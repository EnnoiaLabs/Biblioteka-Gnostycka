# Changelog

## 1.4.8 - Changelog and navigation cleanup

### PL
- Uporządkowano historię zmian: drugi wpis 1.4.6 oznaczono jako 1.4.5, a lista scala duplikaty wersji.
- Sekcja Ostatnie zmiany na stronie Home korzysta teraz z changeloga, zachowuje kolejność i pokazuje najnowszą wersję.
- Przełożono pasek nawigacji strony głównej do układu Home, Księgi, Słownik, Narzędzia, Prywatność, Zmiany, Kontakt, Info, Ustawienia, Wsparcie.
- Ukryty tryb interlinearny nie zostawia już pustego segmentu w przełączniku wersji tekstu.

### EN
- Cleaned up the change history: the second 1.4.6 entry is now marked as 1.4.5, and duplicate versions are merged.
- The Recent changes section on Home now uses the changelog, preserves order, and shows the latest version.
- Reordered the home navigation bar to Home, Books, Dictionary, Tools, Privacy, Changes, Contact, Info, Settings, Support.
- The hidden interlinear mode no longer leaves an empty segment in the text-version switcher.

## 1.4.7 - Experimental interlinear toggle

### PL
- Przywrócono pracę do stabilnej bazy 1.4.6 i rozpoczęto dalszą numerację od wersji 1.4.7.
- Ukryto interlinię z głównych przełączników czytania.
- Dodano w Ustawieniach opcję pokazania interlinii jako trybu eksperymentalnego; po wyłączeniu zapisany tryb interlinearny wraca automatycznie do tekstu polskiego.

### EN
- Restored the work to the stable 1.4.6 base and continued numbering from version 1.4.7.
- Hid the interlinear mode from the main reading switches.
- Added a Settings option to show interlinear as an experimental mode; when disabled, a saved interlinear mode automatically falls back to the Polish text.

## 1.4.6

### PL
- Dodano nową sekcję Kontakt w nawigacji biblioteki i stopce.
- Dodano klikalny adres e-mail `gnostyk950@gmail.com` do zgłaszania błędów, literówek, problemów z tłumaczeniem oraz opinii.
- Dodano pełną lokalizację PL/EN dla panelu kontaktowego.

### EN
- Added a new Contact section to the library navigation and footer.
- Added a clickable email address `gnostyk950@gmail.com` for bug reports, typos, translation issues, and feedback.
- Added full PL/EN localization for the contact panel.

## 1.4.5

### PL
- Zmieniono separatory w Ustawieniach i Narzędziach na subtelne linie zgodne ze stylem paneli Biblioteki.
- Ujednolicono kolor linii dla motywu ciemnego, jasnego i sepia.

### EN
- Replaced Settings and Tools separators with subtle lines matching the Library panel style.
- Unified separator colors for dark, light, and sepia themes.

## 1.4.4
- Ujednolicono Ustawienia i Narzędzia ze stylem Słownika we wszystkich motywach.
- Dodano tryb gramatyczny interlinii i jawne etykiety lemat/typ przy tokenach koptyjskich.
- Zestandaryzowano checkboxy i kontrolki formularzy do koloru aktywnego motywu.

## 1.4.3

### PL
- Przebudowano panel Ustawień tak, aby wizualnie pasował do reszty Biblioteki Gnozy: sekcje są oddzielone separatorami zamiast ciężkich ramek.
- Ustawienie języka działa teraz jako domyślny język uruchamiania aplikacji, a przełącznik PL/EN pozostaje szybką zmianą bieżącej sesji.
- Zastąpiono niebieskie checkboxy kontrolkami dopasowanymi do aktualnego motywu.
- Ustawienia rozmiaru tekstu, odstępów, szerokości kolumny i interlinii są stosowane także w widokach koptyjskim i interlinearnym.

### EN
- Reworked the Settings panel so it visually matches the rest of Gnostyk Library, using separators instead of heavy nested boxes.
- The language setting now controls the default startup language, while the PL/EN switch remains a quick change for the current session.
- Replaced blue checkboxes with theme-matched controls.
- Text size, spacing, column width, and interlinear settings now also apply to the Coptic and interlinear views.

