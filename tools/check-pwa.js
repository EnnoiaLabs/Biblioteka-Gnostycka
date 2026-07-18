#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const exists = relative => fs.existsSync(path.join(root, relative));
const errors = [];
const fail = message => errors.push(message);
const clean = value => value.replace(/^\.\//, "").split(/[?#]/, 1)[0];

function localReference(value) {
  if (!value || value.startsWith("#") || /^(?:https?:|data:|mailto:|tel:)/i.test(value)) return null;
  return clean(value);
}

function resolveBookReference(metadataPath, reference) {
  const direct = clean(reference);
  if (exists(direct)) return direct;
  return path.posix.normalize(path.posix.join(path.posix.dirname(metadataPath), direct));
}

let version;
let manifest;
try {
  version = JSON.parse(read("VERSION.json")).version;
  manifest = JSON.parse(read("manifest.webmanifest"));
} catch (error) {
  console.error(`[X] PWA: nie można odczytać manifestu lub wersji: ${error.message}`);
  process.exit(1);
}

for (const field of ["name", "short_name", "start_url", "scope", "display", "background_color", "theme_color", "icons"]) {
  if (!manifest[field]) fail(`manifest.webmanifest: brak pola ${field}`);
}
if (manifest.display !== "standalone") fail("manifest.webmanifest: display musi mieć wartość standalone");

const images = [...(manifest.icons || []), ...(manifest.screenshots || [])];
for (const image of images) {
  const relative = localReference(image.src);
  if (!relative || !exists(relative)) {
    fail(`manifest.webmanifest: brak obrazu ${image.src || "(bez src)"}`);
    continue;
  }
  const declared = String(image.sizes || "").match(/^(\d+)x(\d+)$/);
  const data = fs.readFileSync(path.join(root, relative));
  if (declared && data.length >= 24 && data.subarray(1, 4).toString() === "PNG") {
    const actual = `${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`;
    if (actual !== image.sizes) fail(`${relative}: rozmiar ${actual}, zadeklarowano ${image.sizes}`);
  }
}
for (const size of ["192x192", "512x512"]) {
  if (!(manifest.icons || []).some(icon => icon.sizes === size)) fail(`manifest.webmanifest: brak wymaganej ikony ${size}`);
}

const index = read("index.html");
const app = read("app.js");
const sw = read("sw.js");
if (!index.includes(`manifest.webmanifest?v=${version}`)) fail(`index.html: manifest nie ma wersji ${version}`);
if (!/<meta[^>]+name="theme-color"/i.test(index)) fail("index.html: brak meta theme-color");
if (!/serviceWorker\.register\(["']\.\/sw\.js["']\)/.test(app)) fail("app.js: brak rejestracji ./sw.js");
if (!new RegExp(`CACHE_NAME\\s*=\\s*["'][^"']*v${version.replaceAll(".", "\\.")}["']`).test(sw)) {
  fail(`sw.js: nazwa cache nie odpowiada wersji ${version}`);
}

const shellMatch = sw.match(/const APP_SHELL = \[(.*?)\];/s);
const shell = shellMatch ? [...shellMatch[1].matchAll(/["'](\.\/[^"']*)["']/g)].map(match => clean(match[1])) : [];
if (!shellMatch) fail("sw.js: brak APP_SHELL");
const shellSet = new Set(shell);
if (shellSet.size !== shell.length) fail("sw.js: APP_SHELL zawiera powtórzone wpisy");
for (const relative of shell.filter(Boolean)) {
  if (!exists(relative)) fail(`sw.js: APP_SHELL wskazuje brakujący plik ${relative}`);
}

const requiredOffline = new Set([clean(manifest.start_url || ""), "manifest.webmanifest"]);
for (const match of index.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  const relative = localReference(match[1]);
  if (relative && exists(relative)) requiredOffline.add(relative);
}
for (const image of images) {
  const relative = localReference(image.src);
  if (relative) requiredOffline.add(relative);
}

try {
  const loader = read("book-loader.js");
  const assetMap = loader.match(/\/\* BOOK_ASSETS_START \*\/\s*({[\s\S]*?})\s*\/\* BOOK_ASSETS_END \*\//);
  if (!assetMap) throw new Error("brak mapy BOOK_ASSETS");
  const bookAssets = JSON.parse(assetMap[1]);
  requiredOffline.add("book-loader.js");
  requiredOffline.add("app.js");
  for (const files of Object.values(bookAssets)) {
    for (const relative of files) requiredOffline.add(clean(relative));
  }
} catch (error) {
  fail(`loader ksiąg: ${error.message}`);
}

try {
  const registry = JSON.parse(read("books/index.json"));
  requiredOffline.add("books/index.json");
  for (const metadataPath of registry.books || []) {
    requiredOffline.add(clean(metadataPath));
    const metadata = JSON.parse(read(metadataPath));
    for (const field of ["entry", "coptic", "themes"]) {
      if (metadata[field]) requiredOffline.add(resolveBookReference(metadataPath, metadata[field]));
    }
  }
} catch (error) {
  fail(`dane książek: ${error.message}`);
}

for (const relative of requiredOffline) {
  if (relative && !exists(relative)) fail(`zasób offline nie istnieje: ${relative}`);
  else if (relative && !shellSet.has(relative)) fail(`APP_SHELL nie zawiera zasobu: ${relative}`);
}

if (errors.length) {
  for (const error of errors) console.error(`[X] PWA: ${error}`);
  process.exit(1);
}
console.log(`[OK] PWA: manifest, service worker i ${shell.length} wpisów APP_SHELL`);
