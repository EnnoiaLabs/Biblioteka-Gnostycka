const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const json = relative => JSON.parse(read(relative));

function loadBookScripts(bookId) {
  const context = { window: { GNOSTYK_BOOK_MODULES: {} } };
  vm.createContext(context);
  for (const file of ["coptic-data.js", "data.js"]) {
    vm.runInContext(read(`books/${bookId}/${file}`), context, { filename: file });
  }
  return context.window.GNOSTYK_BOOK_MODULES[bookId];
}

test("all JavaScript files have valid syntax", () => {
  const files = [];
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") walk(full);
      } else if (entry.name.endsWith(".js")) files.push(full);
    }
  };
  walk(root);
  for (const file of files) {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  }
  assert.ok(files.length >= 10, "expected the application JavaScript files");
});

test("every application version source agrees with VERSION.json", () => {
  const version = json("VERSION.json").version;
  assert.equal(json("package.json").version, version);
  assert.equal(json("package-lock.json").version, version);
  assert.equal(json("package-lock.json").packages[""].version, version);
  assert.equal(json("library.json").version, version);
  assert.equal(json("library.json").library.version, version);
  assert.equal(json("books/index.json").version, version);
  assert.match(read("app.js"), new RegExp(`version:\\s*"${version.replaceAll(".", "\\.")}"`));
  assert.match(read("sw.js"), new RegExp(`CACHE_NAME.*v${version.replaceAll(".", "\\.")}`));
});

