#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

function loadApplicationData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/data.js"), context, { filename: "data.js" });
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context, { filename: "polish-translations.js" });
  return {
    source: context.window.PISTIS_SOPHIA_DATA,
    translations: context.window.GNOSTYK_POLISH_TRANSLATIONS
  };
}

function check() {
  const { source, translations } = loadApplicationData();
  assert.ok(source && Array.isArray(source.pages), "brak danych stron Pistis Sophii");
  assert.ok(translations && typeof translations === "object", "brak polskiej warstwy tłumaczenia");

  const expectedPages = Array.from({ length: source.pageCount }, (_, index) => index + 1);
  const sourcePages = Array.from(source.pages, page => Number(page.page));
  const translatedPages = Object.keys(translations).map(Number).sort((a, b) => a - b);

  assert.deepEqual(sourcePages, expectedPages, "strony źródłowe muszą być kompletne i uporządkowane");
  assert.deepEqual(translatedPages, expectedPages, "polskie tłumaczenie musi zawierać dokładnie strony 1–255");
  assert.equal(source.pages.length, source.pageCount, "pageCount nie odpowiada liczbie stron źródłowych");
  assert.equal(translatedPages.length, source.pageCount, "pageCount nie odpowiada liczbie stron tłumaczenia");

  for (const number of expectedPages) {
    const sourcePage = source.pages[number - 1];
    const polish = translations[number];
    assert.equal(typeof sourcePage.text, "string", `strona ${number}: brak tekstu źródłowego`);
    assert.ok(sourcePage.text.trim().length >= 20, `strona ${number}: tekst źródłowy jest pusty lub ucięty`);
    assert.equal(typeof polish, "string", `strona ${number}: brak polskiego tekstu`);
    assert.ok(polish.trim().length >= 20, `strona ${number}: polski tekst jest pusty lub ucięty`);
    assert.ok(!polish.includes("\ufffd"), `strona ${number}: znak zastępczy Unicode`);
  }

  const app = read("app.js");
  const index = read("index.html");
  const loader = read("book-loader.js");
  const serviceWorker = read("sw.js");
  assert.match(app, /polishTranslations\[page\.page\]/, "czytnik nie pobiera polskiego tekstu według numeru strony");
  assert.match(app, /data-pistis-text-page/, "czytnik nie znakuje wyrenderowanych stron Pistis Sophii");
  assert.match(index, /book-loader\.js/, "strona nie uruchamia loadera księgi");
  assert.match(loader, /books\/pistis-sophia\/polish-translations\.js/, "loader księgi nie ładuje tłumaczenia");
  assert.ok(loader.indexOf("books/pistis-sophia/polish-translations.js") < loader.indexOf('loadScript("app.js")'), "tłumaczenie musi zostać wczytane przed aplikacją");
  assert.match(serviceWorker, /books\/pistis-sophia\/polish-translations\.js/, "PWA nie przechowuje tłumaczenia offline");

  return { pages: expectedPages.length };
}

try {
  const result = check();
  console.log("STRAŻNIK KOMPLETNOŚCI TŁUMACZENIA: OK");
  console.log(`[OK] ${result.pages}/${result.pages} stron obecnych i niepustych`);
  console.log(`[OK] ${result.pages}/${result.pages} stron podłączonych do ścieżki renderowania`);
  console.log("[OK] tłumaczenie jest ładowane przed aplikacją i dostępne offline");
} catch (error) {
  console.error("STRAŻNIK KOMPLETNOŚCI TŁUMACZENIA: NIEPOWODZENIE");
  console.error(`[X] ${error.message}`);
  process.exit(1);
}
