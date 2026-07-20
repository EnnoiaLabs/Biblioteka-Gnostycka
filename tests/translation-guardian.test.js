const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

function countOccurrences(text, pattern) {
  return text.split(pattern).length - 1;
}

test("translation guardian requires evidence, rationale, footnotes, and enforced wording", () => {
  const registry = JSON.parse(read("books/pistis-sophia/translation-decisions.json"));
  assert.equal(registry.schemaVersion, 1);
  assert.ok(Array.isArray(registry.decisions) && registry.decisions.length > 0);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.entries(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .filter(([page]) => Number(page) >= 48)
    .map(([, text]) => text)
    .join("\n");

  const ids = new Set();
  for (const decision of registry.decisions) {
    assert.ok(decision.id && !ids.has(decision.id), "decision ids must be present and unique");
    ids.add(decision.id);
    assert.ok(["approved", "review", "pending"].includes(decision.status), `${decision.id}: valid status`);
    for (const field of ["selectedPolish", "scope", "rationale", "footnote"]) {
      assert.ok(typeof decision[field] === "string" && decision[field].trim().length >= 20, `${decision.id}: ${field}`);
    }

    assert.ok(Array.isArray(decision.sources) && decision.sources.length >= 2, `${decision.id}: sources`);
    const sourceIds = new Set(decision.sources.map(source => source.id));
    assert.ok(sourceIds.has("mead-1921"), `${decision.id}: Mead evidence`);
    assert.ok(sourceIds.has("macdermot-1978"), `${decision.id}: MacDermot evidence`);
    for (const source of decision.sources) {
      for (const field of ["citation", "rendering", "basis"]) {
        assert.ok(typeof source[field] === "string" && source[field].trim(), `${decision.id}: source ${field}`);
      }
    }

    assert.ok(decision.coptic && typeof decision.coptic.evidence === "string", `${decision.id}: Coptic evidence`);
    assert.ok(["verified", "indirectly-attested", "source-note", "pending"].includes(decision.coptic.status));
    if (decision.coptic.status === "verified") {
      assert.ok(decision.coptic.exactForm, `${decision.id}: verified Coptic form`);
    } else {
      assert.ok(decision.coptic.uncertaintyNote, `${decision.id}: uncertainty must be explicit`);
    }
    assert.match(decision.footnote, /MacDermot|Mead/);
    assert.match(decision.footnote, /Schmidt|koptyj/i);

    if (decision.status === "approved") {
      const enforcement = decision.enforcement;
      assert.ok(enforcement && Array.isArray(enforcement.requiredPatterns), `${decision.id}: enforcement`);
      for (const pattern of enforcement.requiredPatterns) {
        assert.ok(countOccurrences(translation, pattern) >= enforcement.minOccurrences, `${decision.id}: required ${pattern}`);
      }
      for (const pattern of enforcement.forbiddenPatterns || []) {
        assert.equal(countOccurrences(translation, pattern), 0, `${decision.id}: forbidden ${pattern}`);
      }
    }
  }
});
