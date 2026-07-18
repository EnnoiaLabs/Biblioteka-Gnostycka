# Changelog

## 1.6.0 - Księgi ładują się dopiero po otwarciu

### PL
- Aplikacja uruchamia tylko dane aktualnie wybranej księgi zamiast wszystkich trzech naraz.
- Start Ewangelii Tomasza i Ewangelii Filipa zmniejszono do około 2,9 MiB zasobów lokalnych, a najcięższy wariant Pistis Sophii do 5,95 MiB.
- Przełączanie ksiąg, cztery tryby czytania i działanie offline pozostają objęte automatycznymi kontrolami.

### EN
- The application now starts only the currently selected book data instead of loading all three books at once.
- The startup footprint for the Gospels of Thomas and Philip is now about 2.9 MiB of local assets, while the heaviest Pistis Sophia variant is 5.95 MiB.
- Book switching, four reading modes, and offline operation remain protected by automated checks.

## 1.5.0 - Czytelna historia najważniejszych zmian

### PL
- Historia w aplikacji pokazuje teraz najważniejsze etapy rozwoju zamiast wewnętrznych prac technicznych.
- Uporządkowano dotychczasowe zmiany w kamienie milowe dotyczące ksiąg, czytnika, interlinii, warstwy koptyjskiej, cytowania i stabilności.
- Dokładny numer aplikacji pozostaje widoczny, a pełne archiwum techniczne nadal jest zachowane w projekcie.

### EN
- The in-app history now presents major development milestones instead of internal technical work.
- Previous changes were curated into milestones covering books, the reader, interlinear and Coptic layers, citation, and stability.
- The exact application version remains visible, while the complete technical archive is preserved in the project.

## 1.4.124 - Końcowy audyt potwierdza gotowość wydania

### PL
- Dodano polecenie release.py audit do końcowej kontroli kandydata.
- Audyt dwukrotnie buduje deterministyczny ZIP i porównuje sumy SHA-256.
- Kontrola potwierdza komplet wymaganych plików oraz brak wyłączonych zasobów w paczce.
- Workflow i checklista prowadzą teraz przez audyt przed testem Chromium i publikacją.

### EN
- Added release.py audit for final release-candidate validation.
- The audit builds the deterministic ZIP twice and compares SHA-256 digests.
- It verifies all required files and confirms excluded assets are absent from the package.
- The workflow and checklist now require the audit before Chromium testing and publication.

## 1.4.123 - Nieużywane zasoby nie obciążają paczki

### PL
- Audyt wykrył cztery nieużywane grafiki źródłowe o łącznym rozmiarze 5,76 MiB.
- Materiały pozostają w projekcie, ale nie są dodawane do publikacyjnego ZIP.
- Nowy strażnik potwierdza brak odwołań przed zastosowaniem każdego wyłączenia.
- Manifest wydania zapisuje jawną listę plików pominiętych podczas pakowania.

### EN
- The audit found four unused source images totaling 5.76 MiB.
- The source materials remain in the project but are omitted from the published ZIP.
- A new guard verifies that every excluded asset has no runtime references.
- The release manifest records the explicit list of files omitted during packaging.

## 1.4.122 - Budżety wydajności pilnują zasobów startowych

### PL
- Dodano automatyczny pomiar rozmiaru lokalnych zasobów ładowanych przy starcie.
- Budżety kontrolują rozmiar raw, gzip, największy zasób, app.js i styles.css.
- Przekroczenie limitów z performance-budgets.json zatrzymuje wydanie.
- Pomiar bazowy wynosi 6,37 MiB raw i 1,90 MiB gzip dla 27 zasobów.

### EN
- Added automated size measurement for local assets loaded at startup.
- Budgets cover raw size, gzip size, the largest asset, app.js, and styles.css.
- Exceeding performance-budgets.json limits now blocks a release.
- The baseline is 6.37 MiB raw and 1.90 MiB gzip across 27 assets.

## 1.4.121 - Test Chromium czeka na zmianę księgi

### PL
- Test przeglądarkowy czeka teraz na pełne wyrenderowanie strony 48 po przejściu do Pistis Sophia.
- Usunięto wyścig, w którym asercja odczytywała początkową etykietę Strona 1.

### EN
- The browser test now waits for page 48 to finish rendering after switching to Pistis Sophia.
- Removed a race condition where the assertion read the initial Page 1 label.

## 1.4.120 - Poprawiono selektor testu Chromium

### PL
- Test przeglądarkowy korzysta teraz z aktualnego elementu currentPageLabel.
- Dodano kontrolę regresyjną zatrzymującą powrót nieaktualnego selektora currentPage.

### EN
- The browser test now uses the current currentPageLabel element.
- Added a regression check preventing the obsolete currentPage selector from returning.

## 1.4.119 - Kontrola PWA i trybu offline włączona do wydania

### PL
- Dodano samodzielny strażnik tools/check-pwa.js uruchamiany przez release.py check.
- Kontrola sprawdza manifest, rzeczywiste rozmiary obrazów, rejestrację service workera, wersję cache i kompletność APP_SHELL.
- Dodano brakujące pliki themes.json wszystkich trzech ksiąg do cache offline.
- Poprawiono zadeklarowany w manifeście rozmiar zrzutu aplikacji.
- Dodano test regresyjny strażnika PWA i polecenie npm run test:pwa.

### EN
- Added a standalone tools/check-pwa.js guard executed by release.py check.
- The guard validates the manifest, actual image dimensions, service worker registration, cache version, and APP_SHELL completeness.
- Added the missing themes.json files for all three books to the offline cache.
- Corrected the application screenshot dimensions declared in the manifest.
- Added a PWA guard regression test and the npm run test:pwa command.

## 1.4.118 - Test uruchomieniowy Chromium dodany do workflow

### PL
- Dodano test Playwright uruchamiający aplikację przez lokalny serwer HTTP w prawdziwym Chromium.
- Scenariusz obejmuje start czytnika, tryby PL, EN, COPT i interlinearny, nawigację oraz zmianę księgi.
- Test zbiera błędy JavaScript z pageerror i konsoli oraz ma lekki wariant dla środowisk o ograniczonej pamięci.
- Playwright został przypięty w package-lock.json, a test przeglądarkowy dodano do checklisty publikacji jako osobny krok.
- Naprawiono również synchronizację numeru wersji w package-lock.json; pełne uruchomienie browser smoke wymaga zwykłego lokalnego Chromium.

### EN
- Added a Playwright test that serves and starts the application in a real Chromium browser.
- The scenario covers reader startup, PL, EN, COPT, and interlinear modes, navigation, and book switching.
- The test collects JavaScript pageerror and console failures and provides a lightweight mode for memory-constrained environments.
- Playwright is pinned in package-lock.json, and the browser test is an explicit publication-checklist step.
- Also fixed package-lock.json version synchronization; completing the browser smoke run requires a standard local Chromium installation.

## 1.4.117 - Manifest wydania opisuje każdą paczkę

### PL
- Polecenie package tworzy teraz maszynowo czytelny plik .release.json obok ZIP-a.
- Manifest zawiera wersję, datę, zakres zmiany, nazwę archiwum i jego sumę SHA-256.
- Zapisywana jest liczba plików oraz pełna lista elementów wymaganych przez bramkę wydania.
- Raport korzysta bezpośrednio z VERSION.json i wyniku zweryfikowanego pakowania.
- Dodano trzydziesty czwarty test pilnujący kompletności pól manifestu.

### EN
- The package command now creates a machine-readable .release.json file beside the ZIP.
- The manifest contains the version, date, change scope, archive name, and SHA-256 checksum.
- It records the file count and the complete list of items required by the release gate.
- The report uses VERSION.json and the verified packaging result directly.
- Added the thirty-fourth test enforcing manifest field completeness.

