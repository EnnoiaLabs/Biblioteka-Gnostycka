(function initializeReaderEngine(global) {
  const VALID_READER_MODES = Object.freeze(["pl", "source", "coptic", "interlinear"]);

  function validReaderModes() {
    return [...VALID_READER_MODES];
  }

  function supportedReaderModes(book, interlinearEnabled = false) {
    const declared = Array.isArray(book?.readerModes) && book.readerModes.length
      ? book.readerModes
      : VALID_READER_MODES;
    return [...new Set(declared)].filter(mode =>
      VALID_READER_MODES.includes(mode) && (mode !== "interlinear" || interlinearEnabled)
    );
  }

  function normalizeReaderMode(mode, book, interlinearEnabled = false) {
    const supported = supportedReaderModes(book, interlinearEnabled);
    if (supported.includes(mode)) return mode;
    return supported.includes("pl") ? "pl" : (supported[0] || "pl");
  }

  function renderPlan({ mode, isPistis = false, isLogionReader = false, sidebarMode = "chapters" } = {}) {
    if (mode === "interlinear") return "active-interlinear";
    if (isPistis && sidebarMode === "addenda") {
      return mode === "coptic" ? "active-coptic" : "pistis-addenda-continuous";
    }
    if (isPistis) {
      return mode === "coptic" ? "pistis-coptic-continuous" : "pistis-text-continuous";
    }
    if (isLogionReader) {
      return mode === "coptic" ? "logion-coptic-continuous" : "logion-text-continuous";
    }
    return mode === "coptic" ? "active-coptic" : "active-text";
  }

  function defaultStartPage(bookId) {
    return bookId === "pistis-sophia" ? 48 : 1;
  }

  function clampPage(pageNumber, pageCount) {
    const maximum = Math.max(1, Number(pageCount) || 1);
    const requested = Number(pageNumber);
    const normalized = Number.isFinite(requested) ? Math.trunc(requested) : 1;
    return Math.max(1, Math.min(maximum, normalized));
  }

  function adjacentPage(pageNumber, pageCount, direction) {
    const current = clampPage(pageNumber, pageCount);
    const step = direction === "previous" || Number(direction) < 0 ? -1 : 1;
    return clampPage(current + step, pageCount);
  }

  function availablePageNumbers(data) {
    return [...new Set((Array.isArray(data?.pages) ? data.pages : [])
      .map(page => Number(page?.page))
      .filter(number => Number.isFinite(number) && number >= 1))]
      .sort((a, b) => a - b);
  }

  function resolvePageNumber(data, pageNumber) {
    const numbers = availablePageNumbers(data);
    if (!numbers.length) {
      return clampPage(pageNumber, data?.pageCount || data?.pages?.length || 1);
    }
    const requested = Number(pageNumber);
    if (!Number.isFinite(requested)) return numbers[0];
    if (numbers.includes(requested)) return requested;
    return numbers.reduce((closest, number) => {
      const distance = Math.abs(number - requested);
      const closestDistance = Math.abs(closest - requested);
      return distance < closestDistance || (distance === closestDistance && number < closest)
        ? number
        : closest;
    });
  }

  function adjacentAvailablePage(data, pageNumber, direction) {
    const numbers = availablePageNumbers(data);
    if (!numbers.length) return adjacentPage(pageNumber, data?.pageCount || data?.pages?.length || 1, direction);
    const current = resolvePageNumber(data, pageNumber);
    const index = numbers.indexOf(current);
    const step = direction === "previous" || Number(direction) < 0 ? -1 : 1;
    return numbers[Math.max(0, Math.min(numbers.length - 1, index + step))];
  }

  function navigationState(data, pageNumber) {
    const numbers = availablePageNumbers(data);
    if (!numbers.length) {
      const current = clampPage(pageNumber, data?.pageCount || data?.pages?.length || 1);
      const last = Math.max(1, Number(data?.pageCount || data?.pages?.length) || 1);
      return {
        current,
        previous: Math.max(1, current - 1),
        next: Math.min(last, current + 1),
        canPrevious: current > 1,
        canNext: current < last
      };
    }
    const current = resolvePageNumber(data, pageNumber);
    const index = numbers.indexOf(current);
    return {
      current,
      previous: numbers[Math.max(0, index - 1)],
      next: numbers[Math.min(numbers.length - 1, index + 1)],
      canPrevious: index > 0,
      canNext: index < numbers.length - 1
    };
  }

  function isAddendaPage(bookId, pageNumber, textStartPage = 48) {
    return bookId === "pistis-sophia" && Number(pageNumber) < Number(textStartPage);
  }

  function tabForPage(currentTab, bookId, pageNumber, textStartPage = 48) {
    if (bookId !== "pistis-sophia") return currentTab;
    if (isAddendaPage(bookId, pageNumber, textStartPage)) return "addenda";
    return currentTab === "addenda" ? "chapters" : currentTab;
  }

  function splitBoundaryText(text, marker) {
    const source = String(text || "");
    const boundary = String(marker || "");
    if (!boundary) return { introduction: "", main: source };
    const markerIndex = source.indexOf(boundary);
    if (markerIndex < 0) return { introduction: "", main: source };
    return {
      introduction: source.slice(0, markerIndex).trim(),
      main: source.slice(markerIndex).trim()
    };
  }

  function pageByNumber(data, pageNumber) {
    const pages = Array.isArray(data?.pages) ? data.pages : [];
    if (!pages.length) return null;
    const requested = resolvePageNumber(data, pageNumber);
    const numbered = pages
      .map((page, index) => ({ page, index, number: Number(page?.page) }))
      .filter(item => Number.isFinite(item.number));
    if (numbered.length) {
      const exact = numbered.find(item => item.number === requested);
      if (exact) return exact.page;
      const target = requested;
      return numbered.reduce((closest, item) => {
        const distance = Math.abs(item.number - target);
        const closestDistance = Math.abs(closest.number - target);
        return distance < closestDistance || (distance === closestDistance && item.number < closest.number)
          ? item
          : closest;
      }).page;
    }
    const index = Math.max(0, Math.min(pages.length - 1, (Number.isFinite(requested) ? requested : 1) - 1));
    return pages[Math.trunc(index)];
  }

  function chapterForPage(data, pageNumber) {
    const requested = Number(pageNumber);
    if (!Number.isFinite(requested)) return null;
    return (Array.isArray(data?.chapters) ? data.chapters : [])
      .filter(chapter => Number.isFinite(Number(chapter?.page)) && Number(chapter.page) <= requested)
      .reduce((active, chapter) => !active || Number(chapter.page) > Number(active.page) ? chapter : active, null);
  }

  function rangeForChapter(ranges, chapter) {
    if (!chapter) return null;
    return (Array.isArray(ranges) ? ranges : [])
      .find(range => chapter.number >= range.from && chapter.number <= range.to) || null;
  }

  function manuscriptRefs(page) {
    const text = String(page?.text || "");
    const refs = [...text.matchAll(/\|(\d{1,3})\.?/g)].map(match => match[1]);
    return [...new Set(refs)];
  }

  function copticRefs(page, isLogionReader = false) {
    if (isLogionReader) return [String(page?.page || "")].filter(Boolean);
    const refs = manuscriptRefs(page);
    if (Number(page?.page) === 48 && !refs.includes("1")) refs.unshift("1");
    return refs;
  }

  global.GNOSTYK_READER_ENGINE = {
    validReaderModes,
    supportedReaderModes,
    normalizeReaderMode,
    renderPlan,
    defaultStartPage,
    clampPage,
    adjacentPage,
    availablePageNumbers,
    resolvePageNumber,
    adjacentAvailablePage,
    navigationState,
    isAddendaPage,
    tabForPage,
    splitBoundaryText,
    pageByNumber,
    chapterForPage,
    rangeForChapter,
    manuscriptRefs,
    copticRefs
  };
})(window);
