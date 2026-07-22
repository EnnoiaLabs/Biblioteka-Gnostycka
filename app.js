const bookModules = window.GNOSTYK_BOOK_MODULES || {};
const startupParams = new URLSearchParams(window.location.search || "");
const appStorage = window.GNOSTYK_STORAGE;
const startupBookId = startupParams.get("book");
const storedBookId = appStorage.getItem("gnostyk.activeBook");
const startupWantsReader = startupParams.get("view") === "reader" || startupParams.has("book");
const activeBookId = bookModules[startupBookId]
  ? startupBookId
  : bookModules[storedBookId]
    ? storedBookId
    : "pistis-sophia";
const activeBook = bookModules[activeBookId] || bookModules["pistis-sophia"] || {};
if (startupWantsReader && document.body) {
  document.body.dataset.view = "reader";
}
const isThomasBook = activeBook?.id === "gospel-of-thomas" || activeBookId === "gospel-of-thomas";
const isLogionBook = activeBook?.type === "logion-reader";
const activeBookModule = window.GNOSTYK_BOOK_MODULES?.[activeBookId] || activeBook;
const data = activeBook.data || window.PISTIS_SOPHIA_DATA;
let copticData = activeBook.coptic || window.PISTIS_SOPHIA_COPTIC || { meta: {}, pages: {} };
if (isLogionBook && activeBookModule?.coptic) {
  copticData = activeBookModule.coptic;
}
const libraryMeta = {
  id: "gnostyk-biblioteka",
  name: "Biblioteka Gnozy",
  version: "1.7.42",
  updated: "2026-07-15",
  currentWork: {
    id: activeBook.id || "pistis-sophia",
    title: activeBook.title || "Pistis Sophia",
    status: activeBook.status || "Pełna księga",
    source: activeBook.data?.source || "G. R. S. Mead, Pistis Sophia: A Gnostic Miscellany, London: J. M. Watkins, 1921",
    sourceRights: activeBook.sourceRights || "Domena publiczna",
    creativeLayer: activeBook.id === "gospel-of-thomas" ? "Polskie opracowanie Dariusza Kaniewskiego z wykorzystaniem narzędzi AI, układ logionów i moduł biblioteki" : "Polski przekład, dobór terminologii, układ czytelniczy, noty i aparat cytowania"
  }
};

const PISTIS_TEXT_START_PAGE = 48;
const PISTIS_PAGE_48_SOURCE_MARKER = "[THE FIRST BOOK OF]";
const PISTIS_PAGE_48_POLISH_MARKER = "[KSIĘGA PIERWSZA]";

function splitPistisPage48Text(text, language = currentLanguage()) {
  const marker = language === "pl" ? PISTIS_PAGE_48_POLISH_MARKER : PISTIS_PAGE_48_SOURCE_MARKER;
  return window.GNOSTYK_READER_ENGINE.splitBoundaryText(text, marker);
}

function pistisPage48Introduction(page) {
  if (!page || Number(page.page) !== PISTIS_TEXT_START_PAGE) return "";
  const language = currentLanguage() === "pl" ? "pl" : "en";
  const text = language === "pl"
    ? (page.polish || polishTranslations[PISTIS_TEXT_START_PAGE] || page.text || "")
    : (page.text || "");
  return splitPistisPage48Text(text, language).introduction;
}

function pistisPage48MainText(text, language = currentLanguage()) {
  return splitPistisPage48Text(text, language === "pl" ? "pl" : "en").main;
}

function isPistisBook() {
  return (activeBook?.id || activeBookId) === "pistis-sophia";
}

function isPistisAddendaPage(pageNumber = state?.page) {
  return window.GNOSTYK_READER_ENGINE.isAddendaPage(
    activeBook?.id || activeBookId,
    pageNumber,
    PISTIS_TEXT_START_PAGE
  );
}

function readerTabForPage(tab = state.tab, pageNumber = state.page) {
  return window.GNOSTYK_READER_ENGINE.tabForPage(
    tab,
    activeBook?.id || activeBookId,
    pageNumber,
    PISTIS_TEXT_START_PAGE
  );
}

function defaultStartPageForBook(bookId = activeBookId) {
  return window.GNOSTYK_READER_ENGINE.defaultStartPage(bookId);
}

function clampReaderPage(page, pageCount = data?.pageCount) {
  return window.GNOSTYK_READER_ENGINE.clampPage(page, pageCount);
}

function resolveReaderPage(page) {
  return window.GNOSTYK_READER_ENGINE.resolvePageNumber(data, page);
}

function adjacentReaderPage(direction) {
  return window.GNOSTYK_READER_ENGINE.adjacentAvailablePage(data, state.page, direction);
}

function updateReaderNavigationControls() {
  const navigation = window.GNOSTYK_READER_ENGINE.navigationState(data, state.page);
  [els.prev, els.focusPrev, els.mobilePrev].filter(Boolean).forEach(button => {
    button.disabled = !navigation.canPrevious;
    button.setAttribute("aria-disabled", String(!navigation.canPrevious));
  });
  [els.next, els.focusNext, els.mobileNext].filter(Boolean).forEach(button => {
    button.disabled = !navigation.canNext;
    button.setAttribute("aria-disabled", String(!navigation.canNext));
  });
}

const bookUiInfo = window.GNOSTYK_APP_CONTENT?.bookUiInfo || {};

function bookInfo(key) {
  const language = currentLanguage ? currentLanguage() : "pl";
  const bookId = activeBook?.id || "pistis-sophia";
  const pack = bookUiInfo[bookId] || bookUiInfo["pistis-sophia"];
  return (pack[language] && pack[language][key]) || (pack.pl && pack.pl[key]) || "";
}


const VALID_READER_MODES = window.GNOSTYK_READER_ENGINE.validReaderModes();
function interlinearExperimentalEnabled() {
  try {
    return state.settings.interlinearExperimental === true;
  } catch (error) {
    return savedSettings?.interlinearExperimental === true;
  }
}
function supportedReaderModes() {
  return window.GNOSTYK_READER_ENGINE.supportedReaderModes(activeBook, interlinearExperimentalEnabled());
}
function normalizeReaderMode(mode) {
  return window.GNOSTYK_READER_ENGINE.normalizeReaderMode(mode, activeBook, interlinearExperimentalEnabled());
}

function readerRenderPlan() {
  return window.GNOSTYK_READER_ENGINE.renderPlan({
    mode: state.readerMode,
    isPistis: isPistisBook(),
    isLogionReader: activeBook?.type === "logion-reader",
    sidebarMode: state.sidebarMode
  });
}

const savedSettings = JSON.parse(appStorage.getItem("ps.settings") || "{}");
const state = {
  view: startupWantsReader ? "reader" : (appStorage.getItem("ps.view") || "library"),
  page: Number(startupParams.get("page") || appStorage.getItem(`gnostyk.lastPage.${activeBookId}`) || appStorage.getItem("ps.lastPage") || 1),
  query: "",
  mobileChapterQuery: "",
  tab: "chapters",
  mobilePanel: "toc",
  sidebarMode: "chapters",
  changelogText: "",
  readerMode: normalizeReaderMode(appStorage.getItem("ps.readerMode") || "pl"),
  citationFormat: appStorage.getItem("ps.citationFormat") || "simple",
  aboutOpen: false,
  settingsOpen: false,
  sessionLanguage: ["pl", "en"].includes(appStorage.getItem("ps.interfaceLanguage"))
    ? appStorage.getItem("ps.interfaceLanguage")
    : null,
  settings: {
    language: savedSettings.language || "auto",
    theme: savedSettings.theme || "dark",
    fontSize: savedSettings.fontSize || "medium",
    lineHeight: savedSettings.lineHeight || "normal",
    width: savedSettings.width || "standard",
    textAlignment: ["left", "justify", "center"].includes(savedSettings.textAlignment)
      ? savedSettings.textAlignment
      : (savedSettings.bookJustify === false ? "left" : "justify"),
    bookJustify: savedSettings.bookJustify !== false,
    interlinearExperimental: savedSettings.interlinearExperimental === true,
    interlinearLayout: savedSettings.interlinearLayout || "classic",
    interlinearShowLemma: savedSettings.interlinearShowLemma !== false,
    interlinearShowType: savedSettings.interlinearShowType === true,
    dictionaryScope: savedSettings.dictionaryScope || "current"
  },
  marks: JSON.parse(appStorage.getItem("ps.marks") || "[]"),
  notes: JSON.parse(appStorage.getItem("ps.notes") || "{}"),
  customGlosses: JSON.parse(appStorage.getItem("ps.copticGlosses") || "{}"),
  dictionaryOccurrenceOffsets: {},
  activeDictionaryToken: null
};

if (isPistisBook() && !startupParams.has("page") && state.page < PISTIS_TEXT_START_PAGE) {
  state.page = PISTIS_TEXT_START_PAGE;
}

const uiText = window.GNOSTYK_APP_CONTENT?.uiText || {};

function detectedLanguage() {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language || "pl"];
  return languages.some(lang => String(lang).toLowerCase().startsWith("pl")) ? "pl" : "en";
}

function currentLanguage() {
  if (["pl", "en"].includes(state.sessionLanguage)) return state.sessionLanguage;
  return state.settings.language === "auto" ? detectedLanguage() : state.settings.language;
}

function localizedLibraryName() {
  return currentLanguage() === "pl" ? "Biblioteka Gnozy" : "Gnostic Library";
}

function t(key) {
  const lang = currentLanguage();
  return uiText[lang]?.[key] || uiText.pl[key] || key;
}

const bookThemes = window.GNOSTYK_APP_CONTENT?.bookThemes || {};

const themes = bookThemes[activeBook?.id] || bookThemes["pistis-sophia"];


const { chapterRanges = [], translationPrinciples = [], translationReview = { misalignedIntroPages: new Set(), compressedPages: new Set() } } = window.GNOSTYK_APP_CONTENT || {};

const polishTranslations = window.GNOSTYK_POLISH_TRANSLATIONS || {};

const els = {
  search: document.querySelector("#searchInput"),
  chapters: document.querySelector("#chaptersPanel"),
  themes: document.querySelector("#themesPanel"),
  marks: document.querySelector("#marksPanel"),
  addenda: document.querySelector("#addendaPanel"),
  addendaTab: document.querySelector('[data-tab="addenda"]'),
  pistisSectionSwitch: document.querySelector("#pistisSectionSwitch"),
  pistisTextButton: document.querySelector("#pistisTextButton"),
  pistisAddendaButton: document.querySelector("#pistisAddendaButton"),
  pageText: document.querySelector("#pageText"),
  polishGuide: document.querySelector("#polishGuide"),
  pageInput: document.querySelector("#pageInput"),
  currentPage: document.querySelector("#currentPageLabel"),
  currentChapter: document.querySelector("#currentChapterLabel"),
  prev: document.querySelector("#prevPage"),
  next: document.querySelector("#nextPage"),
  continue: document.querySelector("#continueButton"),
  polishMode: document.querySelector("#polishMode"),
  sourceMode: document.querySelector("#sourceMode"),
  copticMode: document.querySelector("#copticMode"),
  interlinearMode: document.querySelector("#interlinearMode"),
  bookmark: document.querySelector("#bookmarkButton"),
  citationFormat: document.querySelector("#citationFormat"),
  copy: document.querySelector("#copyButton"),
  addendaSidebarToggle: document.querySelector("#addendaSidebarToggle"),
  readerSidebar: document.querySelector("#readerSidebar"),
  sidebarTabs: document.querySelector(".tabs.book-nav"),
  aboutToggle: document.querySelector("#aboutToggle"),
  aboutPanel: document.querySelector("#aboutPanel"),
  settingsToggle: document.querySelector("#librarySettingsToggle"),
  settingsPanel: document.querySelector("#settingsPanel"),
  languageSetting: document.querySelector("#languageSetting"),
  languageAutoHint: document.querySelector("#languageAutoHint"),
  languageSwitchButtons: document.querySelectorAll("[data-language-switch]"),
  themeSetting: document.querySelector("#themeSetting"),
  fontSizeSetting: document.querySelector("#fontSizeSetting"),
  lineHeightSetting: document.querySelector("#lineHeightSetting"),
  widthSetting: document.querySelector("#widthSetting"),
  bookJustifySetting: document.querySelector("#bookJustifySetting"),
  textAlignControls: document.querySelector("#textAlignControls"),
  textAlignButtons: document.querySelectorAll("[data-text-align]"),
  interlinearExperimentalSetting: document.querySelector("#interlinearExperimentalSetting"),
  interlinearLayoutSetting: document.querySelector("#interlinearLayoutSetting"),
  interlinearLemmaSetting: document.querySelector("#interlinearLemmaSetting"),
  interlinearTypeSetting: document.querySelector("#interlinearTypeSetting"),
  dictionaryScopeSetting: document.querySelector("#dictionaryScopeSetting"),
  saveSettingsButton: document.querySelector("#saveSettingsButton"),
  settingsSaveStatus: document.querySelector("#settingsSaveStatus"),
  settingsToast: document.querySelector("#settingsToast"),
  notes: document.querySelector("#notesInput"),
  clearNote: document.querySelector("#clearNote"),
  saveStatus: document.querySelector("#saveStatus"),
  backupStatus: document.querySelector("#backupStatus"),
  chooseBackupFolder: document.querySelector("#chooseBackupFolder"),
  exportNotes: document.querySelector("#exportNotesButton"),
  importNotes: document.querySelector("#importNotesButton"),
  restoreNotesInput: document.querySelector("#restoreNotesInput"),
  glossaryStatus: document.querySelector("#glossaryStatus"),
  glossaryTokenInput: document.querySelector("#glossaryTokenInput"),
  glossaryGlossInput: document.querySelector("#glossaryGlossInput"),
  saveGloss: document.querySelector("#saveGlossButton"),
  clearGlossary: document.querySelector("#clearGlossButton"),
  exportGlossary: document.querySelector("#exportGlossaryButton"),
  importGlossary: document.querySelector("#importGlossaryButton"),
  restoreGlossaryInput: document.querySelector("#restoreGlossaryInput"),
  customGlossaryList: document.querySelector("#customGlossaryList"),
  dictionarySearchInput: document.querySelector("#dictionarySearchInput"),
  dictionarySearchClear: document.querySelector("#dictionarySearchClear"),
  dictionarySearchMeta: document.querySelector("#dictionarySearchMeta"),
  dictionarySearchResults: document.querySelector("#dictionarySearchResults"),
  focus: document.querySelector("#focusToggle"),
  focusExit: document.querySelector("#focusExit"),
  focusPrev: document.querySelector("#focusPrevPage"),
  focusNext: document.querySelector("#focusNextPage"),
  focusPageInput: document.querySelector("#focusPageInput"),
  focusModeToggle: document.querySelector("#focusModeToggle"),
  focusModeMenu: document.querySelector("#focusModeMenu"),
  focusModeItems: document.querySelectorAll("[data-focus-mode]"),
  openWork: document.querySelector("#openWorkButton"),
  thomasDetailsToggle: document.querySelector("#thomasDetailsToggle"),
  thomasDetailsPanel: document.querySelector("#thomasDetailsPanel"),
  libraryHomeToggle: document.querySelector("#libraryHomeToggle"),
  homeRecentUpdates: document.querySelector("#homeRecentUpdates"),
  browseBooksButton: document.querySelector("#browseBooksButton"),
  homeContinueButton: document.querySelector("#homeContinueButton"),
  homeSupportButton: document.querySelector("#homeSupportButton"),
  visitCounterValue: document.querySelector("#visitCounterValue"),
  libraryBooksToggle: document.querySelector("#libraryBooksToggle"),
  libraryInfoToggle: document.querySelector("#libraryInfoToggle"),
  libraryContactToggle: document.querySelector("#libraryContactToggle"),
  libraryPrivacyToggle: document.querySelector("#libraryPrivacyToggle"),
  libraryChangesToggle: document.querySelector("#libraryChangesToggle"),
  libraryHelpToggle: document.querySelector("#libraryHelpToggle"),
  libraryDictionaryToggle: document.querySelector("#libraryDictionaryToggle"),
  libraryToolsToggle: document.querySelector("#libraryToolsToggle"),
  librarySettingsToggle: document.querySelector("#librarySettingsToggle"),
  librarySupportToggle: document.querySelector("#librarySupportToggle"),
  footerInfo: document.querySelector("#footerInfoButton"),
  footerContact: document.querySelector("#footerContactButton"),
  footerPrivacy: document.querySelector("#footerPrivacyButton"),
  footerChanges: document.querySelector("#footerChangesButton"),
  footerSupport: document.querySelector("#footerSupportButton"),
  libraryHomePanel: document.querySelector("#libraryHomePanel"),
  libraryBooksPanel: document.querySelector("#libraryBooksPanel"),
  libraryInfoPanel: document.querySelector("#libraryInfoPanel"),
  libraryContactPanel: document.querySelector("#libraryContactPanel"),
  libraryPrivacyPanel: document.querySelector("#libraryPrivacyPanel"),
  libraryChangesPanel: document.querySelector("#libraryChangesPanel"),
  libraryHelpPanel: document.querySelector("#libraryHelpPanel"),
  libraryDictionaryPanel: document.querySelector("#libraryDictionaryPanel"),
  libraryToolsPanel: document.querySelector("#libraryToolsPanel"),
  librarySupportPanel: document.querySelector("#librarySupportPanel"),
  supportPaypalButton: document.querySelector("#supportPaypalButton"),
  backToLibrary: document.querySelector("#backToLibraryButton"),
  mobileBackToLibrary: document.querySelector("#mobileBackToLibraryButton"),
  readerControls: document.querySelector("#readerControls"),
  pageCount: document.querySelector("#pageCount"),
  chapterCount: document.querySelector("#chapterCount"),
  mobileSheet: document.querySelector("#mobileSheet"),
  mobileOverlay: document.querySelector("#mobileOverlay"),
  mobileClose: document.querySelector("#mobileClose"),
  mobileSheetTitle: document.querySelector("#mobileSheetTitle"),
  mobileChapterSearch: document.querySelector("#mobileChapterSearch"),
  mobileSearch: document.querySelector("#mobileSearchInput"),
  mobileChapters: document.querySelector("#mobileChaptersPanel"),
  mobileSearchPanel: document.querySelector("#mobileSearchPanel"),
  mobileMarks: document.querySelector("#mobileMarksPanel"),
  mobileCurrentPage: document.querySelector("#mobileCurrentPage"),
  mobilePrev: document.querySelector("#mobilePrevPage"),
  mobileNext: document.querySelector("#mobileNextPage"),
  mobileBookmark: document.querySelector("#mobileBookmarkButton"),
  mobileCopy: document.querySelector("#mobileCopyButton"),
  mobileAbout: document.querySelector("#mobileAboutButton"),
  mobileSettings: document.querySelector("#mobileSettingsButton"),
  mobileFocus: document.querySelector("#mobileFocusButton"),
  mobilePolishMode: document.querySelector("#mobilePolishMode"),
  mobileSourceMode: document.querySelector("#mobileSourceMode"),
  mobileCopticMode: document.querySelector("#mobileCopticMode"),
  mobileInterlinearMode: document.querySelector("#mobileInterlinearMode"),
  mobileCitationFormats: document.querySelectorAll("[data-mobile-citation]"),
  libraryVersion: document.querySelector("#libraryVersion"),
  libraryVersionFooter: document.querySelector("#libraryVersionFooter"),
  libraryVersionFooterHome: document.querySelector("#libraryVersionFooterHome"),
  libraryUpdates: document.querySelector("#libraryUpdates"),
  offlineNotice: document.querySelector("#offlineNotice")
};

function listen(element, eventName, handler) {
  if (element) element.addEventListener(eventName, handler);
}

function setText(element, text) {
  if (element) element.textContent = text;
}

function setValue(element, value) {
  if (element) element.value = value;
}

function setChecked(element, checked) {
  if (element) element.checked = Boolean(checked);
}

function setHidden(element, hidden) {
  if (element) element.hidden = Boolean(hidden);
}

const NOTES_BACKUP_FILE = "gnostyk-notes-backup.json";
const GLOSSARY_BACKUP_FILE = "gnostyk-interlinear-glossary.json";
const BACKUP_DB_NAME = "gnostyk-notes-backup";
const BACKUP_STORE_NAME = "handles";
const BACKUP_HANDLE_KEY = "notesDirectory";
let notesBackupTimer = null;
let backupStatusKey = "backupStatusLocal";
let glossaryStatusKey = "glossaryStatusEmpty";

function saveCustomGlosses() {
  appStorage.setItem("ps.copticGlosses", JSON.stringify(state.customGlosses));
}

function setGlossaryStatus(key) {
  glossaryStatusKey = key;
  const count = Object.keys(state.customGlosses || {}).length;
  setText(els.glossaryStatus, t(key).replace("{count}", count));
}

function glossaryPayload() {
  return {
    type: "gnostyk-interlinear-glossary",
    version: libraryMeta.version,
    savedAt: new Date().toISOString(),
    glosses: state.customGlosses
  };
}

function applyGlossaryPayload(payload) {
  if (!payload || payload.type !== "gnostyk-interlinear-glossary" || typeof payload.glosses !== "object") {
    throw new Error("Invalid glossary");
  }
  state.customGlosses = Object.fromEntries(
    Object.entries(payload.glosses)
      .map(([token, gloss]) => [cleanCopticToken(token).toLowerCase(), String(gloss || "").trim()])
      .filter(([token, gloss]) => token && gloss)
  );
  saveCustomGlosses();
  renderGlossaryPanel();
  renderReader();
}

function renderGlossaryPanel() {
  const entries = Object.entries(state.customGlosses || {}).sort(([a], [b]) => a.localeCompare(b));
  const statusKey = entries.length && glossaryStatusKey === "glossaryStatusEmpty" ? "customGlossCount" : glossaryStatusKey;
  setGlossaryStatus(statusKey);
  if (!els.customGlossaryList) return;
  els.customGlossaryList.innerHTML = entries.length
    ? entries.map(([token, gloss]) => `
        <button class="custom-gloss-item" data-gloss-token="${escapeHtml(token)}" type="button">
          <bdi>${escapeHtml(token)}</bdi>
          <span>${escapeHtml(gloss)}</span>
        </button>
      `).join("")
    : `<p>${escapeHtml(t("noCustomGlosses"))}</p>`;
}

function saveGlossFromForm() {
  const token = cleanCopticToken(els.glossaryTokenInput?.value || "").toLowerCase();
  const gloss = (els.glossaryGlossInput?.value || "").trim();
  if (!token || !gloss) {
    setGlossaryStatus("glossaryStatusError");
    return;
  }
  state.customGlosses[token] = gloss;
  saveCustomGlosses();
  setValue(els.glossaryTokenInput, "");
  setValue(els.glossaryGlossInput, "");
  glossaryStatusKey = "glossaryStatusSaved";
  renderGlossaryPanel();
  renderReader();
}

function clearCustomGlossary() {
  state.customGlosses = {};
  saveCustomGlosses();
  glossaryStatusKey = "glossaryStatusCleared";
  renderGlossaryPanel();
  renderReader();
}