## 1.4.116 - Paczki wydania są deterministyczne

### PL
- ZIP zapisuje pliki w stałej, alfabetycznej kolejności niezależnej od systemu plików.
- Każdy wpis archiwum otrzymuje ujednolicony znacznik czasu i uprawnienia.
- Ponowne pakowanie niezmienionej wersji generuje identyczne bajty i tę samą sumę SHA-256.
- Zachowano wcześniejszą kontrolę integralności, kompletności i atomową publikację paczki.
- Dodano trzydziesty trzeci test pilnujący deterministycznych parametrów archiwum.

### EN
- The ZIP stores files in a fixed alphabetical order independent of filesystem ordering.
- Every archive entry receives a normalized timestamp and permissions.
- Repackaging an unchanged version produces identical bytes and the same SHA-256 checksum.
- Preserved the existing integrity, completeness, and atomic-publication checks.
- Added the thirty-third test enforcing deterministic archive parameters.

## 1.4.115 - Pakiet jest weryfikowany przed publikacją

### PL
- ZIP jest teraz tworzony jako plik tymczasowy i publikowany dopiero po pomyślnej weryfikacji.
- Skrypt sprawdza integralność wszystkich skompresowanych danych przed zapisaniem finalnej paczki.
- Kontrolowana jest obecność każdego pliku wymaganego przez workflow wydania.
- Nieudane pakowanie usuwa plik tymczasowy i nie nadpisuje ostatniego poprawnego archiwum.
- Dodano trzydziesty drugi test pilnujący kolejności: budowa, weryfikacja, publikacja.

### EN
- The ZIP is now built as a temporary file and published only after successful verification.
- The script checks the integrity of all compressed data before writing the final package.
- Every file required by the release workflow is checked for presence.
- Failed packaging removes the temporary file and does not overwrite the last valid archive.
- Added the thirty-second test enforcing the build, verify, publish order.

## 1.4.114 - Pakowanie wydania zautomatyzowane

### PL
- Dodano polecenie release.py package, które przed pakowaniem uruchamia pełną bramkę jakości.
- Pakiet otrzymuje automatyczną nazwę z numerem wersji i technicznym zakresem zmian.
- Obok ZIP-a generowany jest plik kontrolny z sumą SHA-256.
- Z archiwum wykluczane są node_modules, cache Pythona, Git, katalog dist i pliki systemowe.
- Dodano trzydziesty pierwszy test oraz zaktualizowano workflow, skrypty npm i instrukcję Windows.

### EN
- Added release.py package, which runs the full quality gate before packaging.
- The package receives an automatic name containing the version and technical change scope.
- A SHA-256 checksum file is generated next to the ZIP.
- node_modules, Python caches, Git, the dist directory, and system files are excluded.
- Added the thirty-first test and updated the workflow, npm scripts, and Windows instructions.

## 1.4.113 - Pełne testy stały się bramką wydania

### PL
- Włączono pełny zestaw testów JavaScript bezpośrednio do polecenia release.py check.
- Przygotowanie wersji zostaje zatrzymane, gdy brakuje testów, Node jest niedostępny albo choć jeden test nie przechodzi.
- Plik tests/smoke.test.js został dodany do wymaganych elementów pakietu wydania.
- Kontrola danych książek, składni, wersji, PWA i testów działa teraz w jednym powtarzalnym poleceniu.
- Dodano trzydziesty test pilnujący trwałego podłączenia zestawu testów do workflow.

### EN
- Integrated the full JavaScript test suite directly into release.py check.
- Release preparation stops when tests are missing, Node is unavailable, or any test fails.
- The tests/smoke.test.js file is now a required release-package component.
- Book-data, syntax, version, PWA, and test checks now run through one repeatable command.
- Added the thirtieth test ensuring the suite remains connected to the workflow.

## 1.4.112 - Kontrola danych książek włączona do wydania

### PL
- Dodano samodzielny kontroler tools/check-book-data.js uruchamiany przez release.py check.
- Wydanie jest blokowane przez duplikaty stron lub rozdziałów, złą kolejność, błędne liczniki i zerwane odwołania.
- Kontrolowane są również identyfikatory książek, pliki wejściowe, tryby czytnika i domyślna warstwa.
- Usunięto niepoprawną deklarację notes z listy warstw tekstowych Ewangelii Tomasza.
- Dodano dwudziesty dziewiąty test potwierdzający działanie strażnika dla wszystkich trzech modułów.

### EN
- Added the standalone tools/check-book-data.js validator, executed by release.py check.
- Releases are blocked by duplicate pages or chapters, invalid ordering, incorrect counts, and broken references.
- Book identifiers, entry files, reader modes, and default layers are also validated.
- Removed the invalid notes declaration from the Gospel of Thomas text-layer list.
- Added the twenty-ninth test confirming the guard across all three modules.

## 1.4.111 - Przyciski nawigacji znają granice książki

### PL
- Dodano wspólny stan nawigacji z poprzednią i następną dostępną stroną.
- Przycisk wstecz jest wyłączany na pierwszej stronie, a przycisk dalej na ostatniej.
- Reguła obejmuje widok główny, tryb skupienia i kontrolki mobilne.
- Dodano atrybut aria-disabled, aby stan graniczny był czytelny również dla technologii asystujących.
- Dodano dwudziesty ósmy test dla pierwszej, środkowej i ostatniej strony.

### EN
- Added shared navigation state with the previous and next available page.
- The previous control is disabled on the first page and the next control on the last page.
- The rule covers the main view, focus mode, and mobile controls.
- Added aria-disabled so boundary state is also exposed to assistive technologies.
- Added the twenty-eighth test covering the first, middle, and last page.

## 1.4.110 - Nawigacja respektuje rzeczywiste numery stron

### PL
- Stan czytnika jest teraz synchronizowany z numerem rzeczywiście istniejącej strony.
- Przyciski poprzedniej i następnej strony przechodzą między dostępnymi numerami, także przy lukach.
- Numery stron są porządkowane i deduplikowane przed użyciem w nawigacji.
- Niepoprawny numer wraca do pierwszej dostępnej strony, a granice książki pozostają nieprzekraczalne.
- Dodano dwudziesty siódmy test dla nawigacji po stronach 10, 20 i 40.

### EN
- Reader state is now synchronized with an actually available page number.
- Previous and next controls move between available numbers even when gaps exist.
- Page numbers are sorted and deduplicated before navigation.
- Invalid input returns to the first available page, and book boundaries remain enforced.
- Added the twenty-seventh test covering navigation across pages 10, 20, and 40.

## 1.4.109 - Czytnik odporny na nieciągłe dane stron

### PL
- Wybór strony korzysta teraz z jej rzeczywistego numeru zamiast pozycji w tablicy danych.
- Przy brakującym numerze wybierana jest najbliższa dostępna strona z przewidywalnym rozstrzyganiem remisów.
- Przypisywanie rozdziału działa również dla nieuporządkowanej listy rozdziałów.
- Zachowano awaryjną obsługę starszych danych stron bez jawnych numerów.
- Dodano dwudziesty szósty test dla nieciągłych, przemieszanych i niepełnych danych.

### EN
- Page selection now uses the actual page number instead of its array position.
- When a number is missing, the nearest available page is selected with predictable tie-breaking.
- Chapter assignment now also works with an unordered chapter list.
- Preserved fallback support for legacy page data without explicit numbers.
- Added the twenty-sixth test covering sparse, shuffled, and incomplete data.

## 1.4.108 - Podział strony 48 zabezpieczony w silniku

