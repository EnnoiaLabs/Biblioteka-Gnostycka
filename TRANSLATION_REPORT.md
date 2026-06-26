# Raport kontroli przekładu Pistis Sophia

Data kontroli: 2026-06-25
Aktualizacja redakcyjna: 2026-06-26

Zakres: porównanie polskiej warstwy tekstu w aplikacji z angielskim wydaniem G. R. S. Meada z 1921 roku zapisanym w `data.js`. To nie jest kontrola względem koptyjskiego rękopisu, tylko względem angielskiej podstawy przyjętej w aplikacji.

## Wniosek główny

Przekład ma spójny, misteryjny ton i dobrze wpisuje się w założony styl aplikacji, ale na tym etapie należy go traktować jako wersję roboczą/redakcyjną, nie jako gotowe wydanie do cytowania naukowego.

Największy problem nie dotyczy samej polszczyzny, lecz zgodności redakcyjnej z podstawą: część stron, zwłaszcza we wstępie i bibliografii, jest przesunięta, skrócona albo ułożona inaczej niż tekst Meada. W głównym tekście od strony 49 przekład jest bliższy źródłu, ale prawie wszędzie giną wewnętrzne znaczniki rękopisu typu `|2`, `|291`, które są ważne dla precyzyjnej paginacji Schwartze-Petermanna.

## Wykonane po raporcie

- Aplikacja pokazuje teraz status redakcyjny przy stronie: `przekład roboczy`, `znaczniki w aparacie` albo `opracowanie do kolacji`.
- Panel `O tekście` wyjaśnia, że polska warstwa jest pełna, ale wybrane miejsca wymagają dalszej kolacji ze źródłem.
- Strona 49 została uzupełniona o brakujący początek fragmentu oraz znaczniki rękopisu `|2`, `|3`, `|4`.
- Dodano narzędzie audytu `tools/audit-translation.mjs`, które generuje `translation-audit.json`.
- Podbito wersję biblioteki do `1.0.11`.

## Co jest dobre

- Wszystkie 255 stron mają polski wpis, więc aplikacja nie pokazuje już pustych stron ani technicznych placeholderów.
- Styl misteryjny jest konsekwentny: `Misterium`, `Światłość`, `Skarbiec Światłości`, `Pierwsze Misterium`, `Dziewica Światłości`.
- W głównych partiach dialogowych rytm „I stało się...” oraz sakralna składnia dobrze oddają charakter tekstu objawieniowego.
- Terminologia jest zasadniczo spójna i czytelna dla projektu gnostyckiej biblioteki.

## Problemy krytyczne

### 1. Rozjazd stron we wstępie i bibliografii

Na stronach ok. 31-47 polska warstwa często nie odpowiada tej samej stronie angielskiej. Przykłady:

- Strona 35 w źródle Meada zawiera bibliografię anotowaną, m.in. opis Müntera, Dulauriera i Mattera. Polska strona 35 mówi natomiast o Szacie Światłości, wiedzy astralnej i transkorporacji.
- Strona 36 w źródle kontynuuje bibliografię, a polska strona 36 mówi o elemencie magicznym.
- Strona 37 w źródle omawia anonimowy przekład w Migne, a polska strona 37 mówi o historii i opowieści psychicznej.
- Strona 40 w źródle omawia Księgi Jeu i badania Schmidta, a polska strona 40 zawiera schemat kosmologiczny oraz początek bibliografii.

To oznacza, że przy obecnym układzie numer strony Meada nie zawsze wskazuje w polskiej wersji ten sam materiał.

### 2. Brak znaczników rękopisu w polskim tekście

Automatyczny audyt wykazał 205 stron, na których angielski tekst ma marginalne znaczniki rękopisu `|...`, a polski wpis nie ma ich wcale.

Przykład:

- Strona 49 źródła ma znaczniki `|2`, `|3`, `|4`.
- Polska strona 49 nie zawiera tych znaczników.

Aplikacja nadal może pokazać pasek cytowania na podstawie angielskiego źródła, ale sam polski tekst nie pozwala precyzyjnie zobaczyć, gdzie w zdaniu przebiega numeracja rękopisu.

### 3. Prawdopodobne skróty albo kondensacje

Kilka stron jest znacząco krótszych od angielskiego odpowiednika. Najbardziej podejrzane strony:

