(function initializeDictionaryEngine(global) {
  const textTools = global.GNOSTYK_COPTIC_TEXT_TOOLS || {};
  const cleanToken = textTools.cleanCopticToken || (value => String(value || "").trim());
  const wordMatch = textTools.dictionarySearchWordMatch || (() => 0);

  function scoreEntry(details, query) {
    const q = String(query || "").trim();
    const copticQuery = cleanToken(q).toLowerCase();
    const token = cleanToken(details?.token || "").toLowerCase();
    let score = 0;

    if (copticQuery && token === copticQuery) score = Math.max(score, 220);
    else if (copticQuery && token.startsWith(copticQuery)) score = Math.max(score, 170);
    else if (copticQuery && token.includes(copticQuery)) score = Math.max(score, 80);

    const weightedScore = (field, weight) => {
      const fieldScore = wordMatch(field, q);
      if (fieldScore > 0) score = Math.max(score, fieldScore + weight);
      return fieldScore;
    };
    const transliterationScore = weightedScore(details?.translit, 70);
    const shortEnglishScore = weightedScore(details?.shortEnglish, 60);
    const shortPolishScore = weightedScore(details?.shortPolish, 55);
    if (shortEnglishScore > 0) weightedScore(details?.english, 45);
    if (shortPolishScore > 0) weightedScore(details?.polish, 40);

    const visibleTextScore = Math.max(transliterationScore, shortEnglishScore, shortPolishScore);
    const matchedToken = copticQuery && (token === copticQuery || token.startsWith(copticQuery) || token.includes(copticQuery));
    return !matchedToken && visibleTextScore < 20 ? 0 : score;
  }

  function splitMeanings(text, shortValue = "") {
    const shortClean = String(shortValue || "").trim().toLowerCase();
    return String(text || "")
      .replace(/\bDDGLC ref:?\s*\d+\b/gi, "")
      .replace(/\bCD\s+\d+[a-z]?\b/gi, "")
      .replace(/~~~[^;|,]*/g, "")
      .replace(/\(specific sense unclear\)/gi, "")
      .split(/;;|;|\||,/)
      .map(part => part.replace(/\([^)]{35,}\)/g, "").replace(/^[,;:\s.]+|[,;:\s.]+$/g, "").trim())
      .filter(Boolean)
      .filter(part => part.length > 1)
      .filter(part => !/^\d+$/.test(part))
      .filter((part, index, values) => values.findIndex(other => other.toLowerCase() === part.toLowerCase()) === index)
      .filter(part => !shortClean || part.toLowerCase() !== shortClean)
      .slice(0, 12);
  }

  function meaningCount(value, shortValue = "") {
    const values = new Set();
    const shortClean = String(shortValue || "").trim().toLowerCase();
    if (shortClean) values.add(shortClean);
    splitMeanings(value, shortValue).forEach(item => values.add(item.toLowerCase()));
    return values.size;
  }

  function statusKey(details) {
    const hasPolish = Boolean(String(details?.polish || details?.shortPolish || details?.custom || "").trim());
    const hasEnglish = Boolean(String(details?.english || details?.shortEnglish || "").trim());
    const hasRaw = Boolean(details?.hasData || details?.base || details?.posRaw);
    if (hasPolish && hasEnglish && hasRaw) return "ready";
    if (hasPolish || hasEnglish || hasRaw) return "basic";
    return "pending";
  }

  global.GNOSTYK_DICTIONARY_ENGINE = { scoreEntry, splitMeanings, meaningCount, statusKey };
})(window);