### PL
- Przeniesiono dzielenie strony 48 na wprowadzenie i tekst główny do reader-engine.js.
- Zachowano osobne znaczniki graniczne dla polskiej i angielskiej warstwy Pistis Sophii.
- Dodano bezpieczne zachowanie dla brakującego lub pustego znacznika: cały tekst pozostaje widoczny.
- Ta sama reguła zasila widok dodatków, tekst ciągły oraz aktywną stronę czytnika.
- Dodano dwudziesty piąty test chroniący obie części strony w obu językach.

### EN
- Moved page 48 splitting between introduction and main text to reader-engine.js.
- Preserved separate boundary markers for the Polish and English Pistis Sophia layers.
- Added safe behavior for missing or empty markers: the complete text remains visible.
- The same rule now feeds the addenda view, continuous text, and active reader page.
- Added the twenty-fifth test protecting both page halves in both languages.

## 1.4.107 - Granica dodatków i tekstu pilnowana przez silnik

### PL
- Przeniesiono rozpoznawanie stron dodatków Pistis Sophii do reader-engine.js.
- Ujednolicono wybór zakładki czytnika podczas nawigacji i renderowania.
- Strony 1–47 otwierają dodatki, a strona 48 i dalsze bezpiecznie wracają do rozdziałów.
- Pozostałe zakładki i inne księgi zachowują swój aktualny stan.
- Dodano dwudziesty czwarty test obejmujący granicę 47/48, własny próg i inne księgi.

### EN
- Moved Pistis Sophia addenda-page detection to reader-engine.js.
- Unified reader-tab selection during navigation and rendering.
- Pages 1–47 open the addenda, while page 48 and later safely return to chapters.
- Other tabs and other books preserve their current state.
- Added the twenty-fourth test covering the 47/48 boundary, a custom threshold, and other books.

## 1.4.106 - Plan renderowania czytnika wydzielony do silnika

### PL
- Przeniesiono wybór zakresu renderowania z app.js do testowalnej funkcji reader-engine.js.
- Tryb interlinearny otrzymuje zawsze plan aktywnej strony, niezależnie od księgi i panelu czytnika.
- Zachowano ciągłe widoki dla lekkich warstw polskich, źródłowych i koptyjskich tam, gdzie były dotychczas dostępne.
- Uproszczono rozgałęzienia renderReader i usunięto zbędne lokalne flagi trybów.
- Dodano dwudziesty trzeci test obejmujący plany renderowania wszystkich typów ksiąg i warstw.

### EN
- Moved rendering-scope selection from app.js to a testable reader-engine.js function.
- Interlinear mode always receives an active-page plan, regardless of book or reader panel.
- Preserved continuous views for lightweight Polish, source, and Coptic layers where previously available.
- Simplified renderReader branching and removed redundant local mode flags.
- Added the twenty-third test covering rendering plans for all book and layer types.

## 1.4.105 - Usunięto starą ścieżkę ciężkiej interlinii

### PL
- Usunięto nieużywany renderer ciągłej interlinii całej Ewangelii Tomasza.
- Uproszczono ciągły renderer koptyjski Pistis Sophii tak, aby nie mógł przełączyć się na interlinię całej księgi.
- Usunięto martwe style przeznaczone wyłącznie dla dawnego widoku ciągłego.
- Rozszerzono test regresji o kontrolę braku starej funkcji, parametru i selektorów CSS.
- Sposób renderowania aktywnej strony interlinearnej pozostaje zgodny z poprawką 1.4.104.

### EN
- Removed the unused continuous whole-book interlinear renderer for the Gospel of Thomas.
- Simplified the Pistis Sophia continuous Coptic renderer so it cannot switch into whole-book interlinear mode.
- Removed dead styles used only by the former continuous view.
- Extended the regression test to verify the legacy function, parameter, and CSS selectors are absent.
- Active-page interlinear rendering remains consistent with the 1.4.104 fix.

## 1.4.104 - Interlinia nie blokuje już interfejsu

### PL
- Naprawiono zawieszanie aplikacji po włączeniu trybu interlinearnego.
- Interlinia renderuje teraz wyłącznie aktywną stronę lub logion zamiast całej księgi jednocześnie.
- Ograniczono koszt przetwarzania dużej warstwy koptyjskiej Pistis Sophii i liczbę tworzonych elementów interfejsu.
- Pozostałe funkcje oraz przełączanie trybów pozostają dostępne bez oczekiwania na wygenerowanie pełnej księgi.
- Dodano dwudziesty drugi test chroniący przed ponownym włączeniem ciągłego renderowania interlinii.

### EN
- Fixed the application freeze after enabling interlinear mode.
- The interlinear view now renders only the active page or logion instead of the entire book at once.
- Reduced the processing cost of the large Pistis Sophia Coptic layer and the number of generated interface elements.
- Other functions and mode switching remain available without waiting for the full book to render.
- Added the twenty-second test preventing continuous whole-book interlinear rendering from returning.

## 1.4.103 - Tryby czytania uporządkowane w silniku

### PL
- Przeniesiono listę poprawnych trybów, wykrywanie dostępnych warstw i normalizację wyboru do reader-engine.js.
- Uwzględniono konfigurację każdej księgi oraz stan eksperymentalnego trybu interlinearnego.
- Nieznane tryby i duplikaty są odrzucane, a niedostępny wybór otrzymuje bezpieczną warstwę zastępczą.
- Ujednolicono także etykietę dostępnych warstw książki z regułami silnika.
- Dodano dwudziesty pierwszy test dla konfiguracji ksiąg, nieznanych trybów i interlinii.

### EN
- Moved the valid-mode list, available-layer detection, and mode normalization to reader-engine.js.
- Accounted for each book configuration and the experimental interlinear-mode state.
- Unknown modes and duplicates are rejected, while unavailable choices receive a safe fallback layer.
- Also aligned the book layer label with the engine rules.
- Added the twenty-first test covering book configuration, unknown modes, and interlinear availability.

## 1.4.102 - Nawigacja czytnika objęta wspólnym silnikiem

### PL
- Przeniesiono ograniczanie numeru strony i wybór strony sąsiedniej do reader-engine.js.
- Ujednolicono nawigację przyciskami głównymi, w trybie skupienia, na urządzeniach mobilnych i z klawiatury.
- Zabezpieczono czytnik przed wyjściem poza pierwszą i ostatnią stronę oraz przed niepoprawnymi numerami.
- Dodano dwudziesty test obejmujący granice książki, błędne dane i oba kierunki nawigacji.
- Nie zmieniono treści, układu ani sposobu zapisywania bieżącej strony.

### EN
- Moved page-number clamping and adjacent-page selection to reader-engine.js.
- Unified navigation across the main controls, focus mode, mobile controls, and keyboard.
- Protected the reader from moving beyond the first or last page and from invalid page values.
- Added the twentieth test covering book boundaries, invalid input, and both navigation directions.
- Reader content, layout, and current-page persistence remain unchanged.

## 1.4.101 - Struktura czytnika wydzielona do modułu

### PL
- Przeniesiono wybór strony, przypisywanie rozdziału, zakresy tematyczne i referencje rękopisu z app.js do reader-engine.js.
- Ujednolicono strony startowe: 48 dla Pistis Sophii oraz 1 dla pozostałych ksiąg.
- Zachowano obsługę paginacji Schwartze-Petermanna i specjalnego początku warstwy koptyjskiej Pistis Sophii.
- Dodano dziewiętnasty test obejmujący granice stron, rozdziały, zakresy i referencje.
- Nie zmieniono renderowania, nawigacji ani treści czytnika.