## 1.4.1

### PL
- Dodano ustawienia interlinii Tomasza: tryb kompaktowy, klasyczny i rozszerzony.
- Dodano przełączniki pokazywania lematu i typu gramatycznego w tokenach interlinearnych.
- Dodano wybór zakresu wystąpień w karcie słownikowej: aktywna księga albo cała biblioteka.
- Na stronie Home sekcja „Ostatnie zmiany” pokazuje teraz tylko trzy najnowsze wpisy; pełna historia pozostaje pod przyciskiem.

### EN
- Added Thomas interlinear settings: compact, classic, and expanded modes.
- Added toggles for showing lemma and grammatical type in interlinear tokens.
- Added dictionary occurrence scope: active book or whole library.
- On Home, “Recent changes” now shows only the three latest entries; full history remains available through the button.

## 1.4.0

### PL
- Dodano etap 3 interlinii Tomasza: wyszukiwanie po lemacie, linki do wystąpień i wyróżnianie tego samego słowa w całym ciągłym tekście.
- Wystąpienia w karcie słownikowej korzystają teraz z formy i lematu tokenu, a nie tylko z surowego tekstu w linii.

### EN
- Added Thomas interlinear stage 3: lemma search, occurrence links, and highlighting of the same word across the continuous text.
- Dictionary-card occurrences now use token forms and lemmas, not only raw line text.

## 1.3.9

### PL
- Dodano etap 2 interlinii Tomasza: tokeny zachowują teraz formę koptyjską, lemat i typ gramatyczny z warstwy Coptic SCRIPTORIUM.
- Kliknięcie słowa w interlinii otwiera kartę słownikową po lemacie, gdy jest dostępny, a nie tylko po formie powierzchniowej.
- Dodano subtelną linię lematu pod tokenem interlinearnym i ujednolicono podświetlanie wystąpień dla form oraz lematów.

### EN
- Added Thomas interlinear stage 2: tokens now preserve the Coptic surface form, lemma, and grammatical type from the Coptic SCRIPTORIUM layer.
- Clicking an interlinear word opens the dictionary card by lemma when available, not only by surface form.
- Added a subtle lemma line below interlinear tokens and normalized occurrence highlighting for forms and lemmas.

## 1.3.8

### PL
- Podbito numer wersji w całej aplikacji, plikach PWA, odnośnikach do zasobów i historii zmian.
- Dodano najnowszy wpis do widocznej historii zmian na stronie Home oraz w zakładce Zmiany.
- Uzupełniono angielskie wersje najnowszych wpisów changeloga, aby tryb EN nie pokazywał polskich punktów.

### EN
- Synchronized the version number across the app, PWA files, asset links, and the change history.
- Added the latest entry to the visible change history on Home and in the Changes tab.
- Completed the English versions of the latest changelog entries so EN mode no longer shows Polish points.

## 1.3.7

### PL
- Przebudowano tryb interlinearny Ewangelii Tomasza na jeden ciągły tekst logionów 1–114.
- Kliknięcie logionu w sidebarze przewija do odpowiedniego miejsca również w interlinii.
- Uproszczono wizualnie bloki słów interlinearnych, aby lepiej pasowały do ciągłego czytnika.

### EN
- Rebuilt the Gospel of Thomas interlinear mode as one continuous text covering logia 1–114.
- Clicking a logion in the sidebar now scrolls to the matching place in the interlinear view as well.
- Simplified the visual style of interlinear word blocks so they fit the continuous reader better.

## 1.3.6

### PL
- Karta słownikowa działa kontekstowo dla aktywnej księgi. W module Ewangelii Tomasza pokazuje wystąpienia z Tomasza, logiony i bieżący logion zamiast pozycji z Pistis Sophii.
- Uogólniono opis wspólnego słownika Biblioteki Gnozy.

### EN
- The dictionary card now follows the active book. In the Gospel of Thomas module it shows Thomas occurrences, logia and the current logion instead of Pistis Sophia positions.
- Generalized the shared Gnostyk Library dictionary note.


## 1.3.5

