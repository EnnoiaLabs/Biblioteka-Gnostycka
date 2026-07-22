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

test("addendum pages 1-12 retain the first close-reading corrections", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const pages = context.window.GNOSTYK_POLISH_TRANSLATIONS;
  const audited = Array.from({ length: 12 }, (_, index) => pages[index + 1]).join("\n");

  for (const wording of [
    "przestała uczestniczyć w ich misterium",
    "towarzyszącym jej Niewidzialnym",
    "Granice dróg przeznaczonych dla godnych",
    "mogą pomóc ci, którzy pozostają na ziemi",
    "Uczniów ogarnia uniesienie wobec wzniosłości ukazanej im perspektywy",
  ]) {
    assert.ok(audited.includes(wording), `missing audited wording: ${wording}`);
  }

  for (const rejected of [
    "ustaje w ich misterium",
    "współniewidzialnym",
    "Granice dróg godnych",
    "mogą pomóc ci na ziemi",
    "popadają w zachwyt na wzniosłość",
    "O takich wtajemniczonych",
  ]) {
    assert.equal(audited.includes(rejected), false, `rejected wording returned: ${rejected}`);
  }
});

test("Mead's detailed contents is clearly identified and retains natural Polish", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const pages = context.window.GNOSTYK_POLISH_TRANSLATIONS;
  const contents = Array.from({ length: 14 }, (_, index) => pages[index + 2]).join("\n");

  for (const wording of [
    "SZCZEGÓŁOWY SPIS TREŚCI WYDANIA MEADA",
    "Nie są częścią narracji Pistis Sophii",
    "Obiecuje wyjawić im wszystko",
    "Jan był Eliaszem w poprzednim wcieleniu",
    "Takie dusze jednoczą się z Pierwszym Misterium",
    "Pokutującemu bratu można ponownie udzielić nawet trzech misteriów z drugiej przestrzeni",
  ]) {
    assert.ok(contents.includes(wording), `missing contents wording: ${wording}`);
  }

  for (const rejected of [
    "Obiecuje powiedzieć im wszystkie rzeczy",
    "w dawnym narodzeniu",
    "Takie dusze są jednym z Pierwszym Misterium",
    "aż do trzech z drugiej przestrzeni",
  ]) {
    assert.equal(contents.includes(rejected), false, `rejected contents wording returned: ${rejected}`);
  }
});

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

test("historical translation decisions remain in a sourced recovery backlog", () => {
  const registry = JSON.parse(read("books/pistis-sophia/translation-decisions.json"));
  const backlog = JSON.parse(read("books/pistis-sophia/translation-decision-backlog.json"));
  assert.equal(backlog.schemaVersion, 1);
  assert.ok(Array.isArray(backlog.items));

  const approvedIds = new Set(registry.decisions.map(decision => decision.id));
  const backlogIds = new Set();
  for (const item of backlog.items) {
    assert.ok(item.id && !approvedIds.has(item.id) && !backlogIds.has(item.id), `${item.id}: unique backlog id`);
    backlogIds.add(item.id);
    assert.equal(item.status, "needs-source-verification", `${item.id}: pending status`);
    assert.ok(typeof item.currentPolish === "string" && item.currentPolish.trim(), `${item.id}: currentPolish`);
    for (const field of ["scope", "reason"]) {
      assert.ok(typeof item[field] === "string" && item[field].trim().length >= 20, `${item.id}: ${field}`);
    }
    assert.ok(Array.isArray(item.originVersions) && item.originVersions.length > 0, `${item.id}: origin versions`);
    assert.ok(Array.isArray(item.requiredEvidence) && item.requiredEvidence.length >= 5, `${item.id}: evidence plan`);
    assert.ok(item.requiredEvidence.some(value => /Mead/i.test(value)), `${item.id}: Mead planned`);
    assert.ok(item.requiredEvidence.some(value => /koptyj/i.test(value)), `${item.id}: Coptic planned`);
  }
});