test("service-worker application shell contains only existing files", () => {
  const sw = read("sw.js");
  const block = sw.match(/const APP_SHELL = \[(.*?)\];/s);
  assert.ok(block, "APP_SHELL must exist");
  const items = [...block[1].matchAll(/"\.\/([^"?#]*)"/g)].map(match => match[1]);
  assert.ok(items.length >= 20, "APP_SHELL should contain the offline application files");
  for (const item of items.filter(Boolean)) {
    assert.ok(fs.existsSync(path.join(root, item)), `missing cached file: ${item}`);
  }
});

test("book registry and book metadata are complete and consistent", () => {
  const registry = json("books/index.json");
  assert.equal(registry.books.length, registry.availableBooks);
  assert.equal(registry.books.length, registry.preparedBooks);
  const ids = new Set();
  for (const metadataPath of registry.books) {
    const metadata = json(metadataPath);
    assert.ok(metadata.id && metadata.title && metadata.type, `${metadataPath}: basic metadata`);
    assert.ok(!ids.has(metadata.id), `duplicate book id: ${metadata.id}`);
    ids.add(metadata.id);
    for (const field of ["entry", "coptic"]) {
      if (metadata[field]) {
        const rootPath = path.join(root, metadata[field]);
        const bookPath = path.join(root, path.dirname(metadataPath), metadata[field]);
        assert.ok(fs.existsSync(rootPath) || fs.existsSync(bookPath), `${metadataPath}: missing ${field}`);
      }
    }
    if (metadata.themes) {
      assert.ok(fs.existsSync(path.join(root, path.dirname(metadataPath), metadata.themes)), `${metadataPath}: missing themes`);
    }
    const module = loadBookScripts(metadata.id);
    assert.ok(module, `${metadata.id}: module registration`);
    assert.equal(module.id, metadata.id);
    assert.ok(Array.isArray(module.data.pages) && module.data.pages.length > 0, `${metadata.id}: pages`);
    assert.ok(Array.isArray(module.data.chapters) && module.data.chapters.length > 0, `${metadata.id}: chapters`);
    assert.equal(module.data.pages.length, module.data.pageCount, `${metadata.id}: pageCount`);
  }
});

test("standalone book-data guard validates every registered module", () => {
  const output = execFileSync(process.execPath, [path.join(root, "tools/check-book-data.js")], {
    cwd: root,
    encoding: "utf8"
  });
  assert.match(output, /\[OK\] dane książek: 3 moduły/);
  assert.match(read("tools/release.py"), /tools\/check-book-data\.js/);
  assert.doesNotMatch(read("books/gospel-of-thomas/book.json"), /"notes"/);
});

test("standalone PWA guard validates the manifest and complete offline shell", () => {
  const output = execFileSync(process.execPath, [path.join(root, "tools/check-pwa.js")], {
    cwd: root,
    encoding: "utf8"
  });
  assert.match(output, /\[OK\] PWA: manifest, service worker/);
  assert.match(read("tools/release.py"), /tools\/check-pwa\.js/);
  assert.equal(json("package.json").scripts["test:pwa"], "node tools/check-pwa.js");
  for (const book of ["pistis-sophia", "gospel-of-thomas", "gospel-of-philip"]) {
    assert.ok(read("sw.js").includes(`./books/${book}/themes.json`), `${book}: themes missing from offline cache`);
  }
  assert.match(read("tools/check-pwa.js"), /loader ksiąg/);
  assert.match(read("tools/check-pwa.js"), /requiredOffline\.add\("app\.js"\)/);
});

test("performance guard enforces explicit startup asset budgets", () => {
  const output = execFileSync(process.execPath, [path.join(root, "tools/check-performance.js")], {
    cwd: root,
    encoding: "utf8"
  });
  assert.match(output, /\[OK\] Wydajność: \d+ zasobów startowych/);
  assert.match(output, /Najcięższy wariant księgi: pistis-sophia/);
  assert.match(output, /Start gospel-of-thomas:/);
  assert.match(output, /Start gospel-of-philip:/);
  const budgets = json("performance-budgets.json");
  for (const field of ["startupLocalRawBytes", "startupLocalGzipBytes", "largestStartupFileBytes", "appJavaScriptBytes", "stylesheetBytes"]) {
    assert.ok(Number.isInteger(budgets[field]) && budgets[field] > 0, `missing performance budget: ${field}`);
  }
  assert.match(read("tools/release.py"), /tools\/check-performance\.js/);
  assert.equal(json("package.json").scripts["test:performance"], "node tools/check-performance.js");
});

test("unused source assets are guarded and excluded from release packages", () => {
  const output = execFileSync(process.execPath, [path.join(root, "tools/check-release-assets.js")], {
    cwd: root,
    encoding: "utf8"
  });
  assert.match(output, /\[OK\] Zasoby wydania: 4 nieużywane pliki źródłowe poza ZIP/);
  const exclusions = json("release-exclusions.json").unusedSourceAssets;
  assert.equal(exclusions.length, 4);
  const release = read("tools/release.py");
  assert.match(release, /path\.relative_to\(ROOT\)\.as_posix\(\) not in excluded_files/);
  assert.match(release, /"excludedFiles": sorted\(excluded_files\)/);
  assert.equal(json("package.json").scripts["test:release-assets"], "node tools/check-release-assets.js");
});

test("final audit rebuilds and compares the release archive before publication", () => {
  const release = read("tools/release.py");
  assert.match(release, /def audit\(\) -> None:/);
  assert.match(release, /TemporaryDirectory\(prefix="gnostyk-release-audit-"\)/);
  assert.match(release, /first_digest != second_digest/);
  assert.match(release, /excluded_files & archived_names/);
  assert.match(release, /AUDYT KOŃCOWY: OK/);
  assert.match(read("RELEASE_WORKFLOW.md"), /python tools\/release\.py audit/);
});

test("release guard always runs the complete JavaScript test suite", () => {
  const release = read("tools/release.py");
  assert.match(release, /glob\("\*\.test\.js"\)/);
  assert.match(release, /\["node", "--test"/);
  assert.match(release, /Testy JavaScript/);
  assert.match(release, /pełny zestaw testów JavaScript/);
  assert.match(release, /"tests\/smoke\.test\.js"/);
});

test("release workflow provides guarded ZIP packaging with a SHA-256 checksum", () => {
  const release = read("tools/release.py");
  assert.match(release, /def package\(args: argparse\.Namespace\)/);
  assert.match(release, /zipfile\.ZipFile/);
  assert.match(release, /hashlib\.sha256/);
  for (const excluded of ["node_modules", "__pycache__", ".git", "dist"]) {
    assert.ok(release.includes(`"${excluded}"`), `package exclusion missing: ${excluded}`);
  }
  assert.match(read("RELEASE_WORKFLOW.md"), /python tools\/release\.py package/);
  assert.equal(json("package.json").scripts["package:release"], "python tools/release.py package");
});

test("release packaging verifies a temporary archive before publishing it", () => {
  const release = read("tools/release.py");
  assert.match(release, /temporary_archive = archive\.with_suffix/);
  assert.match(release, /bundle\.testzip\(\)/);
  assert.match(release, /missing_required = \[relative for relative in REQUIRED/);
  assert.match(release, /temporary_archive\.replace\(archive\)/);
  assert.match(release, /temporary_archive\.unlink\(missing_ok=True\)/);
  assert.ok(
    release.indexOf("bundle.testzip()") < release.indexOf("temporary_archive.replace(archive)"),
    "archive verification must happen before publication"
  );
  assert.match(read("RELEASE_WORKFLOW.md"), /Nieudane\s+pakowanie nie nadpisuje/);
});

test("release ZIP uses deterministic ordering, timestamps, and permissions", () => {
  const release = read("tools/release.py");
  assert.match(release, /def write_reproducible_zip\(target: Path, files: list\[Path\]\)/);
  assert.match(release, /sorted\(files, key=lambda item: item\.relative_to\(ROOT\)\.as_posix\(\)\)/);
  assert.match(release, /date_time=\(1980, 1, 1, 0, 0, 0\)/);
  assert.match(release, /info\.create_system = 3/);
  assert.match(release, /info\.external_attr = 0o100644 << 16/);
  assert.match(release, /bundle\.writestr\(info, path\.read_bytes\(\)/);
  assert.match(read("RELEASE_WORKFLOW.md"), /Archiwum jest deterministyczne/);
});

test("release packaging writes a machine-readable manifest beside the ZIP", () => {
  const release = read("tools/release.py");
  assert.match(release, /manifest = archive\.with_suffix\(archive\.suffix \+ "\.release\.json"\)/);
  for (const field of ["schemaVersion", "version", "date", "currentWork", "archive", "sha256", "fileCount", "requiredFiles"]) {
    assert.ok(release.includes(`"${field}"`), `release manifest field missing: ${field}`);
  }
  assert.match(release, /"requiredFiles": sorted\(REQUIRED\)/);
  assert.match(release, /write\(manifest, json\.dumps\(manifest_data/);
  assert.match(read("RELEASE_WORKFLOW.md"), /\.release\.json/);
});

test("browser smoke test covers startup, reader modes, navigation, and book switching", () => {
  const browserTest = read("tests/browser-smoke.js");
  assert.match(browserTest, /require\("playwright"\)/);
  assert.match(browserTest, /book=pistis-sophia&view=reader&page=48/);
  for (const control of ["#sourceMode", "#copticMode", "#interlinearMode", "#polishMode", "#nextPage"]) {
    assert.ok(browserTest.includes(`"${control}"`), `browser test control missing: ${control}`);
  }
  assert.match(browserTest, /book=gospel-of-thomas&view=reader&page=1/);
  assert.match(browserTest, /page\.on\("pageerror"/);
  assert.match(browserTest, /#currentPageLabel/);
  assert.doesNotMatch(browserTest, /["']#currentPage["']/);
  assert.match(browserTest, /querySelector\("#pageInput"\)\?\.value === "48"/);
  assert.equal(json("package.json").scripts["test:browser"], "node tests/browser-smoke.js");
  assert.equal(json("package.json").devDependencies.playwright, "1.61.1");
  assert.equal(json("package-lock.json").packages[""].devDependencies.playwright, "1.61.1");
  assert.match(read("RELEASE_CHECKLIST.md"), /npm run test:browser/);
});

test("critical reader controls referenced by app.js exist in index.html", () => {
  const html = read("index.html");
  const ids = [
    "pageText", "pageInput", "prevPage", "nextPage", "polishMode", "sourceMode",
    "copticMode", "interlinearMode", "bookmarkButton", "citationFormat", "copyButton",
    "readerSidebar", "libraryHomePanel", "libraryBooksPanel", "libraryInfoPanel",
    "libraryChangesPanel", "libraryDictionaryPanel", "settingsPanel", "mobileSheet",
    "libraryVersion", "offlineNotice"
  ];
  const missing = ids.filter(id => !new RegExp(`id=["']${id}["']`).test(html));
  assert.deepEqual(missing, [], `missing HTML controls: ${missing.join(", ")}`);
});

test("reader modes and all three themes remain available", () => {
  const app = read("app.js");
  assert.match(app, /GNOSTYK_READER_ENGINE\.validReaderModes/);
  const html = read("index.html");
  for (const theme of ["dark", "light", "sepia"]) {
    assert.match(html, new RegExp(`<option value="${theme}"`));
  }
  for (const alignment of ["left", "justify", "center"]) {
    assert.match(html, new RegExp(`data-text-align="${alignment}"`));
  }
});

test("extracted Polish translations are lazy-loaded with Pistis Sophia and preserve the complete layer", () => {
  const loader = read("book-loader.js");
  const translationsScript = "books/pistis-sophia/polish-translations.js";
  assert.ok(loader.indexOf(translationsScript) > 0, "translation script must be in the Pistis asset group");
  assert.ok(loader.indexOf(translationsScript) < loader.indexOf('loadScript("app.js")'), "translations must load before app.js");

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read(translationsScript), context, { filename: translationsScript });
  const translations = context.window.GNOSTYK_POLISH_TRANSLATIONS;
  assert.ok(translations && typeof translations === "object");
  assert.ok(Object.keys(translations).length >= 250, "expected the complete Pistis Sophia translation layer");
  for (const page of [1, 48, 100, 148, 200, 255]) {
    assert.ok(typeof translations[page] === "string" && translations[page].length > 20, `missing Polish page ${page}`);
  }
  assert.match(translations[48], /pięć Znamion/);
  assert.match(translations[48], /Po zmartwychwstaniu Jezus przez jedenaście lat rozmawiał ze swoimi uczniami/);
  assert.match(translations[48], /dwudziestego czwartego Misterium na zewnątrz i poniżej/);
  assert.doesNotMatch(translations[48], /dwudziestego czwartego Misterium od wewnątrz ku zewnętrzu/);
  assert.match(translations[49], /pięciu Znamionach/);
  assert.match(translations[50], /wszyscy trwali w głębokim milczeniu/);
  assert.match(translations[52], /wszystkie trzęsienia ziemi\?/);
  assert.match(translations[55], /otrzymam od Pierwszego Misterium polecenie/);
  assert.match(translations[56], /Misterium pięciu Znamion/);
  assert.match(translations[64], /w jaki sposób zostaną szybko oczyszczone/);
  assert.match(translations[73], /zamieszkująca mnie moc światłości/);
  assert.match(translations[85], /Filip wystąpił/);
  assert.match(translations[86], /Zamieszkująca mnie moc światłości/);
  assert.match(translations[94], /jej pokuta zostanie przyjęta/);
  assert.match(translations[102], /mam dla niej zrozumienie/);
  assert.match(translations[108], /zwodniczym językiem obmawiali mnie/);
  assert.match(translations[108], /lichwiarz zagarnie wszystko/);
  assert.match(translations[114], /jej pokuta została przyjęta/);
  assert.match(translations[117], /miej dla mnie cierpliwość/);
  assert.match(translations[126], /mówię do was\?/);
  assert.match(translations[130], /zamieszkująca mnie moc światłości/);
  assert.match(translations[145], /zbawiła mnie od was\?/);
  assert.match(translations[154], /w Królestwie Światłości\?/);
  assert.match(translations[155], /Bliźniaczy Zbawiciele/);
  assert.match(translations[157], /ochrzczą je/);
  assert.match(translations[158], /zamieszkująca mnie moc światłości/);
  assert.match(translations[160], /ponownie wystąpiła i mówiła dalej/);
  assert.match(translations[164], /powstały gady/);
  assert.match(translations[168], /Bliźniaczy Zbawiciele/);
  assert.match(translations[169], /każdego, kto was usłucha/);
  assert.match(translations[176], /Bliźniaczymi Zbawicielami/);
  assert.match(translations[177], /Królestwa Światłości\?/);
  assert.match(translations[182], /jednym rokiem Światłości\?/);
  assert.match(translations[193], /misteriów drugiej przestrzeni\?/);
  assert.match(translations[196], /z dokładnością i pewnością/);
  assert.match(translations[201], /I stopniowo moc i dusza/);
  assert.match(translations[205], /Maryja ponownie wystąpiła/);
  assert.match(translations[209], /naprawdę badam dokładnie/);
  assert.match(translations[210], /miej cierpliwość, gdy cię pytam/);
  assert.match(translations[216], /misteriów Niewypowiadalnego/);
  assert.match(translations[217], /otrzyma wiele ciosów/);
  assert.match(translations[218], /Maryja ponownie wystąpiła/);
  assert.match(translations[221], /miej dla mnie cierpliwość/);
  assert.match(translations[222], /odziedziczyło Królestwo Światłości\?/);
  assert.match(translations[225], /zmiłuj się nade mną/);
  assert.match(translations[228], /dzikich zwierząt, i gadów/);
  assert.match(translations[229], /Salome wystąpiła/);
  assert.match(translations[231], /czy dzikich zwierząt, czy gadów/);
  assert.match(translations[233], /kto szuka prawdziwie/);
  assert.match(translations[235], /czy żadna dusza nie weszła do Światłości\?/);
  assert.match(translations[247], /jest prawdziwe Misterium chrztu/);
  const completePolishTranslation = Object.values(translations).join("\n");
  assert.doesNotMatch(completePolishTranslation, /wystąpił naprzód|wystąpiła naprzód/);
  assert.doesNotMatch(
    completePolishTranslation,
    /w jakim typie (?:będą|ustanowieni|więc \|298\. chrzty|Misterium chrztu|odpuszczają|jest zewnętrzna)/
  );
  assert.doesNotMatch(
    completePolishTranslation,
    /przyszła czynić pokutę|nie zawrócił ku pokucie|miłosiernie usposobione|otrzyma cierpienie w karaniach sądów/
  );
  assert.match(translations[219], /Jaka jest natura zewnętrznej ciemności/);
  assert.match(translations[214], /przyszła, aby pokutować/);
  assert.match(translations[216], /dozna w karach sądowych/);
  assert.match(translations[210], /Poznaliśmy już sposób, w jaki chrzty odpuszczają grzechy/);
  assert.match(translations[216], /lecz później zgrzeszył i nie zwrócił się ku pokucie/);
  assert.doesNotMatch(
    completePolishTranslation,
    /Oto jawnie poznaliśmy typ, w którym|miej dla mnie cierpliwość, gdy cię pytam|jako przekraczający/
  );
  assert.doesNotMatch(
    completePolishTranslation,
    /aż do krainy, aż do której otrzymał misteria|w prawdzie tęskni za Bogiem|prawdziwie tęskni za Bogiem|przepuśćcie (?:go|także)|w typie (?:\|303\. )?chrztów/
  );
  assert.match(translations[177], /krainy odpowiadającej otrzymanym misteriom/);
  assert.match(translations[194], /dopuśćcie go dalej/);
  assert.match(translations[210], /na sposób \|303\. chrztów/);
  assert.match(translations[215], /pozwól jej odziedziczyć Królestwo Światłości/);
  assert.match(translations[215], /znaczenie tego, co spotkało tę kobietę/);
  assert.match(translations[215], /zapowiedziałeś nam wcześniej w przypowieści/);
  assert.doesNotMatch(
    completePolishTranslation,
    /czyni swoje ciało bezpożytecznym|pozwoliłeś jej odziedziczyć|misteria rzeczy, które przypadły w udziale tej kobiecie/
  );
  assert.doesNotMatch(completePolishTranslation, /\bNiewysłowion(?:y|ego|ym)\b/);
  assert.match(translations[171], /dwanaście porządków Niewysłowionych/);
  assert.match(translations[64], /Maryja odpowiedziała i rzekła do Jezusa/);
  assert.doesNotMatch(completePolishTranslation, /\bkrólestw(?:o|a|ie|em|u) Światłości/);
  assert.match(translations[190], /ponownie posłani ku światu/);
  assert.match(translations[190], /Miłujcie ludzi/);
  assert.match(translations[193], /zachowa przy Życiu i zbawi choćby jedną duszę/);
  assert.match(translations[195], /nie oszukuje, nie udaje ani nie kieruje nim ciekawość/);
  assert.match(translations[194], /ponownie posłana ku światu ludzi/);
  assert.match(translations[196], /prowadził życie w wielkiej prawości oraz trwał w głębokiej pokucie/);
  assert.match(translations[216], /To wyższe Misterium przyjmie jego pokutę i odpuści mu grzechy/);
  assert.match(translations[255], /Wyszli po trzech ku czterem strefom nieba/);
  assert.doesNotMatch(completePolishTranslation, /odgrywani(?:e|a) roli|odgrywaj(?:ą|ąc)|odgrywali przed nami rolę/);
  assert.doesNotMatch(completePolishTranslation, /wielkim obywatelstwie|świat powyżej|to ostatnie dlatego/);
  assert.doesNotMatch(
    completePolishTranslation,
    /przekładu przekładu|prawdziwie w prawdzie|pośpieszą szybko|będzie nieistniejąca|jakichś takich misteriów/
  );
  assert.doesNotMatch(completePolishTranslation, /(?:kontynuowała|kontynuował) i rzekł[ae]?/);
  assert.match(translations[17], /przekładu dokonanego z innego przekładu/);
  assert.match(translations[196], /przestanie istnieć na wieki/);
  assert.match(translations[199], /dokonamy jednego z takich misteriów/);
  assert.match(translations[216], /dwa lub trzy misteria \|315\. drugiej albo trzeciej przestrzeni/);
  assert.match(translations[242], /Jezus mówił dalej: „Czwarty porządek/);
  assert.doesNotMatch(completePolishTranslation, /(^|\s)'(?=\S)|(\S)'(?=$|\s)/m);
  assert.doesNotMatch(completePolishTranslation, / - /);
  assert.match(translations[190], /„Mówcie im: Miłujcie ludzi/);
  assert.match(read("app.js"), /const polishTranslations = window\.GNOSTYK_POLISH_TRANSLATIONS \|\| \{\};/);
});

test("application content is separated from logic and loads before app.js", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("app-content.js") > 0);
  assert.ok(html.indexOf("app-content.js") < html.indexOf("book-loader.js"));
  assert.match(read("book-loader.js"), /loadScript\("app\.js"\)/);

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("app-content.js"), context, { filename: "app-content.js" });
  const content = context.window.GNOSTYK_APP_CONTENT;
  assert.ok(content && typeof content === "object");
  assert.ok(content.bookUiInfo["pistis-sophia"]?.pl);
  assert.ok(content.bookUiInfo["gospel-of-thomas"]?.en);
  assert.ok(content.bookUiInfo["gospel-of-philip"]?.pl);
  assert.ok(Object.keys(content.uiText.pl).length >= 100);
  assert.ok(Object.keys(content.uiText.en).length >= 100);
  assert.ok(content.bookThemes["pistis-sophia"]?.length > 0);
  assert.ok(content.bookThemes["gospel-of-thomas"]?.length > 0);
  assert.equal(content.chapterRanges.length, 5);
  assert.equal(content.translationPrinciples.length, 8);
  assert.equal(Object.prototype.toString.call(content.translationReview.misalignedIntroPages), "[object Set]");

  const app = read("app.js");
  assert.match(app, /window\.GNOSTYK_APP_CONTENT\?\.bookUiInfo/);
  assert.doesNotMatch(app, /const uiText = \{\s*pl:/);
});

test("book loader starts only the selected book before the application", () => {
  const html = read("index.html");
  const loader = read("book-loader.js");
  assert.match(html, /src="book-loader\.js\?v=/);
  assert.doesNotMatch(html, /src="books\/(?:pistis-sophia|gospel-of-thomas|gospel-of-philip)\/(?:data|coptic-data)\.js/);
  assert.doesNotMatch(html, /src="app\.js/);
  for (const bookId of ["pistis-sophia", "gospel-of-thomas", "gospel-of-philip"]) {
    assert.match(loader, new RegExp(`"${bookId}"\\s*:`));
  }
  assert.match(loader, /BOOK_ASSETS\[bookId\][\s\S]*loadScript\("app\.js"\)/);
  assert.match(read("app.js"), /availableBookIds\.has\(workId\)/);
});

test("Coptic lookup configuration is separated and complete", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("coptic-config.js") > 0);
  assert.ok(html.indexOf("coptic-config.js") < html.indexOf("book-loader.js"));

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("coptic-config.js"), context, { filename: "coptic-config.js" });
  const config = context.window.GNOSTYK_COPTIC_CONFIG;
  assert.ok(config && typeof config === "object");
  assert.ok(Object.keys(config.copticTransliterationMap).length >= 30);
  assert.ok(Object.keys(config.copticGlosses).length >= 150);
  assert.ok(config.copticPrefixGlosses.length >= 10);
  assert.ok(config.copticLookupPrefixes.length >= 10);
  assert.ok(config.copticLookupSuffixes.length >= 5);
  for (const token of ["ⲡϫⲟⲉⲓⲥ", "ⲟⲩⲟⲉⲓⲛ", "ⲥⲟⲫⲓⲁ"]) {
    assert.ok(config.copticGlosses[token], `missing base gloss: ${token}`);
  }
  assert.match(read("app.js"), /window\.GNOSTYK_COPTIC_CONFIG \|\| \{\}/);
});

test("fallback changelog is generated outside app.js and matches the public history", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("changelog-fallback.js") > 0);
  assert.ok(html.indexOf("changelog-fallback.js") < html.indexOf("book-loader.js"));

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("changelog-fallback.js"), context, { filename: "changelog-fallback.js" });
  assert.equal(context.window.GNOSTYK_FALLBACK_CHANGELOG, read("PUBLIC_CHANGELOG.md"));
  const app = read("app.js");
  assert.match(app, /window\.GNOSTYK_FALLBACK_CHANGELOG/);
  assert.match(app, /fetch\("\.\/PUBLIC_CHANGELOG\.md"/);
  assert.doesNotMatch(app, /fetch\("\.\/CHANGELOG\.md"/);
  assert.doesNotMatch(app, /const FALLBACK_CHANGELOG = "# Changelog\\n\\n##/);
});

test("storage facade preserves keys and survives blocked browser storage", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("storage.js") > 0);
  assert.ok(html.indexOf("storage.js") < html.indexOf("book-loader.js"));

  const values = new Map();
  const nativeStorage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
  const context = { window: { localStorage: nativeStorage } };
  vm.createContext(context);
  vm.runInContext(read("storage.js"), context, { filename: "storage.js" });
  const storage = context.window.GNOSTYK_STORAGE;
  storage.setItem("ps.settings", '{"theme":"sepia"}');
  assert.equal(storage.getItem("ps.settings"), '{"theme":"sepia"}');
  storage.removeItem("ps.settings");
  assert.equal(storage.getItem("ps.settings"), null);

  const blocked = context.window.GNOSTYK_CREATE_STORAGE({
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); }
  });
  blocked.setItem("ps.view", "reader");
  assert.equal(blocked.getItem("ps.view"), "reader");
  blocked.removeItem("ps.view");
  assert.equal(blocked.getItem("ps.view"), null);

  const app = read("app.js");
  assert.match(app, /const appStorage = window\.GNOSTYK_STORAGE/);
  assert.doesNotMatch(app, /localStorage\.(?:getItem|setItem|removeItem)/);
});

test("changelog parser is independent, bilingual, ordered, and deduplicated", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("changelog-tools.js") > 0);
  assert.ok(html.indexOf("changelog-tools.js") < html.indexOf("book-loader.js"));

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("changelog-tools.js"), context, { filename: "changelog-tools.js" });
  const tools = context.window.GNOSTYK_CHANGELOG_TOOLS;
  const sample = [
    "## 1.4.10 - Newer",
    "### PL",
    "- Zmiana",
    "- Zmiana",
    "### EN",
    "- Change",
    "## 1.4.9 - Older",
    "- Shared"
  ].join("\n");
  const groups = tools.parseChangelogGroups(sample);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].version, "1.4.10");
  assert.equal(groups[0].points.pl.length, 1);
  assert.equal(groups[0].points.pl[0], "Zmiana");
  assert.equal(groups[0].points.en[0], "Change");
  assert.equal(groups[1].points.all[0], "Shared");
  assert.ok(tools.compareVersionsDesc("1.4.10", "1.4.9") < 0);

  const actual = tools.parseChangelogGroups(read("CHANGELOG.md"));
  assert.equal(actual[0].version, json("VERSION.json").version);
  assert.ok(actual.length >= 25);
  const publicHistory = tools.parseChangelogGroups(read("PUBLIC_CHANGELOG.md"));
  assert.equal(publicHistory[0].version, json("VERSION.json").latestPublicVersion);
  assert.ok(publicHistory.length >= 8);
  assert.match(read("app.js"), /window\.GNOSTYK_CHANGELOG_TOOLS/);
});