### PL
- Widok koptyjski Ewangelii Tomasza pokazuje teraz ciągły tekst wszystkich 114 logionów.
- Kliknięcie logionu w sidebarze przewija do odpowiedniego miejsca w ciągłym tekście koptyjskim.
- Aparat cytowania Tomasza używa logionów i Nag Hammadi Codex II zamiast paginacji Meada / Schwartze-Petermanna.

### EN
- The Gospel of Thomas Coptic view now shows the continuous text of all 114 logia.
- Clicking a logion in the sidebar scrolls to the matching place in the continuous Coptic text.
- Thomas citation now uses logion numbers and Nag Hammadi Codex II instead of Mead / Schwartze-Petermann pagination.

## 1.3.4
- Naprawiono podłączenie zmiennej warstwy koptyjskiej Ewangelii Tomasza po przełączeniu księgi.
- Wymuszono użycie modułu `books/gospel-of-thomas/coptic-data.js` dla widoku Koptyjski.

## 1.3.4

### PL
- Naprawiono podłączenie koptyjskiej warstwy Ewangelii Tomasza: parser obsługuje przestrzeń nazw TEI/XML z Coptic SCRIPTORIUM.
- Zsynchronizowano widok Koptyjski z logionami 1–114.
- Wyłączono tryb Interlinia dla Tomasza do czasu etapu 2, aby aplikacja nie sugerowała gotowej interlinii słowo po słowie.

### EN
- Fixed the Gospel of Thomas Coptic layer connection: the parser now handles the TEI/XML namespace used by Coptic SCRIPTORIUM.
- Synchronized Coptic mode with logia 1–114.
- Disabled the Thomas interlinear mode until stage 2 so the app does not imply a completed word-by-word interlinear layer.

## 1.3.0

### PL
- Dodano warstwę koptyjską Ewangelii Tomasza z otwartej edycji Coptic SCRIPTORIUM.
- Przygotowano techniczne źródło warstwy koptyjskiej dla logionów Tomasza.
- Zaktualizowano metadane, prawa, źródła i aparat cytowania Tomasza o Coptic SCRIPTORIUM / CC-BY 4.0.

### EN
- Added the Coptic layer for the Gospel of Thomas from the open Coptic SCRIPTORIUM edition.
- Prepared the technical source for the Coptic layer of Thomas logia.
- Updated Thomas metadata, rights, sources and citation apparatus with Coptic SCRIPTORIUM / CC-BY 4.0.


## 1.2.4

PL:
- Uporządkowano listę Codex II: każda pozycja jest osobnym wierszem bez kropek listy.
- Dodano statusy po prawej stronie pozycji oraz efekt hover dla dostępnej Ewangelii Tomasza.
- Zachowano zwykły kursor zamiast kursora-rączki.

EN:
- Organized the Codex II list: each entry is now a separate row without list bullets.
- Added right-aligned statuses and hover feedback for the available Gospel of Thomas entry.
- Kept the default cursor instead of the hand pointer.

## 1.2.3

PL:
- Wyrównano położenie przycisków w kafelkach Home, aby akcje były w jednej linii niezależnie od długości opisu.
- Uporządkowano układ kart startowych bez zmiany dolnego paska nawigacji.

EN:
- Aligned Home card action buttons so they sit consistently regardless of description length.
- Cleaned up the start-card layout without changing the bottom navigation bar.

## 1.2.2

PL:
- Usunięto dużą ikonę książki z kafelka na stronie Home.
- Dodano subtelne, jednolite ikony Material Symbols w kafelkach Home.
- Ikony dziedziczą kolor z aktualnego motywu strony i nie są kolorowymi emoji.

EN:
- Removed the large book icon from the Home card.
- Added subtle, consistent Material Symbols icons to the Home cards.
- Icons inherit their color from the current theme and are not colored emoji.

## 1.2.1

PL:
- Poprawiono przycisk „Wróć do ostatniego tekstu”, aby otwierał ostatnio przeglądaną księgę i zapamiętaną pozycję zamiast katalogu.
- Usunięto dublowanie funkcji „Przeglądaj bibliotekę” na karcie kontynuacji pracy.
- Naprawiono parser changeloga: tryb EN rozpoznaje nagłówki „EN:” i nie pokazuje polskich punktów jako ostatnich zmian.