test("global audit queue is separate, complete, and ready for source review", () => {
  const queue = JSON.parse(read("books/pistis-sophia/translation-audit-queue.json"));
  assert.equal(queue.schemaVersion, 1);
  assert.equal(queue.createdForVersion, "1.7.19");
  assert.equal(queue.summary.pagesScanned, 208);
  assert.equal(queue.summary.candidateGroups, queue.items.length);
  assert.ok(queue.items.length > 0);

  const ids = new Set();
  for (const item of queue.items) {
    assert.ok(item.id && !ids.has(item.id), `${item.id}: unique audit id`);
    ids.add(item.id);
    assert.ok(["high", "medium", "low"].includes(item.priority), `${item.id}: priority`);
    assert.equal(item.status, "needs-source-verification", `${item.id}: pending status`);
    assert.ok(typeof item.currentPolish === "string" && item.currentPolish.trim(), `${item.id}: currentPolish`);
    assert.ok(typeof item.reason === "string" && item.reason.trim().length >= 40, `${item.id}: reason`);
    assert.ok(Array.isArray(item.pages) && item.pages.length > 0, `${item.id}: pages`);
    assert.ok(item.pages.every(page => Number.isInteger(page) && page >= 48 && page <= 255), `${item.id}: page range`);
    assert.ok(Array.isArray(item.requiredEvidence) && item.requiredEvidence.length >= 5, `${item.id}: evidence plan`);
    assert.ok(item.requiredEvidence.some(value => /Mead/i.test(value)), `${item.id}: Mead planned`);
    assert.ok(item.requiredEvidence.some(value => /MacDermot/i.test(value)), `${item.id}: MacDermot planned`);
    assert.ok(item.requiredEvidence.some(value => /koptyj/i.test(value)), `${item.id}: Coptic planned`);
  }

  const high = queue.items.filter(item => item.priority === "high").length;
  const medium = queue.items.filter(item => item.priority === "medium").length;
  assert.equal(queue.summary.highPriority, high);
  assert.equal(queue.summary.mediumPriority, medium);
});

test("version 1.7.20 resolves all six global-audit groups and guards the corrected wording", () => {
  const queue = JSON.parse(read("books/pistis-sophia/translation-audit-queue.json"));
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-decisions.json"));
  assert.equal(queue.completedForVersion, "1.7.20");
  assert.equal(audit.completedForVersion, "1.7.20");
  assert.equal(audit.decisions.length, queue.items.length);
  assert.deepEqual(
    new Set(audit.decisions.map(item => item.id)),
    new Set(queue.items.map(item => item.id))
  );

  for (const decision of audit.decisions) {
    assert.match(decision.status, /^approved-/);
    assert.ok(decision.selectedPolish.length >= 20, `${decision.id}: selected Polish`);
    assert.ok(decision.rationale.length >= 80, `${decision.id}: rationale`);
    assert.ok(decision.coptic.length > 0, `${decision.id}: Coptic`);
    assert.ok(decision.mead.length > 0, `${decision.id}: Mead`);
    assert.ok(decision.macdermot.length > 0, `${decision.id}: MacDermot`);
  }

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.values(context.window.GNOSTYK_POLISH_TRANSLATIONS).join("\n");
  const corrected = audit.decisions.find(item => item.id === "spreading-of-universe-calque");
  assert.equal(countOccurrences(translation, corrected.requiredPattern), corrected.requiredOccurrences);
  assert.equal(countOccurrences(translation, corrected.requiredInflectedPattern), corrected.requiredInflectedOccurrences);
  assert.equal(countOccurrences(translation, corrected.requiredGenitivePattern), corrected.requiredGenitiveOccurrences);
  assert.equal(countOccurrences(translation, corrected.forbiddenPattern), 0);
});