test("Coptic text tools normalize, transliterate, and rank searches independently", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("coptic-config.js") < html.indexOf("coptic-text-tools.js"));
  assert.ok(html.indexOf("coptic-text-tools.js") < html.indexOf("book-loader.js"));

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("coptic-config.js"), context, { filename: "coptic-config.js" });
  vm.runInContext(read("coptic-text-tools.js"), context, { filename: "coptic-text-tools.js" });
  const tools = context.window.GNOSTYK_COPTIC_TEXT_TOOLS;
  assert.equal(tools.cleanCopticToken("ⲡ̄ϫⲟⲉⲓⲥ,"), "ⲡϫⲟⲉⲓⲥ");
  assert.equal(tools.cleanCopticToken("(ⲥⲟⲫⲓⲁ)"), "ⲥⲟⲫⲓⲁ");
  assert.equal(tools.transliterateCoptic("ⲥⲟⲫⲓⲁ"), "sophia");
  assert.equal(tools.transliterateCoptic("ⲡϫⲟⲉⲓⲥ"), "pjoeis");
  assert.equal(tools.normalizeDictionarySearchText("  Światłość,  Misterium! "), "swiatłosc misterium");
  assert.equal(tools.dictionarySearchWordMatch("Sophia wisdom", "Sophia"), 80);
  assert.equal(tools.dictionarySearchWordMatch("Sophia", "sop"), 45);
  assert.equal(tools.dictionarySearchWordMatch("Pistis Sophia", "oph"), 20);
  assert.equal(tools.dictionarySearchWordMatch("Sophia", "chaos"), 0);
  assert.match(read("app.js"), /window\.GNOSTYK_COPTIC_TEXT_TOOLS/);
});