### EN
- Moved page selection, chapter assignment, thematic ranges, and manuscript references from app.js to reader-engine.js.
- Standardized start pages: 48 for Pistis Sophia and 1 for the remaining books.
- Preserved Schwartze-Petermann pagination and the special beginning of the Pistis Sophia Coptic layer.
- Added the nineteenth test covering page bounds, chapters, ranges, and references.
- Reader rendering, navigation, and content remain unchanged.

## 1.4.100 - Silnik cytowania wydzielony z czytnika

### PL
- Przeniesiono składanie etykiet referencyjnych i czterech formatów cytowania z app.js do citation-engine.js.
- Objęto jednym silnikiem Pistis Sophię, Ewangelię Tomasza i Ewangelię Filipa w języku polskim i angielskim.
- Zachowano obsługę paginacji Meada, oznaczeń Schwartze-Petermanna, logionów, sekcji, kodeksów i wersji biblioteki.
- Dodano osiemnasty test porównujący pełne wyniki cytowania dla wszystkich trzech ksiąg.
- Nie zmieniono treści ani wyglądu cytatów.

### EN
- Moved reference-label construction and all four citation formats from app.js to citation-engine.js.
- Unified Pistis Sophia, the Gospel of Thomas, and the Gospel of Philip in Polish and English under one engine.
- Preserved Mead pagination, Schwartze-Petermann markers, logia, sections, codices, and library version handling.
- Added an eighteenth test comparing complete citation output for all three books.
- Preserved citation content and appearance unchanged.

## 1.4.99 - Model tokenów interlinearnych wydzielony do modułu

### PL
- Przeniesiono normalizowanie tokenów interlinearnych, wybór klucza słownikowego i pobieranie tokenów z linii do interlinear-engine.js.
- Ujednolicono obsługę tokenów zapisanych jako tekst oraz jako obiekty z formą, lematem, typem gramatycznym i językiem.
- Zachowano pierwszeństwo lematu przy wyszukiwaniu i bezpieczny powrót do formy powierzchniowej.
- Dodano siedemnasty test dla tokenów, lematów, znaków diakrytycznych i dwóch sposobów tokenizacji linii.
- Nie zmieniono renderowania ani glos interlinii.

### EN
- Moved interlinear token normalization, dictionary-key selection, and line token extraction to interlinear-engine.js.
- Unified handling of plain-text tokens and objects containing surface form, lemma, grammatical type, and language.
- Preserved lemma-first lookup with a safe fallback to the surface form.
- Added a seventeenth test covering tokens, lemmas, diacritics, and both line-tokenization paths.
- Preserved interlinear rendering and glosses unchanged.

## 1.4.98 - Silnik wyszukiwania słownika wydzielony z interfejsu

### PL
- Przeniesiono ocenianie wyników słownikowych, analizę znaczeń i klasyfikację kompletności haseł z app.js do dictionary-engine.js.
- Oddzielono czystą logikę słownika od renderowania kart, tłumaczeń interfejsu i stanu czytnika.
- Zachowano dotychczasowe wagi wyszukiwania dla tokenu, transliteracji oraz krótkich znaczeń PL i EN.
- Dodano szesnasty test obejmujący ranking, czyszczenie oznaczeń DDGLC/CD, duplikaty znaczeń i statusy ready/basic/pending.
- Nie zmieniono wyglądu kart ani wyników wyszukiwania.

### EN
- Moved dictionary-result scoring, meaning analysis, and entry-completeness classification from app.js to dictionary-engine.js.
- Separated pure dictionary logic from card rendering, interface translations, and reader state.
- Preserved the existing search weights for tokens, transliteration, and short Polish and English meanings.
- Added a sixteenth test covering ranking, DDGLC/CD cleanup, duplicate meanings, and ready/basic/pending statuses.
- Preserved card appearance and search results unchanged.

## 1.4.97 - Rozpoznawanie form koptyjskich wydzielone do modułu

### PL
- Przeniesiono generowanie kandydatów słownikowych i rozpoznawanie rdzeni z app.js do coptic-lookup.js.
- Moduł obsługuje formy bezpośrednie, prefiksy, sufiksy oraz jednoczesne odcięcie prefiksu i sufiksu.
- Oddzielono dobór hasła od interfejsu, języka wyświetlania i stanu czytnika.
- Dodano piętnasty test wykorzystujący rzeczywiste formy koptyjskie i kontrolujący brak powtórzonych kandydatów.
- Nie zmieniono wyników słownika ani działania interlinii.

### EN
- Moved dictionary-candidate generation and root-form recognition from app.js to coptic-lookup.js.
- The module supports direct forms, prefixes, suffixes, and combined prefix-suffix removal.
- Separated entry selection from the interface, display language, and reader state.
- Added a fifteenth test using real Coptic forms and checking candidate deduplication.
- Preserved dictionary results and interlinear behaviour unchanged.

## 1.4.96 - Narzędzia tekstu koptyjskiego wydzielone do modułu

### PL
- Przeniesiono normalizowanie tokenów koptyjskich, transliterację, normalizowanie zapytań i ranking dopasowań z app.js do coptic-text-tools.js.
- Powiązano moduł z wcześniej wydzieloną konfiguracją alfabetu bez zależności od interfejsu czy stanu czytnika.
- Dodano testy konkretnych słów koptyjskich, znaków diakrytycznych, interpunkcji i różnych poziomów dopasowania wyszukiwania.
- Zwiększono zestaw zabezpieczeń do czternastu testów automatycznych.
- Nie zmieniono wyników słownika, transliteracji ani działania interlinii.

### EN
- Moved Coptic token normalization, transliteration, query normalization, and match ranking from app.js to coptic-text-tools.js.
- Connected the module to the previously extracted alphabet configuration without depending on the interface or reader state.
- Added tests for specific Coptic words, diacritics, punctuation, and multiple search-match levels.
- Expanded the regression suite to fourteen automated tests.
- Preserved dictionary results, transliteration, and interlinear behaviour unchanged.

## 1.4.95 - Parser historii zmian wydzielony do modułu

### PL
- Przeniesiono rozpoznawanie wersji, sekcji PL/EN, sortowanie i usuwanie duplikatów z app.js do changelog-tools.js.
- Pozostawiono renderowanie historii na stronie głównej i w pełnym widoku bez zmian.
- Dodano niezależny test parsera obejmujący kolejność wersji, treści dwujęzyczne, wpisy wspólne i duplikaty.
- Zwiększono zestaw zabezpieczeń do trzynastu testów automatycznych.
- Nie zmieniono wyglądu ani zawartości historii zmian.

### EN
- Moved version parsing, Polish/English sections, sorting, and deduplication from app.js to changelog-tools.js.
- Kept Home and full-history rendering unchanged.
- Added an independent parser test covering version order, bilingual content, shared entries, and duplicates.
- Expanded the regression suite to thirteen automated tests.
- Preserved the interface and change-history content unchanged.

## 1.4.94 - Wspólna warstwa bezpiecznego zapisu ustawień

### PL
- Dodano storage.js jako jedno miejsce obsługi ustawień, postępu czytania, notatek, zakładek i glos użytkownika.
- Przełączono 34 bezpośrednie operacje localStorage w app.js na wspólną warstwę zapisu bez zmiany nazw istniejących kluczy.
- Dodano pamięć awaryjną dla sesji, dzięki której aplikacja nie przerywa działania, gdy przeglądarka blokuje dostęp do localStorage.
- Dodano dwunasty test sprawdzający zapis, odczyt, usuwanie, zgodność kluczy i tryb awaryjny.
- Nie zmieniono zachowanych ustawień, wyglądu ani funkcji czytnika.

