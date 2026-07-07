import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read("data.js"), sandbox);

const app = read("app.js");
const data = sandbox.window.PISTIS_SOPHIA_DATA;
const translations = extractTranslations(app);

const issues = [];

for (const page of data.pages) {
  const polish = translations[page.page] || "";
  const sourceRefs = refsIn(page.text);
  const polishRefs = refsIn(polish);

  if (!polish) {
    issues.push({ page: page.page, type: "missing_translation" });
  }

  if (sourceRefs.length && !polishRefs.length) {
    issues.push({ page: page.page, type: "missing_manuscript_refs", refs: sourceRefs });
  }

  if (sourceRefs.length && polishRefs.length && polishRefs.length < sourceRefs.length) {
    issues.push({
      page: page.page,
      type: "partial_manuscript_refs",
      sourceRefs,
      polishRefs
    });
  }

  if (page.page > 10 && polish.length < page.text.length * 0.45) {
    issues.push({
      page: page.page,
      type: "very_short_polish",
      sourceLength: page.text.length,
      polishLength: polish.length
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  pages: data.pages.length,
  translatedPages: Object.keys(translations).length,
  issueCounts: issues.reduce((counts, issue) => {
    counts[issue.type] = (counts[issue.type] || 0) + 1;
    return counts;
  }, {}),
  issues
};

fs.writeFileSync(path.join(root, "translation-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report.issueCounts, null, 2));

function refsIn(text) {
  return [...text.matchAll(/\|(\d{1,3})\.?/g)].map(match => match[1]);
}

function extractTranslations(source) {
  const start = source.indexOf("const polishTranslations = {");
  const objectStart = source.indexOf("{", start);
  let depth = 0;
  let objectEnd = -1;
  let inTemplate = false;
  let escaped = false;

  for (let index = objectStart; index < source.length; index += 1) {
    const char = source[index];
    if (inTemplate) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === "`") inTemplate = false;
      continue;
    }
    if (char === "`") {
      inTemplate = true;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        objectEnd = index + 1;
        break;
      }
    }
  }

  return Function(`return ${source.slice(objectStart, objectEnd)}`)();
}