EN:
- Fixed the “Return to the last text” button so it opens the last viewed book and saved position instead of the catalogue.
- Removed the duplicated “Browse library” behavior from the continue-work card.
- Fixed the changelog parser: EN mode now recognizes “EN:” headings and no longer shows Polish points as the latest changes.

## 1.2.0

PL:
- Przebudowano stronę Home: nie jest już drugim katalogiem ksiąg, tylko ekranem startowym ze statystykami, ostatnio dodanym tekstem, wsparciem i ostatnimi zmianami.
- Usunięto zdublowane kafelki ksiąg z zakładki Księgi; katalog kodeksów pozostaje głównym miejscem otwierania tekstów.
- Ujednolicono przyciski na „Otwórz” i przygotowano widoczny licznik odwiedzin pod zewnętrzne API licznika prywatnościowego.

EN:
- Reworked the Home page: it is no longer a second book catalogue, but a start screen with stats, recently added text, support and recent changes.
- Removed duplicated book tiles from the Books tab; the codex catalogue remains the main place for opening texts.
- Standardized buttons to “Open” and prepared a visible visit counter for a privacy-friendly external counter API.

## 1.1.5
- Rozdzielono motywy tematyczne ksiąg: Ewangelia Tomasza nie korzysta już z motywów Pistis Sophii.
- Dodano osobne zestawy motywów dla Pistis Sophii i Ewangelii Tomasza.
- Przygotowano pliki `themes.json` w modułach ksiąg jako fundament pod pełną niezależność metadanych kolejnych tekstów.

## 1.1.4

PL:
- Dostosowano aparat cytowania Ewangelii Tomasza: opcje Meada i Schwartze-Petermanna nie są już pokazywane jako właściwe dla Tomasza; zastępują je logion i źródła.
- Zmieniono nazwę polskiej warstwy na „Polskie opracowanie Dariusza Kaniewskiego z wykorzystaniem narzędzi AI”.
- Poprawiono stronę Home: kafelek Pistis Sophia prowadzi do Pistis Sophii, kafelek Tomasza prowadzi do Ewangelii Tomasza.
- Ujednolicono ikonę przy Ewangelii Tomasza z ikoną używaną przy Pistis Sophii.

EN:
- Adjusted the Gospel of Thomas citation apparatus: Mead and Schwartze-Petermann are no longer presented as Thomas-specific options; they are replaced by logion and sources.
- Renamed the Polish layer as “Dariusz Kaniewski’s Polish AI-assisted adaptation”.
- Fixed the Home page: the Pistis Sophia card opens Pistis Sophia and the Thomas card opens the Gospel of Thomas.
- Unified the Gospel of Thomas icon with the Pistis Sophia icon.

## 1.1.3

PL:
- Znormalizowano informacje czytnika dla Ewangelii Tomasza: aktualna pozycja biblioteki, podstawa tekstu, prawa, opis przekładu, stopka prawna i cytowanie nie pokazują już danych Pistis Sophii.
- Dostosowano metadane widoku księgi do aktywnego modułu: Pistis Sophia używa stron i paginacji Meada, a Ewangelia Tomasza używa logionów 1–114.
- Poprawiono cytowanie Ewangelii Tomasza tak, aby odwoływało się do numeru logionu i warstwy PL/EN.

EN:
- Normalized the reader information for the Gospel of Thomas: current library item, source base, rights, translation notes, legal footer and citation no longer show Pistis Sophia data.
- Adjusted book-view metadata to the active module: Pistis Sophia uses Mead pages, while the Gospel of Thomas uses logia 1–114.
- Fixed Gospel of Thomas citation so it refers to logion numbers and the PL/EN layer.

## 1.1.2

PL:
- Dodano angielską warstwę Ewangelii Tomasza wg public-domain Mark M. Mattison.
- Podłączono Ewangelię Tomasza w statystykach biblioteki jako drugą dostępną księgę.
- Uzupełniono metadane modułu PL/EN oraz opis źródeł.

