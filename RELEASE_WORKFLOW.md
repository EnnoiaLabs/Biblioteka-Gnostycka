# Powtarzalny workflow wydań

`VERSION.json` jest jedynym źródłem prawdy o aktualnym numerze. Skrypt
`tools/release.py` pilnuje pozostałych miejsc i zatrzymuje wydanie, jeśli
wykryje rozjazd, lukę w historii lub uszkodzone kodowanie.
Projekt ma jedną numerację wersji i dwie warstwy historii. `CHANGELOG.md`
zachowuje każde wydanie techniczne, a `PUBLIC_CHANGELOG.md` zawiera wyłącznie
kamienie milowe istotne dla czytelników i jest wyświetlany w aplikacji.
Kontrola uruchamia też `tools/check-pwa.js`, który sprawdza manifest, ikony,
rejestrację service workera, numer cache oraz kompletność `APP_SHELL`.
`tools/check-performance.js` mierzy lokalne zasoby ładowane na starcie i
zatrzymuje wydanie po przekroczeniu limitów z `performance-budgets.json`.
Materiały źródłowe wymienione w `release-exclusions.json` pozostają w projekcie,
ale trafiają poza ZIP wyłącznie wtedy, gdy strażnik potwierdzi brak odwołań.
`book-loader.js` uruchamia tylko dane aktualnie wybranej księgi. Strażniki PWA
i wydajności odczytują jego mapę zasobów, dzięki czemu kontrolują każdy wariant
startu oraz kompletność cache offline.
Decyzje przekładowe *Pistis Sophii* chroni dodatkowo rejestr
`books/pistis-sophia/translation-decisions.json` i test opisany w
`TRANSLATION_GUARDIAN.md`. Wydanie zostaje zatrzymane, gdy decyzja nie zawiera
źródeł, podstawy koptyjskiej, uzasadnienia i przypisu albo gdy tekst narusza
zatwierdzone brzmienie.

## 1. Przed rozpoczęciem zmiany

Zachowaj ostatni stabilny ZIP. Pracuj na jego rozpakowanej kopii i określ jeden
zakres wydania — nie łącz niezwiązanych poprawek.

## 2. Po wykonaniu zmiany

Uruchom kontrolę bieżącej wersji:

```bash
python tools/release.py check
```

Następnie przygotuj kolejną wersję. Każdy `--pl` i `--en` dodaje osobny punkt
historii zmian:

```bash
python tools/release.py prepare \
  --title-pl "Krótki tytuł wydania" \
  --title-en "Short release title" \
  --slug "krotka-nazwa-zmiany" \
  --release-type technical \
  --pl "Opis pierwszej zmiany." \
  --pl "Opis drugiej zmiany." \
  --en "Description of the first change." \
  --en "Description of the second change."
```

`technical` jest wartością domyślną: wpis trafia tylko do pełnego archiwum.
Gdy wydanie dodaje księgę, funkcję albo inną zmianę zauważalną dla czytelnika,
użyj `--release-type public`. Taki wpis trafia również do historii w aplikacji:

```bash
python tools/release.py prepare \
  --version 1.5.0 \
  --release-type public \
  --title-pl "Nowa funkcja dla czytelników" \
  --title-en "New reader-facing feature" \
  --slug "reader-feature" \
  --pl "Opis widocznej zmiany." \
  --en "Description of the visible change."
```

Numer pozostaje wspólny. Zwykłe poprawki techniczne zwiększają patch, a większe
publiczne funkcje mogą zwiększać minor, np. `1.4.124` → `1.5.0`.

Bez `--version` skrypt zwiększa ostatni człon numeru, np. `1.4.87` → `1.4.88`.
Skrypt aktualizuje `VERSION.json`, bieżący numer w aplikacji, cache PWA i
`CHANGELOG.md`. Dla wydania publicznego aktualizuje też `PUBLIC_CHANGELOG.md`
oraz jego kopię awaryjną, po czym ponownie uruchamia kontrolę.

Po krótkim teście ręcznym utwórz gotowy pakiet:

```bash
python tools/release.py package
```

Polecenie ponownie uruchamia pełną bramkę jakości, tworzy czysty ZIP w katalogu
`dist` i zapisuje obok plik `.sha256`. Z archiwum automatycznie wykluczane są
pliki robocze, `node_modules`, cache Pythona, repozytorium Git i sam katalog
wynikowy. ZIP powstaje najpierw jako plik tymczasowy; przed opublikowaniem skrypt
sprawdza jego integralność i obecność wszystkich wymaganych plików. Nieudane
pakowanie nie nadpisuje ostatniego poprawnego archiwum.

Archiwum jest deterministyczne: pliki mają stałą kolejność, czas i uprawnienia.
Ponowne spakowanie niezmienionej wersji powinno dać identyczną sumę SHA-256.
Obok paczki powstaje również plik `.release.json` z numerem i datą wersji,
zakresem zmiany, nazwą oraz sumą archiwum, liczbą plików i listą wymaganych
elementów. Jest to maszynowo czytelny raport z pakowania.

## 3. Przed publikacją

Wykonaj wszystkie punkty z `RELEASE_CHECKLIST.md`. Automatyczna kontrola chroni
spójność plików, ale nie zastępuje krótkiego testu wizualnego i funkcjonalnego.
Najpierw uruchom końcowy audyt deterministyczności i zawartości paczki:

```bash
python tools/release.py audit
```

Po jednorazowym `npm install` uruchom test w prawdziwym Chromium:

```bash
npm run test:browser
```

W CI lub niestandardowym środowisku można wskazać istniejącą przeglądarkę przez
zmienną `GNOSTYK_BROWSER_EXECUTABLE`.

## 4. Polecenie dla AI

Przy kolejnej pracy wystarczy przekazać najnowszy ZIP i napisać:

> Wprowadź tę zmianę i przygotuj kolejną wersję zgodnie z RELEASE_WORKFLOW.md.

AI powinno najpierw wykonać kontrolę, zmienić tylko uzgodniony zakres, uruchomić
kontrolę końcową i użyć `release.py package`, aby zwrócić prawidłowo nazwany ZIP
wraz z raportem i sumą SHA-256.