test("Coptic lookup resolves direct, prefixed, suffixed, and combined forms", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("coptic-config.js") < html.indexOf("coptic-lookup.js"));
  assert.ok(html.indexOf("coptic-lookup.js") < html.indexOf("book-loader.js"));

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("coptic-config.js"), context, { filename: "coptic-config.js" });
  vm.runInContext(read("coptic-lookup.js"), context, { filename: "coptic-lookup.js" });
  const lookup = context.window.GNOSTYK_COPTIC_LOOKUP;
  const direct = lookup.candidates("ⲡϫⲟⲉⲓⲥ");
  assert.equal(direct[0].type, "direct");
  assert.equal(direct[0].key, "ⲡϫⲟⲉⲓⲥ");

  const prefixed = lookup.candidates("ⲛⲁⲡϫⲟⲉⲓⲥ");
  assert.ok(prefixed.some(item => item.type === "prefix" && item.key === "ⲡϫⲟⲉⲓⲥ"));
  const suffixed = lookup.candidates("ⲡϫⲟⲉⲓⲥϥ");
  assert.ok(suffixed.some(item => item.type === "suffix" && item.key === "ⲡϫⲟⲉⲓⲥ"));
  const combined = lookup.candidates("ⲛⲁⲡϫⲟⲉⲓⲥϥ");
  assert.ok(combined.some(item => item.type === "prefix-suffix" && item.key === "ⲡϫⲟⲉⲓⲥ"));
  assert.equal(new Set(combined.map(item => item.key)).size, combined.length);

  const result = lookup.findEntry("ⲛⲁⲡϫⲟⲉⲓⲥ", {
    dictionary: { "ⲡϫⲟⲉⲓⲥ": { en: "Lord" } },
    overrides: { "ⲡϫⲟⲉⲓⲥ": "Pan" },
    manualGlosses: {}
  });
  assert.equal(result.key, "ⲡϫⲟⲉⲓⲥ");
  assert.equal(result.type, "prefix");
  assert.equal(result.polish, "Pan");
  assert.equal(lookup.findEntry("ⲭⲭⲭ", {}), null);
  assert.match(read("app.js"), /window\.GNOSTYK_COPTIC_LOOKUP/);
});

