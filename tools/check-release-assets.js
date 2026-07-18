#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const config = JSON.parse(fs.readFileSync(path.join(root, "release-exclusions.json"), "utf8"));
const excluded = config.unusedSourceAssets || [];
const runtimeExtensions = new Set([".html", ".css", ".js", ".json", ".webmanifest"]);
const ignoredTopLevel = new Set(["tools", "tests", "dist", "node_modules"]);
const runtimeFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || ignoredTopLevel.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (runtimeExtensions.has(path.extname(entry.name)) && entry.name !== "release-exclusions.json") runtimeFiles.push(full);
  }
}
walk(root);

const errors = [];
if (!excluded.length) errors.push("brak jawnej listy zasobów wyłączonych z wydania");
if (new Set(excluded).size !== excluded.length) errors.push("lista wyłączeń zawiera powtórzenia");

for (const relative of excluded) {
  const target = path.join(root, relative);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    errors.push(`nie istnieje: ${relative}`);
    continue;
  }
  const basename = path.basename(relative);
  const references = runtimeFiles.filter(file => fs.readFileSync(file, "utf8").includes(basename));
  if (references.length) {
    errors.push(`${relative} jest używany przez ${references.map(file => path.relative(root, file)).join(", ")}`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`[X] Zasoby wydania: ${error}`);
  process.exit(1);
}

const bytes = excluded.reduce((sum, relative) => sum + fs.statSync(path.join(root, relative)).size, 0);
console.log(`[OK] Zasoby wydania: ${excluded.length} nieużywane pliki źródłowe poza ZIP (${(bytes / 1024 / 1024).toFixed(2)} MiB)`);