- 19
- 35
- 36
- 37
- 38
- 40
- 42
- 44
- 45
- 46
- 47

Nie każdy skrót jest błędem, jeśli celem było opracowanie, ale przy deklaracji „przekład” trzeba te miejsca sprawdzić ręcznie.

### 4. Strona 49 zaczyna się z pominięciem początku akapitu

Angielska strona 49 zaczyna od słów Jezusa o Pierwszym Misterium. Polska strona 49 zaczyna już od tego, czego Jezus jeszcze nie powiedział uczniom. Wygląda to na pominięcie początku fragmentu albo przesunięcie materiału.

## Problemy średniej wagi

### Terminologia do decyzji redakcyjnej

Niektóre wybory są dopuszczalne, ale warto je zatwierdzić w słowniku:

- `Self-willed` jako `Samowolny`: dobre literacko, ale warto dodać notę, że chodzi o nazwę własną bytu/mocy.
- `receivers` jako `odbiorcy`: dosłowne, lecz po polsku brzmi technicznie. Możliwe alternatywy: `przyjmujący`, `przeprowadzający`, `poborcy dusz`. Trzeba wybrać jedną linię.
- `counterfeit spirit` jako `duch naśladowczy`: sensownie oddaje ideę, ale może warto w nocie podać także „duch podrobiony/fałszywy”.
- `Light-power` jako `moc światłości` albo `moc Światłości`: trzeba konsekwentnie ustalić wielkość litery, bo w tym projekcie `Światłość` działa prawie jak nazwa sakralna.

### Tytuły „ksiąg”

W tekście pojawiają się wewnętrzne tytuły typu „Druga Księga Pistis Sophia”, „Trzecia Księga”, „Czwarta Księga”. To jest część tradycji rękopiśmiennej i wydania Meada, ale w aplikacji może mylić użytkownika, bo cała pozycja biblioteki ma tytuł `Pistis Sophia`. Warto rozróżnić:

- tytuł dzieła w bibliotece: `Pistis Sophia`,
- wewnętrzne działy/traktaty według Meada/rękopisu.

## Ocena jakości

### Jako tekst literacko-mistyczny

Ocena: dobra baza.

Polszczyzna ma odpowiedni ton, miejscami jest podniosła i rytmiczna. Dobrze pasuje do założenia „misteryjnego” przekładu.

### Jako przekład wierny strona-do-strony

Ocena: wymaga redakcji.

Najpierw trzeba przywrócić zgodność stron, uzupełnić pominięte początki/końcówki i zdecydować, czy wstęp Meada ma być pełnym przekładem, czy własnym opracowaniem.

### Jako tekst do cytowania

Ocena: jeszcze niegotowe.

Do cytowania trzeba zachować numerację Meada i najlepiej wprowadzić w polski tekst znaczniki Schwartze-Petermanna w tych samych miejscach, w których są w źródle.

## Rekomendowany plan naprawy

1. Rozdzielić w aplikacji dwie warstwy: `Przekład` i `Opracowanie`.
2. Wstęp Meada potraktować osobno: albo pełny przekład wstępu, albo własne opracowanie bez udawania strony-do-strony.
3. Dla stron 31-47 zrobić ręczną rekonstrukcję zgodności z Meadem.
4. Dla stron 49-255 dodać do polskiego tekstu znaczniki rękopisu `|...` w odpowiadających miejscach.
5. Ustalić słownik terminologiczny: `Self-willed`, `receivers`, `counterfeit spirit`, `light-power`, `emanations`, `rulers`, `mysteries`.
6. Po korekcie uruchomić drugi audyt: długość, brakujące znaczniki, zgodność nagłówków, obecność angielskich pozostałości.

## Decyzja redakcyjna

Najlepszy kierunek dla profesjonalnej aplikacji:

- główny widok: `Przekład misteryjny`,
- drugi widok: `Oryginał EN`,
- osobny panel: `Opracowanie`, gdzie można umieścić własny wstęp, omówienie praw, kontekst rękopisu i komentarz do terminologii.

Wtedy nie trzeba na siłę tłumaczyć całego wstępu Meada jako części lektury, a sama `Pistis Sophia` może być czystsza i bardziej profesjonalna.