EN:
- Added the English Gospel of Thomas layer based on Mark M. Mattison’s public-domain translation.
- Connected the Gospel of Thomas in library statistics as the second available book.
- Updated PL/EN module metadata and source descriptions.

## 1.1.1

PL:
- Ewangelia Tomasza ma teraz ciągły, przewijany tekst z numerami logionów.
- Kliknięcie logionu w sidebarze przewija czytnik do odpowiedniego miejsca w tekście.

EN:
- The Gospel of Thomas now uses a continuous scrollable text with visible logion numbers.
- Clicking a logion in the sidebar scrolls the reader to that exact place in the text.

# 1.1.0

## PL
- Dodano Ewangelię Tomasza jako pełną księgę modułową.
- Wprowadzono 114 logionów w polskim opracowaniu Dariusza Kaniewskiego z wykorzystaniem narzędzi AI.
- Po kliknięciu księgi biblioteka przełącza czytnik na moduł Tomasza.
- Zaktualizowano wersję aplikacji do numeracji 1.1.0, bo to pierwsza większa rozbudowa biblioteki.

## EN
- Added the Gospel of Thomas as a full modular book.
- Added all 114 logia in Dariusz Kaniewski’s Polish AI-assisted adaptation.
- Clicking the book now switches the reader to the Thomas module.
- Updated the app version to 1.1.0 because this is the first larger library expansion.

# 1.0.149

## PL
- Poprawiono widok słownika w trybie PL: wyniki i karta nie podstawiają już angielskich glos jako głównego tekstu, gdy brakuje polskiej glosy.
- Wyśrodkowano krzyżyk zamykania karty słownikowej.
- Poprawiono wyszukiwanie w słowniku: wyniki są teraz sortowane według trafności.
- Ograniczono listę do 30 najlepszych wyników, żeby nie pokazywać przypadkowych dopasowań.
- Usunięto fałszywe trafienia typu „mój / my” przy wyszukiwaniu słowa „spirit”.

## EN
- Fixed the dictionary view in Polish mode: results and cards no longer use English glosses as the main text when a Polish gloss is missing.
- Centered the dictionary card close button.
- Improved dictionary search: results are now ranked by relevance.
- Limited the list to the 30 best results to avoid weak accidental matches.
- Removed false matches such as “mój / my” when searching for “spirit”.

# 1.0.144

### PL
- Ujednolicono numer wersji w całej aplikacji, plikach PWA i odnośnikach do zasobów.
- Dodano najnowszą wersję do widocznej historii zmian.
- Wyśrodkowano krzyżyk zamykania karty słownikowej.
- Usunięto ramkę i tło ze statusów książek w katalogu.

### EN
- Synchronized the version number across the app, PWA files, and asset links.
- Added the latest version to the visible changelog.
- Centered the dictionary card close button.
- Removed the border and background from catalogue book status labels.

# 1.0.143

- Przebudowano strukturę danych na bibliotekę modułową w katalogu `books/`.
- Przeniesiono Pistis Sophię do `books/pistis-sophia/`.
- Dodano szkielet modułu Ewangelii Tomasza w `books/gospel-of-thomas/` z miejscem na 114 logionów.
- Zaktualizowano manifest biblioteki, ścieżki skryptów i cache PWA.

## 1.0.142

### PL
- Uzupełniono historię zmian o najnowsze wersje katalogu biblioteki.
- Usunięto obramowanie logo po najechaniu kursorem.
- Domyślnie zwinięto kodeksy Nag Hammadi i uporządkowano oznaczenia statusów książek.

### EN
- Updated the change history with the latest library catalogue versions.
- Removed the hover outline from the Gnostyk logo.
- Collapsed the Nag Hammadi codices by default and cleaned up book status markers.

## 1.0.141

### PL
- Ujednolicono podbicie wersji po zmianach w strukturze Home/Księgi.
- Kliknięcie logo Gnostyk przenosi teraz do strony Home.
- Pozycja Pistis Sophia w katalogu Ksiąg jest teraz klikalna i otwiera czytnik.

### EN
- Synchronized the version after the Home/Books structure update.
- Clicking the Gnostyk logo now takes the user to the Home page.
- The Pistis Sophia item in the Books catalogue is now clickable and opens the reader.