test("version 1.7.21 records the second grouped terminology audit without flattening contextual terms", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-2.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.21");
  assert.equal(audit.decisions.length, 3);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.values(context.window.GNOSTYK_POLISH_TRANSLATIONS).join("\n");

  for (const decision of audit.decisions) {
    assert.match(decision.status, /^approved-/);
    assert.ok(decision.selectedPolish.length >= 20, `${decision.id}: selected Polish`);
    assert.ok(decision.rationale.length >= 100, `${decision.id}: rationale`);
    assert.ok(decision.coptic.length > 0, `${decision.id}: Coptic`);
    assert.ok(decision.mead.length > 0, `${decision.id}: Mead`);
    assert.ok(decision.macdermot.length > 0, `${decision.id}: MacDermot`);
    assert.ok(Array.isArray(decision.pages) && decision.pages.length > 0, `${decision.id}: pages`);
    if (decision.requiredPattern) {
      assert.equal(countOccurrences(translation, decision.requiredPattern), decision.requiredOccurrences, `${decision.id}: guarded wording`);
    }
    if (decision.forbiddenPattern) {
      assert.equal(countOccurrences(translation, decision.forbiddenPattern), 0, `${decision.id}: forbidden flattening`);
    }
  }
});

test("version 1.7.22 records the third grouped terminology audit and preserves technical loanwords", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-3.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.22");
  assert.equal(audit.decisions.length, 3);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.values(context.window.GNOSTYK_POLISH_TRANSLATIONS).join("\n");

  for (const decision of audit.decisions) {
    assert.match(decision.status, /^approved-/);
    assert.ok(decision.selectedPolish.length >= 40, `${decision.id}: selected Polish`);
    assert.ok(decision.rationale.length >= 120, `${decision.id}: rationale`);
    assert.ok(decision.coptic.length >= 40, `${decision.id}: Coptic`);
    assert.ok(decision.mead.length > 0, `${decision.id}: Mead`);
    assert.ok(decision.macdermot.length > 0, `${decision.id}: MacDermot`);
    assert.ok(Array.isArray(decision.pages) && decision.pages.length > 0, `${decision.id}: pages`);
    assert.ok(countOccurrences(translation, decision.requiredPattern) >= decision.minimumOccurrences, `${decision.id}: guarded wording`);
    assert.equal(countOccurrences(translation, decision.forbiddenPattern), 0, `${decision.id}: forbidden flattening`);
  }
});

test("version 1.7.23 records the fourth grouped audit and preserves hierarchical distinctions", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-4.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.23");
  assert.equal(audit.decisions.length, 3);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.values(context.window.GNOSTYK_POLISH_TRANSLATIONS).join("\n");

  for (const decision of audit.decisions) {
    assert.match(decision.status, /^approved-/);
    assert.ok(decision.selectedPolish.length >= 80, `${decision.id}: selected Polish`);
    assert.ok(decision.rationale.length >= 180, `${decision.id}: rationale`);
    assert.ok(decision.coptic.length >= 80, `${decision.id}: Coptic`);
    assert.ok(decision.mead.length >= 40, `${decision.id}: Mead`);
    assert.ok(decision.macdermot.length >= 40, `${decision.id}: MacDermot`);
    assert.ok(Array.isArray(decision.pages) && decision.pages.length > 0, `${decision.id}: pages`);
    assert.ok(countOccurrences(translation, decision.requiredPattern) >= decision.minimumOccurrences, `${decision.id}: guarded wording`);
    assert.equal(countOccurrences(translation, decision.forbiddenPattern), 0, `${decision.id}: forbidden flattening`);
  }
});

test("version 1.7.24 records the fifth grouped audit and preserves seals, veils, and the Treasury", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-5.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.24");
  assert.equal(audit.decisions.length, 3);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.entries(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .filter(([page]) => Number(page) >= 48)
    .map(([, text]) => text)
    .join("\n");

  for (const decision of audit.decisions) {
    assert.match(decision.status, /^approved-/);
    assert.ok(decision.selectedPolish.length >= 100, `${decision.id}: selected Polish`);
    assert.ok(decision.rationale.length >= 200, `${decision.id}: rationale`);
    assert.ok(decision.coptic.length >= 100, `${decision.id}: Coptic`);
    assert.ok(decision.mead.length >= 70, `${decision.id}: Mead`);
    assert.ok(decision.macdermot.length >= 70, `${decision.id}: MacDermot`);
    assert.ok(Array.isArray(decision.pages) && decision.pages.length > 0, `${decision.id}: pages`);
    assert.ok(countOccurrences(translation, decision.requiredPattern) >= decision.minimumOccurrences, `${decision.id}: guarded wording`);
    assert.equal(countOccurrences(translation, decision.forbiddenPattern), 0, `${decision.id}: forbidden flattening`);
  }
});

