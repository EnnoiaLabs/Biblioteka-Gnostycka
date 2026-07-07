window.GNOSTYK_BOOK_MODULES = window.GNOSTYK_BOOK_MODULES || {};
window.GNOSTYK_BOOK_MODULES["gospel-of-thomas"] = {
  id: "gospel-of-thomas",
  title: "Ewangelia Tomasza",
  status: "Moduł przygotowany — oczekuje na tekst",
  type: "logion-reader",
  language: "pl",
  sourceLanguageLayers: ["cop"],
  unitName: "logion",
  unitCount: 114,
  data: {
    title: "Ewangelia Tomasza",
    source: "Koptyjski tekst z Kodeksu II z Nag Hammadi; podstawa edytorska do ustalenia przed przekładem.",
    pageCount: 0,
    logia: Array.from({ length: 114 }, (_, index) => ({
      number: index + 1,
      title: `Logion ${index + 1}`,
      status: "placeholder",
      text: ""
    }))
  },
  coptic: { meta: {}, pages: {} }
};