## 1.0.140

### PL
- Dodano osobną stronę Home jako ekran startowy biblioteki.
- Przeniesiono katalog tekstów do zakładki Księgi.
- Dodano strukturę kolekcji: Biblioteka Nag Hammadi, Kodeks Askew, Kodeks Bruce'a i inne teksty gnostyckie.

### EN
- Added a separate Home page as the library start screen.
- Moved the text catalogue into the Books tab.
- Added a collection structure: Nag Hammadi Library, Askew Codex, Bruce Codex, and other Gnostic texts.

# Changelog

## 1.3.4
- Naprawiono podłączenie zmiennej warstwy koptyjskiej Ewangelii Tomasza po przełączeniu księgi.
- Wymuszono użycie modułu `books/gospel-of-thomas/coptic-data.js` dla widoku Koptyjski.

## 1.3.4

### PL
- Naprawiono podłączenie koptyjskiej warstwy Ewangelii Tomasza: parser obsługuje przestrzeń nazw TEI/XML z Coptic SCRIPTORIUM.
- Zsynchronizowano widok Koptyjski z logionami 1–114.
- Wyłączono tryb Interlinia dla Tomasza do czasu etapu 2, aby aplikacja nie sugerowała gotowej interlinii słowo po słowie.

### EN
- Fixed the Gospel of Thomas Coptic layer connection: the parser now handles the TEI/XML namespace used by Coptic SCRIPTORIUM.
- Synchronized Coptic mode with logia 1–114.
- Disabled the Thomas interlinear mode until stage 2 so the app does not imply a completed word-by-word interlinear layer.

## 1.2.4

PL:
- Uporządkowano listę Codex II: każda pozycja jest osobnym wierszem bez kropek listy.
- Dodano statusy po prawej stronie pozycji oraz efekt hover dla dostępnej Ewangelii Tomasza.
- Zachowano zwykły kursor zamiast kursora-rączki.

EN:
- Organized the Codex II list: each entry is now a separate row without list bullets.
- Added right-aligned statuses and hover feedback for the available Gospel of Thomas entry.
- Kept the default cursor instead of the hand pointer.

## 1.1.5
- Rozdzielono motywy tematyczne ksiąg: Ewangelia Tomasza nie korzysta już z motywów Pistis Sophii.
- Dodano osobne zestawy motywów dla Pistis Sophii i Ewangelii Tomasza.
- Przygotowano pliki `themes.json` w modułach ksiąg jako fundament pod pełną niezależność metadanych kolejnych tekstów.

## 1.0.139 - Dictionary card language refresh

PL
- Naprawiono kartę słownikową po zmianie języka interfejsu.
- Otwarta karta słownikowa odświeża teraz etykiety PL/EN, aby w trybie polskim nie zostawały angielskie napisy.

EN
- Fixed the dictionary card after changing the interface language.
- An open dictionary card now refreshes PL/EN labels instead of keeping English labels in Polish mode.

## 1.0.138

PL
- Rozbudowano kartę słownikową o profil hasła jako fundament Słownika 2.0.
- Dodano informacje o lemacie, liczbie znaczeń PL/EN i gotowości hasła do użycia w wielu tekstach.
- Uporządkowano prezentację danych słownikowych bez zmiany działania interlinii.

EN
- Expanded the dictionary card with an entry profile as the foundation for Dictionary 2.0.
- Added lemma information, PL/EN meaning counts, and multi-text dictionary readiness.
- Improved dictionary data presentation without changing interlinear behavior.

## 1.0.137

PL
- Naprawiono historię zmian, aby w trybie EN nie pokazywała polskich punktów z wpisów oznaczonych jako PL.
- Parser changeloga rozpoznaje teraz zarówno nagłówki PL / EN, jak i ### PL / ### EN.
- Podbito wersję aplikacji po poprawce lokalizacji changeloga.

EN
- Fixed the change history so EN mode no longer shows Polish points from entries marked as PL.
- The changelog parser now recognizes both PL / EN headings and ### PL / ### EN headings.
- Bumped the application version after the changelog localization fix.

## 1.0.136