### EN
- Added storage.js as the single storage layer for settings, reading progress, notes, bookmarks, and user glosses.
- Routed 34 direct localStorage operations in app.js through the shared layer without renaming existing keys.
- Added an in-memory session fallback so the app continues working when browser storage access is blocked.
- Added a twelfth regression test covering reads, writes, removal, key compatibility, and fallback behaviour.
- Preserved saved settings, interface, and reader functionality unchanged.

## 1.4.93 - Awaryjny changelog wydzielony z logiki

### PL
- Przeniesiono pełną awaryjną kopię historii zmian z app.js do generowanego pliku changelog-fallback.js.
- Zmniejszono app.js z około 219 KB do około 189 KB bez zmiany wyświetlania historii online i offline.
- Zmieniono skrypt wydania tak, aby automatycznie odtwarzał plik awaryjny bezpośrednio z CHANGELOG.md.
- Dodano jedenasty test sprawdzający identyczność głównego i awaryjnego changelogu oraz kolejność ładowania.
- Nie zmieniono wyglądu ani funkcji czytnika.

### EN
- Moved the complete fallback change history from app.js to the generated changelog-fallback.js file.
- Reduced app.js from about 219 KB to about 189 KB without changing online or offline history rendering.
- Updated the release script to regenerate the fallback file directly from CHANGELOG.md.
- Added an eleventh regression test checking exact changelog equality and load order.
- Preserved the interface and reader functionality unchanged.

## 1.4.92 - Konfiguracja słownika koptyjskiego wydzielona z logiki

### PL
- Przeniesiono mapę transliteracji, ręczne glosy oraz reguły prefiksów i sufiksów z app.js do coptic-config.js.
- Pozostawiono funkcje słownika i interlinii bez zmian, ograniczając ryzyko regresji.
- Zmniejszono app.js z około 227 KB do około 219 KB i dodano nowy zasób do cache PWA.
- Dodano dziesiąty test zabezpieczający kompletność podstawowej konfiguracji koptyjskiej i kolejność jej ładowania.
- Nie zmieniono tłumaczeń, wyglądu, wyszukiwania słownikowego ani działania czytnika.

### EN
- Moved the transliteration map, manual glosses, and prefix/suffix rules from app.js to coptic-config.js.
- Kept dictionary and interlinear functions unchanged to minimize regression risk.
- Reduced app.js from about 227 KB to about 219 KB and added the new resource to the PWA cache.
- Added a tenth regression test covering core Coptic configuration completeness and load order.
- Preserved translations, interface, dictionary search, and reader behaviour unchanged.

## 1.4.91 - Treści konfiguracyjne oddzielone od logiki

### PL
- Przeniesiono teksty interfejsu PL/EN, opisy ksiąg, motywy, zakresy rozdziałów i zasady przekładu z app.js do app-content.js.
- Zmniejszono app.js z około 288 KB do około 227 KB, pozostawiając w nim głównie logikę działania.
- Dodano app-content.js do kolejności ładowania i cache PWA.
- Dodano dziewiąty test zabezpieczający kompletność konfiguracji i jej załadowanie przed app.js.
- Nie zmieniono wyglądu, tekstów, motywów ani funkcji czytnika.

### EN
- Moved Polish and English UI text, book descriptions, themes, chapter ranges, and translation principles from app.js to app-content.js.
- Reduced app.js from about 288 KB to about 227 KB, leaving it focused primarily on application logic.
- Added app-content.js to the load order and PWA cache.
- Added a ninth regression test covering configuration completeness and loading before app.js.
- Preserved the interface, text, themes, and reader functionality unchanged.

## 1.4.90 - Polskie tłumaczenia wydzielone z logiki aplikacji

### PL
- Przeniesiono kompletną polską warstwę Pistis Sophii z app.js do osobnego pliku books/pistis-sophia/polish-translations.js.
- Zmniejszono app.js z około 900 KB do około 288 KB bez zmiany treści tłumaczeń ani działania czytnika.
- Dodano ładowanie nowego pliku przed logiką aplikacji oraz obsługę tego zasobu w cache PWA.
- Dodano ósmy test zabezpieczający kompletność tłumaczeń, kolejność ładowania oraz dostępność wybranych stron.
- Nie zmieniono wyglądu, kolorów, motywów, cytowania ani nawigacji.

### EN
- Moved the complete Polish Pistis Sophia layer from app.js into books/pistis-sophia/polish-translations.js.
- Reduced app.js from about 900 KB to about 288 KB without changing translation content or reader behaviour.
- Added loading of the new file before application logic and included it in the PWA cache.
- Added an eighth regression test covering translation completeness, load order, and selected pages.
- Preserved the interface, colors, themes, citations, and navigation unchanged.

## 1.4.89 - Testy zabezpieczające i kontrola metadanych

### PL
- Dodano siedem automatycznych testów zabezpieczających składnię JavaScript, rejestr ksiąg, kluczowe elementy czytnika, tryby tekstu, motywy i historię zmian.
- Rozszerzono workflow o kontrolę wersji w library.json, books/index.json i package.json.
- Naprawiono niespójne numery 1.4.87 pozostawione w metadanych biblioteki i indeksie ksiąg.
- Usunięto z cache PWA odwołanie do nieistniejącego pliku, które mogło blokować instalację zasobów offline.
- Nie zmieniono wyglądu, kolorów, motywów ani działania czytnika.

### EN
- Added seven automated regression tests covering JavaScript syntax, the book registry, critical reader controls, reader modes, themes, and changelog continuity.
- Extended the release workflow to validate versions in library.json, books/index.json, and package.json.
- Fixed stale 1.4.87 version numbers left in the library metadata and book index.
- Removed a missing file reference from the PWA cache that could prevent offline shell installation.
- Preserved the reader interface, colors, themes, and behaviour unchanged.

## 1.4.88 - Automatyczny workflow wydań

### PL
- Dodano skrypt kontroli jakości, który sprawdza spójność numeru wersji, cache PWA, wymagane pliki i kodowanie UTF-8.
- Dodano automatyczne wykrywanie luk i powtórzeń w historii 25 najnowszych wersji.
- Dodano powtarzalne przygotowanie kolejnej wersji wraz z aktualizacją VERSION.json, changelogu i jego kopii awaryjnej.
- Dodano checklistę testów ręcznych przed publikacją oraz prosty plik kontrolny dla Windows.
- Nie zmieniono wyglądu, kolorów, motywów ani działania czytnika.

### EN
- Added a quality-check script that validates version consistency, the PWA cache, required files, and UTF-8 encoding.
- Added automatic detection of gaps and duplicates across the 25 latest changelog entries.
- Added repeatable preparation of the next release, including VERSION.json, changelog, and fallback changelog updates.
- Added a manual pre-publication checklist and a simple Windows check launcher.
- Preserved the reader interface, colors, themes, and behaviour unchanged.

## 1.4.87 - Naprawiona ciągłość wersji i historii zmian

### PL
- Podbito numer biblioteki do 1.4.87 we wszystkich wymaganych plikach aplikacji i pamięci podręcznej PWA.
- Naprawiono błędny opis wersji 1.4.82, który wskazywał numer 1.4.83 i tworzył pozorny przeskok w historii.
- Poprawiono awaryjną historię zmian w `app.js`: przywrócono osobne wpisy 1.4.85 i 1.4.86 oraz prawidłowy opis wersji 1.4.83.
- Zachowano ciągłość numeracji 1.4.82 → 1.4.83 → 1.4.84 → 1.4.85 → 1.4.86 → 1.4.87.
- Nie zmieniono wyglądu, kolorów, motywów ani działania czytnika.