function exportGlossary() {
  const blob = new Blob([JSON.stringify(glossaryPayload(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = GLOSSARY_BACKUP_FILE;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  glossaryStatusKey = "glossaryStatusExported";
  renderGlossaryPanel();
}

function importGlossaryFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      applyGlossaryPayload(JSON.parse(reader.result));
      glossaryStatusKey = "glossaryStatusImported";
      renderGlossaryPanel();
    } catch {
      setGlossaryStatus("glossaryStatusError");
    }
  };
  reader.onerror = () => setGlossaryStatus("glossaryStatusError");
  reader.readAsText(file);
}

const { copticTransliterationMap = {}, copticGlosses = {}, copticPrefixGlosses = [], copticLookupPrefixes = [], copticLookupSuffixes = [] } = window.GNOSTYK_COPTIC_CONFIG || {};

function localizedAffixGloss(gloss) {
  if (!gloss || typeof gloss !== "object") return gloss || "";
  return currentLanguage() === "en" ? (gloss.en || gloss.pl || "") : (gloss.pl || gloss.en || "");
}

const { candidates: copticLookupCandidates, findEntry: findCopticDictionaryEntry } = window.GNOSTYK_COPTIC_LOOKUP;

function copticDictionaryLookup(cleaned) {
  return findCopticDictionaryEntry(cleaned, {
    dictionary: window.COPTIC_DICTIONARY,
    overrides: window.COPTIC_POLISH_OVERRIDES,
    manualGlosses: copticGlosses
  });
}

function affixLabelForLookup(lookup) {
  if (!lookup || lookup.type === "direct") return "";
  const parts = [];
  if (lookup.prefixGloss) parts.push(localizedAffixGloss(lookup.prefixGloss));
  if (lookup.suffixGloss) parts.push(localizedAffixGloss(lookup.suffixGloss));
  return parts.filter(Boolean).join(" + ");
}

function localizedPrefixGloss(gloss) {
  if (!gloss || typeof gloss !== "object") return gloss || "";
  return currentLanguage() === "en" ? (gloss.en || gloss.pl || "") : (gloss.pl || gloss.en || "");
}

function supportsFolderBackup() {
  return Boolean(window.showDirectoryPicker && window.isSecureContext && window.indexedDB);
}

function openBackupDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(BACKUP_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(BACKUP_STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStoredDirectoryHandle() {
  if (!supportsFolderBackup()) return null;
  const db = await openBackupDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(BACKUP_STORE_NAME, "readonly").objectStore(BACKUP_STORE_NAME).get(BACKUP_HANDLE_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function storeDirectoryHandle(handle) {
  const db = await openBackupDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(BACKUP_STORE_NAME, "readwrite").objectStore(BACKUP_STORE_NAME).put(handle, BACKUP_HANDLE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function verifyDirectoryPermission(handle, mode = "readwrite") {
  if (!handle) return false;
  const options = { mode };
  if ((await handle.queryPermission(options)) === "granted") return true;
  return (await handle.requestPermission(options)) === "granted";
}

function notesBackupPayload() {
  return {
    type: "gnostyk-notes-backup",
    version: libraryMeta.version,
    savedAt: new Date().toISOString(),
    notes: state.notes,
    marks: state.marks,
    lastPage: state.page,
    settings: state.settings
  };
}

function setBackupStatus(key) {
  backupStatusKey = key;
  setText(els.backupStatus, t(key));
}

function applyNotesBackup(payload) {
  if (!payload || payload.type !== "gnostyk-notes-backup") throw new Error("Invalid backup");
  state.notes = payload.notes && typeof payload.notes === "object" ? payload.notes : {};
  state.marks = Array.isArray(payload.marks) ? payload.marks : state.marks;
  if (payload.settings && typeof payload.settings === "object") {
    state.settings = { ...state.settings, ...payload.settings };
    if (event.target.id === "languageSetting") state.sessionLanguage = null;
    saveSettings();
    applySettings();
    applyLanguage();
  }
  saveMarks();
  appStorage.setItem("ps.notes", JSON.stringify(state.notes));
  renderReader();
  renderLists();
}

async function writeNotesBackupToDirectory(handle) {
  if (!handle || !(await verifyDirectoryPermission(handle))) return false;
  const fileHandle = await handle.getFileHandle(NOTES_BACKUP_FILE, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(notesBackupPayload(), null, 2));
  await writable.close();
  setBackupStatus("backupStatusSaved");
  setTimeout(() => setBackupStatus("backupStatusReady"), 1400);
  return true;
}

function scheduleNotesBackup() {
  window.clearTimeout(notesBackupTimer);
  notesBackupTimer = window.setTimeout(async () => {
    try {
      const handle = await getStoredDirectoryHandle();
      if (handle) await writeNotesBackupToDirectory(handle);
    } catch {
      setBackupStatus("backupStatusError");
    }
  }, 700);
}

async function chooseBackupFolder() {
  if (!supportsFolderBackup()) {
    setBackupStatus("backupStatusUnsupported");
    return;
  }
  try {
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    if (!(await verifyDirectoryPermission(handle))) return;
    await storeDirectoryHandle(handle);
    await writeNotesBackupToDirectory(handle);
    setBackupStatus("backupStatusReady");
  } catch (error) {
    if (error?.name !== "AbortError") setBackupStatus("backupStatusError");
  }
}

function exportNotesBackup() {
  const blob = new Blob([JSON.stringify(notesBackupPayload(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = NOTES_BACKUP_FILE;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setBackupStatus("backupStatusSaved");
}

function importNotesBackupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      applyNotesBackup(JSON.parse(reader.result));
      setBackupStatus("backupStatusRestored");
      scheduleNotesBackup();
    } catch {
      setBackupStatus("backupStatusError");
    }
  };
  reader.onerror = () => setBackupStatus("backupStatusError");
  reader.readAsText(file);
}

async function restoreNotesFromStoredBackup() {
  if (Object.keys(state.notes || {}).length) {
    setBackupStatus(supportsFolderBackup() ? "backupStatusLocal" : "backupStatusUnsupported");
    return;
  }
  try {
    const handle = await getStoredDirectoryHandle();
    if (!handle || !(await verifyDirectoryPermission(handle, "read"))) {
      setBackupStatus(supportsFolderBackup() ? "backupStatusLocal" : "backupStatusUnsupported");
      return;
    }
    const fileHandle = await handle.getFileHandle(NOTES_BACKUP_FILE);
    const file = await fileHandle.getFile();
    applyNotesBackup(JSON.parse(await file.text()));
    setBackupStatus("backupStatusRestored");
  } catch {
    setBackupStatus(supportsFolderBackup() ? "backupStatusLocal" : "backupStatusUnsupported");
  }
}

function pageByNumber(page) {
  return window.GNOSTYK_READER_ENGINE.pageByNumber(data, page);
}

function chapterForPage(page) {
  return window.GNOSTYK_READER_ENGINE.chapterForPage(data, page);
}

function rangeForChapter(chapter) {
  return window.GNOSTYK_READER_ENGINE.rangeForChapter(chapterRanges, chapter);
}

function localizedRangeTitle(range) {
  if (!range || currentLanguage() === "pl") return range?.title || "";
  const titles = {
    "Objawienie po zmartwychwstaniu": "Post-resurrection revelation",
    "Upadek i ocalenie Pistis Sophii": "The fall and rescue of Pistis Sophia",
    "Wyjaśnienia misteriów": "Explanations of the mysteries",
    "Misteria światła i droga duszy": "Mysteries of light and the soul's path",
    "Rytuały, sądy i pouczenia końcowe": "Rituals, judgments, and final teachings"
  };
  return titles[range.title] || range.title;
}

function readableChapter(chapter) {
  if (activeBook?.type === "logion-reader") return chapter ? `${logionUnitLabel()} ${chapter.number}` : logionBookTitle();
  if (!chapter) return currentLanguage() === "pl" ? "Wstęp, spis treści i opracowanie historyczne" : "Introduction, contents, and historical study";
  const range = rangeForChapter(chapter);
  return range ? `${localizedRangeTitle(range)} - ${t("chapter")} ${chapter.number}` : `${t("chapterCapital")} ${chapter.number}`;
}


function logionBookTitle() {
  if (activeBook?.id === "gospel-of-philip") return currentLanguage() === "pl" ? "Ewangelia Filipa" : "Gospel of Philip";
  if (activeBook?.id === "gospel-of-thomas") return currentLanguage() === "pl" ? "Ewangelia Tomasza" : "Gospel of Thomas";
  return activeBook?.title || "Gnostyk";
}

function logionUnitLabel() {
  if (activeBook?.unitName === "section" || activeBook?.structure?.unitName === "section") {
    return currentLanguage() === "pl" ? "Sekcja" : "Section";
  }
  return "Logion";
}

function readerModeLabel(mode) {
  if (mode === "source") return t("source");
  if (mode === "coptic") return t("coptic");
  if (mode === "interlinear") return t("interlinear");
  return t("polishText");
}

function chapterNavExcerpt(chapter) {
  const page = pageByNumber(chapter.page);
  const source = currentLanguage() === "pl" ? (page.polish || polishTranslations[chapter.page] || page.text) : page.text;
  const withoutHead = source
    .replace(/\[[^\]]+\]\s*/g, "")
    .replace(/^ROZDZIAŁ\s+\d+\s*/i, "")
    .replace(/^CHAPTER\s+\d+\s*/i, "")
    .trim();
  return compactText(withoutHead, 120);
}

function chapterMatchesQuery(chapter, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const matchedTheme = themeForQuery(normalized);
  const page = pageByNumber(chapter.page);
  const polishText = page.polish || polishTranslations[chapter.page] || "";
  const hay = `${readableChapter(chapter)} ${chapter.title} ${chapter.subtitle} ${polishText}`.toLowerCase();
  const sourceText = (page.text || "").toLowerCase();
  return hay.includes(normalized)
    || sourceText.includes(normalized)
    || Boolean(matchedTheme && matchedTheme.terms.some(term => sourceText.includes(term.toLowerCase())));
}

function chapterButtonHtml(chapter) {
  const currentChapterNumber = isPistisBook() && Number.isFinite(Number(state.pistisChapter))
    ? Number(state.pistisChapter)
    : chapterForPage(state.page)?.number;
  const active = currentChapterNumber === chapter.number;
  const chapterData = isPistisBook() ? ` data-pistis-chapter="${chapter.number}"` : "";
  return `
    <button class="nav-item ${active ? "is-active" : ""}" data-page="${chapter.page}"${chapterData} type="button">
      <strong>${escapeHtml(readableChapter(chapter))}</strong>
      <span>${activeBook?.type === "logion-reader" ? `${logionUnitLabel()} ${chapter.page}` : `${isPistisBook() && copticRefForPistisChapter(chapter.number) ? `P${copticRefForPistisChapter(chapter.number)} · ` : ""}${currentLanguage() === "pl" ? "str." : t("page")} ${chapter.page}`} · ${escapeHtml(chapterNavExcerpt(chapter))}</span>
    </button>
  `;
}

function pistisAddendaPages() {
  if (!isPistisBook()) return [];
  return data.pages.filter(page => Number(page.page) <= PISTIS_TEXT_START_PAGE);
}

function addendaLocalizedText(page) {
  const pageNumber = Number(page.page);
  return currentLanguage() === "pl"
    ? (page.polish || polishTranslations[pageNumber] || page.text || "")
    : (page.text || page.preview || "");
}

function completeSentenceExcerpt(text, max = 150) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const sentences = clean.match(/[^.!?…]+(?:[.!?…]+[”’'"]?|$)/g)?.map(item => item.trim()).filter(Boolean) || [clean];
  let excerpt = "";
  for (const sentence of sentences) {
    const candidate = excerpt ? `${excerpt} ${sentence}` : sentence;
    if (excerpt && candidate.length > max) break;
    excerpt = candidate;
    if (excerpt.length >= Math.min(90, max)) break;
  }
  return excerpt || sentences[0];
}

function addendaTitleForPage(page) {
  const pageNumber = Number(page.page);
  if (pageNumber === 1) return currentLanguage() === "pl" ? "Karta tytułowa i nota edytorska" : "Title page and editorial note";
  if (pageNumber === 2) return currentLanguage() === "pl" ? "Wstęp, spis treści i opracowanie historyczne" : "Introduction, contents, and historical study";
  if (pageNumber === PISTIS_TEXT_START_PAGE) return currentLanguage() === "pl" ? "Zakończenie wprowadzenia" : "Conclusion of the introduction";
  return compactText(addendaLocalizedText(page), 105) || t("addendaPageFallback");
}

function addendaButtonHtml(page) {
  const pageNumber = Number(page.page);
  const active = state.page === pageNumber;
  const localizedText = pageNumber === PISTIS_TEXT_START_PAGE ? pistisPage48Introduction(page) : addendaLocalizedText(page);
  const preview = compactText(localizedText, 165);
  return `
    <button class="nav-item ${active ? "is-active" : ""}" data-page="${pageNumber}" data-addenda-page="${pageNumber}" type="button">
      <strong>${escapeHtml(addendaTitleForPage(page))}</strong>
      <span>${t("page")} ${pageNumber}${preview ? ` · ${escapeHtml(preview)}` : ""}</span>
    </button>
  `;
}

function renderPistisAddendaContinuousText() {
  const pages = pistisAddendaPages();
  const isSource = state.readerMode === "source";
  const modeClass = isSource ? " source-prose" : "";
  return pages.map(page => {
    const pageNumber = Number(page.page);
    const text = pageNumber === PISTIS_TEXT_START_PAGE
      ? pistisPage48Introduction(page)
      : (isSource ? (page.text || "") : polishPageText(page, null));
    return `
      <section class="addenda-text-section" id="addenda-page-${pageNumber}" data-addenda-text-page="${pageNumber}">
        <div class="addenda-text-heading">
          <span>${escapeHtml(t("page"))} ${pageNumber}</span>
          <strong>${escapeHtml(addendaTitleForPage(page))}</strong>
        </div>
        <div class="page-prose${modeClass}">${isSource ? structuredSourceProseHtml(text) : highlight(text)}</div>
      </section>
    `;
  }).join("");
}

function markButtonHtml(page) {
  const item = pageByNumber(page);
  return `
    <button class="mark-item" data-page="${page}" type="button">
      <strong>${activeBook?.type === "logion-reader" ? `${logionUnitLabel()} ${page}` : `${t("page")} ${page}`}</strong>
      <span>${escapeHtml(item.preview || (currentLanguage() === "pl" ? "Zapisana strona" : "Saved page"))}</span>
    </button>
  `;
}

function hitsForPage(page) {
  const lower = page.text.toLowerCase();
  return themes
    .map(theme => ({
      ...theme,
      count: theme.terms.reduce((sum, term) => {
        const matches = lower.match(new RegExp(term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"));
        return sum + (matches ? matches.length : 0);
      }, 0)
    }))
    .filter(theme => theme.count > 0)
    .sort((a, b) => b.count - a.count);
}

function themeForQuery(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;
  return themes.find(theme => {
    const labels = [theme.label, localizedThemeLabel(theme), ...(theme.aliases || [])].map(item => item.toLowerCase());
    return labels.includes(normalized) || theme.terms.some(term => term.toLowerCase() === normalized);
  }) || null;
}

function localizedThemeLabel(theme) {
  return currentLanguage() === "pl" ? theme.label : (theme.enLabel || theme.label);
}

function localizedThemeNote(theme) {
  return currentLanguage() === "pl" ? theme.note : (theme.enNote || theme.note);
}

function sourceLineStartsNewParagraph(line, currentText) {
  if (!currentText || !/[.!?][”’'\"]?$/.test(currentText.trim())) return false;
  if (/^["“‘]/.test(line)) return true;
  if (/^(?:It came to pass|And it came to pass|Then\b|Thereupon\b|From this\b|After this\b|When\b|Now\b)/i.test(line)) return true;
  // Short editorial rubrics in Mead's edition, e.g. "He promiseth to tell them all things. Then ..."
  return /^[A-Z][^.!?]{1,72}[.!?]\s+(?:Then|And|But|It|The|Jesus|Mary|Peter|Philip|Sophia|He|She|They|When|From|Thereupon)\b/.test(line);
}

function structuredSourceProseHtml(text) {
  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];

  const normalizeText = value => String(value || "").replace(/\s+/g, " ").trim();

  const pushSourceParagraph = value => {
    let content = normalizeText(value).replace(/^\[paragraph continues\]\s*/i, "");
    if (!content) return;

    // Mead often prints a short editorial rubric at the start of the same line as the paragraph.
    // Split it into its own heading so the English layer mirrors the structured Polish layer.
    const rubricMatch = content.match(/^(.{3,118}?[.!?])\s+(?=(?:["“‘]|It\b|And\b|Then\b|When\b|Now\b|But\b|Jesus\b|Mary\b|Peter\b|Philip\b|Thomas\b|John\b|The\b|He\b|She\b|They\b|Thereafter\b|From\b))/);
    if (rubricMatch) {
      const candidate = rubricMatch[1].trim();
      const rubricLike = /^(?:Of\b|The\b|Jesus\b|Mary\b|Peter\b|Philip\b|Thomas\b|John\b|Sophia\b|He\b|She\b|A\b|An\b)/i.test(candidate)
        && (/(?:eth|est|th)\b/i.test(candidate) || /^(?:Of|The (?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth)|A sinner|Even the|Jesus|Mary|Peter|Philip|Thomas|John|Sophia)\b/i.test(candidate));
      if (rubricLike) {
        blocks.push({ type: "rubric", text: candidate });
        content = content.slice(rubricMatch[0].length).trim();
      }
    }

    if (content) blocks.push({ type: "paragraph", text: content });
  };

  const flushParagraph = () => {
    const joined = paragraph.join(" ");
    if (normalizeText(joined)) pushSourceParagraph(joined);
    paragraph = [];
  };

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      return;
    }
    if (/^CHAPTER\s+[IVXLCDM\d]+\.?$/i.test(line)) {
      flushParagraph();
      blocks.push({ type: "chapter", text: line });
      return;
    }
    if (/^p\.\s*[ivxlcdm\d]+\.?$/i.test(line)) {
      flushParagraph();
      blocks.push({ type: "page", text: line });
      return;
    }
    if (/^\[[^\]]+\]$/.test(line)
      || /^(?:DIVISION\s+[IVXLCDM\d]+\.?|THE\s+(?:FIRST|SECOND|THIRD|FOURTH)\s+BOOK\b.*|THE\s+STORY\s+OF\b.*|PREFACE|INTRODUCTION|CONTENTS|TRANSLATION|ANNOTATED BIBLIOGRAPHY|FOOTNOTES|THE END\.?)$/i.test(line)
      || (/^[A-Z0-9ÆŒ .,:;’'()\-]+$/.test(line) && line.length <= 115 && /[A-Z]/.test(line))) {
      flushParagraph();
      blocks.push({ type: "book-heading", text: line });
      return;
    }
    const currentText = paragraph.join(" ");
    if (sourceLineStartsNewParagraph(line, currentText)) flushParagraph();
    paragraph.push(line);
  });
  flushParagraph();

  return blocks.map(block => {
    if (block.type === "chapter") return `<h3 class="source-chapter-heading">${highlight(block.text)}</h3>`;
    if (block.type === "book-heading") return `<h2 class="source-book-heading">${highlight(block.text)}</h2>`;
    if (block.type === "page") return `<div class="source-page-marker">${highlight(block.text)}</div>`;
    if (block.type === "rubric") return `<h4 class="source-rubric">${highlight(block.text)}</h4>`;
    return `<p class="source-paragraph">${highlight(block.text)}</p>`;
  }).join("");
}
function sourceProseHtml(text) {
  return state.settings.bookJustify === true ? structuredSourceProseHtml(text) : highlight(text);
}

function structuredPolishProseHtml(text) {
  const normalized = String(text || "").replace(/\r\n?/g, "\n");
  const rawBlocks = normalized.split(/\n\s*\n+/).map(block => block.trim()).filter(Boolean);
  const blocks = [];

  const pushParagraphWithMarkers = value => {
    const parts = String(value || "").split(/\s*\|(\d+)\.\s*/g);
    const lead = (parts.shift() || "").replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
    if (lead) blocks.push({ type: "paragraph", text: lead });
    for (let index = 0; index < parts.length; index += 2) {
      const number = parts[index];
      const following = (parts[index + 1] || "").replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
      if (number) blocks.push({ type: "page", text: `p. ${number}` });
      if (following) blocks.push({ type: "paragraph", text: following });
    }
  };

  rawBlocks.forEach(rawBlock => {
    const compact = rawBlock.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
    if (!compact) return;
    if (/^ROZDZIAŁ\s+\d+\.?$/i.test(compact)) {
      blocks.push({ type: "chapter", text: compact });
      return;
    }
    if (/^\[[^\]]+\]$/.test(compact) || (/^[A-ZĄĆĘŁŃÓŚŹŻ0-9 .,:;„”'’()-]+$/.test(compact) && compact.length <= 72)) {
      blocks.push({ type: "book-heading", text: compact });
      return;
    }
    if (/^p\.\s*\d+\.?$/i.test(compact)) {
      blocks.push({ type: "page", text: compact });
      return;
    }
    // Numbered verses and list items (for example Psalms quoted inside Pistis Sophia)
    // are body text, not editorial rubrics/headings.
    if (/^\d{1,3}\.\s+\S/.test(compact)) {
      blocks.push({ type: "numbered-paragraph", text: compact });
      return;
    }
    const startsWithQuotation = /^[„“”«»'’‘"]/.test(compact);
    const explicitEditorialRubric = /^(?:Jezus|Maria|Maryja|Marta|Salome|Piotr|Andrzej|Jakub|Jan|Filip|Tomasz|Mateusz)(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][\p{L}-]+){0,2}\s+(?:interpretuje|wyjaśnia|pochwala|chwali|pyta|odpowiada|ogłasza|kontynuuje|przedstawia|rozwiązuje)\b/iu.test(compact)
      || /^(?:Pierwsza|Druga|Trzecia|Czwarta|Piąta|Szósta|Siódma|Ósma|Dziewiąta|Dziesiąta|Jedenasta|Dwunasta|Trzynasta)\s+(?:pokuta|szata)\b/i.test(compact)
      || /^Pokuta\s+Sophii\b/i.test(compact)
      || /^Rozwiązanie\b/i.test(compact);
    const narrativeStart = /^(?:I|A|Ale|Wtedy|Gdy|Albowiem|Ponieważ|Lecz|Oto|Teraz|Następnie|Rzekł|Rzekła|Powiedział|Powiedziała|Jezus\s+(?:rzekł|znowu|podjął|odpowiedział)|Maria\s+(?:wystąpiła|znowu|rzekła|odpowiedziała)|Maryja\s+(?:wystąpiła|znowu|rzekła|odpowiedziała)|Piotr\s+(?:rzekł|wystąpił)|Filip\s+(?:rzekł|wystąpił)|Tomasz\s+(?:rzekł|wystąpił)|Jan\s+(?:rzekł|wystąpił))\b/i.test(compact);
    const genericEditorialRubric = compact.length <= 105
      && compact.split(/\s+/).length <= 16
      && /[.!?]$/.test(compact)
      && !narrativeStart;
    const isRubric = !startsWithQuotation
      && !compact.includes("|")
      && (explicitEditorialRubric || genericEditorialRubric);
    if (isRubric) {
      blocks.push({ type: "rubric", text: compact });
      return;
    }
    pushParagraphWithMarkers(rawBlock);
  });

  return blocks.map(block => {
    if (block.type === "chapter") return `<h3 class="source-chapter-heading polish-chapter-heading">${highlight(block.text)}</h3>`;
    if (block.type === "book-heading") return `<h2 class="polish-book-heading">${highlight(block.text)}</h2>`;
    if (block.type === "page") return `<div class="source-page-marker polish-page-marker">${highlight(block.text)}</div>`;
    if (block.type === "rubric") return `<h4 class="polish-rubric">${highlight(block.text)}</h4>`;
    if (block.type === "numbered-paragraph") return `<p class="source-paragraph polish-paragraph polish-numbered-paragraph">${highlight(block.text)}</p>`;
    return `<p class="source-paragraph polish-paragraph">${highlight(block.text)}</p>`;
  }).join("");
}

function polishProseHtml(text) {
  return structuredPolishProseHtml(text);
}

function addPistisChapterAnchors(html) {
  const used = new Set();
  return String(html || "").replace(/\b(?:CHAPTER|ROZDZIAŁ)\s+(\d+)\.?/gi, match => {
    const number = Number((match.match(/\d+/) || [])[0]);
    if (!Number.isFinite(number) || used.has(number)) return match;
    used.add(number);
    return `<span class="pistis-chapter-anchor" id="pistis-chapter-${number}" data-pistis-text-chapter="${number}" aria-hidden="true"></span>${match}`;
  });
}

function renderPistisContinuousText() {
  const isSource = state.readerMode === "source";
  const pages = (Array.isArray(data.pages) ? data.pages : []).filter(item => Number(item.page) >= PISTIS_TEXT_START_PAGE);
  return `
    <div class="pistis-continuous page-prose${isSource ? " source-prose" : ""}">
      ${pages.map(item => {
        const pageNumber = Number(item.page);
        const chapter = chapterForPage(pageNumber);
        let text = isSource ? (item.text || "") : polishPageText(item, chapter);
        if (pageNumber === PISTIS_TEXT_START_PAGE) {
          text = pistisPage48MainText(text, isSource ? "en" : "pl");
        }
        const rendered = isSource ? structuredSourceProseHtml(text) : polishProseHtml(text);
        return `
          <section id="pistis-page-${pageNumber}" class="pistis-page-section" data-pistis-text-page="${pageNumber}">
            <div class="pistis-page-number">${escapeHtml(t("page"))} ${pageNumber}</div>
            <div class="pistis-page-content">${addPistisChapterAnchors(rendered)}</div>
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function highlight(text) {
  if (!state.query.trim()) return escapeHtml(text);
  const pattern = state.query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escapeHtml(text).replace(new RegExp(pattern, "gi"), match => `<mark>${match}</mark>`);
}

function logionTextForPage(page) {
  if (!page) return "";
  if (state.readerMode === "source") return page.en || page.text || "";
  return page.polish || polishTranslations[page.page] || page.pl || page.text || "";
}

function renderLogionContinuousText() {
  const modeClass = state.readerMode === "source" ? " source-prose" : "";
  const modeLabel = state.readerMode === "source"
    ? (currentLanguage() === "pl" ? "Warstwa angielska" : "English text")
    : (currentLanguage() === "pl" ? "Tekst polski" : "Polish text");
  const pages = Array.isArray(data.pages) ? data.pages : [];
  if (!pages.length) {
    const fallback = currentLanguage() === "pl"
      ? "Tekst tej księgi nie został wczytany."
      : "This book text has not been loaded.";
    return `<div class="logion-continuous page-prose"><section class="logion-block is-active"><div>${escapeHtml(fallback)}</div></section></div>`;
  }
  return `
    <div class="logion-continuous page-prose${modeClass}">
      ${pages.map(item => {
        const text = logionTextForPage(item);
        const isActive = Number(item.page) === Number(state.page);
        return `
          <section id="logion-${escapeHtml(String(item.page))}" class="logion-block ${isActive ? "is-active" : ""}" data-logion="${escapeHtml(String(item.page))}">
            <h2>${escapeHtml(logionUnitLabel())} ${escapeHtml(String(item.page))}</h2>
            <p class="logion-layer-label">${escapeHtml(modeLabel)}</p>
            <div>${state.readerMode === "source" ? sourceProseHtml(text) : highlight(text)}</div>
          </section>
        `;
      }).join("")}
    </div>
  `;
}


function compactText(text, max = 170) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trim()}...` : clean;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function manuscriptRefsForPage(page) {
  return window.GNOSTYK_READER_ENGINE.manuscriptRefs(page);
}

function copticRefsForPage(page) {
  return window.GNOSTYK_READER_ENGINE.copticRefs(page, isThomasBook || activeBook?.type === "logion-reader");
}

let pistisChapterManuscriptMapCache = null;

function pistisChapterManuscriptMap() {
  if (!isPistisBook()) return new Map();
  if (pistisChapterManuscriptMapCache) return pistisChapterManuscriptMapCache;
  const map = new Map();
  let currentRef = "1";
  for (const page of (Array.isArray(data.pages) ? data.pages : [])) {
    const text = String(page.text || "");
    const tokenPattern = /\|(\d{1,3})\.?|\bCHAPTER\s+(\d+)\.?/gi;
    let match;
    while ((match = tokenPattern.exec(text))) {
      if (match[1]) {
        currentRef = String(Number(match[1]));
      } else if (match[2]) {
        map.set(Number(match[2]), currentRef);
      }
    }
  }
  pistisChapterManuscriptMapCache = map;
  return map;
}

function copticRefForPistisChapter(chapterNumber) {
  return pistisChapterManuscriptMap().get(Number(chapterNumber)) || null;
}

function activePistisCopticRefs() {
  const selected = Number(state.pistisChapter);
  const selectedRef = Number.isFinite(selected) ? copticRefForPistisChapter(selected) : null;
  if (selectedRef) return new Set([String(selectedRef)]);
  return new Set(copticRefsForPage(pageByNumber(state.page)).map(String));
}

function copticEntriesForPage(page) {
  const module = window.GNOSTYK_BOOK_MODULES?.[activeBookId];
  if (activeBook?.type === "logion-reader" && module?.coptic && copticData !== module.coptic) {
    copticData = module.coptic;
  }
  return copticRefsForPage(page).flatMap(ref => copticData.pages?.[ref] || []);
}

function ensureCopticLayerLoaded() {
  const module = window.GNOSTYK_BOOK_MODULES?.[activeBookId];
  if (activeBook?.type === "logion-reader" && module?.coptic) {
    copticData = module.coptic;
  }
  if (!activeBook?.id || !copticData?.fetchUrl || copticData.loaded || copticData.loading) return;
  if (typeof window.GNOSTYK_LOAD_COPTIC_LAYER !== "function") return;
  window.GNOSTYK_LOAD_COPTIC_LAYER(activeBook.id).then(() => {
    if (state.readerMode === "coptic" || state.readerMode === "interlinear") renderReader();
  });
}

function copticPageText(page) {
  const refs = copticRefsForPage(page);
  const entries = copticEntriesForPage(page);
  if (!entries.length) {
    if ((isThomasBook || activeBook?.type === "logion-reader") && copticData?.fetchUrl) {
      ensureCopticLayerLoaded();
      const loadingText = copticData.error
        ? (currentLanguage() === "pl" ? `Nie udało się załadować warstwy koptyjskiej: ${copticData.error}` : `Could not load the Coptic layer: ${copticData.error}`)
        : (currentLanguage() === "pl" ? "Ładowanie koptyjskiej warstwy Ewangelii Tomasza z Coptic SCRIPTORIUM…" : "Loading the Gospel of Thomas Coptic layer from Coptic SCRIPTORIUM…");
      return `
        <div class="coptic-source-note coptic-empty-note">
          <strong>${escapeHtml(currentLanguage() === "pl" ? "Warstwa koptyjska" : "Coptic layer")}</strong>
          <p>${escapeHtml(loadingText)}</p>
        </div>
      `;
    }
    if (isThomasBook) {
      ensureCopticLayerLoaded();
      const message = copticData?.error
        ? (currentLanguage() === "pl" ? `Nie udało się załadować koptyjskiego tekstu Tomasza: ${copticData.error}` : `Could not load Thomas Coptic text: ${copticData.error}`)
        : (currentLanguage() === "pl" ? "Koptyjski tekst Tomasza jest ładowany. Odśwież stronę po kilku sekundach, jeśli widzisz ten komunikat z pamięci podręcznej PWA." : "The Thomas Coptic text is loading. Refresh after a few seconds if this comes from the PWA cache.");
      return `
        <div class="coptic-source-note coptic-empty-note">
          <strong>${escapeHtml(currentLanguage() === "pl" ? `Tekst koptyjski: ${logionBookTitle()}` : `Coptic text: ${logionBookTitle()}`)}</strong>
          <p>${escapeHtml(message)}</p>
        </div>
      `;
    }
    return `
      <div class="coptic-source-note coptic-empty-note">
        <strong>${escapeHtml(t("copticEmptyTitle"))}</strong>
        <p>${t("copticEmptyNote").replace("{ref}", "<span>|298</span>")}</p>
      </div>
    `;
  }
  const grouped = refs.map(ref => {
    const lines = entries.filter(entry => String(entry.page) === String(ref));
    if (!lines.length) return "";
    return `
      <section class="coptic-page" aria-label="${(isThomasBook || activeBook?.type === "logion-reader") ? `${logionUnitLabel()} ${escapeHtml(ref)}` : `Schwartze-Petermann ${escapeHtml(ref)}`} ">
        <header>
          <strong>${(isThomasBook || activeBook?.type === "logion-reader") ? `${logionUnitLabel()} ${escapeHtml(ref)}` : `Schw.-Pet. ${escapeHtml(ref)}`}</strong>
          <span>${escapeHtml(lines[0].bookTitle || "Tekst koptyjski")} · ${lines.length} ${currentLanguage() === "pl" ? "sekcji" : "sections"}</span>
        </header>
        ${lines.map(line => `
          <p class="coptic-line">
            <span>${escapeHtml(line.ref)}</span>
            <bdi>${escapeHtml(line.text)}</bdi>
          </p>
        `).join("")}
      </section>
    `;
  }).join("");
  const source = copticData.meta?.source || "cyfrowa transkrypcja Unicode";
  const note = copticData.meta?.note || "Warstwa koptyjska ma status roboczy i wymaga dalszej kolacji.";
  return `
    <div class="coptic-source-note">
      <strong>Warstwa koptyjska Unicode</strong>
      <p>${escapeHtml(source)}. ${escapeHtml(note)}</p>
    </div>
    <div class="coptic-text">${grouped}</div>
  `;
}



function pistisCopticPageRefs() {
  const pages = window.GNOSTYK_BOOK_MODULES?.[activeBookId]?.coptic?.pages || copticData?.pages || {};
  return Object.keys(pages)
    .filter(ref => Array.isArray(pages[ref]) && pages[ref].length)
    .sort((a, b) => Number(a) - Number(b));
}

function renderPistisCopticContinuousText() {
  const pages = window.GNOSTYK_BOOK_MODULES?.[activeBookId]?.coptic?.pages || copticData?.pages || {};
  const refs = pistisCopticPageRefs();
  const source = copticData?.meta?.source || "cyfrowa transkrypcja Unicode";
  const note = currentLanguage() === "pl"
    ? "Tekst jest wyświetlany w pełnej kolejności rękopisu, bez uzależniania ciągłości od znaczników stron w przekładzie Meada."
    : "The text is displayed in the complete manuscript order, without making continuity depend on page markers in Mead's translation.";
  if (!refs.length) return copticPageText(pageByNumber(state.page));
  const activeRefs = activePistisCopticRefs();
  return `
    <div class="coptic-source-note">
      <strong>${escapeHtml(currentLanguage() === "pl" ? "Warstwa koptyjska Unicode" : "Unicode Coptic layer")}</strong>
      <p>${escapeHtml(source)}. ${escapeHtml(note)}</p>
    </div>
    <div class="coptic-text pistis-coptic-continuous">
      ${refs.map(ref => {
        const lines = pages[ref] || [];
        const active = activeRefs.has(String(ref));
        return `
          <section id="coptic-page-${escapeHtml(ref)}" class="coptic-page ${active ? "is-active" : ""}" data-coptic-page="${escapeHtml(ref)}" aria-label="Schwartze-Petermann ${escapeHtml(ref)}">
            <header>
              <strong>Schw.-Pet. ${escapeHtml(ref)}</strong>
              <span>${escapeHtml(lines[0]?.bookTitle || "Pistis Sophia")} · ${lines.length} ${currentLanguage() === "pl" ? "sekcji" : "sections"}</span>
            </header>
            ${lines.map(line => `
              <p class="coptic-line">
                <span>${escapeHtml(line.ref)}</span>
                <bdi>${escapeHtml(line.text)}</bdi>
              </p>
            `).join("")}
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function renderThomasCopticContinuousText() {
  ensureCopticLayerLoaded();
  const pages = window.GNOSTYK_BOOK_MODULES?.[activeBookId]?.coptic?.pages || copticData?.pages || {};
  const refs = data.pages.map(item => String(item.page));
  const loadedCount = refs.filter(ref => Array.isArray(pages[ref]) && pages[ref].length).length;
  const source = copticData?.meta?.source || `${logionBookTitle()}, Nag Hammadi Codex II.`;
  const note = copticData?.meta?.note || "Warstwa koptyjska Unicode jest grupowana według numerów logionów.";

  if (!loadedCount) {
    const loadingText = copticData?.error
      ? (currentLanguage() === "pl" ? `Nie udało się załadować koptyjskiego tekstu Tomasza: ${copticData.error}` : `Could not load the Coptic layer for ${logionBookTitle()}: ${copticData.error}`)
      : (currentLanguage() === "pl" ? "Ładowanie pełnego tekstu koptyjskiego Ewangelii Tomasza…" : "Loading the full Coptic text of the Gospel of Thomas…");
    return `
      <div class="coptic-source-note coptic-empty-note">
        <strong>${escapeHtml(currentLanguage() === "pl" ? `Tekst koptyjski: ${logionBookTitle()}` : `Coptic text: ${logionBookTitle()}`)}</strong>
        <p>${escapeHtml(loadingText)}</p>
      </div>
    `;
  }

  return `
    <div class="coptic-source-note">
      <strong>${escapeHtml(currentLanguage() === "pl" ? "Warstwa koptyjska Unicode" : "Unicode Coptic layer")}</strong>
      <p>${escapeHtml(source)} ${escapeHtml(note)}</p>
    </div>
    <div class="coptic-text thomas-coptic-continuous">
      ${refs.map(ref => {
        const lines = pages[ref] || [];
        const isActive = Number(ref) === Number(state.page);
        return `
          <section id="logion-${escapeHtml(ref)}" class="coptic-page logion-block ${isActive ? "is-active" : ""}" data-logion="${escapeHtml(ref)}" aria-label="${escapeHtml(logionUnitLabel())} ${escapeHtml(ref)}">
            <header>
              <strong>${escapeHtml(logionUnitLabel())} ${escapeHtml(ref)}</strong>
              <span>${escapeHtml(lines[0]?.bookTitle || "Ewangelia Tomasza · Nag Hammadi Codex II")}${lines.length ? ` · ${lines.length} ${currentLanguage() === "pl" ? "sekcji" : "sections"}` : ""}</span>
            </header>
            ${lines.length ? lines.map(line => `
              <p class="coptic-line">
                <span>${escapeHtml(line.ref)}</span>
                <bdi>${escapeHtml(line.text)}</bdi>
              </p>
            `).join("") : `<p class="coptic-line"><span>${escapeHtml(logionUnitLabel())} ${escapeHtml(ref)}</span><bdi>${escapeHtml(currentLanguage() === "pl" ? "Brak przypisanego tekstu koptyjskiego." : "No assigned Coptic text.")}</bdi></p>`}
          </section>
        `;
      }).join("")}
    </div>
  `;
}


const { cleanCopticToken, transliterateCoptic, normalizeDictionarySearchText, dictionarySearchWordMatch } = window.GNOSTYK_COPTIC_TEXT_TOOLS;

function dictionaryGlossForToken(cleaned) {
  const polish = window.COPTIC_POLISH_OVERRIDES?.[cleaned];
  const entry = window.COPTIC_DICTIONARY?.[cleaned];
  if (currentLanguage() === "pl") {
    if (polish) return polish;
    if (entry && typeof entry === "object" && entry.pl) return entry.pl;
    return "";
  }
  if (entry) {
    if (typeof entry === "string") return entry;
    if (entry.en) return entry.en;
  }
  return "";
}

function glossFromLookup(lookup) {
  if (!lookup) return "";
  let gloss = "";
  if (currentLanguage() === "pl") {
    gloss = state.customGlosses?.[lookup.key] || lookup.manual || lookup.polish || (typeof lookup.entry === "object" ? (lookup.entry.pl || "") : "");
  } else if (lookup.entry) {
    gloss = typeof lookup.entry === "string" ? lookup.entry : (lookup.entry.en || "");
  }
  if (!gloss) return "";
  const affix = affixLabelForLookup(lookup);
  return affix ? `${affix} + ${gloss}` : gloss;
}

function fallbackDictionaryGloss(cleaned) {
  const direct = dictionaryGlossForToken(cleaned);
  if (direct) return direct;
  return glossFromLookup(copticDictionaryLookup(cleaned));
}

function manualGlossForToken(cleaned) {
  if (state.customGlosses?.[cleaned]) return state.customGlosses[cleaned];
  if (currentLanguage() !== "pl") return "";
  if (copticGlosses[cleaned]) return copticGlosses[cleaned];
  for (const [prefix, gloss] of copticPrefixGlosses) {
    if (!cleaned.startsWith(prefix) || cleaned.length <= prefix.length + 1) continue;
    const rest = cleaned.slice(prefix.length);
    if (copticGlosses[rest]) return `${localizedPrefixGloss(gloss)} + ${copticGlosses[rest]}`;
  }
  return "";
}


function compactGlossText(gloss) {
  if (!gloss) return "";
  const cleaned = String(gloss)
    .replace(/\bDDGLC ref:?\s*\d+\b/gi, "")
    .replace(/\(specific sense unclear\)/gi, "")
    .replace(/\([^)]{25,}\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const firstMeaning = cleaned
    .split(/;;|;|\|/)
    .map(part => part.replace(/^[,;:\s]+|[,;:\s]+$/g, "").trim())
    .filter(Boolean)[0] || "";

  return firstMeaning
    .split(/\s+\/\s+/)[0]
    .replace(/^[,;:\s]+|[,;:\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function displayGlossText(gloss) {
  const compact = compactGlossText(gloss);
  if (!compact) return gloss || "";
  return compact.length > 42 ? `${compact.slice(0, 39).trim()}…` : compact;
}

function fullGlossForToken(token) {
  const cleaned = cleanCopticToken(token).toLowerCase();
  if (!cleaned) return "";
  const manualGloss = currentLanguage() === "pl" ? manualGlossForToken(cleaned) : "";
  const fallbackGloss = fallbackDictionaryGloss(cleaned);
  const lateManualGloss = currentLanguage() !== "pl" ? manualGlossForToken(cleaned) : "";
  return manualGloss || fallbackGloss || lateManualGloss || "";
}

function glossCopticToken(token) {
  const cleaned = cleanCopticToken(token).toLowerCase();
  if (!cleaned) return "";
  if (/[\u25a0-\u25ff]/.test(cleaned)) return currentLanguage() === "en" ? "ed. gap" : "luka ed.";
  if (/^[a-z]+$/i.test(cleaned)) return currentLanguage() === "en" ? "ed. note" : "nota ed.";

  // Polish mode keeps curated/manual glosses first. English mode uses the dictionary first.
  if (currentLanguage() === "pl") {
    const manualGloss = manualGlossForToken(cleaned);
    if (manualGloss) return displayGlossText(manualGloss);
  }

  const fallbackGloss = fallbackDictionaryGloss(cleaned);
  if (fallbackGloss) return displayGlossText(fallbackGloss);

  if (currentLanguage() !== "pl") {
    const manualGloss = manualGlossForToken(cleaned);
    if (manualGloss) return displayGlossText(manualGloss);
  }

  return t("interlinearNeedsGloss");
}

function fullInterlinearTranslationHtml(page) {
  try {
    const chapter = chapterForPage(page.page);
    const translation = currentLanguage() === "pl" ? polishPageText(page, chapter) : page.text;
    if (!translation) return "";
    return `
      <aside class="interlinear-full-translation">
        <header>
          <strong>${escapeHtml(t("interlinearFullTranslation"))}</strong>
          <span>${escapeHtml(t("page"))} ${escapeHtml(page.page)}</span>
        </header>
        <p class="interlinear-full-translation-source">${escapeHtml(t("interlinearFullTranslationSource"))}</p>
        <div class="page-prose">${highlight(translation)}</div>
      </aside>
    `;
  } catch (error) {
    console.warn("Interlinear full translation unavailable", error);
    return "";
  }
}



function localizedPartOfSpeech(pos) {
  const raw = String(pos || "").trim();
  if (!raw) return "";
  const key = raw.toUpperCase().replace(/[.\s]+$/g, "");
  const map = {
    N: { pl: "rzeczownik", en: "noun" },
    NOUN: { pl: "rzeczownik", en: "noun" },
    V: { pl: "czasownik", en: "verb" },
    VB: { pl: "czasownik", en: "verb" },
    VERB: { pl: "czasownik", en: "verb" },
    PREP: { pl: "przyimek / partykuła", en: "preposition / particle" },
    PRON: { pl: "zaimek", en: "pronoun" },
    ART: { pl: "rodzajnik", en: "article" },
    CONJ: { pl: "spójnik", en: "conjunction" },
    ADV: { pl: "przysłówek", en: "adverb" },
    ADJ: { pl: "przymiotnik", en: "adjective" },
    PART: { pl: "partykuła", en: "particle" },
    NUM: { pl: "liczebnik", en: "numeral" },
    PROPN: { pl: "nazwa własna", en: "proper noun" }
  };
  const label = map[key];
  if (!label) return raw;
  const localized = currentLanguage() === "en" ? label.en : label.pl;
  return `${localized} (${raw})`;
}

function dictionaryRawEntryForToken(cleaned) {
  const lookup = copticDictionaryLookup(cleaned);
  if (!lookup) return null;
  return {
    entry: lookup.entry,
    derived: lookup.type !== "direct",
    base: lookup.key,
    prefix: affixLabelForLookup(lookup),
    lookup
  };
}

function dictionaryDetailsForToken(token) {
  const cleaned = cleanCopticToken(token).toLowerCase();
  const raw = dictionaryRawEntryForToken(cleaned);
  const entry = raw?.entry;
  const base = raw?.base || cleaned;
  const entryEn = typeof entry === "string" ? entry : (entry?.en || "");
  const entryPl = typeof entry === "object" ? (entry.pl || "") : "";
  const manualPl = copticGlosses[cleaned] || window.COPTIC_POLISH_OVERRIDES?.[cleaned] || copticGlosses[base] || window.COPTIC_POLISH_OVERRIDES?.[base] || entryPl;
  const custom = state.customGlosses?.[cleaned] || state.customGlosses?.[base] || "";
  const prefixLabel = raw?.derived && raw.prefix ? `${raw.prefix} + ` : "";
  const polish = custom || (manualPl ? `${prefixLabel}${manualPl}` : "");
  const english = entryEn ? `${prefixLabel}${entryEn}` : "";
  const shortPolish = polish ? displayGlossText(polish) : "";
  const shortEnglish = english ? displayGlossText(english) : "";
  return {
    token: cleanCopticToken(token),
    translit: transliterateCoptic(token),
    polish,
    english,
    shortPolish,
    shortEnglish,
    custom,
    pos: localizedPartOfSpeech(typeof entry === "object" ? (entry.pos || "") : ""),
    posRaw: typeof entry === "object" ? (entry.pos || "") : "",
    source: window.COPTIC_DICTIONARY_META?.source || "Kyima / Coptic Dictionary Online",
    base: raw?.base || "",
    baseTranslit: raw?.base ? transliterateCoptic(raw.base) : "",
    hasData: Boolean(polish || english || raw)
  };
}

function dictionarySearchEntryDetails(key, entry) {
  const token = key || "";
  const entryEn = typeof entry === "string" ? entry : (entry?.en || "");
  const entryPl = typeof entry === "object" ? (entry.pl || "") : "";
  const overridePl = window.COPTIC_POLISH_OVERRIDES?.[token] || copticGlosses[token] || entryPl || "";
  const shortPolish = overridePl ? displayGlossText(overridePl) : "";
  const shortEnglish = entryEn ? displayGlossText(entryEn) : "";
  return {
    token,
    translit: transliterateCoptic(token),
    polish: overridePl,
    english: entryEn,
    shortPolish,
    shortEnglish,
    pos: localizedPartOfSpeech(typeof entry === "object" ? (entry.pos || "") : ""),
    posRaw: typeof entry === "object" ? (entry.pos || "") : "",
    source: window.COPTIC_DICTIONARY_META?.source || "Kyima / Coptic Dictionary Online"
  };
}



const {
  scoreEntry: dictionarySearchScore,
  splitMeanings: splitDictionaryMeanings,
  meaningCount: dictionaryMeaningCount,
  statusKey: dictionaryStatusKey
} = window.GNOSTYK_DICTIONARY_ENGINE;

function interlinearLemmaSearchRows(query) {
  const plainQuery = String(query || "").trim();
  const normalizedQuery = cleanCopticToken(plainQuery).toLowerCase();
  if (plainQuery.length < 2 && normalizedQuery.length < 2) return [];
  const seen = new Set();
  const rows = [];
  const source = dictionaryOccurrenceSources()[0];
  const pages = typeof source?.getPages === "function" ? source.getPages() : [];
  for (const page of pages) {
    const entries = typeof source?.getEntriesForPage === "function" ? source.getEntriesForPage(page) : [];
    for (const line of entries) {
      for (const rawToken of lineTokensForOccurrenceMatch(line)) {
        const info = normalizeInterlinearToken(rawToken);
        const lemma = cleanCopticToken(info.lemma || "").toLowerCase();
        const surface = cleanCopticToken(info.surface || "").toLowerCase();
        const key = lemma || surface;
        if (!key || seen.has(key)) continue;
        const details = dictionaryDetailsForToken(key);
        const haystack = [surface, lemma, transliterateCoptic(surface), transliterateCoptic(lemma), details.shortPolish, details.shortEnglish, details.polish, details.english, info.type].filter(Boolean).join(" ");
        const copticMatch = normalizedQuery && (surface.includes(normalizedQuery) || lemma.includes(normalizedQuery));
        const textMatch = dictionarySearchWordMatch(haystack, plainQuery) > 0;
        if (!copticMatch && !textMatch) continue;
        seen.add(key);
        rows.push({
          details: { ...details, token: key, pos: details.pos || localizedPartOfSpeech(info.type || "") },
          score: copticMatch ? 190 : 75
        });
      }
    }
  }
  return rows;
}

function dictionarySearchRows(query) {
  const normalizedQuery = cleanCopticToken(query || "").toLowerCase();
  const plainQuery = String(query || "").trim().toLowerCase();
  if (plainQuery.length < 2 && normalizedQuery.length < 2) return [];
  const dictionary = window.COPTIC_DICTIONARY || {};
  const scoredRows = [];
  for (const [key, entry] of Object.entries(dictionary)) {
    const details = dictionarySearchEntryDetails(key, entry);
    const score = dictionarySearchScore(details, query);
    if (score > 0) scoredRows.push({ details, score });
  }
  interlinearLemmaSearchRows(query).forEach(row => scoredRows.push(row));
  const unique = new Map();
  for (const row of scoredRows) {
    const key = cleanCopticToken(row.details?.token || "").toLowerCase();
    if (!key) continue;
    const existing = unique.get(key);
    if (!existing || row.score > existing.score) unique.set(key, row);
  }
  return [...unique.values()]
    .sort((a, b) => b.score - a.score || a.details.token.length - b.details.token.length || a.details.token.localeCompare(b.details.token))
    .slice(0, 30)
    .map(item => item.details);
}

function dictionaryEntryStatus(details) {
  const key = dictionaryStatusKey(details);
  const title = key.charAt(0).toUpperCase() + key.slice(1);
  return { key, label: t(`dictionaryStatus${title}`), note: t(`dictionaryStatus${title}Note`) };
}

function dictionaryStatusPillHtml(status) {
  if (!status) return "";
  return `<span class="dictionary-status dictionary-status-${escapeHtml(status.key)}">${escapeHtml(status.label)}</span>`;
}

function dictionaryEntryProfileHtml(details) {
  const lemma = details.base || details.token || "";
  const lemmaText = lemma
    ? `${lemma}${details.baseTranslit ? ` · ${details.baseTranslit}` : ""}`
    : "";
  const plCount = dictionaryMeaningCount(details.polish, details.shortPolish);
  const enCount = dictionaryMeaningCount(details.english, details.shortEnglish);
  const meaningStats = t("dictionaryMeaningStatsValue")
    .replace("{pl}", String(plCount || 0))
    .replace("{en}", String(enCount || 0));
  const status = dictionaryEntryStatus(details);
  return `
    <section class="dictionary-profile" aria-label="${escapeHtml(t("dictionaryProfile"))}">
      <h4>${escapeHtml(t("dictionaryProfile"))}</h4>
      <dl>
        ${lemmaText ? `<div><dt>${escapeHtml(t("dictionaryLemma"))}</dt><dd><bdi>${escapeHtml(lemmaText)}</bdi></dd></div>` : ""}
        <div><dt>${escapeHtml(t("dictionaryStatus"))}</dt><dd>${dictionaryStatusPillHtml(status)} <span class="dictionary-status-note">${escapeHtml(status.note)}</span></dd></div>
        <div><dt>${escapeHtml(t("dictionaryMeaningStats"))}</dt><dd>${escapeHtml(meaningStats)}</dd></div>
        <div><dt>${escapeHtml(t("dictionaryEntryScope"))}</dt><dd>${escapeHtml(t("dictionaryEntryScopeValue"))}</dd></div>
      </dl>
      <p>${escapeHtml(t("dictionaryResearchNoteValue"))}</p>
    </section>
  `;
}


const DICTIONARY_OCCURRENCE_SOURCES = [
  {
    id: "pistis_sophia",
    bookId: "pistis-sophia",
    title: () => "Pistis Sophia",
    getPages: () => data.pages || [],
    getEntriesForPage: page => copticEntriesForPage(page),
    pageLabel: page => `${t("page")} ${page.page}`,
    currentLabel: () => `${t("page")} ${state.page}`
  },
  {
    id: "gospel_of_thomas",
    bookId: "gospel-of-thomas",
    title: () => currentLanguage() === "pl" ? "Ewangelia Tomasza" : "Gospel of Thomas",
    getPages: () => data.pages || [],
    getEntriesForPage: page => copticEntriesForPage(page),
    pageLabel: page => `${logionUnitLabel()} ${page.page}`,
    currentLabel: () => `${logionUnitLabel()} ${state.page}`
  }
];

function dictionaryOccurrenceSources() {
  const activeId = activeBook?.id || "pistis-sophia";
  const activeSource = DICTIONARY_OCCURRENCE_SOURCES.find(source => source.bookId === activeId);
  if (state.settings.dictionaryScope === "library") {
    const sorted = [...DICTIONARY_OCCURRENCE_SOURCES];
    return activeSource ? sorted.sort((a, b) => (a.bookId === activeId ? -1 : b.bookId === activeId ? 1 : 0)) : sorted;
  }
  return activeSource ? [activeSource] : [DICTIONARY_OCCURRENCE_SOURCES[0]];
}

function dictionaryOccurrenceSourceTitle(source) {
  return typeof source?.title === "function" ? source.title() : (source?.title || "");
}

function dictionaryOccurrenceCurrentLabel(source) {
  return typeof source?.currentLabel === "function" ? source.currentLabel() : String(state.page);
}

function copticTokenFormsForMatch(token) {
  const cleaned = cleanCopticToken(token || "").toLowerCase();
  if (!cleaned) return [];
  const forms = new Set([cleaned]);
  const lookup = copticDictionaryLookup(cleaned);
  if (lookup?.key) forms.add(lookup.key);
  return [...forms];
}

function tokenCandidatesForOccurrenceMatch(rawToken) {
  const info = normalizeInterlinearToken(rawToken);
  const surface = cleanCopticToken(info.surface || rawToken || "").toLowerCase();
  const lemma = cleanCopticToken(info.lemma || "").toLowerCase();
  const candidates = new Set([surface, lemma].filter(Boolean));
  [surface, lemma].filter(Boolean).forEach(value => {
    const lookup = copticDictionaryLookup(value);
    if (lookup?.key) candidates.add(lookup.key);
  });
  return candidates;
}

const { lineTokens: lineTokensForOccurrenceMatch } = window.GNOSTYK_INTERLINEAR_ENGINE;

function copticOccurrencesInSourceForToken(source, token) {
  const forms = copticTokenFormsForMatch(token);
  if (!forms.length) return { source, total: 0, items: [] };
  const occurrences = [];
  const seen = new Set();
  const pages = typeof source.getPages === "function" ? source.getPages() : [];
  for (const page of pages) {
    const entries = typeof source.getEntriesForPage === "function" ? source.getEntriesForPage(page) : [];
    for (const line of entries) {
      const tokens = lineTokensForOccurrenceMatch(line);
      let lineHits = 0;
      for (const rawToken of tokens) {
        const candidates = tokenCandidatesForOccurrenceMatch(rawToken);
        if ([...forms].some(form => candidates.has(form))) lineHits += 1;
      }
      if (!lineHits) continue;
      const key = `${source.id}|${page.page}|${line.ref}|${line.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      occurrences.push({
        sourceId: source.id,
        sourceTitle: dictionaryOccurrenceSourceTitle(source),
        page: page.page,
        pageLabel: typeof source.pageLabel === "function" ? source.pageLabel(page) : `${t("page")} ${page.page}`,
        ref: line.ref,
        text: line.text,
        count: lineHits
      });
    }
  }
  return {
    source,
    total: occurrences.length,
    items: occurrences
  };
}

function copticOccurrencesForToken(token) {
  const sources = dictionaryOccurrenceSources().map(source => copticOccurrencesInSourceForToken(source, token));
  return {
    total: sources.reduce((sum, item) => sum + item.total, 0),
    sources
  };
}

const DICTIONARY_OCCURRENCE_PAGE_SIZE = 20;

function occurrenceOffsetKey(sourceId, token) {
  return `${sourceId}|${cleanCopticToken(token || "").toLowerCase()}`;
}

function occurrenceOffsetFor(sourceId, token, total) {
  const key = occurrenceOffsetKey(sourceId, token);
  const raw = Number(state.dictionaryOccurrenceOffsets?.[key] || 0);
  const maxOffset = Math.max(0, Math.floor(Math.max(0, total - 1) / DICTIONARY_OCCURRENCE_PAGE_SIZE) * DICTIONARY_OCCURRENCE_PAGE_SIZE);
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(maxOffset, raw));
}

function setOccurrenceOffset(sourceId, token, offset, total) {
  const key = occurrenceOffsetKey(sourceId, token);
  const maxOffset = Math.max(0, Math.floor(Math.max(0, total - 1) / DICTIONARY_OCCURRENCE_PAGE_SIZE) * DICTIONARY_OCCURRENCE_PAGE_SIZE);
  state.dictionaryOccurrenceOffsets[key] = Math.max(0, Math.min(maxOffset, Number(offset) || 0));
}

function sortOccurrencesNearCurrentPage(items) {
  const currentPage = Number(state.page) || 1;
  return [...items].sort((a, b) => {
    const distance = Math.abs(Number(a.page) - currentPage) - Math.abs(Number(b.page) - currentPage);
    if (distance) return distance;
    return Number(a.page) - Number(b.page);
  });
}

function dictionaryOccurrencesHtml(token) {
  const occurrences = copticOccurrencesForToken(token);
  const label = t("dictionaryOccurrencesByText");
  if (!occurrences.total) {
    return `
      <details class="dictionary-more dictionary-occurrences">
        <summary>${escapeHtml(label)}</summary>
        <p>${escapeHtml(t("dictionaryOccurrencesEmpty"))}</p>
        <p class="dictionary-occurrences-note">${escapeHtml(t("dictionaryOccurrencesTextNote"))}</p>
      </details>
    `;
  }
  return `
    <details class="dictionary-more dictionary-occurrences" open>
      <summary>${escapeHtml(label)} (${occurrences.total})</summary>
      <p class="dictionary-occurrences-note">${escapeHtml(t("dictionaryOccurrencesTextNote"))}</p>
      <p class="dictionary-occurrences-note">${escapeHtml(t("dictionaryOccurrencesNear"))}</p>
      ${occurrences.sources.filter(group => group.total > 0).map(group => {
        const sortedItems = sortOccurrencesNearCurrentPage(group.items);
        const offset = occurrenceOffsetFor(group.source.id, token, group.total);
        const pageItems = sortedItems.slice(offset, offset + DICTIONARY_OCCURRENCE_PAGE_SIZE);
        const from = group.total ? offset + 1 : 0;
        const to = Math.min(offset + pageItems.length, group.total);
        const rangeNote = t("dictionaryOccurrencesRange")
          .replace("{from}", from)
          .replace("{to}", to)
          .replace("{total}", group.total)
          .replace("{page}", dictionaryOccurrenceCurrentLabel(group.source));
        const previousDisabled = offset <= 0 ? "disabled" : "";
        const nextDisabled = offset + DICTIONARY_OCCURRENCE_PAGE_SIZE >= group.total ? "disabled" : "";
        return `
          <section class="dictionary-occurrence-source" data-occurrence-source="${escapeHtml(group.source.id)}">
            <h4>${escapeHtml(dictionaryOccurrenceSourceTitle(group.source))} <span>(${group.total})</span></h4>
            <p class="dictionary-occurrences-note">${escapeHtml(rangeNote)}</p>
            <div class="dictionary-occurrence-pager">
              <button type="button" ${previousDisabled} data-occurrence-page-nav="prev" data-occurrence-source="${escapeHtml(group.source.id)}" data-occurrence-token="${escapeHtml(token)}" data-occurrence-offset="${escapeHtml(String(Math.max(0, offset - DICTIONARY_OCCURRENCE_PAGE_SIZE)))}" data-occurrence-total="${escapeHtml(String(group.total))}">${escapeHtml(t("dictionaryOccurrencesPrev"))}</button>
              <button type="button" ${nextDisabled} data-occurrence-page-nav="next" data-occurrence-source="${escapeHtml(group.source.id)}" data-occurrence-token="${escapeHtml(token)}" data-occurrence-offset="${escapeHtml(String(offset + DICTIONARY_OCCURRENCE_PAGE_SIZE))}" data-occurrence-total="${escapeHtml(String(group.total))}">${escapeHtml(t("dictionaryOccurrencesNext"))}</button>
            </div>
            <ul>
              ${pageItems.map(item => `
                <li>
                  <button type="button" data-occurrence-source="${escapeHtml(item.sourceId)}" data-occurrence-page="${escapeHtml(String(item.page))}" data-occurrence-ref="${escapeHtml(item.ref || "")}" data-occurrence-token="${escapeHtml(token)}">
                    <strong>${escapeHtml(item.pageLabel)}</strong>
                    <span>${escapeHtml(item.ref)}${item.count > 1 ? ` · ×${item.count}` : ""}</span>
                    <small><bdi>${escapeHtml(compactText(item.text, 110))}</bdi></small>
                  </button>
                </li>
              `).join("")}
            </ul>
          </section>
        `;
      }).join("")}
    </details>
  `;
}

function dictionaryMeaningsHtml(value, shortValue = "") {
  const meanings = splitDictionaryMeanings(value, shortValue);
  if (!meanings.length) return "";
  return `
    <details class="dictionary-more">
      <summary>${escapeHtml(t("dictionaryMoreMeanings"))}</summary>
      <ul>
        ${meanings.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </details>
  `;
}

function dictionaryFullEntryDetailsHtml(value) {
  if (!value) return "";
  return `
    <details class="dictionary-more dictionary-full-entry">
      <summary>${escapeHtml(t("dictionaryFullEntry"))}</summary>
      <p>${escapeHtml(value)}</p>
    </details>
  `;
}

function dictionaryResultHtml(item) {
  const isEnglishMode = currentLanguage() === "en";
  const primary = isEnglishMode
    ? (item.shortEnglish || item.shortPolish || item.english)
    : (item.shortPolish || item.polish || t("dictionaryMissingPolishGloss"));
  const secondary = isEnglishMode ? (item.shortPolish || item.polish || "") : "";
  const status = dictionaryEntryStatus({ ...item, hasData: Boolean(item.polish || item.english) });
  return `
    <article class="dictionary-result" data-dictionary-token="${escapeHtml(item.token)}">
      <button class="dictionary-result-main" type="button" data-dictionary-open="${escapeHtml(item.token)}">
        <span class="dictionary-result-coptic"><bdi>${escapeHtml(item.token)}</bdi></span>
        <span class="dictionary-result-translit">${escapeHtml(item.translit)}</span>
        <strong>${escapeHtml(primary || t("interlinearNeedsGloss"))}</strong>
        ${secondary ? `<em>${escapeHtml(secondary)}</em>` : ""}
      </button>
      <div class="dictionary-result-meta">
        ${dictionaryStatusPillHtml(status)}
        ${item.pos ? `<span>${escapeHtml(item.pos)}</span>` : ""}
        ${isEnglishMode && item.shortEnglish ? `<span>EN: ${escapeHtml(item.shortEnglish)}</span>` : ""}
      </div>
    </article>
  `;
}

function updateDictionarySearchClear() {
  if (!els.dictionarySearchClear || !els.dictionarySearchInput) return;
  els.dictionarySearchClear.hidden = !String(els.dictionarySearchInput.value || "").trim();
}

function clearDictionarySearch() {
  if (!els.dictionarySearchInput) return;
  els.dictionarySearchInput.value = "";
  renderDictionarySearch();
  els.dictionarySearchInput.focus();
}

function renderDictionarySearch() {
  if (!els.dictionarySearchResults || !els.dictionarySearchInput) return;
  const query = els.dictionarySearchInput.value || "";
  updateDictionarySearchClear();
  const rows = dictionarySearchRows(query);
  if (String(query).trim().length < 2) {
    setText(els.dictionarySearchMeta, t("dictionarySearchEmpty"));
    els.dictionarySearchResults.innerHTML = "";
    return;
  }
  setText(els.dictionarySearchMeta, t("dictionarySearchCount").replace("{count}", rows.length));
  els.dictionarySearchResults.innerHTML = rows.length
    ? rows.slice(0, 30).map(dictionaryResultHtml).join("")
    : `<p class="dictionary-search-empty">${escapeHtml(t("dictionarySearchNoResults"))}</p>`;
}

function dictionaryFieldHtml(label, value, className = "") {
  if (!value) return "";
  return `
    <div class="dictionary-field ${className}">
      <span>${escapeHtml(label)}</span>
      <p>${escapeHtml(value)}</p>
    </div>
  `;
}

function showInterlinearDictionaryCard(token) {
  state.activeDictionaryToken = token;
  const details = dictionaryDetailsForToken(token);
  let popup = document.querySelector("#interlinearDictionaryPopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "interlinearDictionaryPopup";
    popup.className = "dictionary-popup";
    popup.hidden = true;
    document.body.appendChild(popup);
  }
  const fullPolish = details.polish && details.polish !== details.shortPolish ? details.polish : "";
  const fullEnglish = details.english && details.english !== details.shortEnglish ? details.english : "";
  const isEnglishMode = currentLanguage() === "en";
  const primaryLanguageFields = isEnglishMode
    ? `${dictionaryFieldHtml(t("dictionaryEnglish"), details.shortEnglish || details.english, "dictionary-primary")}
       ${dictionaryFieldHtml(t("dictionaryPolish"), details.shortPolish || details.polish, "dictionary-primary dictionary-secondary-language")}`
    : `${dictionaryFieldHtml(t("dictionaryPolish"), details.shortPolish || details.polish || t("dictionaryMissingPolishGloss"), "dictionary-primary")}
       ${dictionaryFieldHtml(t("dictionaryEnglish"), details.shortEnglish || details.english, "dictionary-primary dictionary-secondary-language")}`;
  const localizedMoreMeanings = isEnglishMode
    ? dictionaryMeaningsHtml(fullEnglish, details.shortEnglish)
    : dictionaryMeaningsHtml(fullPolish, details.shortPolish);
  const localizedFullEntry = isEnglishMode ? fullEnglish : fullPolish;
  popup.innerHTML = `
    <div class="dictionary-card" role="dialog" aria-modal="false" aria-label="${escapeHtml(t("dictionaryCardTitle"))}">
      <header>
        <div>
          <span>${escapeHtml(t("dictionaryCardTitle"))}</span>
          <strong><bdi>${escapeHtml(details.token || token)}</bdi></strong>
          <em>${escapeHtml(details.translit)}</em>
        </div>
        <button class="dictionary-close" type="button" data-dictionary-close aria-label="${escapeHtml(t("dictionaryClose"))}">×</button>
      </header>
      <div class="dictionary-card-body">
        ${details.hasData ? "" : `<p class="dictionary-empty">${escapeHtml(t("dictionaryNoData"))}</p>`}
        ${primaryLanguageFields}
        ${dictionaryEntryProfileHtml(details)}
        ${localizedMoreMeanings}
        ${dictionaryOccurrencesHtml(details.base || details.token || token)}
        ${dictionaryFullEntryDetailsHtml(localizedFullEntry)}
        ${details.base && details.base !== details.token ? dictionaryFieldHtml(t("dictionaryBaseForm"), `${details.base} · ${details.baseTranslit}`) : ""}
        ${dictionaryFieldHtml(t("dictionaryGrammar"), details.pos)}
        ${dictionaryFieldHtml(t("dictionaryCustomGloss"), details.custom)}
        ${dictionaryFieldHtml(t("dictionarySource"), details.source)}
      </div>
    </div>
  `;
  popup.hidden = false;
}

function hideInterlinearDictionaryCard() {
  state.activeDictionaryToken = null;
  const popup = document.querySelector("#interlinearDictionaryPopup");
  if (popup) popup.hidden = true;
}

function rerenderOpenDictionaryCard() {
  const popup = document.querySelector("#interlinearDictionaryPopup");
  if (!popup || popup.hidden || !state.activeDictionaryToken) return;
  showInterlinearDictionaryCard(state.activeDictionaryToken);
}

function clearCopticOccurrenceHighlights() {
  document.querySelectorAll(".interlinear-token.occurrence-highlight").forEach(item => {
    item.classList.remove("occurrence-highlight");
  });
}

function highlightCopticOccurrenceToken(token, preferredPage = null) {
  const forms = new Set(copticTokenFormsForMatch(token));
  if (!forms.size) return;
  clearCopticOccurrenceHighlights();
  let firstMatch = null;
  let preferredMatch = null;
  document.querySelectorAll(".interlinear-token[data-coptic-token]").forEach(item => {
    const cleaned = cleanCopticToken(item.dataset.copticToken || "").toLowerCase();
    const lemma = cleanCopticToken(item.dataset.copticLemma || "").toLowerCase();
    if (!cleaned && !lemma) return;
    const candidates = tokenCandidatesForOccurrenceMatch({ surface: cleaned, lemma });
    const matched = [...forms].some(form => candidates.has(form));
    if (!matched) return;
    item.classList.add("occurrence-highlight");
    if (!firstMatch) firstMatch = item;
    const logion = item.closest("[data-logion]")?.dataset.logion;
    if (preferredPage && String(logion) === String(preferredPage) && !preferredMatch) preferredMatch = item;
  });
  const target = preferredMatch || firstMatch;
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }
}

const {
  normalizeToken: normalizeInterlinearToken,
  lookupKey: interlinearTokenLookupKey
} = window.GNOSTYK_INTERLINEAR_ENGINE;

function interlinearTokenHtml(token) {
  const info = normalizeInterlinearToken(token);
  const cleaned = cleanCopticToken(info.surface).toLowerCase();
  const lemma = cleanCopticToken(info.lemma).toLowerCase();
  const lookupKey = interlinearTokenLookupKey(info);
  const fullGloss = fullGlossForToken(lookupKey || info.surface) || fullGlossForToken(info.surface);
  const gloss = lookupKey ? (displayGlossText(fullGlossForToken(lookupKey)) || glossCopticToken(info.surface)) : glossCopticToken(info.surface);
  const unresolved = gloss === t("interlinearNeedsGloss");
  const titleParts = [cleaned];
  if (lemma && lemma !== cleaned) titleParts.push(`${currentLanguage() === "pl" ? "lemat" : "lemma"}: ${lemma}`);
  if (info.type) titleParts.push(info.type);
  if (fullGloss) titleParts.push(fullGloss);
  const layout = state.settings.interlinearLayout || "classic";
  const grammaticalLayout = layout === "grammatical" || layout === "expanded";
  const showTranslit = layout !== "compact";
  const showLemma = (state.settings.interlinearShowLemma !== false || grammaticalLayout) && lemma && lemma !== cleaned;
  const showType = (state.settings.interlinearShowType === true || grammaticalLayout) && info.type;
  const lemmaLabel = currentLanguage() === "pl" ? "lemat" : "lemma";
  const typeLabel = currentLanguage() === "pl" ? "typ" : "type";
  const lemmaLine = showLemma ? `<span class="interlinear-lemma"><em>${escapeHtml(lemmaLabel)}</em>${escapeHtml(lemma)}</span>` : "";
  const typeLine = showType ? `<span class="interlinear-type"><em>${escapeHtml(typeLabel)}</em>${escapeHtml(info.type)}</span>` : "";
  return `
    <span class="interlinear-token ${unresolved ? "needs-gloss" : ""} layout-${escapeHtml(layout)}" data-coptic-token="${escapeHtml(cleaned)}" data-coptic-lemma="${escapeHtml(lemma)}" data-coptic-type="${escapeHtml(info.type || "")}" data-full-gloss="${escapeHtml(fullGloss)}" title="${escapeHtml(titleParts.join(" — "))}">
      <bdi class="interlinear-coptic">${escapeHtml(info.surface)}</bdi>
      ${showTranslit ? `<span class="interlinear-translit">${escapeHtml(transliterateCoptic(info.surface))}</span>` : ""}
      ${lemmaLine}
      ${typeLine}
      <span class="interlinear-gloss">${escapeHtml(gloss)}</span>
    </span>
  `;
}

function interlinearLineHtml(line) {
  const tokens = Array.isArray(line.tokens) && line.tokens.length ? line.tokens : line.text.split(/\s+/).filter(Boolean);
  return `
    <article class="interlinear-line">
      <header>
        <span>${escapeHtml(line.ref)}</span>
        <strong>${escapeHtml(t("interlinearAutoGloss"))}</strong>
      </header>
      <p class="interlinear-source"><bdi>${escapeHtml(line.text)}</bdi></p>
      <div class="interlinear-tokens">
        ${tokens.map(interlinearTokenHtml).join("")}
      </div>
    </article>
  `;
}

function interlinearPageText(page) {
  try {
    const refs = copticRefsForPage(page);
    const entries = copticEntriesForPage(page);
    if (!entries.length) return copticPageText(page);
    const grouped = refs.map(ref => {
      const lines = entries.filter(entry => String(entry.page) === String(ref));
      if (!lines.length) return "";
      return `
        <section class="interlinear-page" aria-label="${activeBook?.type === "logion-reader" ? `${logionUnitLabel()} ${escapeHtml(ref)}` : `Interlinear Schwartze-Petermann ${escapeHtml(ref)}`}">
          <header>
            <strong>${(isThomasBook || activeBook?.type === "logion-reader") ? `${logionUnitLabel()} ${escapeHtml(ref)}` : `Schw.-Pet. ${escapeHtml(ref)}`}</strong>
            <span>${escapeHtml(lines[0].bookTitle || "Tekst koptyjski")} · ${lines.length} ${currentLanguage() === "pl" ? "sekcji" : "sections"}</span>
          </header>
          ${lines.map(interlinearLineHtml).join("")}
        </section>
      `;
    }).join("");
    if (!grouped.trim()) return copticPageText(page);
    return `
      <div class="coptic-source-note interlinear-note">
        <strong>${escapeHtml(t("interlinearTitle"))}</strong>
        <p>${escapeHtml(t("interlinearSubtitle"))}</p>
      </div>
      <div class="interlinear-text">${grouped}</div>
      ${fullInterlinearTranslationHtml(page)}
    `;
  } catch (error) {
    console.warn("Interlinear mode unavailable", error);
    return copticPageText(page);
  }
}

function manuscriptRefsInPolish(page) {
  const text = polishTranslations[page.page] || "";
  return [...text.matchAll(/\|(\d{1,3})\.?/g)].map(match => match[1]);
}

function reviewStatusForPage(page) {
  const refs = manuscriptRefsForPage(page);
  const polishRefs = manuscriptRefsInPolish(page);
  if (translationReview.misalignedIntroPages.has(page.page)) {
    return {
      level: "needs-review",
      label: "opracowanie do kolacji",
      note: "Ta strona w warstwie polskiej wymaga ręcznego zrównania z odpowiadającą stroną Meada."
    };
  }
  if (translationReview.compressedPages.has(page.page)) {
    return {
      level: "needs-review",
      label: "wersja skrócona",
      note: "Tekst polski jest wyraźnie krótszy od podstawy i wymaga sprawdzenia redakcyjnego."
    };
  }
  if (refs.length && !polishRefs.length) {
    return {
      level: "apparatus",
      label: "znaczniki w aparacie",
      note: "Numeracja Schwartze-Petermanna jest zachowana w aparacie cytowania na podstawie źródła EN; nie została jeszcze wprowadzona w sam polski tekst."
    };
  }
  if (refs.length && polishRefs.length < refs.length) {
    return {
      level: "partial",
      label: "część znaczników w tekście",
      note: "Część numeracji Schwartze-Petermanna została już wprowadzona w polski tekst; pozostałe znaczniki są nadal widoczne w aparacie cytowania."
    };
  }
  return {
    level: "aligned",
    label: "przekład skolacjonowany",
    note: refs.length ? "Polski tekst zawiera znaczniki rękopisu tej strony." : "Strona bez osobnego znacznika rękopisu w podstawie."
  };
}

function localizedReviewStatus(status, hasRefs) {
  if (currentLanguage() === "pl") return status;
  const labels = {
    "needs-review": "requires collation",
    "partial": "partial markers",
    "apparatus": "markers in apparatus",
    "aligned": "collated translation"
  };
  const notes = {
    "needs-review": "This page requires manual alignment with the corresponding Mead page.",
    "partial": "Some Schwartze-Petermann markers have already been added to the Polish text; the remaining markers are still visible in the citation apparatus.",
    "apparatus": "Schwartze-Petermann numbering is preserved in the citation apparatus from the EN source; it has not yet been inserted into the Polish text.",
    "aligned": hasRefs ? "The Polish text contains manuscript markers for this page." : "This page has no separate manuscript marker in the source."
  };
  return {
    level: status.level,
    label: labels[status.level] || status.label,
    note: notes[status.level] || status.note
  };
}

function citationForPage(page, chapter) {
  return window.GNOSTYK_CITATION_ENGINE.referenceLabel({
    kind: activeBook?.type === "logion-reader" ? "logion" : "pistis",
    unitLabel: logionUnitLabel(),
    pageNumber: page.page,
    chapterNumber: chapter?.number,
    chapterLabel: t("chapter"),
    refs: manuscriptRefsForPage(page)
  });
}

function formattedCitation(page, chapter) {
  const library = `${localizedLibraryName()} v${libraryMeta.version}`;
  if (activeBook?.type === "logion-reader") {
    return window.GNOSTYK_CITATION_ENGINE.format({
      kind: "logion",
      locale: currentLanguage(),
      format: state.citationFormat,
      library,
      title: logionBookTitle(),
      unit: logionUnitLabel().toLowerCase(),
      number: page?.page || chapter?.number || state.page,
      bookId: activeBook?.id,
      readerMode: state.readerMode
    });
  }
  const refs = manuscriptRefsForPage(page);
  return window.GNOSTYK_CITATION_ENGINE.format({
    kind: "pistis",
    locale: currentLanguage(),
    format: state.citationFormat,
    library,
    pageNumber: page.page,
    chapterPart: chapter ? `${t("chapter")} ${chapter.number}` : t("introMaterial"),
    refs
  });
}

function renderReferenceStrip(page, chapter) {
  if (activeBook?.type === "logion-reader") {
    const number = page?.page || chapter?.number || state.page;
    const title = logionBookTitle();
    const source = activeBook?.id === "gospel-of-philip" ? "Nag Hammadi Codex II,3" : "Nag Hammadi Codex II";
    const layer = readerModeLabel(state.readerMode);
    const chips = [
      `<span class="reference-chip">${escapeHtml(title)}</span>`,
      `<span class="reference-chip">${escapeHtml(logionUnitLabel())} ${escapeHtml(String(number))}</span>`,
      `<span class="reference-chip">${escapeHtml(source)}</span>`,
      `<span class="reference-chip">${escapeHtml(layer)}</span>`
    ].join("");
    const note = activeBook?.id === "gospel-of-philip"
      ? (currentLanguage() === "pl"
        ? "Ewangelia Filipa jest cytowana według sekcji 1–18. Dostępne są warstwy PL/EN; koptyjska zostanie dodana po imporcie pewnego źródła."
        : "The Gospel of Philip is cited by sections 1–18. PL/EN layers are available; the Coptic layer will be added after a reliable source import.")
      : (currentLanguage() === "pl"
        ? "Ewangelia Tomasza jest cytowana według numerów logionów 1–114. Warstwa koptyjska pochodzi z edycji Coptic SCRIPTORIUM CC-BY 4.0."
        : "The Gospel of Thomas is cited by logion numbers 1–114. The Coptic layer comes from the Coptic SCRIPTORIUM CC-BY 4.0 edition.");
    return `
      <div class="reference-strip" aria-label="${escapeHtml(t("citationTitle"))}">
        <strong>${escapeHtml(t("citationTitle"))}</strong>
        <div class="reference-chips">${chips}</div>
        <small>${escapeHtml(note)}</small>
      </div>
    `;
  }
  const refs = manuscriptRefsForPage(page);
  const status = localizedReviewStatus(reviewStatusForPage(page), refs.length > 0);
  const chapterLabel = chapter ? `${t("chapterCapital")} ${chapter.number}` : t("introMaterial");
  const chips = [
    `<span class="reference-chip">Mead s. ${page.page}</span>`,
    `<span class="reference-chip">${escapeHtml(chapterLabel)}</span>`,
    ...refs.map(ref => `<span class="reference-chip">Schw.-Pet. ${escapeHtml(ref)}</span>`),
    `<span class="reference-chip review-chip ${status.level}">${escapeHtml(status.label)}</span>`
  ].join("");
  const note = refs.length
    ? `${currentLanguage() === "pl" ? "Paginacja rękopisu według marginalnej numeracji Schwartze-Petermanna zachowanej w tekście źródłowym." : "Manuscript pagination follows the marginal Schwartze-Petermann numbering preserved in the source text."} ${status.note}`
    : (currentLanguage() === "pl" ? "Ta strona nie ma osobnego znacznika paginacji rękopisu w tekście źródłowym." : "This page has no separate manuscript pagination marker in the source text.");

  return `
    <div class="reference-strip" aria-label="${escapeHtml(t("citationTitle"))}">
      <strong>${escapeHtml(t("citationTitle"))}</strong>
      <div class="reference-chips">${chips}</div>
      <small>${escapeHtml(note)}</small>
    </div>
  `;
}

function saveReadingState() {
  const bookId = activeBook?.id || "pistis-sophia";
  appStorage.setItem("gnostyk.lastWork", bookId);
  appStorage.setItem(`gnostyk.lastPage.${bookId}`, String(state.page));
  appStorage.setItem("ps.lastPage", String(state.page));
  appStorage.setItem("ps.readerMode", state.readerMode);
  appStorage.setItem("ps.citationFormat", state.citationFormat);
}

function saveSettings() {
  appStorage.setItem("ps.settings", JSON.stringify(state.settings));
}

let settingsToastTimer = null;
function showSettingsSavedMessage() {
  const message = currentLanguage() === "pl" ? "Ustawienia zapisane" : "Settings saved";
  if (els.settingsSaveStatus) els.settingsSaveStatus.textContent = message;
  if (els.settingsToast) {
    els.settingsToast.textContent = message;
    els.settingsToast.hidden = false;
    clearTimeout(settingsToastTimer);
    settingsToastTimer = setTimeout(() => {
      if (els.settingsToast) els.settingsToast.hidden = true;
      if (els.settingsSaveStatus) els.settingsSaveStatus.textContent = "";
    }, 1600);
  }
}

function commitSettingsChange(options = {}) {
  saveSettings();
  applySettings();
  applyLanguage();
  renderReader();
  renderLists();
  rerenderOpenDictionaryCard();
  if (options.feedback) showSettingsSavedMessage();
}

function applySettings() {
  document.documentElement.lang = currentLanguage();
  document.documentElement.dataset.theme = state.settings.theme;
  document.documentElement.style.backgroundColor = state.settings.theme === "light" ? "#f8f5ee" : (state.settings.theme === "sepia" ? "#e8dcc5" : "#090806");
  document.documentElement.style.colorScheme = state.settings.theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = state.settings.theme;
  document.body.dataset.fontSize = state.settings.fontSize;
  document.body.dataset.lineHeight = state.settings.lineHeight;
  document.body.dataset.width = state.settings.width;
  const textAlignment = ["left", "justify", "center"].includes(state.settings.textAlignment)
    ? state.settings.textAlignment
    : (state.settings.bookJustify === false ? "left" : "justify");
  state.settings.textAlignment = textAlignment;
  state.settings.bookJustify = textAlignment === "justify";
  document.body.dataset.textAlign = textAlignment;
  document.body.dataset.bookJustify = textAlignment === "justify" ? "true" : "false";
  document.body.dataset.interlinearLayout = state.settings.interlinearLayout || "classic";
  setValue(els.languageSetting, state.settings.language);
  setValue(els.themeSetting, state.settings.theme);
  setValue(els.fontSizeSetting, state.settings.fontSize);
  setValue(els.lineHeightSetting, state.settings.lineHeight);
  setValue(els.widthSetting, state.settings.width);
  if (els.bookJustifySetting) els.bookJustifySetting.checked = textAlignment === "justify";
  els.textAlignButtons?.forEach(button => {
    const active = button.dataset.textAlign === textAlignment;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  const alignmentLabels = currentLanguage() === "pl"
    ? { left: "Wyrównaj do lewej", justify: "Wyjustuj", center: "Wyśrodkuj" }
    : { left: "Align left", justify: "Justify", center: "Center" };
  els.textAlignControls?.setAttribute("aria-label", currentLanguage() === "pl" ? "Wyrównanie tekstu" : "Text alignment");
  els.textAlignButtons?.forEach(button => {
    const label = alignmentLabels[button.dataset.textAlign] || "";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  });
  if (els.interlinearExperimentalSetting) els.interlinearExperimentalSetting.checked = state.settings.interlinearExperimental === true;
  setValue(els.interlinearLayoutSetting, state.settings.interlinearLayout || "classic");
  const interlinearEnabled = interlinearExperimentalEnabled();
  [els.interlinearLayoutSetting, els.interlinearLemmaSetting, els.interlinearTypeSetting].filter(Boolean).forEach(control => {
    control.disabled = !interlinearEnabled;
  });
  if (els.interlinearLemmaSetting) els.interlinearLemmaSetting.checked = state.settings.interlinearShowLemma !== false;
  if (els.interlinearTypeSetting) els.interlinearTypeSetting.checked = state.settings.interlinearShowType === true;
  setValue(els.dictionaryScopeSetting, state.settings.dictionaryScope || "current");
}

function setSelectLabels(select, labels) {
  if (!select) return;
  Object.entries(labels).forEach(([value, label]) => {
    const option = select.querySelector(`option[value="${value}"]`);
    if (option) option.textContent = label;
  });
}

function setFieldLabel(select, label) {
  const field = select?.closest("label");
  if (field?.firstChild) field.firstChild.textContent = `${label}\n              `;
}

function localizedPlaceholder(key) {
  const placeholders = {
    search: {
      pl: "światło, Sophia, mystery",
      en: "light, Sophia, mystery"
    },
    chapterSearch: {
      pl: "Sophia, światłość, misterium",
      en: "Sophia, light, mystery"
    },
    fullSearch: {
      pl: "Wpisz motyw lub słowo",
      en: "Enter a theme or word"
    }
  };
  return placeholders[key]?.[currentLanguage()] || "";
}

function setTextForAll(selector, key, value = null) {
  const text = value === null ? t(key) : value;
  document.querySelectorAll(selector).forEach(element => setText(element, text));
}

function setHtmlForAll(selector, key, value = null) {
  const html = (value === null ? t(key) : value).replace("{version}", libraryMeta.version);
  document.querySelectorAll(selector).forEach(element => {
    if (element) element.innerHTML = html;
  });
}

function rawDetectedLanguage() {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language || "pl"];
  return languages.filter(Boolean).map(lang => String(lang)).join(", ") || "pl";
}


function localizeDataText() {
  const lang = currentLanguage() === "en" ? "en" : "pl";
  document.querySelectorAll("[data-i18n-pl][data-i18n-en]").forEach((item) => {
    const value = lang === "en" ? item.dataset.i18nEn : item.dataset.i18nPl;
    if (typeof value === "string") setText(item, value);
  });
}

function localizeLibraryInfo() {
  setTextForAll("#libraryInfoPanel .library-info-head span", "infoKicker");
  setTextForAll("#libraryInfoPanel .library-info-head h3", "infoTitle");
  setTextForAll("#libraryInfoPanel .library-info-head p", "infoLead");
  setTextForAll("#libraryInfoPanel .library-prose h4", "infoHeading");
  setHtmlForAll("#libraryInfoPanel .library-prose > p:nth-of-type(1)", "infoP1");
  setHtmlForAll("#libraryInfoPanel .library-prose > p:nth-of-type(2)", "infoP2");
  setHtmlForAll("#libraryInfoPanel .library-prose > p:nth-of-type(3)", "infoP3");
  const labels = ["infoScopeLabel", "infoFormLabel", "infoApparatusLabel", "infoDataLabel", "infoModeLabel"];
  const values = ["infoScopeValue", "infoFormValue", "infoApparatusValue", "infoDataValue", "infoModeValue"];
  document.querySelectorAll("#libraryInfoPanel .library-info-strip span").forEach((item, index) => {
    item.innerHTML = `<strong>${t(labels[index])}</strong>${t(values[index])}`;
  });
}

function localizeContactInfo() {
  setTextForAll("#libraryContactPanel .library-info-head span", "contactKicker");
  setTextForAll("#libraryContactPanel .library-info-head h3", "contactTitle");
  setTextForAll("#libraryContactPanel .library-info-head p", "contactLead");
  setTextForAll("#libraryContactPanel .library-prose > p:nth-of-type(1)", "contactP1");
  const emailParagraph = document.querySelector("#libraryContactPanel .library-prose > p:nth-of-type(2)");
  if (emailParagraph) {
    const link = emailParagraph.querySelector("a");
    emailParagraph.replaceChildren();
    const strong = document.createElement("strong");
    strong.textContent = t("contactEmailLabel");
    emailParagraph.append(strong, " ");
    if (link) emailParagraph.append(link);
  }
  setTextForAll("#libraryContactPanel .library-prose > p:nth-of-type(3)", "contactP3");
  els.libraryContactPanel?.setAttribute("aria-label", t("contact"));
}

function localizePrivacyInfo() {
  setTextForAll("#libraryPrivacyPanel .library-info-head span", "privacyKicker");
  setTextForAll("#libraryPrivacyPanel .library-info-head h3", "privacyTitle");
  setTextForAll("#libraryPrivacyPanel .library-info-head p", "privacyLead");
  ["privacyP1", "privacyP2", "privacyP3", "privacyP4", "privacyP5"].forEach((key, index) => {
    setHtmlForAll(`#libraryPrivacyPanel .library-prose > p:nth-of-type(${index + 1})`, key);
  });
}

function localizeChangesInfo() {
  setTextForAll("#libraryChangesPanel .library-info-head span", "changesKicker");
  setTextForAll("#libraryChangesPanel .library-info-head h3", "changesTitle");
  setTextForAll("#libraryChangesPanel .library-info-head p", "changesLead");
}

function localizeDictionaryInfo() {
  setText(document.querySelector("#dictionaryKicker"), t("dictionaryKicker"));
  setText(document.querySelector("#dictionaryPanelTitle"), t("dictionaryPanelTitle"));
  setText(document.querySelector("#dictionaryPanelLead"), t("dictionaryPanelLead"));
  setText(document.querySelector("#dictionaryBrowserTitle"), t("dictionaryBrowserTitle"));
  setText(document.querySelector("#dictionaryBrowserLead"), t("dictionaryBrowserLead"));
  const dictionarySearchLabel = document.querySelector("#dictionarySearchLabel");
  if (dictionarySearchLabel) {
    const control = dictionarySearchLabel.querySelector(".dictionary-search-control");
    dictionarySearchLabel.replaceChildren(document.createTextNode(t("dictionarySearchLabel")), control);
  }
  if (els.dictionarySearchInput) {
    els.dictionarySearchInput.placeholder = t("dictionarySearchPlaceholder");
  }
  if (els.dictionarySearchClear) {
    const clearLabel = t("dictionarySearchClear");
    els.dictionarySearchClear.setAttribute("aria-label", clearLabel);
    els.dictionarySearchClear.title = clearLabel;
  }
}

function localizeToolsInfo() {
  setTextForAll("#libraryToolsPanel .library-info-head span", "toolsKicker");
  setTextForAll("#libraryToolsPanel .library-info-head h3", "toolsTitle");
  setTextForAll("#libraryToolsPanel .library-info-head p", "toolsLead");
}

function bookLayersLabel() {
  const modes = window.GNOSTYK_READER_ENGINE.supportedReaderModes(activeBook, true);
  const labels = ["PL"];
  if (modes.includes("source")) labels.push("EN");
  if (modes.includes("coptic")) labels.push("COPT");
  return labels.join("/");
}

function localizeBookInfo() {
  setTextForAll(".reader-hero .eyebrow", null, bookInfo("eyebrow"));
  setTextForAll(".reader-hero h2", null, activeBook?.title || data.title || "Pistis Sophia");
  setTextForAll(".reader-hero .book-layer-label", null, bookLayersLabel());
  setTextForAll(".reader-hero .hero-subtitle", null, bookInfo("subtitle"));
  setTextForAll(".mobile-book-head div > span", null, activeBook?.title || data.title || "Pistis Sophia");
  setTextForAll(".mobile-book-head strong", null, bookInfo("mobileMeta"));
  setTextForAll(".library-card h2", null, activeBook?.title || data.title || "Pistis Sophia");
  setTextForAll(".library-card p", null, bookInfo("sidebarDescription"));
  setTextForAll("#aboutPanel h3:first-of-type", null, bookInfo("aboutTitle"));
  setHtmlForAll("#aboutPanel > p:first-of-type", null, bookInfo("aboutLead"));
  const standardAboutFields = [
    ["aboutSourceLabel", "aboutSourceValue"],
    ["aboutCopticLabel", "aboutCopticValue"],
    ["aboutMethodLabel", "aboutMethodValue"],
    ["aboutApparatusLabel", "aboutApparatusValue"],
    ["aboutRightsLabel", "aboutRightsValue"]
  ];
  const pistisAboutFields = [
    ["aboutSourceLabel", "aboutSourceValue"],
    ["aboutComparisonLabel", "aboutComparisonValue"],
    ["aboutProcessLabel", "aboutProcessValue"],
    ["aboutCopticLabel", "aboutCopticValue"],
    ["aboutMethodLabel", "aboutMethodValue"],
    ["aboutTerminologyLabel", "aboutTerminologyValue"],
    ["aboutApparatusLabel", "aboutApparatusValue"],
    ["aboutRightsLabel", "aboutRightsValue"]
  ];
  const aboutFields = activeBook?.id === "pistis-sophia" ? pistisAboutFields : standardAboutFields;
  document.querySelectorAll("#aboutPanel dl div").forEach((item, index) => {
    const field = aboutFields[index];
    item.hidden = !field;
    if (!field) return;
    setText(item.querySelector("dt"), bookInfo(field[0]));
    item.querySelector("dd").innerHTML = bookInfo(field[1]);
  });
  setTextForAll("#aboutPanel h3:nth-of-type(2)", "citeTitle");
  setHtmlForAll("#aboutPanel > p:nth-of-type(2)", null, bookInfo("citeSimple").replace("{version}", libraryMeta.version));
  setHtmlForAll("#aboutPanel > p:nth-of-type(3)", null, bookInfo("citeScholarly"));
  setTextForAll(".legal-footer strong", null, bookInfo("legalTitle"));
  setHtmlForAll(".legal-footer p:nth-of-type(1)", null, bookInfo("legalP1"));
  setHtmlForAll(".legal-footer p:nth-of-type(2)", null, bookInfo("legalP2"));
  setHtmlForAll(".legal-footer p:nth-of-type(3)", null, bookInfo("legalP3"));
}


function localizeSupportInfo() {
  setTextForAll("#librarySupportPanel .library-info-head span", "supportKicker");
  setTextForAll("#librarySupportPanel .library-info-head h3", "supportTitle");
  setTextForAll("#librarySupportPanel .library-info-head p", "supportLead");
  setTextForAll("#librarySupportPanel .support-prose > p:nth-of-type(1)", "supportP1");
  setTextForAll("#librarySupportPanel .support-prose > p:nth-of-type(2)", "supportP2");
  setTextForAll("#librarySupportPanel .support-help-box strong", "supportHelpTitle");
  const items = t("supportHelpItems") || [];
  document.querySelectorAll("#librarySupportPanel .support-help-box li").forEach((item, index) => {
    setText(item, items[index] || "");
  });
  setTextForAll("#supportPaypalButton span:last-child", "supportPaypal");
  const supportLabel = t("support");
  els.librarySupportPanel?.setAttribute("aria-label", supportLabel);
  els.supportPaypalButton?.setAttribute("aria-label", t("supportPaypal"));
}

function localizeStaticText() {
  localizeDataText();
  [
    [".brand p", "librarySubtitle"],
    ["#backToLibraryButton", "backLibrary"],
    [".search span", "search"],
    ['[data-tab="chapters"]', "chapters"],
    ['[data-tab="themes"]', "themes"],
    ['[data-tab="marks"]', "bookmarks"],
    ['[data-tab="addenda"]', "addendaSection"],
    [".library-home-copy h2", "libraryTitle"],
    [".library-home-copy > p:not(.eyebrow)", "libraryLead"],
    ["#libraryHomeToggle", "home"],
    ["#libraryBooksToggle", "books"],
    ["#libraryInfoToggle", "info"],
    ["#libraryContactToggle", "contact"],
    ["#libraryPrivacyToggle", "privacy"],
    ["#libraryChangesToggle", "changes"],
    ["#libraryHelpToggle", "help"],
    ["#libraryDictionaryToggle", "dictionary"],
    ["#libraryToolsToggle", "tools"],
    ["#librarySettingsToggle", "settings"],
    ["#librarySupportToggle span:last-child", "support"],
    [".library-card .eyebrow", "currentWorkKicker"],
    [".library-card p", "workSidebarDescription"],
    ["#openWorkButton", "read"],
    [".work-tile.is-available span", "workStatus"],
    [".work-tile.is-available p", "workDescription"],
    [".work-tile.is-planned span", "planned"],
    [".work-tile.is-planned h3", "nextTexts"],
    [".work-tile.is-planned p", "nextTextsNote"],
    ["#thomasDetailsToggle", "details"],
    ["#thomasDetailsPanel header span", "planned"],
    ["#thomasDetailsPanel header h3", "nextTexts"],
    ["#thomasDetailsPanel header p", "thomasDetailsLead"],
    ["#thomasDetailsPanel .planned-work-grid div:nth-child(1) strong", "thomasStatusLabel"],
    ["#thomasDetailsPanel .planned-work-grid div:nth-child(1) span", "thomasStatusValue"],
    ["#thomasDetailsPanel .planned-work-grid div:nth-child(2) strong", "thomasSourceLabel"],
    ["#thomasDetailsPanel .planned-work-grid div:nth-child(2) span", "thomasSourceValue"],
    ["#thomasDetailsPanel .planned-work-grid div:nth-child(3) strong", "thomasFormLabel"],
    ["#thomasDetailsPanel .planned-work-grid div:nth-child(3) span", "thomasFormValue"],
    ["#thomasDetailsPanel .planned-work-grid div:nth-child(4) strong", "thomasNextLabel"],
    ["#thomasDetailsPanel .planned-work-grid div:nth-child(4) span", "thomasNextValue"],
    ["#settingsPanel .library-info-head span", "settingsKicker"],
    ["#settingsPanel .library-info-head h3", "settingsTitle"],
    ["#settingsPanel .library-info-head p", "settingsLead"],
    [".backup-settings strong", "backupTitle"],
    [".glossary-settings strong", "glossaryTitle"],
    ["#chooseBackupFolder", "chooseBackupFolder"],
    ["#exportNotesButton", "exportNotes"],
    ["#importNotesButton", "importNotes"],
    ["#saveGlossButton", "saveGloss"],
    ["#clearGlossButton", "clearGlossary"],
    ["#exportGlossaryButton", "exportGlossary"],
    ["#importGlossaryButton", "importGlossary"],
    ["#continueButton", "continue"],
    [".page-jump span", "page"],
    ["#polishMode", "polishText"],
    ["#sourceMode", "source"],
    ["#copticMode", "coptic"],
    ["#interlinearMode", "interlinear"],
    ["#copyButton", "copyFragment"],
    ["#addendaSidebarToggle", "showAddenda"],
    ["#aboutToggle", "aboutTranslation"],
    ["#bookmarkButton", "bookmarks"],
    [".reader-focus-toggle span", "focusMode"],
    [".notes h3", "notes"],
    ["#clearNote", "clear"],
    ["#saveStatus", "localSave"],
    ["#offlineNotice", "offline"],
    ["#mobileBackToLibraryButton", "backLibrary"],
    ["#mobileCopyButton", "copyQuote"],
    ["#mobileAboutButton", "aboutTranslation"],
    ["#mobileSettingsButton", "settings"],
    ["#mobileFocusButton", "focusMode"],
    ["#mobileClose", "close"],
    ["#mobilePolishMode", "polishText"],
    ["#mobileSourceMode", "source"],
    ["#mobileCopticMode", "coptic"],
    ["#mobileInterlinearMode", "interlinear"],
    ['[data-mobile-panel="toc"]', "mobileToc"],
    ['[data-mobile-panel="search"]', "mobileSearch"],
    ['[data-mobile-panel="marks"]', "bookmarks"],
    ['[data-mobile-panel="more"]', "mobileMore"],
    ["#focusExit", "exitFocus"],
    [".focus-page-field span", "page"],
    ["#footerInfoButton", "info"],
    ["#footerContactButton", "contact"],
    ["#footerPrivacyButton", "privacy"],
    ["#footerChangesButton", "changes"],
    ["#footerSupportButton span:last-child", "support"],
    [".site-footer.library-only > div:first-child > strong", "libraryTitle"]
  ].forEach(([selector, key]) => setTextForAll(selector, key));
  setTextForAll(".site-footer.library-only > div:first-child p:not(.site-copyright)", "footerLead");
  localizeLibraryInfo();
  localizeContactInfo();
  localizePrivacyInfo();
  localizeChangesInfo();
  localizeDictionaryInfo();
  localizeToolsInfo();
  localizeSupportInfo();
  localizeBookInfo();
  els.thomasDetailsPanel?.setAttribute("aria-label", t("thomasDetailsAria"));
}

function localizeMobileLabels() {
  document.querySelectorAll(".mobile-panel label.mobile-search span").forEach((item, index) => {
    setText(item, index === 0 ? t("searchChapters") : t("searchAll"));
  });
  document.querySelectorAll(".mobile-field > span").forEach((item, index) => {
    setText(item, index === 0 ? t("textMode") : t("citationFormat"));
  });
}

function localizeMetaBlocks() {
  document.querySelectorAll(".work-meta article").forEach((item, index) => {
    const labels = ["status", "sourceBase", "pagination", "rights"];
    const values = [bookInfo("status"), bookInfo("sourceShort"), bookInfo("pagination"), bookInfo("rightsShort")];
    setText(item.querySelector("span"), t(labels[index]));
    setText(item.querySelector("strong"), values[index]);
  });
  document.querySelectorAll(".hero-stats span").forEach((item, index) => {
    const strong = item.querySelector("strong")?.outerHTML || "";
    if (index === 0) item.innerHTML = `${strong} ${Number(data.pageCount) === 1 ? bookInfo("statUnitSingular") : bookInfo("statUnitPlural")}`;
    if (index === 1) item.innerHTML = `${strong} ${bookInfo("structureLabel")}`;
    if (index === 2) item.innerHTML = `${strong} ${t("libraryVersionLabel")}`;
  });
}


function localizePlaceholders() {
  if (els.search) els.search.placeholder = localizedPlaceholder("search");
  if (els.mobileChapterSearch) els.mobileChapterSearch.placeholder = localizedPlaceholder("chapterSearch");
  if (els.mobileSearch) els.mobileSearch.placeholder = localizedPlaceholder("fullSearch");
  if (els.notes) els.notes.placeholder = t("notesPlaceholder");
}

function localizeModeControls() {
  setText(document.querySelector('[data-focus-mode="pl"]'), t("polishText"));
  setText(document.querySelector('[data-focus-mode="source"]'), t("source"));
  setText(document.querySelector('[data-focus-mode="coptic"]'), t("coptic"));
  setText(document.querySelector('[data-focus-mode="interlinear"]'), t("interlinear"));
  const isLogionReader = activeBook?.type === "logion-reader";
  setSelectLabels(els.citationFormat, {
    simple: t("simpleCitation"),
    scholarly: t("scholarlyCitation"),
    mead: isLogionReader ? (currentLanguage() === "pl" ? "Logion" : "Logion") : "Mead",
    schwpet: isLogionReader ? (currentLanguage() === "pl" ? "Źródła" : "Sources") : "Schw.-Pet."
  });
  setText(document.querySelector('[data-mobile-citation="simple"]'), t("simpleCitation"));
  setText(document.querySelector('[data-mobile-citation="scholarly"]'), t("scholarlyCitation"));
}

function localizeSettingsControls() {
  setFieldLabel(els.languageSetting, t("language"));
  setFieldLabel(els.themeSetting, t("theme"));
  setFieldLabel(els.fontSizeSetting, t("fontSize"));
  setFieldLabel(els.lineHeightSetting, t("lineHeight"));
  setFieldLabel(els.widthSetting, t("columnWidth"));
  setFieldLabel(els.interlinearLayoutSetting, currentLanguage() === "pl" ? "Tryb interlinii" : "Interlinear mode");
  setFieldLabel(els.dictionaryScopeSetting, currentLanguage() === "pl" ? "Wystąpienia w słowniku" : "Dictionary occurrences");
  const lemmaLabel = els.interlinearLemmaSetting?.closest("label")?.querySelector("span");
  const typeLabel = els.interlinearTypeSetting?.closest("label")?.querySelector("span");
  setText(lemmaLabel, currentLanguage() === "pl" ? "Pokazuj lemat" : "Show lemma");
  setText(typeLabel, currentLanguage() === "pl" ? "Pokazuj typ gramatyczny" : "Show grammatical type");
  setFieldLabel(els.glossaryTokenInput, t("glossaryToken"));
  setFieldLabel(els.glossaryGlossInput, t("glossaryGloss"));
  setSelectLabels(els.languageSetting, { auto: t("auto"), pl: t("polish"), en: t("english") });
  setSelectLabels(els.themeSetting, { sepia: t("sepia"), light: t("light"), dark: t("dark") });
  setSelectLabels(els.fontSizeSetting, { small: t("small"), medium: t("medium"), large: t("large") });
  setSelectLabels(els.lineHeightSetting, { compact: t("compact"), normal: t("normal"), wide: t("wide") });
  setSelectLabels(els.widthSetting, { standard: t("standard"), narrow: t("narrow"), wide: t("wide") });
  setSelectLabels(els.interlinearLayoutSetting, { compact: currentLanguage() === "pl" ? "Kompaktowa" : "Compact", classic: currentLanguage() === "pl" ? "Klasyczna" : "Classic", grammatical: currentLanguage() === "pl" ? "Gramatyczna" : "Grammatical", expanded: currentLanguage() === "pl" ? "Rozszerzona" : "Expanded" });
  setSelectLabels(els.dictionaryScopeSetting, { current: currentLanguage() === "pl" ? "Tylko aktywna księga" : "Active book only", library: currentLanguage() === "pl" ? "Cała biblioteka" : "Whole library" });
  setText(els.languageAutoHint, t("autoLanguageHint").replace("{language}", rawDetectedLanguage()));
  setBackupStatus(backupStatusKey);
  renderGlossaryPanel();
  renderDictionarySearch();
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage();
  localizeStaticText();
  localizeMobileLabels();
  localizeMetaBlocks();
  localizePlaceholders();
  localizeModeControls();
  localizeSettingsControls();
  syncLanguageSwitches();
  if (state.changelogText) renderLibraryUpdatesFromChangelog(state.changelogText);
  else localizeRenderedLibraryUpdates();
  renderPanelState();
  rerenderOpenDictionaryCard();
}

function syncLanguageSwitches() {
  const lang = currentLanguage();
  els.languageSwitchButtons?.forEach(button => {
    const active = button.dataset.languageSwitch === lang;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setInterfaceLanguage(language) {
  if (!["pl", "en"].includes(language)) return;
  state.sessionLanguage = language;
  appStorage.setItem("ps.interfaceLanguage", language);
  applySettings();
  applyLanguage();
  renderReader();
  renderLists();
  rerenderOpenDictionaryCard();
}

function updateOfflineNotice() {
  const offline = !navigator.onLine;
  if (els.offlineNotice) els.offlineNotice.hidden = !offline;
}

function setLibraryVersion(version) {
  libraryMeta.version = version;
  setText(els.libraryVersion, version);
  setText(els.libraryVersionFooter, version);
  setText(els.libraryVersionFooterHome, version);
  document.querySelectorAll(".inline-library-version").forEach(item => setText(item, version));
}

const FALLBACK_CHANGELOG = window.GNOSTYK_FALLBACK_CHANGELOG || "# Changelog\n";

const { compareVersionsDesc, parseChangelogGroups } = window.GNOSTYK_CHANGELOG_TOOLS;

function localizedChangelogPoint(point) {
  return String(point || "");
}

function changelogPointsForGroup(group, wantedLocale) {
  const directPoints = group.points[wantedLocale] || [];
  const allPoints = group.points.all || [];
  const fallbackLocale = wantedLocale === "en" ? "pl" : "en";
  const fallbackPoints = group.points[fallbackLocale] || [];
  const points = directPoints.length ? directPoints : (allPoints.length ? allPoints : fallbackPoints);
  if (!points.length && group.title) return [group.title];
  return points;
}

function renderHomeRecentUpdates(groups) {
  if (!els.homeRecentUpdates) return;
  const wantedLocale = currentLanguage() === "en" ? "en" : "pl";
  const items = [];
  for (const group of groups) {
    const points = changelogPointsForGroup(group, wantedLocale);
    if (!points.length) continue;
    items.push({ version: group.version, point: points[0] });
    if (items.length >= 3) break;
  }
  if (!items.length) return;
  els.homeRecentUpdates.innerHTML = items.map(item => `
    <li>
      <strong>${escapeHtml(item.version)}</strong>
      <span>${escapeHtml(localizedChangelogPoint(item.point))}</span>
    </li>
  `).join("");
}

function localizeRenderedLibraryUpdates() {
  if (!els.libraryUpdates) return;
  els.libraryUpdates.querySelectorAll("[data-localize]").forEach(item => {
    const key = item.dataset.localize;
    if (key) setText(item, t(key));
  });
}

function renderLibraryUpdatesFromChangelog(text) {
  const wantedLocale = currentLanguage() === "en" ? "en" : "pl";
  const groups = parseChangelogGroups(text);
  renderHomeRecentUpdates(groups);
  if (!els.libraryUpdates) {
    localizeRenderedLibraryUpdates();
    return;
  }

  const renderedGroups = [];
  for (const group of groups) {
    const points = changelogPointsForGroup(group, wantedLocale);
    if (!points.length) continue;
    renderedGroups.push({ version: group.version, points });
    if (renderedGroups.length >= 25) break;
  }

  const rendered = renderedGroups.map(group => `
      <li class="library-update-group">
        <strong>${escapeHtml(group.version)}</strong>
        <ul>
          ${group.points.map(point => `<li>${escapeHtml(localizedChangelogPoint(point))}</li>`).join("")}
        </ul>
      </li>
    `);
  if (rendered.length) els.libraryUpdates.innerHTML = rendered.join("");
  localizeRenderedLibraryUpdates();
}

async function loadLibraryVersion() {
  setLibraryVersion(libraryMeta.version);
  if (location.protocol === "file:") {
    state.changelogText = FALLBACK_CHANGELOG;
    renderLibraryUpdatesFromChangelog(FALLBACK_CHANGELOG);
    return;
  }
  try {
    const response = await fetch("./PUBLIC_CHANGELOG.md", { cache: "no-store" });
    if (!response.ok) return;
    const changelogText = await response.text();
    state.changelogText = changelogText;
    renderLibraryUpdatesFromChangelog(changelogText);
  } catch {
    setLibraryVersion(libraryMeta.version);
  }
}

function setPanelVisibility(panel, open) {
  if (!panel) return;
  panel.hidden = !open;
  panel.classList.toggle("is-open", open);
}

function renderPanelState() {
  setPanelVisibility(els.aboutPanel, state.aboutOpen);
  setPanelVisibility(els.settingsPanel, state.settingsOpen);
  els.aboutToggle?.classList.toggle("is-active", state.aboutOpen);
  els.settingsToggle?.classList.toggle("is-active", state.settingsOpen);
  els.aboutToggle?.setAttribute("aria-expanded", String(state.aboutOpen));
  els.settingsToggle?.setAttribute("aria-expanded", String(state.settingsOpen));
}

function setReaderPanel(panel) {
  if (panel === "about") {
    state.aboutOpen = !state.aboutOpen;
  }
  renderPanelState();
}

function polishPageText(page, chapter) {
  if (page?.polish) return page.polish;
  if (polishTranslations[page.page]) {
    return polishTranslations[page.page];
  }
  const hits = hitsForPage(page).slice(0, 4);
  const range = rangeForChapter(chapter);
  const lead = chapter
    ? `Ta część należy do bloku „${range?.title || "Pistis Sophia"}”. ${range?.summary || "Tekst rozwija dialog Jezusa z uczniami oraz kosmologię gnostyczną."}`
    : "Ta część zawiera materiał wprowadzający: tytuł, informacje o wydaniu, spis treści, wstęp i kontekst rękopisu.";
  const concepts = hits.length
    ? hits.map(hit => `- ${hit.label}: ${hit.note}.`).join("\n")
    : "- Na tej stronie nie ma wyraźnego skupienia na jednym z oznaczonych motywów.";
  const chapterLine = chapter
    ? `Aktualny punkt lektury: rozdział ${chapter.number}. ${chapter.subtitle ? `W oryginale zaczyna się od: „${chapter.subtitle}”.` : ""}`
    : "Aktualny punkt lektury: wstęp przed właściwym przekładem.";
  const glossary = translationPrinciples.map(([source, target, note]) => `- ${source} -> ${target}: ${note}.`).join("\n");
  return `${chapterLine}\n\n${lead}\n\nTa strona nie ma jeszcze pełnego polskiego przekładu. Do czasu opracowania pokazuję przewodnik i słownik stylu, a pełny tekst źródłowy jest w trybie „Oryginał EN”.\n\nNajważniejsze motywy na tej stronie:\n${concepts}\n\nZasady przekładu misteryjnego:\n${glossary}`;
}

function renderPolishGuide(page, chapter) {
  if (activeBook?.type === "logion-reader") {
    const isPhilip = activeBook?.id === "gospel-of-philip";
    const guideMeta = isPhilip
      ? (currentLanguage() === "pl" ? "Ewangelia Filipa · pełny tekst PL/EN" : "Gospel of Philip · full PL/EN text")
      : (currentLanguage() === "pl" ? "Ewangelia Tomasza · pełny tekst PL/EN/COPT" : "Gospel of Thomas · full PL/EN/COPT text");
    const guideNote = isPhilip
      ? (currentLanguage() === "pl" ? "Czytnik sekcji w module Ewangelii Filipa." : "Section reader in the Gospel of Philip module.")
      : (currentLanguage() === "pl" ? "Czytnik logionów w module Ewangelii Tomasza." : "Logion reader in the Gospel of Thomas module.");
    els.polishGuide.innerHTML = `<div class="guide-head"><strong>${escapeHtml(page?.heading || page?.title || logionUnitLabel())}</strong><span>${guideMeta}</span></div><p class="review-note done">${guideNote}</p>`;
    return;
  }
  const hits = hitsForPage(page).slice(0, 5);
  const range = rangeForChapter(chapter);
  const translated = Boolean(polishTranslations[page.page]);
  const status = localizedReviewStatus(reviewStatusForPage(page), manuscriptRefsForPage(page).length > 0);
  els.polishGuide.innerHTML = `
    <div class="guide-head">
      <strong>${escapeHtml(readableChapter(chapter))}</strong>
      <span>${translated ? escapeHtml(status.label) : t("awaitingTranslation")} · ${range ? `${t("chapters")} ${range.from}-${range.to}` : t("introRange")}</span>
    </div>
    <p class="review-note ${status.level}">${escapeHtml(status.note)}</p>
    <div class="guide-chips">
      ${(hits.length ? hits : themes.slice(0, 3)).map(hit => `<span>${escapeHtml(localizedThemeLabel(hit))}</span>`).join("")}
    </div>
  `;
}

function saveMarks() {
  appStorage.setItem("ps.marks", JSON.stringify(state.marks));
}

function saveNotes() {
  appStorage.setItem("ps.notes", JSON.stringify(state.notes));
  scheduleNotesBackup();
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 920px)").matches;
}

function setAppView(view) {
  state.view = view;
  document.body.dataset.view = view;
  appStorage.setItem("ps.view", view);
}

function setLibrarySection(section) {
  const isHome = section === "home" || !section;
  const isBooks = section === "books";
  const isInfo = section === "info";
  const isContact = section === "contact";
  const isPrivacy = section === "privacy";
  const isChanges = section === "changes";
  const isHelp = section === "help";
  const isDictionary = section === "dictionary";
  const isTools = section === "tools";
  const isSettings = section === "settings";
  const isSupport = section === "support";
  if (els.libraryHomePanel) els.libraryHomePanel.hidden = !isHome;
  if (els.libraryBooksPanel) els.libraryBooksPanel.hidden = !isBooks;
  if (els.libraryInfoPanel) els.libraryInfoPanel.hidden = !isInfo;
  if (els.libraryContactPanel) els.libraryContactPanel.hidden = !isContact;
  if (els.libraryPrivacyPanel) els.libraryPrivacyPanel.hidden = !isPrivacy;
  if (els.libraryChangesPanel) els.libraryChangesPanel.hidden = !isChanges;
  if (els.libraryHelpPanel) els.libraryHelpPanel.hidden = !isHelp;
  if (els.libraryDictionaryPanel) els.libraryDictionaryPanel.hidden = !isDictionary;
  if (els.libraryToolsPanel) els.libraryToolsPanel.hidden = !isTools;
  if (els.settingsPanel) els.settingsPanel.hidden = !isSettings;
  if (els.librarySupportPanel) els.librarySupportPanel.hidden = !isSupport;
  state.settingsOpen = isSettings;
  els.libraryHomeToggle?.classList.toggle("is-active", isHome);
  els.libraryBooksToggle?.classList.toggle("is-active", isBooks);
  els.libraryInfoToggle?.classList.toggle("is-active", isInfo);
  els.libraryContactToggle?.classList.toggle("is-active", isContact);
  els.libraryPrivacyToggle?.classList.toggle("is-active", isPrivacy);
  els.libraryChangesToggle?.classList.toggle("is-active", isChanges);
  els.libraryHelpToggle?.classList.toggle("is-active", isHelp);
  els.libraryDictionaryToggle?.classList.toggle("is-active", isDictionary);
  els.libraryToolsToggle?.classList.toggle("is-active", isTools);
  els.librarySettingsToggle?.classList.toggle("is-active", isSettings);
  els.librarySupportToggle?.classList.toggle("is-active", isSupport);
  els.libraryHomeToggle?.setAttribute("aria-expanded", String(isHome));
  els.libraryBooksToggle?.setAttribute("aria-expanded", String(isBooks));
  els.libraryInfoToggle?.setAttribute("aria-expanded", String(isInfo));
  els.libraryContactToggle?.setAttribute("aria-expanded", String(isContact));
  els.libraryPrivacyToggle?.setAttribute("aria-expanded", String(isPrivacy));
  els.libraryChangesToggle?.setAttribute("aria-expanded", String(isChanges));
  els.libraryHelpToggle?.setAttribute("aria-expanded", String(isHelp));
  els.libraryDictionaryToggle?.setAttribute("aria-expanded", String(isDictionary));
  els.libraryToolsToggle?.setAttribute("aria-expanded", String(isTools));
  els.librarySettingsToggle?.setAttribute("aria-expanded", String(isSettings));
  els.librarySupportToggle?.setAttribute("aria-expanded", String(isSupport));
  const target = isHome ? els.libraryHomePanel : isInfo ? els.libraryInfoPanel : isContact ? els.libraryContactPanel : isPrivacy ? els.libraryPrivacyPanel : isChanges ? els.libraryChangesPanel : isHelp ? els.libraryHelpPanel : isDictionary ? els.libraryDictionaryPanel : isTools ? els.libraryToolsPanel : isSettings ? els.settingsPanel : isSupport ? els.librarySupportPanel : els.libraryBooksPanel;
  if (state.view !== "reader") {
    requestAnimationFrame(() => target?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }
}

function toggleThomasDetails(forceOpen) {
  if (!els.thomasDetailsPanel || !els.thomasDetailsToggle) return;
  const open = typeof forceOpen === "boolean" ? forceOpen : els.thomasDetailsPanel.hidden;
  els.thomasDetailsPanel.hidden = !open;
  els.thomasDetailsToggle.setAttribute("aria-expanded", String(open));
  if (open) {
    requestAnimationFrame(() => els.thomasDetailsPanel.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }
}

function closeReaderPanels() {
  state.aboutOpen = false;
  state.settingsOpen = false;
  renderPanelState();
}

function scrollToReaderText() {
  if (isPistisBook() && state.sidebarMode !== "addenda" && !["coptic", "interlinear"].includes(state.readerMode)) {
    const target = document.querySelector(`#pistis-page-${state.page}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }
  if (isThomasBook || activeBook?.type === "logion-reader") {
    const target = document.querySelector(`#logion-${state.page}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }
  document.querySelector(".text-surface")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function keepActiveSidebarItemVisible(pageNumber) {
  const selector = state.sidebarMode === "addenda"
    ? `[data-addenda-page="${pageNumber}"]`
    : `.nav-item[data-page="${pageNumber}"]`;
  const activeItem = els.chapters?.querySelector(selector);
  if (!activeItem) return;
  requestAnimationFrame(() => {
    activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

function navigateFromAddendaSidebar(pageNumber) {
  const targetPage = clampReaderPage(pageNumber, PISTIS_TEXT_START_PAGE);
  state.sidebarMode = "addenda";
  state.tab = "chapters";
  state.page = targetPage;
  saveReadingState();
  renderReader();
  renderLists();
  setTab(state.tab);
  requestAnimationFrame(() => {
    document.querySelector(`#addenda-page-${targetPage}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    keepActiveSidebarItemVisible(targetPage);
  });
}

function navigateFromPistisChapterSidebar(chapterNumber, pageNumber) {
  const chapter = data.chapters.find(item => Number(item.number) === Number(chapterNumber));
  const targetPage = Number(chapter?.page || pageNumber || PISTIS_TEXT_START_PAGE);
  state.sidebarMode = "chapters";
  state.tab = "chapters";
  state.page = targetPage;
  state.pistisChapter = Number(chapterNumber);
  saveReadingState();
  renderReader();
  renderLists();
  setTab(state.tab);
  requestAnimationFrame(() => {
    const copticRef = copticRefForPistisChapter(chapterNumber);
    const target = ["coptic", "interlinear"].includes(state.readerMode) && copticRef
      ? document.querySelector(`#coptic-page-${copticRef}`)
      : (document.querySelector(`#pistis-chapter-${Number(chapterNumber)}`)
        || document.querySelector(`#pistis-page-${targetPage}`));
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    keepActiveSidebarItemVisible(targetPage);
  });
}

function scrollToReaderControls() {
  setAppView("reader");
  closeReaderPanels();
  (els.readerControls || document.querySelector(".text-surface"))?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function goToPage(page, options = {}) {
  setAppView("reader");
  if (isMobileLayout()) closeReaderPanels();
  state.page = resolveReaderPage(page);
  if (isPistisBook() && !options.keepChapterSelection) state.pistisChapter = null;
  state.tab = readerTabForPage();
  saveReadingState();
  renderReader();
  renderLists();
  setTab(state.tab);
  if (options.scrollToText || isMobileLayout()) {
    requestAnimationFrame(scrollToReaderText);
  }
}

function renderReader() {
  state.tab = readerTabForPage();
  state.readerMode = normalizeReaderMode(state.readerMode);
  const page = pageByNumber(state.page);
  const chapter = chapterForPage(state.page);
  renderPolishGuide(page, chapter);
  const isSource = state.readerMode === "source";
  let text = state.readerMode === "pl" ? polishPageText(page, chapter) : page.text;
  if (isPistisBook() && Number(page?.page) === PISTIS_TEXT_START_PAGE && state.sidebarMode !== "addenda") {
    text = pistisPage48MainText(text, state.readerMode === "pl" ? "pl" : "en");
  }
  if (els.pageText) {
    els.pageText.lang = isSource ? "en" : "pl";
    let body = "";
    const plan = readerRenderPlan();
    if (plan === "pistis-addenda-continuous") {
      body = renderPistisAddendaContinuousText();
      els.pageText.innerHTML = body;
    } else if (plan === "pistis-text-continuous") {
      body = renderPistisContinuousText();
      els.pageText.innerHTML = `${renderReferenceStrip(page, chapter)}${body}`;
    } else if (plan === "logion-text-continuous") {
      body = renderLogionContinuousText();
      els.pageText.innerHTML = body;
    } else if (plan === "logion-coptic-continuous") {
      body = renderThomasCopticContinuousText();
      els.pageText.innerHTML = `${renderReferenceStrip(page, chapter)}${body}`;
    } else if (plan === "pistis-coptic-continuous") {
      body = renderPistisCopticContinuousText();
      els.pageText.innerHTML = `${renderReferenceStrip(page, chapter)}${body}`;
    } else if (plan === "active-interlinear") {
      body = interlinearPageText(page);
      els.pageText.innerHTML = `${renderReferenceStrip(page, chapter)}${body}`;
    } else {
      body = plan === "active-coptic"
        ? copticPageText(page)
        : `<div class="page-prose ${isSource ? "source-prose" : ""}">${isSource ? structuredSourceProseHtml(text) : highlight(text)}</div>`;
      els.pageText.innerHTML = `${renderReferenceStrip(page, chapter)}${body}`;
    }
  }
  setValue(els.pageInput, state.page);
  setValue(els.focusPageInput, state.page);
  updateReaderNavigationControls();
  setText(els.currentPage, (isThomasBook || activeBook?.type === "logion-reader") ? `${logionUnitLabel()} ${state.page}` : `${t("page")} ${state.page}`);
  setText(els.focusPageLabel, (isThomasBook || activeBook?.type === "logion-reader") ? `${logionUnitLabel()} ${state.page}` : `${t("pageShort")} ${state.page}`);
  setText(els.currentChapter, readableChapter(chapter));
  const modes = supportedReaderModes();
  [
    [els.polishMode, "pl"],
    [els.sourceMode, "source"],
    [els.copticMode, "coptic"],
    [els.interlinearMode, "interlinear"]
  ].forEach(([button, mode]) => {
    if (!button) return;
    button.hidden = !modes.includes(mode);
    button.classList.toggle("is-active", state.readerMode === mode);
    button.setAttribute("aria-pressed", String(state.readerMode === mode));
  });
  setText(els.focusModeToggle, t("version"));
  els.focusModeItems?.forEach(button => {
    const mode = button.dataset.focusMode;
    button.hidden = !modes.includes(mode);
    button.classList.toggle("is-active", mode === state.readerMode);
  });
  els.bookmark?.classList.toggle("is-active", state.marks.includes(state.page));
  setValue(els.notes, state.notes[state.page] || "");
  setText(els.mobileCurrentPage, (isThomasBook || activeBook?.type === "logion-reader") ? `${logionUnitLabel()} ${state.page}` : `${t("pageShort")} ${state.page}`);
  setValue(els.citationFormat, state.citationFormat);
  [
    [els.mobilePolishMode, "pl"],
    [els.mobileSourceMode, "source"],
    [els.mobileCopticMode, "coptic"],
    [els.mobileInterlinearMode, "interlinear"]
  ].forEach(([button, mode]) => {
    if (!button) return;
    button.hidden = !modes.includes(mode);
    button.classList.toggle("is-active", state.readerMode === mode);
    button.setAttribute("aria-pressed", String(state.readerMode === mode));
  });
  els.mobileCitationFormats?.forEach(button => {
    button.classList.toggle("is-active", button.dataset.mobileCitation === state.citationFormat);
  });
  setText(els.mobileBookmark, state.marks.includes(state.page) ? (currentLanguage() === "pl" ? "Usuń zakładkę" : "Remove bookmark") : (currentLanguage() === "pl" ? "Dodaj zakładkę" : "Add bookmark"));
}

function renderLists() {
  updatePistisSectionUi();
  renderChapters();
  renderThemes();
  renderMarks();
  renderAddenda();
  renderMobileNavigation();
}

function renderChapters() {
  if (!els.chapters) return;

  if (isPistisBook() && state.sidebarMode === "addenda") {
    const normalizedQuery = state.query.trim().toLowerCase();
    const pages = pistisAddendaPages().filter(page => {
      if (!normalizedQuery) return true;
      const pageNumber = Number(page.page);
      const text = `${addendaTitleForPage(page)} ${page.preview || ""} ${page.polish || polishTranslations[pageNumber] || ""} ${page.text || ""}`.toLowerCase();
      return text.includes(normalizedQuery);
    });
    els.chapters.innerHTML = pages.length
      ? `<div class="addenda-sidebar-heading"><strong>${escapeHtml(t("addendaMaterials"))}</strong><span>${escapeHtml(t("addendaLead"))}</span></div>${pages.map(addendaButtonHtml).join("")}`
      : `<div class="empty">${t("noResults")}</div>`;
    return;
  }

  const matches = data.chapters.filter(chapter => chapterMatchesQuery(chapter, state.query));
  els.chapters.innerHTML = matches.map(chapterButtonHtml).join("") || `<div class="empty">${t("noResults")}</div>`;
}

function renderThemes() {
  if (!els.themes) return;
  els.themes.innerHTML = themes.map(theme => {
    const count = data.pages.reduce((sum, page) => {
      const text = page.text.toLowerCase();
      return sum + theme.terms.filter(term => text.includes(term.toLowerCase())).length;
    }, 0);
    return `
      <button class="theme-item" data-theme="${theme.label}" type="button">
        <strong>${escapeHtml(localizedThemeLabel(theme))}</strong>
        <span>${count} ${currentLanguage() === "pl" ? "trafień" : "matches"} · ${escapeHtml(localizedThemeNote(theme))}</span>
      </button>
    `;
  }).join("");
}

function renderMarks() {
  const marks = [...state.marks].sort((a, b) => a - b);
  if (!els.marks) return;
  els.marks.innerHTML = marks.map(markButtonHtml).join("") || `<div class="empty">${t("noBookmarks")}</div>`;
}

function renderAddenda() {
  if (!els.addenda) return;
  const pages = pistisAddendaPages();
  els.addenda.innerHTML = pages.length
    ? `<div class="empty addenda-lead">${escapeHtml(t("addendaLead"))}</div>${pages.map(addendaButtonHtml).join("")}`
    : `<div class="empty">${t("noResults")}</div>`;
}

function updatePistisSectionUi() {
  if (state.tab === "addenda") state.tab = "chapters";
  const available = isPistisBook();
  if (!available) state.sidebarMode = "chapters";
  if (els.addendaSidebarToggle) {
    els.addendaSidebarToggle.hidden = !available;
    const showingAddenda = available && state.sidebarMode === "addenda";
    setText(els.addendaSidebarToggle, showingAddenda ? t("showPistis") : t("showAddenda"));
    els.addendaSidebarToggle.classList.toggle("is-active", showingAddenda);
    els.addendaSidebarToggle.setAttribute("aria-pressed", String(showingAddenda));
    els.addendaSidebarToggle.setAttribute("title", showingAddenda ? t("showPistis") : t("showAddenda"));
  }
  els.readerSidebar?.classList.toggle("is-addenda-mode", available && state.sidebarMode === "addenda");
  if (els.sidebarTabs) els.sidebarTabs.hidden = available && state.sidebarMode === "addenda";
}

function chaptersByRange(chapters) {
  if (activeBook?.type === "logion-reader") {
    const size = activeBook?.id === "gospel-of-philip" ? 6 : 20;
    const label = logionUnitLabel();
    const groups = [];
    for (let i = 0; i < chapters.length; i += size) {
      const chunk = chapters.slice(i, i + size);
      if (!chunk.length) continue;
      groups.push({
        title: `${label} ${chunk[0].number}–${chunk[chunk.length - 1].number}`,
        from: chunk[0].number,
        to: chunk[chunk.length - 1].number,
        chapters: chunk
      });
    }
    return groups;
  }
  return chapterRanges.map(range => ({
    ...range,
    chapters: chapters.filter(chapter => chapter.number >= range.from && chapter.number <= range.to)
  })).filter(range => range.chapters.length);
}

function renderMobileChapterGroups(chapters) {
  return chaptersByRange(chapters).map(range => `
    <details class="chapter-group" ${range.chapters.some(chapter => chapterForPage(state.page)?.number === chapter.number) ? "open" : ""}>
      <summary>
        <strong>${escapeHtml(localizedRangeTitle(range))}</strong>
        <span>${range.chapters.length} ${currentLanguage() === "pl" ? "rozdz." : "chap."}</span>
      </summary>
      <div class="chapter-group-list">
        ${range.chapters.map(chapterButtonHtml).join("")}
      </div>
    </details>
  `).join("") || `<div class="empty">${t("noResults")}</div>`;
}

function renderMobileNavigation() {
  const chapterMatches = data.chapters.filter(chapter => chapterMatchesQuery(chapter, state.mobileChapterQuery));
  const searchMatches = data.chapters.filter(chapter => chapterMatchesQuery(chapter, state.query));
  const marks = [...state.marks].sort((a, b) => a - b);
  if (els.mobileChapters) els.mobileChapters.innerHTML = renderMobileChapterGroups(chapterMatches);
  if (els.mobileSearchPanel) els.mobileSearchPanel.innerHTML = searchMatches.map(chapterButtonHtml).join("") || `<div class="empty">${t("noResults")}</div>`;
  if (els.mobileMarks) els.mobileMarks.innerHTML = marks.map(markButtonHtml).join("") || `<div class="empty">${t("noBookmarks")}</div>`;
  setText(els.mobileCurrentPage, (isThomasBook || activeBook?.type === "logion-reader") ? `${logionUnitLabel()} ${state.page}` : `${t("pageShort")} ${state.page}`);
}

function setMobilePanel(panel) {
  state.mobilePanel = panel;
  const titles = {
    toc: t("mobileToc"),
    search: t("mobileSearch"),
    marks: t("bookmarks"),
    more: t("mobileMore")
  };
  setText(els.mobileSheetTitle, titles[panel] || (currentLanguage() === "pl" ? "Nawigacja" : "Navigation"));
  document.querySelectorAll("[data-mobile-content]").forEach(item => {
    item.classList.toggle("is-active", item.dataset.mobileContent === panel);
  });
}

function openMobileSheet(panel = state.mobilePanel) {
  if (!els.mobileSheet || !els.mobileOverlay) return;
  setMobilePanel(panel);
  els.mobileOverlay.hidden = false;
  els.mobileSheet.classList.add("is-open");
  els.mobileSheet.setAttribute("aria-hidden", "false");
}

function closeMobileSheet() {
  if (!els.mobileSheet || !els.mobileOverlay) return;
  els.mobileOverlay.hidden = true;
  els.mobileSheet.classList.remove("is-open");
  els.mobileSheet.setAttribute("aria-hidden", "true");
}

function setReaderMode(mode) {
  state.readerMode = normalizeReaderMode(mode);
  saveReadingState();
  renderReader();
}

function currentPlainText(page, chapter) {
  if (state.readerMode === "pl") return polishPageText(page, chapter);
  if (state.readerMode === "coptic") {
    const entries = copticEntriesForPage(page);
    if (!entries.length) return "Brak przypisanej warstwy koptyjskiej dla tej strony Meada.";
    return entries.map(entry => `(${entry.ref}) ${entry.text}`).join("\n");
  }
  if (state.readerMode === "interlinear") {
    const entries = copticEntriesForPage(page);
    if (!entries.length) return "Brak przypisanej warstwy koptyjskiej dla tej strony Meada.";
    return entries.map(entry => {
      const tokens = entry.text.split(/\s+/).filter(Boolean);
      const transliteration = transliterateCoptic(entry.text);
      const glosses = tokens.map(token => glossCopticToken(token)).join(" / ");
      return `(${entry.ref}) ${entry.text}\n${transliteration}\n${glosses}`;
    }).join("\n\n");
  }
  return page.text;
}

function selectedReaderText() {
  const selection = window.getSelection?.();
  if (!selection || selection.isCollapsed || !els.pageText) return "";
  const textBody = els.pageText.querySelector(".page-prose, .coptic-text, .interlinear-text");
  if (!textBody) return "";
  const pieces = [];
  for (let index = 0; index < selection.rangeCount; index += 1) {
    const range = selection.getRangeAt(index);
    if (!range.intersectsNode(textBody)) continue;
    const fragment = range.cloneContents();
    const wrapper = document.createElement("div");
    wrapper.appendChild(fragment);
    wrapper.querySelectorAll(".reference-strip, .coptic-source-note").forEach(item => item.remove());
    const text = wrapper.textContent.replace(/\s+/g, " ").trim();
    if (text) pieces.push(text);
  }
  return pieces.join("\n\n").trim();
}

function toggleBookmark() {
  if (state.marks.includes(state.page)) {
    state.marks = state.marks.filter(page => page !== state.page);
  } else {
    state.marks.push(state.page);
  }
  saveMarks();
  renderReader();
  renderMarks();
  renderMobileNavigation();
}

async function copyCurrentFragment() {
  const page = pageByNumber(state.page);
  const chapter = chapterForPage(state.page);
  const selectedText = selectedReaderText();
  const text = selectedText || currentPlainText(page, chapter);
  const textWithCitation = `[${formattedCitation(page, chapter)}]\n\n${text}`;
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(textWithCitation);
  } else {
    const helper = document.createElement("textarea");
    helper.value = textWithCitation;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
}

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll(".tab").forEach(button => {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  });
  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.toggle("is-active", panel.id === `${tab}Panel`);
  });
}

document.addEventListener("click", event => {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  if (!target) return;

  const pageButton = target.closest("[data-page]");
  if (pageButton) {
    if (pageButton.matches("[data-addenda-page]")) {
      navigateFromAddendaSidebar(pageButton.dataset.addendaPage);
    } else if (pageButton.matches("[data-pistis-chapter]") && isPistisBook()) {
      navigateFromPistisChapterSidebar(pageButton.dataset.pistisChapter, pageButton.dataset.page);
    } else {
      if (isPistisBook()) state.pistisChapter = null;
      goToPage(pageButton.dataset.page, { scrollToText: true });
      keepActiveSidebarItemVisible(Number(pageButton.dataset.page));
    }
    if (pageButton.closest(".mobile-sheet")) closeMobileSheet();
  }

  const themeButton = target.closest(".theme-item[data-theme]");
  if (themeButton) {
    const theme = themes.find(item => item.label === themeButton.dataset.theme);
    if (!theme) return;
    state.query = localizedThemeLabel(theme);
    setValue(els.search, state.query);
    setValue(els.mobileSearch, state.query);
    setTab("chapters");
    const first = data.pages.find(page => theme.terms.some(term => page.text.toLowerCase().includes(term.toLowerCase())));
    if (first) goToPage(first.page, { scrollToText: true });
  }

  const tab = target.closest(".tab");
  if (tab) setTab(tab.dataset.tab);

  const mobilePanelButton = target.closest("[data-mobile-panel]");
  if (mobilePanelButton) openMobileSheet(mobilePanelButton.dataset.mobilePanel);
});

document.querySelectorAll("[data-mobile-panel]").forEach(button => {
  listen(button, "click", event => {
    event.preventDefault();
    event.stopPropagation();
    openMobileSheet(button.dataset.mobilePanel);
  });
});

listen(els.search, "input", event => {
  state.query = event.target.value;
  setValue(els.mobileSearch, state.query);
  renderReader();
  renderLists();
});

listen(els.mobileChapterSearch, "input", event => {
  state.mobileChapterQuery = event.target.value;
  renderMobileNavigation();
});

listen(els.mobileSearch, "input", event => {
  state.query = event.target.value;
  setValue(els.search, state.query);
  renderReader();
  renderLists();
});

listen(els.pageInput, "change", event => goToPage(event.target.value));
listen(els.focusPageInput, "change", event => goToPage(event.target.value));
listen(els.prev, "click", () => goToPage(adjacentReaderPage("previous"), { scrollToText: true }));
listen(els.next, "click", () => goToPage(adjacentReaderPage("next"), { scrollToText: true }));
listen(els.focusPrev, "click", () => goToPage(adjacentReaderPage("previous"), { scrollToText: true }));
listen(els.focusNext, "click", () => goToPage(adjacentReaderPage("next"), { scrollToText: true }));
listen(els.continue, "click", () => goToPage(appStorage.getItem("ps.lastPage") || state.page, { scrollToText: true }));
listen(els.mobilePrev, "click", () => goToPage(adjacentReaderPage("previous"), { scrollToText: true }));
listen(els.mobileNext, "click", () => goToPage(adjacentReaderPage("next"), { scrollToText: true }));
listen(els.mobileCurrentPage, "click", scrollToReaderText);
listen(els.openWork, "click", () => openLibraryWork("pistis-sophia"));
listen(els.thomasDetailsToggle, "click", () => openLibraryWork("gospel-of-thomas"));

function updateVisitCounter() {
  const output = els.visitCounterValue || document.querySelector("#visitCounterValue");
  if (!output) return;
  const endpoint = window.GNOSTYK_VISIT_COUNTER_URL || document.documentElement.dataset.visitCounterUrl || "";
  if (!endpoint) {
    output.textContent = "—";
    output.title = currentLanguage() === "pl" ? "Podłącz adres API licznika, aby pokazać globalne odwiedziny." : "Connect the counter API URL to show global visits.";
    return;
  }
  fetch(endpoint, { cache: "no-store" })
    .then(response => response.ok ? response.json() : Promise.reject(new Error("counter")))
    .then(data => {
      const value = data?.count ?? data?.visits ?? data?.total ?? data?.value;
      const numeric = Number(value);
      output.textContent = Number.isFinite(numeric) ? numeric.toLocaleString(currentLanguage() === "pl" ? "pl-PL" : "en-US") : String(value || "—");
    })
    .catch(() => {
      output.textContent = "—";
    });
}

listen(els.libraryHomeToggle, "click", () => setLibrarySection("home"));
listen(els.browseBooksButton, "click", () => setLibrarySection("books"));
listen(els.homeContinueButton, "click", continueLastWork);
listen(els.homeSupportButton, "click", () => setLibrarySection("support"));
listen(els.libraryBooksToggle, "click", () => setLibrarySection("books"));
listen(els.libraryInfoToggle, "click", () => setLibrarySection("info"));
listen(els.libraryContactToggle, "click", () => setLibrarySection("contact"));
listen(els.libraryPrivacyToggle, "click", () => setLibrarySection("privacy"));
listen(els.libraryChangesToggle, "click", () => setLibrarySection("changes"));
listen(els.libraryHelpToggle, "click", () => setLibrarySection("help"));

document.querySelectorAll("#libraryHelpPanel details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll("#libraryHelpPanel details[open]").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

listen(els.libraryDictionaryToggle, "click", () => {
  setLibrarySection("dictionary");
  renderDictionarySearch();
});
listen(els.libraryToolsToggle, "click", () => {
  setLibrarySection("tools");
  renderDictionarySearch();
});
listen(els.librarySupportToggle, "click", () => setLibrarySection("support"));
listen(els.footerInfo, "click", () => setLibrarySection("info"));
listen(els.footerContact, "click", () => setLibrarySection("contact"));
listen(els.footerPrivacy, "click", () => setLibrarySection("privacy"));
listen(els.footerChanges, "click", () => setLibrarySection("changes"));
listen(els.footerSupport, "click", () => setLibrarySection("support"));

listen(els.dictionarySearchInput, "input", renderDictionarySearch);
listen(els.dictionarySearchClear, "click", clearDictionarySearch);
if (els.dictionarySearchResults) {
  els.dictionarySearchResults.addEventListener("click", event => {
    const button = event.target.closest("[data-dictionary-open]");
    if (!button) return;
    showInterlinearDictionaryCard(button.dataset.dictionaryOpen || "");
  });
}

function returnToLibrary() {
  setAppView("library");
  closeReaderPanels();
  closeMobileSheet();
  setLibrarySection("books");
  document.querySelector(".library-home")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function goToHome() {
  setAppView("library");
  closeReaderPanels();
  closeMobileSheet();
  setLibrarySection("home");
  updateVisitCounter();
  document.querySelector(".library-home")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openLibraryWork(workId = "pistis-sophia", options = {}) {
  const availableBookIds = new Set(["pistis-sophia", "gospel-of-thomas", "gospel-of-philip"]);
  const moduleId = availableBookIds.has(workId) ? workId : "pistis-sophia";
  const targetPage = options.preservePage
    ? (appStorage.getItem(`gnostyk.lastPage.${moduleId}`) || appStorage.getItem("ps.lastPage") || "1")
    : String(defaultStartPageForBook(moduleId));
  appStorage.setItem("gnostyk.activeBook", moduleId);
  appStorage.setItem("gnostyk.lastWork", moduleId);
  appStorage.setItem("ps.lastPage", targetPage);
  appStorage.setItem("ps.view", "reader");
  if (moduleId !== activeBookId) {
    const targetUrl = new URL(window.location.href);
    targetUrl.searchParams.set("book", moduleId);
    targetUrl.searchParams.set("view", "reader");
    targetUrl.searchParams.set("page", String(targetPage));
    window.location.href = targetUrl.toString();
    return;
  }
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("book", moduleId);
  currentUrl.searchParams.set("view", "reader");
  currentUrl.searchParams.set("page", String(targetPage));
  window.history.replaceState({}, "", currentUrl.toString());
  setAppView("reader");
  goToPage(Number(targetPage) || 1, { scrollToText: true });
}

function continueLastWork() {
  const lastWork = appStorage.getItem("gnostyk.lastWork") || appStorage.getItem("gnostyk.activeBook") || "pistis-sophia";
  openLibraryWork(lastWork, { preservePage: true });
}

document.addEventListener("click", event => {
  const workLink = event.target.closest("[data-open-work]");
  if (!workLink) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  openLibraryWork(workLink.dataset.openWork || "pistis-sophia");
}, true);

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const workLink = event.target.closest("[data-open-work]");
  if (!workLink) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  openLibraryWork(workLink.dataset.openWork || "pistis-sophia");
}, true);

listen(els.backToLibrary, "click", returnToLibrary);
listen(els.mobileBackToLibrary, "click", returnToLibrary);
listen(els.mobileClose, "click", closeMobileSheet);
listen(els.mobileOverlay, "click", closeMobileSheet);
listen(els.polishMode, "click", () => setReaderMode("pl"));
listen(els.sourceMode, "click", () => setReaderMode("source"));
listen(els.copticMode, "click", () => setReaderMode("coptic"));
listen(els.interlinearMode, "click", () => setReaderMode("interlinear"));

document.addEventListener("click", event => {
  const homeLink = event.target.closest("[data-go-home]");
  if (!homeLink) return;
  event.preventDefault();
  goToHome();
});

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const homeLink = event.target.closest("[data-go-home]");
  if (!homeLink) return;
  event.preventDefault();
  goToHome();
});

document.addEventListener("click", event => {
  const navLink = event.target.closest("[data-nav-section]");
  if (!navLink) return;
  setLibrarySection(navLink.dataset.navSection);
});


document.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const navLink = event.target.closest("[data-nav-section]");
  if (!navLink) return;
  event.preventDefault();
  setLibrarySection(navLink.dataset.navSection);
});


document.addEventListener("click", event => {
  const button = event.target.closest("[data-reader-mode]");
  if (!button) return;
  const mode = button.dataset.readerMode;
  if (!VALID_READER_MODES.includes(mode)) return;
  event.preventDefault();
  setReaderMode(mode);
});
listen(els.focusModeToggle, "click", event => {
  event.stopPropagation();
  const isOpen = !els.focusModeMenu?.hidden;
  setHidden(els.focusModeMenu, isOpen);
  els.focusModeToggle?.setAttribute("aria-expanded", String(!isOpen));
});
els.focusModeItems?.forEach(button => {
  listen(button, "click", event => {
    event.stopPropagation();
    setReaderMode(button.dataset.focusMode);
    setHidden(els.focusModeMenu, true);
    els.focusModeToggle?.setAttribute("aria-expanded", "false");
  });
});

els.textAlignButtons?.forEach(button => {
  listen(button, "click", () => {
    const alignment = button.dataset.textAlign;
    if (!["left", "justify", "center"].includes(alignment)) return;
    state.settings.textAlignment = alignment;
    state.settings.bookJustify = alignment === "justify";
    saveSettings();
    applySettings();
  });
});

listen(els.citationFormat, "change", event => {
  state.citationFormat = event.target.value;
  els.mobileCitationFormats?.forEach(button => {
    button.classList.toggle("is-active", button.dataset.mobileCitation === state.citationFormat);
  });
  saveReadingState();
});

listen(els.aboutToggle, "click", () => {
  setReaderPanel("about");
});

listen(els.settingsToggle, "click", () => {
  setLibrarySection("settings");
});

[els.languageSetting, els.themeSetting, els.fontSizeSetting, els.lineHeightSetting, els.widthSetting, els.interlinearLayoutSetting, els.dictionaryScopeSetting].filter(Boolean).forEach(control => {
  listen(control, "change", event => {
    const map = {
      languageSetting: "language",
      themeSetting: "theme",
      fontSizeSetting: "fontSize",
      lineHeightSetting: "lineHeight",
      widthSetting: "width",
      interlinearLayoutSetting: "interlinearLayout",
      dictionaryScopeSetting: "dictionaryScope"
    };
    state.settings[map[event.target.id]] = event.target.value;
    if (event.target.id === "languageSetting") {
      state.sessionLanguage = null;
      appStorage.removeItem("ps.interfaceLanguage");
    }
    commitSettingsChange({ feedback: true });
  });
});
[els.bookJustifySetting, els.interlinearExperimentalSetting, els.interlinearLemmaSetting, els.interlinearTypeSetting].filter(Boolean).forEach(control => {
  listen(control, "change", event => {
    const map = {
      bookJustifySetting: "bookJustify",
      interlinearExperimentalSetting: "interlinearExperimental",
      interlinearLemmaSetting: "interlinearShowLemma",
      interlinearTypeSetting: "interlinearShowType"
    };
    state.settings[map[event.target.id]] = Boolean(event.target.checked);
    if (event.target.id === "bookJustifySetting") {
      state.settings.textAlignment = event.target.checked ? "justify" : "left";
    }
    if (!interlinearExperimentalEnabled() && state.readerMode === "interlinear") {
      state.readerMode = "pl";
      saveReadingState();
    }
    commitSettingsChange({ feedback: true });
  });
});

listen(els.saveSettingsButton, "click", () => {
  commitSettingsChange({ feedback: true });
});

listen(els.chooseBackupFolder, "click", chooseBackupFolder);
listen(els.exportNotes, "click", exportNotesBackup);
listen(els.importNotes, "click", () => {
  els.restoreNotesInput?.click();
});
listen(els.restoreNotesInput, "change", event => {
  importNotesBackupFile(event.target.files?.[0]);
  event.target.value = "";
});
listen(els.saveGloss, "click", saveGlossFromForm);
listen(els.clearGlossary, "click", clearCustomGlossary);
listen(els.exportGlossary, "click", exportGlossary);
listen(els.importGlossary, "click", () => {
  els.restoreGlossaryInput?.click();
});
listen(els.restoreGlossaryInput, "change", event => {
  importGlossaryFile(event.target.files?.[0]);
  event.target.value = "";
});
listen(els.customGlossaryList, "click", event => {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  const item = target?.closest(".custom-gloss-item");
  if (!item) return;
  const token = item.dataset.glossToken;
  setValue(els.glossaryTokenInput, token);
  setValue(els.glossaryGlossInput, state.customGlosses[token] || "");
  els.glossaryGlossInput?.focus();
});
listen(els.pageText, "click", event => {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  const item = target?.closest(".interlinear-token");
  const token = item?.dataset.copticLemma || item?.dataset.copticToken;
  if (!token) return;
  showInterlinearDictionaryCard(token);
  if (!els.glossaryTokenInput) return;
  setValue(els.glossaryTokenInput, token);
  setValue(els.glossaryGlossInput, state.customGlosses[token] || "");
  glossaryStatusKey = "glossaryStatusEmpty";
  renderGlossaryPanel();
});

listen(document, "click", event => {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  const occurrencePageNav = target?.closest("[data-occurrence-page-nav]");
  if (occurrencePageNav) {
    const sourceId = occurrencePageNav.dataset.occurrenceSource || "pistis_sophia";
    const token = occurrencePageNav.dataset.occurrenceToken || "";
    const offset = Number(occurrencePageNav.dataset.occurrenceOffset || 0);
    const total = Number(occurrencePageNav.dataset.occurrenceTotal || 0);
    setOccurrenceOffset(sourceId, token, offset, total);
    showInterlinearDictionaryCard(token);
    return;
  }
  const occurrenceButton = target?.closest("[data-occurrence-page]");
  if (occurrenceButton) {
    const page = Number(occurrenceButton.dataset.occurrencePage);
    const token = occurrenceButton.dataset.occurrenceToken || "";
    if (Number.isFinite(page)) {
      state.readerMode = interlinearExperimentalEnabled() ? "interlinear" : "coptic";
      goToPage(page, { scrollToText: true });
      requestAnimationFrame(() => requestAnimationFrame(() => highlightCopticOccurrenceToken(token, page)));
    }
    return;
  }
  if (target?.closest("[data-dictionary-close]")) hideInterlinearDictionaryCard();
});

listen(document, "keydown", event => {
  if (event.key === "Escape") hideInterlinearDictionaryCard();
});

els.languageSwitchButtons?.forEach(button => {
  listen(button, "click", () => setInterfaceLanguage(button.dataset.languageSwitch));
});

listen(els.bookmark, "click", toggleBookmark);

listen(els.copy, "click", async () => {
  await copyCurrentFragment();
  setText(els.copy, t("copied"));
  setTimeout(() => {
    setText(els.copy, t("copyFragment"));
  }, 1100);
});

listen(els.addendaSidebarToggle, "click", () => {
  if (!isPistisBook()) return;
  state.sidebarMode = state.sidebarMode === "addenda" ? "chapters" : "addenda";
  state.tab = "chapters";
  state.query = "";
  setValue(els.search, "");
  renderLists();
  els.chapters?.scrollTo({ top: 0, behavior: "smooth" });
});

listen(els.mobileBookmark, "click", () => {
  toggleBookmark();
  closeMobileSheet();
});

listen(els.mobileCopy, "click", async () => {
  await copyCurrentFragment();
  setText(els.mobileCopy, t("copied"));
  setTimeout(() => {
    setText(els.mobileCopy, t("copyQuote"));
  }, 1100);
});

listen(els.mobileAbout, "click", () => {
  closeMobileSheet();
  setReaderPanel("about");
  requestAnimationFrame(scrollToReaderText);
});

listen(els.mobileSettings, "click", () => {
  closeMobileSheet();
  setReaderPanel("settings");
  requestAnimationFrame(scrollToReaderText);
});

listen(els.mobileFocus, "click", enterFocusMode);

listen(els.mobilePolishMode, "click", () => setReaderMode("pl"));
listen(els.mobileSourceMode, "click", () => setReaderMode("source"));
listen(els.mobileCopticMode, "click", () => setReaderMode("coptic"));
listen(els.mobileInterlinearMode, "click", () => setReaderMode("interlinear"));

els.mobileCitationFormats?.forEach(button => {
  listen(button, "click", () => {
    state.citationFormat = button.dataset.mobileCitation;
    setValue(els.citationFormat, state.citationFormat);
    els.mobileCitationFormats.forEach(item => {
      item.classList.toggle("is-active", item === button);
    });
    saveReadingState();
  });
});

listen(els.notes, "input", event => {
  state.notes[state.page] = event.target.value;
  saveNotes();
  setText(els.saveStatus, t("saved"));
  setTimeout(() => {
    setText(els.saveStatus, t("localSave"));
  }, 900);
});

listen(els.clearNote, "click", () => {
  delete state.notes[state.page];
  saveNotes();
  setValue(els.notes, "");
});

function enterFocusMode() {
  setAppView("reader");
  closeReaderPanels();
  closeMobileSheet();
  setChecked(els.focus, true);
  document.body.classList.add("focus");
  requestAnimationFrame(scrollToReaderText);
}

function exitFocusMode() {
  setChecked(els.focus, false);
  setHidden(els.focusModeMenu, true);
  els.focusModeToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("focus");
  if (isMobileLayout()) {
    closeMobileSheet();
    requestAnimationFrame(scrollToReaderText);
  }
}

listen(els.focus, "change", event => {
  if (event.target.checked) {
    enterFocusMode();
  } else {
    exitFocusMode();
  }
});

listen(els.focusExit, "click", exitFocusMode);

document.addEventListener("click", event => {
  if (els.focusModeMenu?.hidden) return;
  if (event.target.closest(".focus-mode-field")) return;
  setHidden(els.focusModeMenu, true);
  els.focusModeToggle?.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", event => {
  if (event.target.matches("input, textarea")) return;
  if (event.key === "ArrowLeft") goToPage(adjacentReaderPage("previous"));
  if (event.key === "ArrowRight") goToPage(adjacentReaderPage("next"));
  if (event.key === "/") {
    event.preventDefault();
    els.search?.focus();
  }
  if (event.key === "Escape") {
    setHidden(els.focusModeMenu, true);
    els.focusModeToggle?.setAttribute("aria-expanded", "false");
    if (document.body.classList.contains("focus")) {
      exitFocusMode();
    }
    closeMobileSheet();
  }
});

setText(els.pageCount, data.pageCount);
setText(els.chapterCount, data.chapters.length);
loadLibraryVersion();
state.page = resolveReaderPage(state.page);
applySettings();
applyLanguage();
updateVisitCounter();
setAppView(state.view);
renderPanelState();
updateOfflineNotice();
window.addEventListener("online", updateOfflineNotice);
window.addEventListener("offline", updateOfflineNotice);
renderReader();
renderLists();
setTab(state.tab);
restoreNotesFromStoredBackup();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    fetch("./VERSION.json", { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("version unavailable")))
      .then(metadata => navigator.serviceWorker.register(
        `./sw.js?app-version=${encodeURIComponent(metadata.version || "current")}`,
        { updateViaCache: "none" }
      ))
      .catch(() => navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch(() => {}));
  });
}