PL
- Znormalizowano układ strony Wsparcie między wersją polską i angielską.
- Poszerzono teksty opisowe i ujednolicono wysokości bloków, aby przełączanie języka nie zmieniało proporcji strony.
- Dopasowano treść PL/EN tak, aby obie wersje miały ten sam rytm i strukturę.

EN
- Normalized the Support page layout between Polish and English.
- Widened descriptive text blocks and unified section heights so switching language does not change the page proportions.
- Aligned PL/EN copy so both versions share the same rhythm and structure.

## 1.0.135

PL
- Dodano zakładkę Wsparcie / Support z opisem rozwoju projektu.
- Dodano przycisk PayPal prowadzący do paypal.me/dariuszkaniewski.
- Ikona serca korzysta z kolorów aktywnego motywu, aby pasowała do trybów Dark, Light i Sepia.

EN
- Added a Support tab with a project development description.
- Added a PayPal button linking to paypal.me/dariuszkaniewski.
- The heart icon now uses the active theme colors so it fits Dark, Light and Sepia modes.

## 1.0.133

### PL
- Znormalizowano układ przełączników widoku czytelnika między wersją polską i angielską.
- Przełączniki tekstu mają teraz stałą siatkę czterech kolumn, więc nie zmieniają położenia po zmianie języka.

### EN
- Normalized the reader view switcher layout between Polish and English.
- Text mode buttons now use a fixed four-column grid so their position stays consistent after changing the interface language.

## 1.0.132

### PL
- Znormalizowano opis strony głównej w wersji polskiej względem wersji angielskiej.
- Poszerzono blok opisu pod nagłówkiem biblioteki, aby dłuższy tekst PL nie łamał się niepotrzebnie.
- Zmniejszono odstęp pod logo, dzięki czemu nagłówek strony głównej jest bardziej zwarty.

### EN
- Normalized the Polish home page description against the English version.
- Widened the description block under the library heading so longer PL text does not wrap unnecessarily.
- Reduced the spacing below the logo to make the home page header more compact.

## 1.0.131

### PL
- Dostosowano pole wyszukiwania słownika do motywów Light, Sepia i Dark.
- Zastąpiono sztywne kolory zmiennymi motywu dla tła, tekstu, obramowania i przycisku czyszczenia.
- Poprawiono kontrast pola wyszukiwania bez zmiany działania słownika.

### EN
- Adapted the dictionary search field to the Light, Sepia, and Dark themes.
- Replaced hard-coded colors with theme variables for the background, text, border, and clear button.
- Improved search field contrast without changing dictionary behavior.

## 1.0.129

### PL
- Poprawiono wygląd pola wyszukiwania słownika w ciemnych motywach.
- Dodano przycisk × do szybkiego czyszczenia wyszukiwania.
- Ujednolicono styl pola wyszukiwania z resztą interfejsu.

### EN
- Improved the dictionary search field appearance in dark themes.
- Added an × button for quickly clearing the search.
- Unified the search field styling with the rest of the interface.

## 1.0.128

### PL
- Ujednolicono numer wersji w całej aplikacji po wydaniu 1.0.127.
- Podbito odwołania wersji w plikach aplikacji, cache PWA, metadanych i linkach zasobów.
- Uporządkowano historię zmian tak, aby pokazywała ostatnie 10 wersji z opisami PL/EN.

### EN
- Unified the version number across the application after the 1.0.127 release.
- Updated version references in app files, PWA cache, metadata, and asset links.
- Cleaned up the changelog so it shows the latest 10 versions with PL/EN descriptions.

## 1.0.127

### PL
- Na telefonach karta słownikowa działa jako dolny panel zamiast zakrywać cały tekst.
- Tekst pozostaje widoczny nad kartą słownikową podczas przeglądania wystąpień.
- Panel ma własne przewijanie, a przycisk zamykania pozostaje dostępny.

### EN
- On mobile, the dictionary card now works as a bottom sheet instead of covering the whole text.
- The text remains visible above the dictionary card while browsing occurrences.
- The panel has its own scrolling area and the close button remains available.

## 1.0.126