test("dictionary engine scores entries, cleans meanings, and classifies completeness", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("coptic-text-tools.js") < html.indexOf("dictionary-engine.js"));
  assert.ok(html.indexOf("dictionary-engine.js") < html.indexOf("book-loader.js"));

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("coptic-config.js"), context, { filename: "coptic-config.js" });
  vm.runInContext(read("coptic-text-tools.js"), context, { filename: "coptic-text-tools.js" });
  vm.runInContext(read("dictionary-engine.js"), context, { filename: "dictionary-engine.js" });
  const engine = context.window.GNOSTYK_DICTIONARY_ENGINE;
  const details = {
    token: "ⲥⲟⲫⲓⲁ",
    translit: "sophia",
    shortEnglish: "wisdom",
    shortPolish: "mądrość",
    english: "wisdom; insight",
    polish: "mądrość; poznanie",
    base: "ⲥⲟⲫⲓⲁ"
  };
  assert.equal(engine.scoreEntry(details, "ⲥⲟⲫⲓⲁ"), 220);
  assert.equal(engine.scoreEntry(details, "sophia"), 170);
  assert.equal(engine.scoreEntry(details, "wisdom"), 160);
  assert.equal(engine.scoreEntry(details, "chaos"), 0);

  const meanings = engine.splitMeanings("wisdom; insight; Wisdom; DDGLC ref: 123; CD 45a; 42", "wisdom");
  assert.deepEqual(Array.from(meanings), ["insight"]);
  assert.equal(engine.meaningCount("wisdom; insight; insight", "wisdom"), 2);
  assert.equal(engine.statusKey(details), "ready");
  assert.equal(engine.statusKey({ shortPolish: "mądrość" }), "basic");
  assert.equal(engine.statusKey({}), "pending");
  assert.match(read("app.js"), /window\.GNOSTYK_DICTIONARY_ENGINE/);
});

