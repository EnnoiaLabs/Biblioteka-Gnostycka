#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative));
const budgets = JSON.parse(read("performance-budgets.json"));
const html = read("index.html").toString("utf8");
const errors = [];
const loader = read("book-loader.js").toString("utf8");

const localFiles = [...new Set(
  [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map(match => match[1].split(/[?#]/, 1)[0].replace(/^\.\//, ""))
    .filter(relative => relative && fs.existsSync(path.join(root, relative)) && fs.statSync(path.join(root, relative)).isFile())
)];

const entryFor = relative => {
  const data = read(relative);
  return { relative, raw: data.length, gzip: zlib.gzipSync(data, { level: 9 }).length };
};
const loaderAssetsMatch = loader.match(/\/\* BOOK_ASSETS_START \*\/\s*({[\s\S]*?})\s*\/\* BOOK_ASSETS_END \*\//);
if (!loaderAssetsMatch) {
  console.error("[X] Wydajność: book-loader.js nie zawiera czytelnej mapy zasobów ksiąg");
  process.exit(1);
}
const bookAssets = JSON.parse(loaderAssetsMatch[1]);
const bookGroups = Object.entries(bookAssets).map(([bookId, files]) => ({
  bookId,
  entries: files.map(entryFor)
}));
const heaviestBook = bookGroups.reduce((current, group) => {
  const raw = group.entries.reduce((sum, entry) => sum + entry.raw, 0);
  return raw > current.raw ? { ...group, raw } : current;
}, { bookId: "", entries: [], raw: 0 });
const entries = [...localFiles.map(entryFor), entryFor("app.js"), ...heaviestBook.entries];
const raw = entries.reduce((sum, entry) => sum + entry.raw, 0);
const gzip = entries.reduce((sum, entry) => sum + entry.gzip, 0);
const largest = entries.reduce((current, entry) => entry.raw > current.raw ? entry : current, { relative: "", raw: 0 });
const appBytes = read("app.js").length;
const cssBytes = read("styles.css").length;

function within(label, actual, budget) {
  if (!Number.isInteger(budget) || budget <= 0) errors.push(`${label}: niepoprawny budżet`);
  else if (actual > budget) errors.push(`${label}: ${actual} B przekracza budżet ${budget} B`);
}

within("lokalne zasoby startowe (raw)", raw, budgets.startupLocalRawBytes);
within("lokalne zasoby startowe (gzip)", gzip, budgets.startupLocalGzipBytes);
within(`największy zasób startowy (${largest.relative})`, largest.raw, budgets.largestStartupFileBytes);
within("app.js", appBytes, budgets.appJavaScriptBytes);
within("styles.css", cssBytes, budgets.stylesheetBytes);

if (errors.length) {
  for (const error of errors) console.error(`[X] Wydajność: ${error}`);
  process.exit(1);
}

const mib = bytes => (bytes / 1024 / 1024).toFixed(2);
console.log(`[OK] Wydajność: ${entries.length} zasobów startowych, ${mib(raw)} MiB raw, ${mib(gzip)} MiB gzip`);
console.log(`[OK] Najcięższy wariant księgi: ${heaviestBook.bookId} (${mib(heaviestBook.raw)} MiB raw)`);
for (const group of bookGroups) {
  const groupFiles = [...localFiles.map(entryFor), entryFor("app.js"), ...group.entries];
  const groupRaw = groupFiles.reduce((sum, entry) => sum + entry.raw, 0);
  const groupGzip = groupFiles.reduce((sum, entry) => sum + entry.gzip, 0);
  console.log(`[OK] Start ${group.bookId}: ${mib(groupRaw)} MiB raw, ${mib(groupGzip)} MiB gzip`);
}
console.log(`[OK] Największy zasób: ${largest.relative} (${mib(largest.raw)} MiB)`);