### EN
- Updated the library version to 1.4.87 across all required application files and the PWA cache.
- Corrected the erroneous 1.4.82 description that referred to 1.4.83 and created an apparent version gap.
- Repaired the fallback changelog in `app.js`: restored separate 1.4.85 and 1.4.86 entries and the correct 1.4.83 description.
- Preserved consecutive numbering from 1.4.82 through 1.4.87.
- Preserved the interface, colors, themes, and reader behavior unchanged.

## 1.4.86 - Wyrównanie tekstu koptyjskiego

### PL
- Podłączono wyrównanie do lewej, justowanie i wyśrodkowanie do właściwych linii tekstu koptyjskiego.
- Element zawierający tekst koptyjski zajmuje teraz pełną szerokość kolumny, dzięki czemu wyśrodkowanie jest widoczne.
- Zachowano numerację linii, układ interfejsu, kolory i motywy bez zmian.

### EN
- Connected left alignment, justification, and centering to the actual Coptic text lines.
- The element containing Coptic text now spans the full text column, making centering visible.
- Preserved line numbering, interface layout, colors, and themes.

## 1.4.85 - Motyw stosowany przed pierwszym renderem

### PL
- Zapisany motyw jest odczytywany i ustawiany w sekcji `head`, zanim przeglądarka narysuje interfejs.
- Usunięto jasne mignięcie widoczne podczas pełnego przeładowania przy przełączaniu ksiąg.
- Zsynchronizowano atrybut motywu elementów `html` i `body` bez zmiany palety kolorów ani wyglądu.

### EN
- The saved theme is read and applied in the `head` before the browser paints the interface.
- Removed the bright flash visible during full page reloads when switching books.
- Synchronized the `html` and `body` theme attributes without changing the color palette or layout.

## 1.4.84 - Sidebar połączony z warstwą koptyjską Pistis Sophii

### PL
- Automatycznie przypisano wszystkie 148 rozdziałów Pistis Sophii do oznaczeń stron `P` Schwartzego–Petermanna odczytanych z warstwy angielskiej.
- Kliknięcie rozdziału w sidebarze w trybie koptyjskim lub interlinearnym przewija teraz bezpośrednio do odpowiadającej strony `P`.
- Aktywny rozdział i odpowiadająca mu strona koptyjska pozostają zaznaczone po nawigacji.
- Przy rozdziałach w sidebarze pokazano odpowiadające oznaczenie `P`.
- Zachowano ciągłość tekstu, wygląd, kolory, CSS i motywy bez zmian.

### EN
- Automatically mapped all 148 Pistis Sophia chapters to Schwartze–Petermann `P` page markers read from the English layer.
- Clicking a sidebar chapter in Coptic or interlinear mode now scrolls directly to the corresponding `P` manuscript page.
- The selected chapter and its corresponding Coptic page remain highlighted after navigation.
- Added the corresponding `P` marker to each Pistis Sophia chapter item in the sidebar.
- Preserved continuous reading, layout, colors, CSS, and themes unchanged.

## 1.4.83 - Ciągła warstwa koptyjska Pistis Sophii

### PL
- Przebudowano widok koptyjski Pistis Sophii tak, aby wyświetlał pełny tekst w nieprzerwanej kolejności stron rękopisu Schwartzego–Petermanna.
- Usunięto zależność ciągłości tekstu koptyjskiego od niepełnych znaczników stron `|…` w angielskim przekładzie Meada.
- Ten sam ciągły mechanizm zastosowano w widoku interlinearnym Pistis Sophii.
- Zachowano kolory, CSS, motywy i układ interfejsu bez zmian.
- Zachowano ciągłość numeracji 1.4.82 → 1.4.83.

### EN
- Rebuilt the Pistis Sophia Coptic view to display the complete text in uninterrupted Schwartze–Petermann manuscript-page order.
- Removed the dependency of Coptic-text continuity on incomplete `|…` page markers in Mead's English translation.
- Applied the same continuous mechanism to the Pistis Sophia interlinear view.
- Preserved all colors, CSS, themes, and interface layout.
- Preserved consecutive version numbering from 1.4.82 to 1.4.83.

## 1.4.82 - Pełna synchronizacja wersji i historii zmian

### PL
- Podbito numer biblioteki do 1.4.82 we wszystkich wymaganych plikach aplikacji, zasobach i pamięci podręcznej PWA.
- Uzupełniono brakujące wpisy 1.4.80 i 1.4.81, przywracając ciągłość numeracji 1.4.79 → 1.4.80 → 1.4.81 → 1.4.82.
- Sekcja „Ostatnie zmiany” pokazuje dokładnie 3 najnowsze wersje, a pełna historia dokładnie 25 najnowszych wersji.
- Nie zmieniono kolorów, CSS, motywów ani układu interfejsu.

### EN
- Updated the library version to 1.4.82 across all required application files, assets, and the PWA cache.
- Added the missing 1.4.80 and 1.4.81 entries, restoring continuity from 1.4.79 through 1.4.82.
- Recent changes displays exactly the 3 newest releases, while Full history displays exactly the 25 newest releases.
- Preserved all colors, CSS, themes, and interface layout.

## 1.4.81 - Przecinki w prostym aparacie cytowania

### PL
- Zmieniono separator prostego formatu cytowania z pionowej kreski na przecinek.
- Zachowano pozostałe formaty cytowania oraz wygląd i działanie aplikacji bez zmian.
- Zachowano ciągłość numeracji 1.4.80 → 1.4.81.

### EN
- Changed the simple citation separator from the vertical bar to a comma.
- Preserved the remaining citation formats and all application appearance and behavior.
- Preserved consecutive version numbering from 1.4.80 to 1.4.81.

## 1.4.80 - Uproszczony aparat cytowania

### PL
- Usunięto z prostych cytatów techniczną informację o użytej warstwie tekstowej.
- Cytaty zawierają teraz tylko tytuł księgi, jednostkę tekstu i nazwę biblioteki z numerem wersji.
- Zachowano ciągłość numeracji 1.4.79 → 1.4.80.

### EN
- Removed the technical text-layer information from simple citations.
- Citations now contain only the book title, textual unit, and library name with version number.
- Preserved consecutive version numbering from 1.4.79 to 1.4.80.

## 1.4.79 - Pionowy separator w aparacie cytowania

### PL
- Zmieniono separator w prostym formacie cytowania na pionową kreskę `|`.
- Zmiana obejmuje Pistis Sophię, Ewangelię Tomasza i Ewangelię Filipa w polskiej i angielskiej wersji interfejsu.
- Nie zmieniono kolorów, CSS, motywów, układu ani pozostałych funkcji aplikacji.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Changed the separator in the simple citation format to the vertical bar `|`.
- The change applies to Pistis Sophia, the Gospel of Thomas, and the Gospel of Philip in both interface languages.
- Preserved all colors, CSS, themes, layout, and other application functions.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.78 - Dwujęzyczna nazwa projektu

### PL
- Ustawiono nazwę **Biblioteka Gnozy** w polskiej wersji interfejsu oraz **Gnostic Library** w wersji angielskiej.
- Ujednolicono nazwę w nagłówku strony głównej, stopce, panelach Info, Kontakt, Prywatność i Wsparcie oraz w aparacie cytowania.
- Pozostawiono logo **GNOSTYK** bez zmian.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Set the project name to **Biblioteka Gnozy** in the Polish interface and **Gnostic Library** in the English interface.
- Unified the name across the Home heading, footer, Info, Contact, Privacy, and Support panels, and the citation apparatus.
- Preserved the **GNOSTYK** logo unchanged.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.77 - Ujednolicone przyciski strony głównej i typografia pełnej historii

