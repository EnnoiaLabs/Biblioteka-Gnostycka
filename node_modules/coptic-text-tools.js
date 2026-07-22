window.GNOSTYK_COPTIC_TEXT_TOOLS = (() => {
const transliterationMap = window.GNOSTYK_COPTIC_CONFIG?.copticTransliterationMap || {};
function cleanCopticToken(token) {
  return token
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?()[\]{}"“”'‘’··⸱]/g, "")
    .replace(/[‐‑‒–—―]/g, "")
    .replace(/[-‐‑‒–—―]+$/g, "")
    .trim();
}

function transliterateCoptic(text) {
  return [...text.normalize("NFD")]
    .filter(char => !/[\u0300-\u036f]/.test(char))
    .map(char => transliterationMap[char.toLowerCase()] || char)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDictionarySearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}"“”'‘’··⸱]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dictionarySearchWordMatch(field, query) {
  const normalized = normalizeDictionarySearchText(field);
  const q = normalizeDictionarySearchText(query);
  if (!normalized || !q) return 0;
  const words = normalized.split(/\s+/).filter(Boolean);
  if (normalized === q) return 100;
  if (words.includes(q)) return 80;
  if (words.some(word => word.startsWith(q))) return 45;
  if (normalized.includes(q)) return 20;
  return 0;
}

return { cleanCopticToken, transliterateCoptic, normalizeDictionarySearchText, dictionarySearchWordMatch };
})();
