window.GNOSTYK_BOOK_MODULES = window.GNOSTYK_BOOK_MODULES || {};
(function () {
  const bookId = "gospel-of-thomas";
  const module = window.GNOSTYK_BOOK_MODULES[bookId] || (window.GNOSTYK_BOOK_MODULES[bookId] = {});
  const existingLayer = module.coptic || {};
  const hasUsableLocalLayer = existingLayer.pages && Object.keys(existingLayer.pages).length >= 1;
  const hasLoaderLayer = !!existingLayer.fetchUrl;
  const copticLayer = (hasUsableLocalLayer || hasLoaderLayer) ? existingLayer : {
    meta: {
      title: "Ewangelia Tomasza — tekst koptyjski",
      status: "Etap 1: warstwa koptyjska zsynchronizowana z logionami 1–114",
      source: "Coptic SCRIPTORIUM, Gospel of Thomas, Nag Hammadi Codex II, edited from the manuscript by Paul Dilley; data released under CC-BY 4.0.",
      note: "Warstwa koptyjska jest pobierana z otwartej edycji Coptic SCRIPTORIUM i grupowana według numerów logionów. Interlinia słowo po słowie pozostaje etapem 2.",
      license: "CC-BY 4.0",
      citation: "Coptic SCRIPTORIUM, Gospel of Thomas, urn:cts:copticLit:nh.thomas.NHAM02:0-114, version 6.2.0."
    },
    pages: {},
    loaded: false,
    loading: false,
    error: null,
    fetchUrl: "https://raw.githubusercontent.com/CopticScriptorium/corpora/master/thomas-gospel/thomas.gospel_TEI/thomas_gospel.xml"
  };
  module.coptic = copticLayer;

  function uniqElements(list) {
    const seen = new Set();
    return list.filter(el => {
      if (seen.has(el)) return false;
      seen.add(el);
      return true;
    });
  }

  function byLocalName(root, name) {
    if (!root) return [];
    return uniqElements([
      ...Array.from(root.getElementsByTagName(name)),
      ...Array.from(root.getElementsByTagNameNS ? root.getElementsByTagNameNS("*", name) : [])
    ]);
  }

  function cleanToken(element) {
    return (element.textContent || "")
      .replace(/\s+/g, "")
      .replace(/\uFFFD/g, "")
      .trim();
  }

  function paragraphText(paragraph) {
    return byLocalName(paragraph, "w")
      .map(cleanToken)
      .filter(Boolean)
      .join(" ")
      .replace(/\s+([·.,;:?!])/g, " $1")
      .trim();
  }

  function sectionEntries(section, n) {
    const paragraphs = byLocalName(section, "p");
    const entries = [];
    paragraphs.forEach((paragraph, index) => {
      const text = paragraphText(paragraph);
      if (!text) return;
      const paragraphNo = paragraph.getAttribute("n") || String(index + 1);
      const isPrologue = n === "0";
      entries.push({
        page: isPrologue ? "1" : String(n),
        ref: isPrologue ? `Prolog ${paragraphNo}` : `Logion ${n}.${paragraphNo}`,
        text,
        bookTitle: "Ewangelia Tomasza · Nag Hammadi Codex II"
      });
    });
    return entries;
  }

  function buildPagesFromPlainText(xmlText) {
    const pages = {};
    const blocks = xmlText
      .split(/~~/g)
      .map(part => part.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
      .filter(part => /[Ⲁ-⳿]/.test(part));
    let logion = 0;
    blocks.forEach((text, index) => {
      const page = index === 0 ? "1" : String(++logion);
      if (Number(page) > 114) return;
      pages[page] = pages[page] || [];
      pages[page].push({
        page,
        ref: index === 0 ? "Prolog" : `Logion ${page}`,
        text,
        bookTitle: "Ewangelia Tomasza · Nag Hammadi Codex II"
      });
    });
    return pages;
  }

  function buildPagesFromXml(xmlText) {
    if (typeof DOMParser !== "function") return buildPagesFromPlainText(xmlText);
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    const parserError = byLocalName(doc, "parsererror")[0];
    if (parserError) throw new Error("Nie udało się odczytać XML Coptic SCRIPTORIUM.");
    const pages = {};
    byLocalName(doc, "div1").forEach(section => {
      const n = section.getAttribute("n");
      if (!n || (n !== "0" && !/^\d+$/.test(n))) return;
      const entries = sectionEntries(section, n);
      entries.forEach(entry => {
        pages[entry.page] = pages[entry.page] || [];
        pages[entry.page].push(entry);
      });
    });
    const count = Object.keys(pages).filter(key => Number(key) >= 1 && Number(key) <= 114).length;
    if (count < 114) {
      const fallback = buildPagesFromPlainText(xmlText);
      const fallbackCount = Object.keys(fallback).filter(key => Number(key) >= 1 && Number(key) <= 114).length;
      if (fallbackCount >= count) return fallback;
      throw new Error(`Niepełna warstwa koptyjska: ${count}/114 logionów.`);
    }
    return pages;
  }

  window.GNOSTYK_LOAD_COPTIC_LAYER = async function (requestedBookId) {
    if (requestedBookId && requestedBookId !== bookId) return null;
    if (copticLayer.loaded) return copticLayer;
    if (copticLayer.loading) return copticLayer.pending;
    copticLayer.loading = true;
    copticLayer.error = null;
    copticLayer.pending = fetch(copticLayer.fetchUrl, { cache: "force-cache" })
      .then(response => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(xmlText => {
        copticLayer.pages = buildPagesFromXml(xmlText);
        copticLayer.loaded = true;
        copticLayer.loading = false;
        copticLayer.error = null;
        return copticLayer;
      })
      .catch(error => {
        copticLayer.error = error.message || String(error);
        copticLayer.loading = false;
        return copticLayer;
      });
    return copticLayer.pending;
  };
})();