### PL
- Ujednolicono kolory przycisków „Wróć do tekstu”, „Otwórz” i „Pełna historia” ze stonowanym stylem przycisku „Wesprzyj”.
- Dopasowano czcionkę, grubość, wysokość, padding i stany interakcji przycisku „Pełna historia” do pozostałych przycisków strony głównej.
- Zachowano odrębne kolory stanów normalny, hover, focus i aktywny dla motywów Dark, Light i Sepia.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Unified the “Return to text”, “Open”, and “Full history” button colors with the calmer Support-button style.
- Matched the Full history button font, weight, height, padding, and interaction states to the other Home-page buttons.
- Preserved distinct normal, hover, focus, and active colors for the Dark, Light, and Sepia themes.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.


## 1.4.76 - Ujednolicone przyciski strony głównej

### PL
- Ujednolicono przyciski „Wróć do tekstu”, „Otwórz” i „Pełna historia” ze stonowanym stylem przycisku „Wesprzyj”.
- Dopasowano typografię, wysokość, padding i stany interakcji przycisku „Pełna historia” do pozostałych przycisków strony głównej.
- Zachowano odrębne kolory dla motywów Dark, Light i Sepia.

### EN
- Unified the Return to text, Open, and Full history buttons with the calmer Support-button style.
- Matched the Full history typography, height, padding, and interaction states to the other Home-page buttons.
- Preserved separate colors for the Dark, Light, and Sepia themes.

## 1.4.75 - Globalnie przygaszone jasne teksty w motywie Dark

### PL
- Przygaszono wszystkie zbyt jasne teksty w motywie Dark we wszystkich zakładkach, panelach i widokach biblioteki.
- Ujednolicono tytuły ksiąg, kodeksów, kart, przycisków, etykiet, formularzy, sidebara i czytnika z jedną spokojniejszą paletą.
- Zachowano złote akcenty semantycznych nagłówków oraz czytelne stany aktywne, hover i focus.
- Nie zmieniono motywów Light i Sepia ani funkcjonalności aplikacji.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Softened every overly bright Dark-theme text color across all Library tabs, panels, and views.
- Unified book, codex, card, button, label, form, sidebar, and reader text with one calmer palette.
- Preserved semantic gold accents and clearly readable active, hover, and focus states.
- Preserved the Light and Sepia themes and all application functionality.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.74 - Przygaszone wszystkie poziomy nagłówków w motywie Dark

### PL
- Przygaszono kolory wszystkich standardowych nagłówków od H1 do H6 w motywie Dark.
- Wprowadzono stopniową hierarchię jasności, dzięki której nagłówki pozostają czytelne, ale nie świecą czystą bielą.
- Nie zmieniono kolorów motywów Light i Sepia ani działania czytnika.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Softened all standard heading levels from H1 through H6 in the Dark theme.
- Added a graduated brightness hierarchy so headings remain readable without appearing pure white.
- Preserved the Light and Sepia themes and all reader functionality.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.73 - Przygaszona hierarchia tekstu w motywie Dark

### PL
- Zmniejszono nadmierny kontrast białych tekstów w motywie Dark, zachowując pełną czytelność treści książek.
- Przygaszono etykiety przycisków, elementy nawigacji, opisy pomocnicze i tekst wtórny, aby nie konkurowały z treścią czytnika.
- Zachowano złote akcenty nagłówków oraz stany hover, focus i aktywne bez zmian funkcjonalnych i układowych.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Reduced excessive white contrast in the Dark theme while preserving full readability of book text.
- Softened button labels, navigation, helper copy, and secondary text so they no longer compete with the reader content.
- Preserved gold heading accents and all hover, focus, and active states without functional or layout changes.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.72 - Przywrócone wyrównanie tekstu w sidebarze

### PL
- Wrócono do stabilnej wersji 1.4.71 jako bazy, pomijając wadliwe zmiany wcześniejszej paczki 1.4.72.
- Przywrócono wyrównanie do lewej tytułów i opisów w sidebarze rozdziałów, motywów i zakładek.
- Ustawienia wyrównania tekstu książki nie wpływają już wizualnie na zawartość sidebara.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Returned to stable version 1.4.71 as the base, excluding the faulty changes from the previous 1.4.72 package.
- Restored left alignment for titles and descriptions in the chapters, themes, and bookmarks sidebar.
- Book text alignment settings no longer visually affect sidebar content.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.71 - Spójny przycisk wsparcia we wszystkich motywach

### PL
- Zestandaryzowano przycisk „Wesprzyj” na stronie głównej z pozostałymi przyciskami aplikacji.
- Dodano jednakowe stany normalny, hover, focus i aktywny, dzięki czemu obramowanie reaguje na najechanie kursorem.
- Dopasowano kolory przycisku do motywów Dark, Light i Sepia.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Standardized the Home-page Support button with the application's other buttons.
- Added matching normal, hover, focus, and active states so the border responds on pointer hover.
- Adapted the button colors to the Dark, Light, and Sepia themes.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.70 - Pasek czytnika dopasowany do jasnych motywów

### PL
- Dostosowano tło, obramowanie i cień przyklejanego paska czytnika do motywów Light i Sepia.
- Pasek korzysta teraz z tych samych jasnych powierzchni i kolorów obramowań co pozostałe panele aktywnego motywu.
- Zachowano dotychczasowy wygląd motywu Dark oraz pełne działanie nawigacji, języków, cytowania, kopiowania, Dodatków i kontrolek wyrównania.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Adapted the sticky reader toolbar background, border, and shadow to the Light and Sepia themes.
- The toolbar now uses the same light surfaces and border colors as the other panels in the active theme.
- Preserved the existing Dark-theme appearance and all navigation, language, citation, copy, Addenda, and alignment functions.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.69 - Spójne obramowanie kontrolek wyrównania

### PL
- Usunięto stałą złotą ramkę otaczającą grupę ikon wyrównania tekstu.
- Nieaktywne ikony korzystają teraz z takiego samego cienkiego obramowania jak pozostałe przyciski paska czytnika.
- Kolor akcentu pojawia się dopiero po najechaniu, ustawieniu fokusu lub wybraniu aktywnego sposobu wyrównania.
- Dostosowano stany normalny, hover, focus i aktywny do motywów Dark, Light i Sepia.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Removed the permanent gold frame surrounding the text-alignment icon group.
- Inactive icons now use the same thin border as the other reader-toolbar buttons.
- The accent border appears only on hover, keyboard focus, or the active alignment mode.
- Matched normal, hover, focus, and active states to the Dark, Light, and Sepia themes.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.68 - Kontrolki wyrównania dopasowane do motywów

### PL
- Usunięto kontrastującą białą ramkę pojawiającą się wokół kontrolek wyrównania tekstu.
- Stany aktywny, hover i focus korzystają teraz z kolorów właściwych dla motywów Dark, Light i Sepia.
- Zachowano widoczny, dostępny fokus klawiatury bez obcego dla motywu białego obramowania.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Removed the contrasting white frame displayed around the text-alignment controls.
- Active, hover, and focus states now use colors appropriate to the Dark, Light, and Sepia themes.
- Preserved a visible keyboard focus indicator without a theme-inconsistent white outline.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.67 - Sterowanie wyrównaniem tekstu na pasku czytnika

### PL
- Dodano trzy intuicyjne ikony wyrównania tekstu: do lewej, justowanie i wyśrodkowanie.
- Sterowanie jest dostępne w przyklejanym pasku czytnika we wszystkich książkach.
- Wybrany sposób wyrównania jest zapamiętywany lokalnie i przywracany po ponownym uruchomieniu biblioteki.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Added three intuitive text-alignment controls: left, justified, and centered.
- The controls are available in the sticky reader toolbar for every book.
- The selected alignment is stored locally and restored when the library is opened again.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.66 - Przyklejany pasek narzędzi czytnika