test("version 1.7.25 records the sixth grouped audit and preserves knowledge, mysteries, and names", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-6.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.25");
  assert.equal(audit.decisions.length, 3);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.entries(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .filter(([page]) => Number(page) >= 48)
    .map(([, text]) => text)
    .join("\n");

  for (const decision of audit.decisions) {
    assert.match(decision.status, /^approved-/);
    assert.ok(decision.selectedPolish.length >= 100, `${decision.id}: selected Polish`);
    assert.ok(decision.rationale.length >= 250, `${decision.id}: rationale`);
    assert.ok(decision.coptic.length >= 120, `${decision.id}: Coptic`);
    assert.ok(decision.mead.length >= 100, `${decision.id}: Mead`);
    assert.ok(decision.macdermot.length >= 100, `${decision.id}: MacDermot`);
    assert.ok(Array.isArray(decision.pages) && decision.pages.length > 0, `${decision.id}: pages`);
    assert.ok(countOccurrences(translation, decision.requiredPattern) >= decision.minimumOccurrences, `${decision.id}: guarded wording`);
    assert.equal(countOccurrences(translation, decision.forbiddenPattern), 0, `${decision.id}: forbidden flattening`);
  }
});

test("version 1.7.26 records the seventh grouped audit and preserves baptism, anointing, and remission", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-7.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.26");
  assert.equal(audit.decisions.length, 3);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.entries(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .filter(([page]) => Number(page) >= 48)
    .map(([, text]) => text)
    .join("\n");

  for (const decision of audit.decisions) {
    assert.match(decision.status, /^approved-/);
    assert.ok(decision.selectedPolish.length >= 100, `${decision.id}: selected Polish`);
    assert.ok(decision.rationale.length >= 250, `${decision.id}: rationale`);
    assert.ok(decision.coptic.length >= 120, `${decision.id}: Coptic`);
    assert.ok(decision.mead.length >= 100, `${decision.id}: Mead`);
    assert.ok(decision.macdermot.length >= 100, `${decision.id}: MacDermot`);
    assert.ok(Array.isArray(decision.pages) && decision.pages.length > 0, `${decision.id}: pages`);
    assert.ok(countOccurrences(translation, decision.requiredPattern) >= decision.minimumOccurrences, `${decision.id}: guarded wording`);
    assert.equal(countOccurrences(translation, decision.forbiddenPattern), 0, `${decision.id}: forbidden flattening`);
  }
});

test("version 1.7.27 records the eighth grouped audit and preserves soul, spirit, and body", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-8.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.27");
  assert.equal(audit.decisions.length, 3);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.entries(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .filter(([page]) => Number(page) >= 48)
    .map(([, text]) => text)
    .join("\n");

  for (const decision of audit.decisions) {
    assert.match(decision.status, /^approved-/);
    assert.ok(decision.selectedPolish.length >= 100, `${decision.id}: selected Polish`);
    assert.ok(decision.rationale.length >= 250, `${decision.id}: rationale`);
    assert.ok(decision.coptic.length >= 120, `${decision.id}: Coptic`);
    assert.ok(decision.mead.length >= 100, `${decision.id}: Mead`);
    assert.ok(decision.macdermot.length >= 100, `${decision.id}: MacDermot`);
    assert.ok(Array.isArray(decision.pages) && decision.pages.length > 0, `${decision.id}: pages`);
    assert.ok(countOccurrences(translation, decision.requiredPattern) >= decision.minimumOccurrences, `${decision.id}: guarded wording`);
    assert.equal(countOccurrences(translation, decision.forbiddenPattern), 0, `${decision.id}: forbidden flattening`);
  }
});

