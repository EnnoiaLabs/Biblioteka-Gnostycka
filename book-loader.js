(function () {
  "use strict";

  const BOOK_ASSETS = /* BOOK_ASSETS_START */ {
    "pistis-sophia": [
      "books/pistis-sophia/data.js",
      "books/pistis-sophia/coptic-data.js",
      "books/pistis-sophia/polish-translations.js"
    ],
    "gospel-of-thomas": [
      "books/gospel-of-thomas/data.js",
      "books/gospel-of-thomas/coptic-data.js"
    ],
    "gospel-of-philip": [
      "books/gospel-of-philip/data.js",
      "books/gospel-of-philip/coptic-data.js"
    ]
  } /* BOOK_ASSETS_END */;
  const loaderScript = document.currentScript;
  const version = new URL(loaderScript.src, window.location.href).searchParams.get("v") || "";
  const withVersion = source => `${source}${version ? `?v=${encodeURIComponent(version)}` : ""}`;

  function selectedBookId() {
    let requested = "";
    let stored = "";
    try {
      requested = new URLSearchParams(window.location.search || "").get("book") || "";
      stored = window.localStorage?.getItem("gnostyk.activeBook") || "";
    } catch (error) {}
    if (BOOK_ASSETS[requested]) return requested;
    if (BOOK_ASSETS[stored]) return stored;
    return "pistis-sophia";
  }

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = withVersion(source);
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Nie udało się załadować ${source}`));
      document.body.appendChild(script);
    });
  }

  const bookId = selectedBookId();
  window.GNOSTYK_ACTIVE_BOOK_ASSETS = { bookId, files: [...BOOK_ASSETS[bookId]] };
  window.GNOSTYK_BOOK_LOAD_PROMISE = BOOK_ASSETS[bookId]
    .reduce((promise, source) => promise.then(() => loadScript(source)), Promise.resolve())
    .then(() => loadScript("app.js"))
    .catch(error => {
      console.error(error);
      const notice = document.querySelector("#offlineNotice");
      if (notice) {
        notice.hidden = false;
        notice.textContent = "Nie udało się załadować danych księgi. Odśwież stronę lub sprawdź połączenie.";
      }
      throw error;
    });
}());
