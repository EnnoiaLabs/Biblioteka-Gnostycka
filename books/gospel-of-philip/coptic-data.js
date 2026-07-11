window.GNOSTYK_BOOK_MODULES = window.GNOSTYK_BOOK_MODULES || {};
(function () {
  const bookId = "gospel-of-philip";
  const module = window.GNOSTYK_BOOK_MODULES[bookId] || (window.GNOSTYK_BOOK_MODULES[bookId] = {});
  module.coptic = {
    meta: {
      title: "Ewangelia Filipa - tekst koptyjski",
      status: "Do importu",
      source: "Nag Hammadi Codex II,3. Pe?na transkrypcja koptyjska Unicode/TEI nie zosta?a jeszcze pod??czona do pakietu.",
      note: "Warstwa koptyjska jest przygotowana technicznie, ale nie zosta?a wype?niona niezweryfikowanym tekstem. Po wskazaniu pewnej edycji cyfrowej zostanie dodana tak jak w module Ewangelii Tomasza.",
      license: "do weryfikacji dla wybranej edycji cyfrowej",
      citation: "Nag Hammadi Codex II,3, Gospel of Philip."
    },
    pages: {},
    loaded: true,
    loading: false,
    error: null
  };
})();