### PL
- Wystąpienia słownika są sortowane według bliskości aktualnej strony.
- Dodano przyciski Poprzednie 20 / Następne 20 dla długich list wystąpień.
- Karta słownikowa pozostaje otwarta podczas przeglądania kolejnych stron.

### EN
- Dictionary occurrences are sorted by proximity to the current page.
- Added Previous 20 / Next 20 buttons for long occurrence lists.
- The dictionary card stays open while browsing occurrence pages.

## 1.0.125

### PL
- Przygotowano architekturę wystąpień słownika pod wiele tekstów koptyjskich.
- Wystąpienia są teraz grupowane według tekstu; obecnie aktywna jest Pistis Sophia.
- Moduł słownika jest gotowy na późniejsze dodanie kolejnych tekstów, np. Ewangelii Tomasza.

### EN
- Prepared the dictionary occurrence architecture for multiple Coptic texts.
- Occurrences are now grouped by text; Pistis Sophia is currently active.
- The dictionary module is ready for adding future texts, such as the Gospel of Thomas.

## 1.0.124

### PL
- Naprawiono pozycję karty słownikowej przy długich listach wystąpień.
- Karta mieści się teraz w ekranie i ma własne przewijanie.
- Przycisk zamykania pozostaje zawsze dostępny.

### EN
- Fixed the dictionary card position with long occurrence lists.
- The card now fits inside the viewport and has its own scrolling area.
- The close button remains available at all times.

## 1.0.123

### PL
- Karta słownikowa pozostaje otwarta po kliknięciu wystąpienia.
- Kliknięcie wystąpienia przenosi do odpowiedniej strony w trybie interlinearnym.
- Dopasowane słowo zostaje podświetlone, aby łatwiej odnaleźć je w tekście.

### EN
- The dictionary card stays open after clicking an occurrence.
- Clicking an occurrence opens the matching page in interlinear mode.
- The matching word is highlighted so it is easier to find in the text.

## 1.0.122

### PL
- Dodano sekcję „Wystąpienia” w karcie słownikowej.
- Karta pokazuje, na których stronach bieżącej warstwy koptyjskiej występuje dana forma lub jej forma bazowa.
- Kliknięcie wystąpienia przenosi do odpowiedniej strony tekstu.

### EN
- Added an “Occurrences” section to the dictionary card.
- The card shows which pages in the current Coptic layer contain the selected form or its base form.
- Clicking an occurrence opens the corresponding text page.

## 1.0.121

### PL
- Rozbudowano kartę słownikową bez dodawania nowych modułów.
- Części mowy są teraz opisane normalnie, np. „rzeczownik (N)” albo „przyimek / partykuła (PREP)”.
- Dla form rozpoznanych przez lematyzację karta pokazuje formę bazową oraz transliterację.
- Oczyszczono listy znaczeń z części technicznych wpisów słownikowych.

### EN
- Expanded the dictionary card without adding new modules.
- Parts of speech are now shown as readable labels, for example “noun (N)” or “preposition / particle (PREP)”.
- For forms resolved by lemmatization, the card now shows the base form and transliteration.
- Cleaned meaning lists from technical dictionary fragments.

## 1.0.120

### PL
- Naprawiono pełną lokalizację karty słownikowej w trybie EN i PL.
- Etykiety karty słownikowej przełączają się teraz zgodnie z językiem interfejsu.
- Usunięto zdublowane pole „Część mowy” z karty słownikowej.

### EN
- Fixed full dictionary-card localization in EN and PL modes.
- Dictionary-card labels now switch according to the interface language.
- Removed the duplicated “Part of speech” field from the dictionary card.

## 1.0.119

### PL
- Naprawiono przyciski widoku czytnika: Polski, Source EN, Coptic i Interlinear.
- Dodano stabilne przełączanie trybu czytania przez atrybut `data-reader-mode`.
- Uodporniono zapisany tryb czytnika na starsze lub błędne wartości z `localStorage`.

### EN
- Fixed reader mode buttons: Polish, Source EN, Coptic, and Interlinear.
- Added stable reader-mode switching through the `data-reader-mode` attribute.
- Made the saved reader mode robust against older or invalid `localStorage` values.