test("version 1.7.28 records the ninth grouped audit and preserves lands, aeons, and spheres", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-9.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.28");
  assert.equal(audit.decisions.length, 3);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.entries(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .filter(([page]) => Number(page) >= 48)
    .map(([, text]) => text)
    .join("\n");

  for (const decision of audit.decisions) {
    assert.match(decision.status, /^approved-/);
    assert.ok(decision.selectedPolish.length >= 100, `${decision.id}: selected Polish`);
    assert.ok(decision.rationale.length >= 250, `${decision.id}: rationale`);
    assert.ok(decision.coptic.length >= 120, `${decision.id}: Coptic`);
    assert.ok(decision.mead.length >= 100, `${decision.id}: Mead`);
    assert.ok(decision.macdermot.length >= 100, `${decision.id}: MacDermot`);
    assert.ok(Array.isArray(decision.pages) && decision.pages.length > 0, `${decision.id}: pages`);
    assert.ok(countOccurrences(translation, decision.requiredPattern) >= decision.minimumOccurrences, `${decision.id}: guarded wording`);
    assert.equal(countOccurrences(translation, decision.forbiddenPattern), 0, `${decision.id}: forbidden flattening`);
  }
});

test("version 1.7.29 completes the approved spreading-of-the-All correction across inflected forms", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-10.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.29");
  assert.equal(audit.decisions.length, 1);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.entries(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .filter(([page]) => Number(page) >= 48)
    .map(([, text]) => text)
    .join("\n");

  const decision = audit.decisions[0];
  assert.equal(decision.status, "approved-corrected");
  assert.equal(decision.textChanged, true);
  assert.equal(decision.pages.length, 14);
  assert.ok(decision.rationale.length >= 250);
  assert.ok(decision.coptic.length >= 120);
  assert.ok(decision.mead.length >= 100);
  assert.ok(decision.macdermot.length >= 100);

  const corrected = translation.match(/rozpostar\w*\s+Całości/giu) || [];
  const regressed = translation.match(new RegExp(decision.forbiddenPattern, "giu")) || [];
  assert.ok(corrected.length >= decision.minimumCorrectedOccurrences, "all approved inflected forms must use Całości");
  assert.equal(regressed.length, 0, "no inflected form of rozpostarcie wszechświata may remain");
});

test("version 1.7.30 audits numbers and directions and corrects Mead's twelve-moons slip", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-11.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.30");
  assert.equal(audit.decisions.length, 2);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.entries(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .filter(([page]) => Number(page) >= 48)
    .map(([, text]) => text)
    .join("\n");

  const aeons = audit.decisions[0];
  assert.equal(aeons.status, "approved-corrected");
  assert.equal(aeons.textChanged, true);
  assert.ok(aeons.coptic.includes("ⲡⲙⲛ̅ⲧⲥⲛⲟⲟⲩⲥ ⲛ̅ ⲁⲓⲱⲛ"));
  assert.equal(countOccurrences(translation, aeons.requiredPattern), aeons.requiredOccurrences);
  assert.equal(countOccurrences(translation, aeons.forbiddenPattern), 0);

  const directions = audit.decisions[1];
  assert.equal(directions.status, "approved-verified");
  assert.equal(directions.textChanged, false);
  assert.ok(directions.readerPages.length >= 100);
  assert.ok(countOccurrences(translation, directions.requiredPattern) >= directions.minimumOccurrences);
  assert.equal(countOccurrences(translation, directions.forbiddenPattern), 0);
});