### PL
- Dodano wspólny, przyklejany pasek narzędzi czytnika dla wszystkich książek biblioteki.
- Nawigacja stron, wybór języka i trybu tekstu, format cytowania, kopiowanie fragmentu oraz Dodatki pozostają dostępne podczas przewijania.
- Pasek korzysta z kolorów aktywnego motywu i ma kompaktowy układ na urządzeniach mobilnych.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Added a shared sticky reader toolbar for every book in the library.
- Page navigation, language and text-mode selection, citation format, copy action, and Addenda remain available while scrolling.
- The toolbar follows the active theme and uses a compact layout on mobile devices.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.65 - Poprawiona klasyfikacja nagłówków i narracji

### PL
- Udoskonalono parser polskiego tekstu Pistis Sophii, rozdzielając prawdziwe nagłówki, śródtytuły redakcyjne i zwykłą narrację.
- Cytaty oraz wypowiedzi rozpoczynające się znakami cudzysłowu nie są już błędnie stylizowane jak nagłówki.
- Śródtytuły takie jak „Maria interpretuje słowa Jezusa” i „Jezus pochwala Mateusza” są ponownie rozpoznawane jako elementy redakcyjne.
- Zachowano poprawną klasyfikację numerowanych wersetów i list wprowadzoną w wersji 1.4.64.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Refined the Polish Pistis Sophia parser to distinguish genuine headings, editorial rubrics, and ordinary narrative.
- Quotations and speech lines beginning with quotation marks are no longer incorrectly styled as headings.
- Editorial rubrics such as “Mary interprets the words of Jesus” and “Jesus praises Matthew” are again recognized as editorial elements.
- Preserved the correct numbered-verse and list classification introduced in version 1.4.64.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.64 - Poprawna klasyfikacja numerowanych wersetów i list

### PL
- Poprawiono parser polskiego tekstu Pistis Sophii: akapity rozpoczynające się numerem, takie jak wersety Psalmów, nie są już rozpoznawane jako nagłówki.
- Numerowane cytaty i listy zachowują zwykłą typografię tekstu, justowanie oraz prawidłowe odstępy między akapitami.
- Prawdziwe nagłówki rozdziałów, ksiąg i śródtytułów pozostają bez zmian.
- Uzupełniono brakujący wpis 1.4.62, przywracając pełną ciągłość 1.4.61 → 1.4.62 → 1.4.63 → 1.4.64.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.

### EN
- Fixed the Polish Pistis Sophia parser so paragraphs beginning with a number, such as Psalm verses, are no longer classified as headings.
- Numbered quotations and lists now retain normal body typography, justification, and paragraph spacing.
- Genuine chapter, book, and editorial headings remain unchanged.
- Added the missing 1.4.62 entry, restoring full continuity from 1.4.61 through 1.4.64.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.

## 1.4.63 - Naprawa uszkodzonych polskich znaków

### PL
- Na podstawie pełnego audytu poprawiono wszystkie potwierdzone przypadki, w których polskie litery zostały zastąpione znakiem `?`.
- Naprawiono polski tekst Pistis Sophii i Dodatków oraz metadane Ewangelii Filipa, bez zmiany prawidłowych znaków zapytania i składni JavaScript.
- Zweryfikowano kodowanie UTF-8 oraz brak znaków zastępczych Unicode w plikach tekstowych.
- Zachowano standard historii: 3 najnowsze wersje w „Ostatnich zmianach” i 25 w pełnej historii.
- Zachowano ciągłość numeracji 1.4.62 → 1.4.63.

### EN
- Corrected every confirmed case found by the full audit where a Polish letter had been replaced by `?`.
- Repaired the Polish Pistis Sophia text and addenda, plus Gospel of Philip metadata, without altering valid question marks or JavaScript optional-chaining syntax.
- Verified UTF-8 decoding and the absence of Unicode replacement characters in text files.
- Preserved the changelog standard: 3 latest releases in Recent changes and 25 in Full history.
- Preserved consecutive version numbering from 1.4.62 to 1.4.63.

## 1.4.62 - Pierwsza korekta uszkodzonych polskich znaków

### PL
- Na podstawie pierwszego audytu poprawiono potwierdzone przypadki utraconych polskich liter w Pistis Sophii, Dodatkach i metadanych Ewangelii Filipa.
- Zachowano prawidłowe znaki zapytania i składnię JavaScript.
- Zweryfikowano kodowanie UTF-8 oraz brak znaku zastępczego Unicode.
- Zachowano ciągłość numeracji 1.4.61 → 1.4.62.

### EN
- Corrected confirmed missing Polish letters found by the first audit in Pistis Sophia, its addenda, and Gospel of Philip metadata.
- Preserved valid question marks and JavaScript syntax.
- Verified UTF-8 encoding and the absence of Unicode replacement characters.
- Preserved consecutive version numbering from 1.4.61 to 1.4.62.

## 1.4.61 - Standard publikacyjny historii zmian

### PL
- Zachowano wszystkie poprawki z wersji 1.4.60, w tym znormalizowane odstępy znaczników stron.
- Ustalono stałą zasadę: sekcja „Ostatnie zmiany” pokazuje dokładnie 3 najnowsze wersje.
- Pełna historia zmian pokazuje dokładnie 25 najnowszych wersji, zarówno online, jak i offline.
- Ujednolicono numer wersji we wszystkich plikach aplikacji i zachowano ciągłość 1.4.60 → 1.4.61.

### EN
- Preserved all fixes from version 1.4.60, including normalized page-marker spacing.
- Established a permanent rule: Recent changes displays exactly the 3 newest releases.
- Full history displays exactly the 25 newest releases, both online and offline.
- Unified the version number across all application files and preserved continuity from 1.4.60 to 1.4.61.

## 1.4.60 - Poprawione odstępy znaczników stron

### PL
- Usunięto nadmierny odstęp powstający pomiędzy końcem akapitu a znacznikiem strony.
- Ujednolicono marginesy kontenerów stron i znaczników `STRONA / PAGE` w ciągłym czytniku.
- Zachowano strukturę rozdziałów, akapitów i nawigację z sidebara.
- Zachowano ciągłość numeracji 1.4.59 → 1.4.60.

### EN
- Removed excessive spacing between the end of a paragraph and the page marker.
- Unified page-section and `STRONA / PAGE` marker margins in the continuous reader.
- Preserved chapter structure, paragraphs, and sidebar navigation.
- Preserved consecutive version numbering from 1.4.59 to 1.4.60.

## 1.4.59 - Normalizacja paginacji czytnika

### PL
- Znormalizowano odstępy nad i pod znacznikami stron w czytniku.
- Wyśrodkowano oznaczenia `STRONA / PAGE` i dostosowano ich kolor do aktywnego motywu.
- Zachowano jednolity wygląd paginacji w tekstach biblioteki.
- Zachowano ciągłość numeracji 1.4.58 → 1.4.59.

### EN
- Normalized spacing above and below page markers in the reader.
- Centered `STRONA / PAGE` labels and adapted their color to the active theme.
- Preserved consistent pagination styling across library texts.
- Preserved consecutive version numbering from 1.4.58 to 1.4.59.

## 1.4.58 - Trzy ostatnie zmiany na stronie głównej

### PL
- Ograniczono sekcję „Ostatnie zmiany” na stronie głównej do dokładnie 3 najnowszych wersji.
- Starsze wpisy pozostawiono dostępne w pełnej historii zmian.
- Zachowano ciągłość numeracji 1.4.57 → 1.4.58.

### EN
- Limited the home-page Recent changes section to exactly the 3 newest releases.
- Older entries remain available in the full change history.
- Preserved consecutive version numbering from 1.4.57 to 1.4.58.
