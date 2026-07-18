(function initializeCitationEngine(global) {
  function referenceLabel(options) {
    if (options.kind === "logion") return `${options.unitLabel} ${options.pageNumber}`;
    const parts = [`Mead s. ${options.pageNumber}`];
    if (options.chapterNumber) parts.push(`${options.chapterLabel} ${options.chapterNumber}`);
    if (options.refs?.length) parts.push(`Schw.-Pet. ${options.refs.join(", ")}`);
    return parts.join(" · ");
  }

  function formatLogion(options) {
    const {
      locale, format, library, title, unit, number, bookId, readerMode
    } = options;
    const isPhilip = bookId === "gospel-of-philip";
    const codex = isPhilip ? "Nag Hammadi Codex II,3" : "Nag Hammadi Codex II";
    const layerPl = readerMode === "source"
      ? "użyta warstwa tekstowa: EN Mark M. Mattison, public domain"
      : (isPhilip ? "użyta warstwa tekstowa: PL gnostyk.pl" : "użyta warstwa tekstowa: PL oprac. Dariusz Kaniewski z wykorzystaniem AI");
    const layerEn = readerMode === "source"
      ? "text layer used: EN Mark M. Mattison, public domain"
      : (isPhilip ? "text layer used: PL gnostyk.pl" : "text layer used: PL AI-assisted adaptation by Dariusz Kaniewski");
    const formats = locale === "pl"
      ? {
        simple: `${title}, ${unit} ${number}, ${layerPl}, ${library}`,
        scholarly: `${title}, ${unit} ${number}, ${codex}, ${layerPl}, ${library}.`,
        mead: `${title}, ${unit} ${number}, ${codex}, ${library}.`,
        schwpet: `${title}, ${unit} ${number}; źródła: ${codex}; ${layerPl}, ${library}.`
      }
      : {
        simple: `${title}, ${unit} ${number}, ${layerEn}, ${library}`,
        scholarly: `${title}, ${unit} ${number}, ${codex}, ${layerEn}, ${library}.`,
        mead: `${title}, ${unit} ${number}, ${codex}, ${library}.`,
        schwpet: `${title}, ${unit} ${number}; sources: ${codex}; ${layerEn}, ${library}.`
      };
    return formats[format] || formats.simple;
  }

  function formatPistis(options) {
    const { locale, format, library, pageNumber, chapterPart, refs = [] } = options;
    const schw = refs.length
      ? `Schw.-Pet. ${refs.join(", ")}`
      : (locale === "pl" ? "bez znacznika Schw.-Pet." : "no Schw.-Pet. marker");
    const source = "G. R. S. Mead, Pistis Sophia: A Gnostic Miscellany, London: J. M. Watkins, 1921";
    const formats = locale === "pl"
      ? {
        simple: `Pistis Sophia, Mead s. ${pageNumber}, ${chapterPart}${refs.length ? `, ${schw}` : ""}, ${library}`,
        scholarly: `Pistis Sophia, tłum. i oprac. Biblioteka Gnozy, na podst. ${source}, Mead s. ${pageNumber}, ${chapterPart}${refs.length ? `, ${schw}` : ""}, ${library}.`,
        mead: `Pistis Sophia, Mead s. ${pageNumber}, ${chapterPart}.`,
        schwpet: refs.length ? `Pistis Sophia, ${schw}, Mead s. ${pageNumber}, ${library}.` : `Pistis Sophia, Mead s. ${pageNumber}; brak osobnego znacznika Schw.-Pet. na tej stronie, ${library}.`
      }
      : {
        simple: `Pistis Sophia, Mead p. ${pageNumber}, ${chapterPart}${refs.length ? `, ${schw}` : ""}, ${library}`,
        scholarly: `Pistis Sophia, Polish translation and editorial work by Gnostic Library, based on ${source}, Mead p. ${pageNumber}, ${chapterPart}${refs.length ? `, ${schw}` : ""}, ${library}.`,
        mead: `Pistis Sophia, Mead p. ${pageNumber}, ${chapterPart}.`,
        schwpet: refs.length ? `Pistis Sophia, ${schw}, Mead p. ${pageNumber}, ${library}.` : `Pistis Sophia, Mead p. ${pageNumber}; no separate Schw.-Pet. marker on this page, ${library}.`
      };
    return formats[format] || formats.simple;
  }

  function format(options) {
    return options.kind === "logion" ? formatLogion(options) : formatPistis(options);
  }

  global.GNOSTYK_CITATION_ENGINE = { referenceLabel, format };
})(window);