test("version 1.7.31 audits proper names, inflection, and system-name capitalization", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-12.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.31");
  assert.equal(audit.decisions.length, 2);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.entries(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .filter(([page]) => Number(page) >= 48)
    .map(([, text]) => text)
    .join("\n");

  for (const decision of audit.decisions) {
    assert.equal(decision.status, "approved-verified");
    assert.equal(decision.textChanged, false);
    assert.ok(decision.rationale.length >= 300);
    assert.ok(countOccurrences(translation, decision.requiredPattern) >= decision.minimumOccurrences);
    for (const forbidden of decision.forbiddenPatterns) {
      assert.equal(countOccurrences(translation, forbidden), 0, `${decision.id}: ${forbidden}`);
    }
  }
});

test("version 1.7.32 removes only confirmed archaic Mead calques", () => {
  const audit = JSON.parse(read("books/pistis-sophia/translation-audit-round-13.json"));
  assert.equal(audit.schemaVersion, 1);
  assert.equal(audit.completedForVersion, "1.7.32");
  assert.equal(audit.decisions.length, 1);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const translation = Object.entries(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .filter(([page]) => Number(page) >= 48)
    .map(([, text]) => text)
    .join("\n");

  const decision = audit.decisions[0];
  assert.equal(decision.status, "approved-corrected");
  assert.equal(decision.textChanged, true);
  assert.equal(decision.changedOccurrences, 8);
  assert.ok(decision.rationale.length >= 500);
  for (const approved of decision.approvedPolish) {
    assert.ok(countOccurrences(translation, approved) >= 1, `missing approved form: ${approved}`);
  }
  for (const forbidden of decision.forbiddenPolish) {
    assert.equal(countOccurrences(translation, forbidden), 0, `obsolete calque remains: ${forbidden}`);
  }
  assert.ok(countOccurrences(translation, "I stało się") >= 50, "narrative formula must remain intact");
  assert.ok(countOccurrences(translation, "odpowiedział i rzekł") >= 50, "dialogue formula must remain intact");
});

test("version 1.7.33 formally closes the 208-page global consistency audit", () => {
  const finalAudit = JSON.parse(read("books/pistis-sophia/translation-audit-final.json"));
  assert.equal(finalAudit.schemaVersion, 1);
  assert.equal(finalAudit.completedForVersion, "1.7.33");
  assert.equal(finalAudit.status, "approved-complete");
  assert.equal(finalAudit.textChanged, false);
  assert.equal(finalAudit.readerPageStart, 48);
  assert.equal(finalAudit.readerPageEnd, 255);
  assert.equal(finalAudit.pagesAudited, 208);
  assert.equal(finalAudit.readerPageEnd - finalAudit.readerPageStart + 1, finalAudit.pagesAudited);
  assert.equal(finalAudit.includedStages.length, 13);
  assert.deepEqual(finalAudit.includedStages, [
    "1.7.20", "1.7.21", "1.7.22", "1.7.23", "1.7.24", "1.7.25", "1.7.26",
    "1.7.27", "1.7.28", "1.7.29", "1.7.30", "1.7.31", "1.7.32"
  ]);
  assert.ok(finalAudit.checks.length >= 7);
  assert.ok(finalAudit.conclusion.length >= 300);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const auditedPages = Object.keys(context.window.GNOSTYK_POLISH_TRANSLATIONS)
    .map(Number)
    .filter(page => page >= finalAudit.readerPageStart && page <= finalAudit.readerPageEnd)
    .sort((a, b) => a - b);
  assert.equal(auditedPages.length, finalAudit.pagesAudited);
  assert.deepEqual(
    auditedPages,
    Array.from({ length: finalAudit.pagesAudited }, (_, index) => finalAudit.readerPageStart + index)
  );

  const stageFiles = [
    "translation-audit-decisions.json",
    ...Array.from({ length: 12 }, (_, index) => `translation-audit-round-${index + 2}.json`)
  ];
  const completedVersions = stageFiles.map(file =>
    JSON.parse(read(`books/pistis-sophia/${file}`)).completedForVersion
  );
  assert.deepEqual(completedVersions, finalAudit.includedStages);
});

test("version 1.7.39 preserves the corrected Addendum pages 13-24", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const pages = context.window.GNOSTYK_POLISH_TRANSLATIONS;
  const audited = Array.from({ length: 12 }, (_, index) => pages[index + 13]).join("\n");

  assert.match(pages[18], /Crum i Schmidt są w tej kwestii całkowicie zgodni/);
  assert.match(pages[18], /Treść\. Z zewnętrznego punktu widzenia zawartość dzieli się na cztery główne części/);
  assert.equal(countOccurrences(audited, "Następnie, wraz z rozdziałem 102"), 1);
  assert.equal(countOccurrences(audited, "podatność na błąd"), 0);
  assert.equal(countOccurrences(audited, "wielkim pokazem szczegółowej argumentacji"), 0);
  assert.equal(countOccurrences(audited, "zaatakował problem"), 0);
});

