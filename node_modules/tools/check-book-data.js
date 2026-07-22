#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const validReaderModes = new Set(["pl", "source", "coptic", "interlinear"]);
const errors = [];
const registry = readJson("books/index.json");

if (registry.books.length !== registry.availableBooks || registry.books.length !== registry.preparedBooks) {
  errors.push("books/index.json: liczniki książek nie odpowiadają rejestrowi");
}

const bookIds = new Set();
for (const metadataPath of registry.books) {
  const metadata = readJson(metadataPath);
  if (!metadata.id || bookIds.has(metadata.id)) errors.push(`${metadataPath}: brak lub powtórzone id`);
  bookIds.add(metadata.id);

  const invalidModes = (metadata.readerModes || []).filter(mode => !validReaderModes.has(mode));
  if (invalidModes.length) errors.push(`${metadataPath}: nieznane tryby czytnika: ${invalidModes.join(", ")}`);
  if (!metadata.readerModes?.includes(metadata.defaultReaderMode)) {
    errors.push(`${metadataPath}: domyślny tryb nie występuje w readerModes`);
  }

  const entryPath = path.join(root, metadata.entry || "");
  if (!metadata.entry || !fs.existsSync(entryPath)) {
    errors.push(`${metadataPath}: brak pliku entry`);
    continue;
  }
  const context = { window: { GNOSTYK_BOOK_MODULES: {} } };
  vm.createContext(context);
  try {
    vm.runInContext(fs.readFileSync(entryPath, "utf8"), context, { filename: metadata.entry });
  } catch (error) {
    errors.push(`${metadata.entry}: nie można wczytać modułu (${error.message})`);
    continue;
  }
  const data = context.window.GNOSTYK_BOOK_MODULES[metadata.id]?.data;
  if (!data) {
    errors.push(`${metadata.entry}: moduł nie rejestruje danych dla ${metadata.id}`);
    continue;
  }

  const pages = Array.isArray(data.pages) ? data.pages.map(page => Number(page?.page)) : [];
  const pageSet = new Set(pages);
  if (!pages.length) errors.push(`${metadata.id}: brak stron`);
  if (pages.some(number => !Number.isInteger(number) || number < 1)) errors.push(`${metadata.id}: niepoprawny numer strony`);
  if (pageSet.size !== pages.length) errors.push(`${metadata.id}: powtórzone numery stron`);
  if (!pages.every((number, index) => index === 0 || number > pages[index - 1])) errors.push(`${metadata.id}: strony nie są rosnące`);
  if (Number(data.pageCount) !== pages.length) errors.push(`${metadata.id}: pageCount nie odpowiada liczbie stron`);

  const chapters = Array.isArray(data.chapters) ? data.chapters : [];
  const chapterNumbers = chapters.map(chapter => Number(chapter?.number));
  if (!chapters.length) errors.push(`${metadata.id}: brak rozdziałów lub jednostek`);
  if (chapterNumbers.some(number => !Number.isInteger(number) || number < 1)) errors.push(`${metadata.id}: niepoprawny numer rozdziału`);
  if (new Set(chapterNumbers).size !== chapterNumbers.length) errors.push(`${metadata.id}: powtórzone numery rozdziałów`);
  if (chapters.some(chapter => !pageSet.has(Number(chapter?.page)))) errors.push(`${metadata.id}: rozdział wskazuje nieistniejącą stronę`);
  if (metadata.structure?.unitCount && Number(metadata.structure.unitCount) !== chapters.length) {
    errors.push(`${metadata.id}: unitCount nie odpowiada liczbie jednostek`);
  }
}

if (errors.length) {
  errors.forEach(error => console.error(`[X] ${error}`));
  process.exit(1);
}

console.log(`[OK] dane książek: ${registry.books.length} moduły, bez duplikatów i zerwanych odwołań`);