test("interlinear engine normalizes token variants and selects stable lookup keys", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("coptic-text-tools.js") < html.indexOf("interlinear-engine.js"));
  assert.ok(html.indexOf("interlinear-engine.js") < html.indexOf("book-loader.js"));

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("coptic-config.js"), context, { filename: "coptic-config.js" });
  vm.runInContext(read("coptic-text-tools.js"), context, { filename: "coptic-text-tools.js" });
  vm.runInContext(read("interlinear-engine.js"), context, { filename: "interlinear-engine.js" });
  const engine = context.window.GNOSTYK_INTERLINEAR_ENGINE;

  assert.deepEqual(
    { ...engine.normalizeToken({ text: "ⲡϫⲟⲉⲓⲥ", lemma: "ⲕⲩⲣⲓⲟⲥ", pos: "N", lang: "cop" }) },
    { surface: "ⲡϫⲟⲉⲓⲥ", lemma: "ⲕⲩⲣⲓⲟⲥ", type: "N", lang: "cop" }
  );
  assert.deepEqual(
    { ...engine.normalizeToken("ⲥⲟⲫⲓⲁ") },
    { surface: "ⲥⲟⲫⲓⲁ", lemma: "", type: "", lang: "" }
  );
  assert.equal(engine.lookupKey({ surface: "ⲡ̄ϫⲟⲉⲓⲥ,", lemma: "ⲕⲩⲣⲓⲟⲥ" }), "ⲕⲩⲣⲓⲟⲥ");
  assert.equal(engine.lookupKey({ surface: "ⲡ̄ϫⲟⲉⲓⲥ,", lemma: "·" }), "ⲡϫⲟⲉⲓⲥ");
  assert.deepEqual(Array.from(engine.lineTokens({ text: "ⲡⲓⲥⲧⲓⲥ  ⲥⲟⲫⲓⲁ" })), ["ⲡⲓⲥⲧⲓⲥ", "ⲥⲟⲫⲓⲁ"]);
  const explicit = [{ surface: "ⲥⲟⲫⲓⲁ" }];
  assert.equal(engine.lineTokens({ text: "ignored", tokens: explicit }), explicit);
  assert.match(read("app.js"), /window\.GNOSTYK_INTERLINEAR_ENGINE/);
});

test("citation engine preserves labels and formats for all three books", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("citation-engine.js") > 0);
  assert.ok(html.indexOf("citation-engine.js") < html.indexOf("book-loader.js"));

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("citation-engine.js"), context, { filename: "citation-engine.js" });
  const engine = context.window.GNOSTYK_CITATION_ENGINE;
  assert.equal(engine.referenceLabel({ kind: "logion", unitLabel: "Logion", pageNumber: 22 }), "Logion 22");
  assert.equal(
    engine.referenceLabel({ kind: "pistis", pageNumber: 100, chapterNumber: 51, chapterLabel: "rozdział", refs: ["123", "124"] }),
    "Mead s. 100 · rozdział 51 · Schw.-Pet. 123, 124"
  );

  assert.equal(
    engine.format({ kind: "pistis", locale: "pl", format: "simple", library: "Biblioteka Gnozy v1.4.99", pageNumber: 100, chapterPart: "rozdział 51", refs: ["123"] }),
    "Pistis Sophia, Mead s. 100, rozdział 51, Schw.-Pet. 123, Biblioteka Gnozy v1.4.99"
  );
  assert.equal(
    engine.format({ kind: "logion", locale: "en", format: "scholarly", library: "Gnostic Library v1.4.99", title: "Gospel of Thomas", unit: "logion", number: 1, bookId: "gospel-of-thomas", readerMode: "source" }),
    "Gospel of Thomas, logion 1, Nag Hammadi Codex II, text layer used: EN Mark M. Mattison, public domain, Gnostic Library v1.4.99."
  );
  assert.equal(
    engine.format({ kind: "logion", locale: "pl", format: "mead", library: "Biblioteka Gnozy v1.4.99", title: "Ewangelia Filipa", unit: "sekcja", number: 3, bookId: "gospel-of-philip", readerMode: "pl" }),
    "Ewangelia Filipa, sekcja 3, Nag Hammadi Codex II,3, Biblioteka Gnozy v1.4.99."
  );
  for (const format of ["simple", "scholarly", "mead", "schwpet"]) {
    assert.ok(engine.format({ kind: "pistis", locale: "en", format, library: "Gnostic Library v1.4.99", pageNumber: 48, chapterPart: "chapter 1", refs: [] }));
  }
  assert.match(read("app.js"), /window\.GNOSTYK_CITATION_ENGINE/);
});

test("reader engine resolves page bounds, chapters, ranges, and manuscript references", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("reader-engine.js") > 0);
  assert.ok(html.indexOf("reader-engine.js") < html.indexOf("book-loader.js"));

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("reader-engine.js"), context, { filename: "reader-engine.js" });
  const engine = context.window.GNOSTYK_READER_ENGINE;
  const data = {
    pages: [{ page: 1 }, { page: 2 }, { page: 3 }],
    chapters: [{ number: 1, page: 1 }, { number: 2, page: 3 }]
  };

  assert.equal(engine.defaultStartPage("pistis-sophia"), 48);
  assert.equal(engine.defaultStartPage("gospel-of-thomas"), 1);
  assert.equal(engine.pageByNumber(data, 0).page, 1);
  assert.equal(engine.pageByNumber(data, 99).page, 3);
  assert.equal(engine.pageByNumber(data, 2).page, 2);
  assert.equal(engine.chapterForPage(data, 2).number, 1);
  assert.equal(engine.chapterForPage(data, 3).number, 2);
  assert.equal(
    engine.rangeForChapter([{ from: 1, to: 4, title: "Range" }], { number: 3 }).title,
    "Range"
  );
  assert.deepEqual(Array.from(engine.manuscriptRefs({ text: "a |12. b |12 c |13" })), ["12", "13"]);
  assert.deepEqual(Array.from(engine.copticRefs({ page: 48, text: "opening" })), ["1"]);
  assert.deepEqual(Array.from(engine.copticRefs({ page: 22 }, true)), ["22"]);
  assert.match(read("app.js"), /window\.GNOSTYK_READER_ENGINE/);
});