test("version 1.7.40 preserves the restored Addendum pages 25-36", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const pages = context.window.GNOSTYK_POLISH_TRANSLATIONS;
  const audited = Array.from({ length: 12 }, (_, index) => pages[index + 25]).join("\n");

  assert.match(pages[32], /Nauka o eonach/);
  assert.match(pages[32], /Epizod Sophii/);
  assert.match(pages[32], /Wędrówka dusz/);
  assert.match(pages[32], /Pistis Sophia jako dokument zastrzeżony/);
  assert.match(pages[32], /Szkic schematu systemu/);
  assert.equal(countOccurrences(audited, "najwyżej radosnemu faktowi"), 0);
  assert.equal(countOccurrences(audited, "cofa swój oślepiający blask"), 0);
});

test("version 1.7.41 preserves the restored Addendum pages 37-48", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const pages = context.window.GNOSTYK_POLISH_TRANSLATIONS;
  const audited = Array.from({ length: 12 }, (_, index) => pages[index + 37]).join("\n");

  assert.match(pages[39], /Harnack uważa, że część III powinna nosić tytuł „Pytania Maryi”/);
  assert.match(pages[39], /Księga Wielkiego Logosu według Misterium/);
  assert.match(pages[41], /31\. 1893\. Legge/);
  assert.match(pages[41], /35\. 1895\. Amélineau/);
  assert.match(pages[43], /Liechtenhan uważa, że fragment obejmujący strony 128-175/);
  assert.match(pages[43], /45\. 1905\. Schmidt/);
  assert.equal(countOccurrences(audited, "Jej ogólna wartość. Jeśli Księgi Zbawcy"), 0);
  assert.equal(countOccurrences(audited, "Woide uważał, że Pistis Sophia jest bardzo starym rękopisem"), 0);
  assert.equal(countOccurrences(audited, "14. 1856. Anonimowy przekład w Dictionnaire des Apocryphes Migne'a"), 0);
});

test("version 1.7.44 preserves the final reader-language edit of Addendum pages 1-48", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("books/pistis-sophia/polish-translations.js"), context);
  const pages = context.window.GNOSTYK_POLISH_TRANSLATIONS;
  const addendum = Array.from({ length: 48 }, (_, index) => pages[index + 1]).join("\n");

  for (const approved of [
    "Kopiści i ich pismo",
    "Nota dopisana późniejszą ręką",
    "Niniejszy przekład nie ma być opatrzony rozbudowanym komentarzem",
    "Schmidt wykorzystuje tu również wyniki swoich wcześniejszych badań",
    "może wyjaśnić niektóre z najtrudniejszych zagadnień"
  ]) {
    assert.match(addendum, new RegExp(approved));
  }

  for (const obsolete of [
    "Nota późniejszą ręką",
    "Z tego, co dotąd zbieramy z powyższych wskazań",
    "Nie jest planem tego przekładu",
    "Schmidt wciąga tu do badań",
    "najbardziej zagadkowych ciemności",
    "publiczno-domenowe angielskie wydanie"
  ]) {
    assert.equal(countOccurrences(addendum, obsolete), 0, `obsolete calque remains: ${obsolete}`);
  }
});
