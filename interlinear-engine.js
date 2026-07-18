(function initializeInterlinearEngine(global) {
  const cleanToken = global.GNOSTYK_COPTIC_TEXT_TOOLS?.cleanCopticToken
    || (value => String(value || "").trim());

  function normalizeToken(token) {
    if (token && typeof token === "object") {
      return {
        surface: token.surface || token.text || token.form || "",
        lemma: token.lemma || "",
        type: token.type || token.pos || "",
        lang: token.lang || ""
      };
    }
    return { surface: String(token || ""), lemma: "", type: "", lang: "" };
  }

  function lookupKey(token) {
    const info = normalizeToken(token);
    const lemma = cleanToken(info.lemma || "").toLowerCase();
    const surface = cleanToken(info.surface || "").toLowerCase();
    return lemma && lemma !== "·" ? lemma : surface;
  }

  function lineTokens(line) {
    if (Array.isArray(line?.tokens) && line.tokens.length) return line.tokens;
    return String(line?.text || "").split(/\s+/).filter(Boolean);
  }

  global.GNOSTYK_INTERLINEAR_ENGINE = { normalizeToken, lookupKey, lineTokens };
})(window);