test("reader navigation clamps invalid pages and stops at both book boundaries", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("reader-engine.js"), context, { filename: "reader-engine.js" });
  const engine = context.window.GNOSTYK_READER_ENGINE;

  assert.equal(engine.clampPage(-8, 255), 1);
  assert.equal(engine.clampPage("12", 255), 12);
  assert.equal(engine.clampPage(12.9, 255), 12);
  assert.equal(engine.clampPage("not-a-page", 255), 1);
  assert.equal(engine.clampPage(999, 255), 255);
  assert.equal(engine.clampPage(4, 0), 1);
  assert.equal(engine.adjacentPage(1, 114, "previous"), 1);
  assert.equal(engine.adjacentPage(1, 114, "next"), 2);
  assert.equal(engine.adjacentPage(114, 114, "next"), 114);
  assert.equal(engine.adjacentPage(50, 114, -1), 49);

  const app = read("app.js");
  assert.match(app, /GNOSTYK_READER_ENGINE\.clampPage/);
  assert.match(app, /GNOSTYK_READER_ENGINE\.adjacentAvailablePage/);
});

test("reader mode rules reject unknown and unavailable text layers", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("reader-engine.js"), context, { filename: "reader-engine.js" });
  const engine = context.window.GNOSTYK_READER_ENGINE;
  const book = { readerModes: ["pl", "source", "coptic", "interlinear", "unknown", "pl"] };

  assert.deepEqual(Array.from(engine.validReaderModes()), ["pl", "source", "coptic", "interlinear"]);
  assert.deepEqual(Array.from(engine.supportedReaderModes(book, false)), ["pl", "source", "coptic"]);
  assert.deepEqual(Array.from(engine.supportedReaderModes(book, true)), ["pl", "source", "coptic", "interlinear"]);
  assert.equal(engine.normalizeReaderMode("interlinear", book, false), "pl");
  assert.equal(engine.normalizeReaderMode("interlinear", book, true), "interlinear");
  assert.equal(engine.normalizeReaderMode("unknown", book, true), "pl");
  assert.equal(engine.normalizeReaderMode("pl", { readerModes: ["source"] }, false), "source");
  assert.equal(engine.normalizeReaderMode("source", { readerModes: [] }, false), "source");

  const app = read("app.js");
  assert.match(app, /GNOSTYK_READER_ENGINE\.supportedReaderModes/);
  assert.match(app, /GNOSTYK_READER_ENGINE\.normalizeReaderMode/);
});

test("interlinear mode renders only the active page instead of the whole book", () => {
  const app = read("app.js");
  const renderReader = app.match(/function renderReader\(\) \{[\s\S]*?\n\}\n\nfunction renderLists\(\)/)?.[0] || "";
  assert.ok(renderReader, "renderReader must exist");
  assert.doesNotMatch(renderReader, /renderThomasInterlinearContinuousText\(\)/);
  assert.doesNotMatch(renderReader, /renderPistisCopticContinuousText\(true\)/);
  assert.equal((renderReader.match(/body = interlinearPageText\(page\);/g) || []).length, 1);
  assert.match(renderReader, /plan === "active-interlinear"/);
  assert.doesNotMatch(app, /function renderThomasInterlinearContinuousText/);
  assert.doesNotMatch(app, /renderPistisCopticContinuousText\(interlinear/);
  assert.doesNotMatch(read("styles.css"), /thomas-interlinear-continuous/);
});

test("reader render plan reserves interlinear mode for the active page", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("reader-engine.js"), context, { filename: "reader-engine.js" });
  const plan = context.window.GNOSTYK_READER_ENGINE.renderPlan;

  for (const configuration of [
    { mode: "interlinear", isPistis: true, sidebarMode: "chapters" },
    { mode: "interlinear", isPistis: true, sidebarMode: "addenda" },
    { mode: "interlinear", isLogionReader: true },
    { mode: "interlinear" }
  ]) {
    assert.equal(plan(configuration), "active-interlinear");
  }
  assert.equal(plan({ mode: "pl", isPistis: true, sidebarMode: "addenda" }), "pistis-addenda-continuous");
  assert.equal(plan({ mode: "source", isPistis: true }), "pistis-text-continuous");
  assert.equal(plan({ mode: "coptic", isPistis: true }), "pistis-coptic-continuous");
  assert.equal(plan({ mode: "pl", isLogionReader: true }), "logion-text-continuous");
  assert.equal(plan({ mode: "coptic", isLogionReader: true }), "logion-coptic-continuous");
  assert.equal(plan({ mode: "coptic" }), "active-coptic");
  assert.equal(plan({ mode: "source" }), "active-text");
  assert.match(read("app.js"), /GNOSTYK_READER_ENGINE\.renderPlan/);
});

test("reader section rules keep Pistis Sophia addenda and chapters in sync with the page", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("reader-engine.js"), context, { filename: "reader-engine.js" });
  const engine = context.window.GNOSTYK_READER_ENGINE;

  assert.equal(engine.isAddendaPage("pistis-sophia", 1), true);
  assert.equal(engine.isAddendaPage("pistis-sophia", 47), true);
  assert.equal(engine.isAddendaPage("pistis-sophia", 48), false);
  assert.equal(engine.isAddendaPage("gospel-of-thomas", 1), false);
  assert.equal(engine.tabForPage("chapters", "pistis-sophia", 20), "addenda");
  assert.equal(engine.tabForPage("addenda", "pistis-sophia", 48), "chapters");
  assert.equal(engine.tabForPage("themes", "pistis-sophia", 100), "themes");
  assert.equal(engine.tabForPage("marks", "gospel-of-thomas", 1), "marks");
  assert.equal(engine.tabForPage("chapters", "pistis-sophia", 10, 12), "addenda");
  assert.equal(engine.tabForPage("addenda", "pistis-sophia", 12, 12), "chapters");

  const app = read("app.js");
  assert.match(app, /GNOSTYK_READER_ENGINE\.isAddendaPage/);
  assert.match(app, /GNOSTYK_READER_ENGINE\.tabForPage/);
  assert.equal((app.match(/state\.tab = readerTabForPage\(\);/g) || []).length, 2);
});

