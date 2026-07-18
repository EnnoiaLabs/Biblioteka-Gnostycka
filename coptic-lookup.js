(function initializeCopticLookup(global) {
  const config = global.GNOSTYK_COPTIC_CONFIG || {};
  const prefixes = config.copticLookupPrefixes || [];
  const suffixes = config.copticLookupSuffixes || [];

  function pushCandidate(list, seen, key, meta = {}) {
    if (!key || key.length < 2 || seen.has(key)) return;
    seen.add(key);
    list.push({ key, ...meta });
  }

  function candidates(cleaned) {
    const value = String(cleaned || "");
    const result = [];
    const seen = new Set();
    pushCandidate(result, seen, value, { type: "direct" });

    for (const [prefix, gloss] of prefixes) {
      if (!value.startsWith(prefix) || value.length <= prefix.length + 1) continue;
      const rest = value.slice(prefix.length);
      pushCandidate(result, seen, rest, { type: "prefix", prefix, prefixGloss: gloss });

      for (const [suffix, suffixGloss] of suffixes) {
        if (!rest.endsWith(suffix) || rest.length <= suffix.length + 1) continue;
        pushCandidate(result, seen, rest.slice(0, -suffix.length), {
          type: "prefix-suffix",
          prefix,
          prefixGloss: gloss,
          suffix,
          suffixGloss
        });
      }
    }

    for (const [suffix, gloss] of suffixes) {
      if (!value.endsWith(suffix) || value.length <= suffix.length + 1) continue;
      pushCandidate(result, seen, value.slice(0, -suffix.length), {
        type: "suffix",
        suffix,
        suffixGloss: gloss
      });
    }

    return result;
  }

  function findEntry(cleaned, sources = {}) {
    const dictionary = sources.dictionary || {};
    const overrides = sources.overrides || {};
    const manualGlosses = sources.manualGlosses || {};
    for (const candidate of candidates(cleaned)) {
      const entry = dictionary[candidate.key];
      const polish = overrides[candidate.key];
      const manual = manualGlosses[candidate.key] || "";
      if (entry || polish || manual) return { ...candidate, entry, polish, manual };
    }
    return null;
  }

  global.GNOSTYK_COPTIC_LOOKUP = { candidates, findEntry };
})(window);