test("reader boundary split preserves both halves of Pistis Sophia page 48", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("reader-engine.js"), context, { filename: "reader-engine.js" });
  const split = context.window.GNOSTYK_READER_ENGINE.splitBoundaryText;

  const polish = split("Koniec wprowadzenia.\n\n[KSIĘGA PIERWSZA]\nPoczątek tekstu.", "[KSIĘGA PIERWSZA]");
  assert.equal(polish.introduction, "Koniec wprowadzenia.");
  assert.equal(polish.main, "[KSIĘGA PIERWSZA]\nPoczątek tekstu.");

  const english = split("End of introduction.\n[THE FIRST BOOK OF]\nOpening text.", "[THE FIRST BOOK OF]");
  assert.equal(english.introduction, "End of introduction.");
  assert.equal(english.main, "[THE FIRST BOOK OF]\nOpening text.");

  const missing = split("Complete text without a boundary", "[MISSING]");
  assert.equal(missing.introduction, "");
  assert.equal(missing.main, "Complete text without a boundary");
  const noMarker = split("Untouched text", "");
  assert.equal(noMarker.introduction, "");
  assert.equal(noMarker.main, "Untouched text");

  assert.match(read("app.js"), /GNOSTYK_READER_ENGINE\.splitBoundaryText/);
});

test("reader resolves sparse and unordered page data without relying on array indexes", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("reader-engine.js"), context, { filename: "reader-engine.js" });
  const engine = context.window.GNOSTYK_READER_ENGINE;
  const data = {
    pages: [{ page: 40, text: "forty" }, { page: 10, text: "ten" }, { page: 20, text: "twenty" }],
    chapters: [{ number: 3, page: 30 }, { number: 1, page: 10 }, { number: 2, page: 20 }]
  };

  assert.equal(engine.pageByNumber(data, 20).text, "twenty");
  assert.equal(engine.pageByNumber(data, 1).text, "ten");
  assert.equal(engine.pageByNumber(data, 26).text, "twenty");
  assert.equal(engine.pageByNumber(data, 35).text, "forty");
  assert.equal(engine.pageByNumber(data, 999).text, "forty");
  assert.equal(engine.pageByNumber(data, "invalid").text, "ten");
  assert.equal(engine.chapterForPage(data, 25).number, 2);
  assert.equal(engine.chapterForPage(data, 35).number, 3);
  assert.equal(engine.chapterForPage(data, 5), null);
  assert.equal(engine.chapterForPage(data, "invalid"), null);

  const unnumbered = { pages: [{ text: "first" }, { text: "second" }] };
  assert.equal(engine.pageByNumber(unnumbered, 2).text, "second");
});

test("reader navigation moves through available sparse page numbers", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("reader-engine.js"), context, { filename: "reader-engine.js" });
  const engine = context.window.GNOSTYK_READER_ENGINE;
  const data = { pages: [{ page: 40 }, { page: 10 }, { page: 20 }, { page: 20 }] };

  assert.deepEqual(Array.from(engine.availablePageNumbers(data)), [10, 20, 40]);
  assert.equal(engine.resolvePageNumber(data, 10), 10);
  assert.equal(engine.resolvePageNumber(data, 26), 20);
  assert.equal(engine.resolvePageNumber(data, 35), 40);
  assert.equal(engine.resolvePageNumber(data, "invalid"), 10);
  assert.equal(engine.adjacentAvailablePage(data, 10, "previous"), 10);
  assert.equal(engine.adjacentAvailablePage(data, 10, "next"), 20);
  assert.equal(engine.adjacentAvailablePage(data, 20, "next"), 40);
  assert.equal(engine.adjacentAvailablePage(data, 40, "next"), 40);
  assert.equal(engine.adjacentAvailablePage(data, 35, "previous"), 20);

  const app = read("app.js");
  assert.match(app, /GNOSTYK_READER_ENGINE\.resolvePageNumber/);
  assert.match(app, /GNOSTYK_READER_ENGINE\.adjacentAvailablePage/);
  assert.equal((app.match(/state\.page = resolveReaderPage/g) || []).length, 2);
});

test("reader navigation state disables controls at the first and last available page", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("reader-engine.js"), context, { filename: "reader-engine.js" });
  const navigationState = context.window.GNOSTYK_READER_ENGINE.navigationState;
  const data = { pages: [{ page: 40 }, { page: 10 }, { page: 20 }] };

  assert.deepEqual(
    JSON.parse(JSON.stringify(navigationState(data, 10))),
    { current: 10, previous: 10, next: 20, canPrevious: false, canNext: true }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(navigationState(data, 20))),
    { current: 20, previous: 10, next: 40, canPrevious: true, canNext: true }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(navigationState(data, 40))),
    { current: 40, previous: 20, next: 40, canPrevious: true, canNext: false }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(navigationState({ pageCount: 3 }, 1))),
    { current: 1, previous: 1, next: 2, canPrevious: false, canNext: true }
  );

  const app = read("app.js");
  assert.match(app, /GNOSTYK_READER_ENGINE\.navigationState/);
  for (const control of ["els.prev", "els.focusPrev", "els.mobilePrev", "els.next", "els.focusNext", "els.mobileNext"]) {
    assert.ok(app.includes(control), `missing navigation state for ${control}`);
  }
  assert.match(app, /aria-disabled/);
});

test("changelog starts at the current version and has no recent gaps", () => {
  const version = json("VERSION.json").version;
  const versions = [...read("CHANGELOG.md").matchAll(/^##\s+(\d+\.\d+\.\d+)\s+-/gm)].map(match => match[1]);
  assert.equal(versions[0], version);
  assert.equal(new Set(versions).size, versions.length, "duplicate changelog version");
  for (let i = 0; i < Math.min(24, versions.length - 1); i += 1) {
    const newer = versions[i].split(".").map(Number);
    const older = versions[i + 1].split(".").map(Number);
    if (newer[0] === older[0] && newer[1] === older[1]) {
      assert.equal(newer[2], older[2] + 1, `gap between ${versions[i]} and ${versions[i + 1]}`);
    }
  }
});

test("release workflow separates public milestones from the technical archive", () => {
  const release = read("tools/release.py");
  assert.match(release, /--release-type/);
  assert.match(release, /choices=\("public", "technical"\)/);
  assert.match(release, /if args\.release_type == "public"/);
  assert.match(release, /latestPublicVersion/);
  assert.match(release, /PUBLIC_CHANGELOG\.md/);
  assert.match(read("RELEASE_WORKFLOW.md"), /--release-type public/);
  const metadata = json("VERSION.json");
  assert.ok(["public", "technical"].includes(metadata.releaseType));
  assert.match(metadata.latestPublicVersion, /^\d+\.\d+\.\d+$/);
});
