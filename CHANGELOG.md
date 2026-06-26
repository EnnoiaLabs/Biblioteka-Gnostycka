# Changelog

## Gnostyk Biblioteka 1.0.22 - trzy czasy i Adamas

- Dodano znaczniki Schwartze-Petermanna `|160`-`|171` oraz `|173` do polskiej warstwy stron 137-144.
- Skolacjonowano kontynuację pieśni Sophii, interpretacje Maryi, Marty i Andrzeja oraz zapowiedź trzech czasów i ponownego ucisku przez Adamasa.
- Zachowano przerwę numeracyjną źródła: w tym odcinku nie występuje znacznik `|172`.

## Gnostyk Biblioteka 1.0.21 - pieśni wybawienia Sophii

- Dodano znaczniki Schwartze-Petermanna `|147`-`|159` do polskiej warstwy stron 129-136.
- Skolacjonowano rozwiązanie Jakuba, pieśń Sophii po wyjściu z chaosu oraz interpretacje Tomasza i Mateusza z Ód Salomona.
- Zachowano ciągłość cytowania drugiej księgi po odcinku strumienia światłości.

## Gnostyk Biblioteka 1.0.20 - strumień światłości

- Dodano znaczniki Schwartze-Petermanna `|131`-`|146` do polskiej warstwy stron 121-128.
- Skolacjonowano opowieść o strumieniu światłości, interpretację Piotra oraz początek walki z emanacjami Samowolnego i Adamasa.
- Zachowano przerwy numeracyjne źródła: w tym odcinku nie występują znaczniki `|137` i `|140`.

## Gnostyk Biblioteka 1.0.19 - koniec pierwszej księgi

- Dodano znaczniki Schwartze-Petermanna `|115`-`|130` do polskiej warstwy stron 113-120.
- Skolacjonowano końcową część Księgi Pierwszej, notę skryby oraz początek Księgi Drugiej z Janową interpretacją i strumieniem światłości.
- Zachowano przerwę numeracyjną źródła: w tym odcinku nie występuje znacznik `|126`.

## Gnostyk Biblioteka 1.0.18 - dwunasta i trzynasta pokuta

- Dodano znaczniki Schwartze-Petermanna `|103` oraz `|105`-`|114` do polskiej warstwy stron 105-112.
- Skolacjonowano interpretację Salome, dwunastą pokutę Sophii, interpretację Andrzeja oraz początek trzynastej pokuty i pieśni chwały.
- Zachowano przerwę numeracyjną źródła: w tym odcinku nie występuje znacznik `|104`.

## Gnostyk Biblioteka 1.0.17 - dziewiąta i dziesiąta pokuta

- Dodano znaczniki Schwartze-Petermanna `|89`-`|102` do polskiej warstwy stron 97-104.
- Skolacjonowano dziewiątą pokutę Sophii, interpretację Jakuba, przyjęcie pokuty oraz początek dziesiątej i jedenastej pokuty.
- Utrzymano numerację biblioteki w plikach PWA, stopce i cache aplikacji.

## Gnostyk Biblioteka 1.0.16 - siódma i ósma pokuta

- Dodano znaczniki Schwartze-Petermanna `|76`-`|88` do polskiej warstwy stron 89-96.
- Skolacjonowano przejście od szóstej pokuty przez interpretację Maryi, siódmą pokutę Sophii oraz początek ósmej pokuty.
- Zachowano przerwę numeracyjną źródła: w tym odcinku nie występuje znacznik `|87`.

## Gnostyk Biblioteka 1.0.15 - piąta i szósta pokuta

- Dodano znaczniki Schwartze-Petermanna `|64`-`|75` do polskiej warstwy stron 81-88.
- Skolacjonowano końcówkę czwartej pokuty, rozwiązanie Jana, piątą pokutę Sophii oraz początek szóstej pokuty.
- Utrzymano numerację biblioteki w stopce, PWA i cache aplikacji zgodnie z changelogiem.

## Gnostyk Biblioteka 1.0.14 - pokuty Sophii

- Dodano kolejne znaczniki Schwartze-Petermanna w polskiej warstwie stron 73-80.
- Skolacjonowano fragment pierwszej i drugiej pokuty Sophii oraz początek czwartej pokuty.
- Zaktualizowano audyt przekładu: liczba stron bez znaczników w polskiej warstwie spadła do 175.

## Gnostyk Biblioteka 1.0.13 - kolacja historii Sophii

- Dodano kolejne jednoznaczne znaczniki Schwartze-Petermanna w polskim tekście dla stron 66-72.
- Rozpoczęto kolację partii o Melchizedeku, zmianie biegów eonów i początku historii Pistis Sophii.
- Zaktualizowano audyt przekładu: zmniejszono liczbę stron bez znaczników w polskiej warstwie do 182.

## Gnostyk Biblioteka 1.0.12 - kolacja znaczników rękopisu

- Wprowadzono znaczniki Schwartze-Petermanna w polskiej warstwie stron 50-64 dla pierwszych jednoznacznych przejść rękopisu.
- Dodano status „część znaczników w tekście”, aby strony częściowo skolacjonowane nie były oznaczane jako w pełni gotowe.
- Rozszerzono audyt przekładu o `partial_manuscript_refs`.
- Zaktualizowano `translation-audit.json`.

## Gnostyk Biblioteka 1.0.11 - redakcja przekładu

- Dodano status redakcyjny przy stronach: przekład roboczy, znaczniki w aparacie albo opracowanie do kolacji.
- Uzupełniono początek strony 49 i wprowadzono tam znaczniki rękopisu `|2`, `|3`, `|4`.
- Dodano notę w panelu „O tekście”, że polska warstwa jest pełna, ale wybrane miejsca wymagają dalszej kolacji ze źródłem.
- Dodano narzędzie `tools/audit-translation.mjs`, które generuje `translation-audit.json` i kontroluje brakujące znaczniki rękopisu oraz podejrzanie krótkie strony.
- Odświeżono cache PWA i wersjonowanie plików aplikacji.

## Gnostyk Biblioteka 1.0.10 - naprawa mobilnych paneli

- Dodano bezpośrednią obsługę kliknięć dla dolnych przycisków „Spis treści” i „Więcej”.
- Uodporniono mobilne kontrolki na niepełne odświeżenie PWA, aby pojedynczy brakujący element nie zatrzymywał całego skryptu.
- Podbito cache PWA, żeby telefon pobierał świeży skrypt i widok razem.

## Gnostyk Biblioteka 1.0.9 - stabilizacja PWA

- Zmieniono strategię service workera dla `index.html`, `app.js`, `styles.css`, manifestu i metadanych na network-first.
- Zabezpieczono mobilne kontrolki przed błędem, gdy przeglądarka trzyma starszy HTML z cache.
- Naprawiono sytuację, w której przyciski „Spis treści” i „Więcej” mogły nie reagować po aktualizacji PWA.

## Gnostyk Biblioteka 1.0.8 - mobilny tryb czytania

- Przebudowano telefoniczny układ na tryb reader-first.
- Na telefonie ukryto hero, metadane, górny toolbar, stopkę i notatki z głównego strumienia czytania.
- Dolny pasek uproszczono do: spis treści, poprzednia strona, aktualna strona, następna strona, więcej.
- Dodano mobilny panel „Więcej” z zakładką, kopiowaniem cytatu, informacją o tekście, ustawieniami, trybem tekstu i formatem cytowania.
- Desktopowy układ pozostaje pełny.

## Gnostyk Biblioteka 1.0.7 - wersja z changeloga

- Uporządkowano historię zmian w numeracji semantycznej.
- Ustawiono `CHANGELOG.md` jako źródło prawdy dla aktualnej wersji biblioteki.
- Aplikacja odczytuje najnowszą wersję z pierwszego wpisu changeloga i pokazuje ją w interfejsie.
- Zaktualizowano pliki metadanych oraz cache PWA.

## Gnostyk Biblioteka 1.0.6 - pole strony

- Usunięto natywny spinner z pola numeru strony.
- Wycentrowano numer strony i zwiększono wewnętrzny odstęp pola.
- Odświeżono cache PWA.

## Gnostyk Biblioteka 1.0.5 - przełączanie paneli

- Panele „O tekście” i „Ustawienia” działają teraz wzajemnie wykluczająco.
- Kliknięcie jednego panelu automatycznie zamyka drugi.
- Poprawiono odstęp w polu numeru strony, aby numer nie kleił się do strzałek kontrolki.
- Odświeżono cache PWA.

## Gnostyk Biblioteka 1.0.4 - poprawki UI

- Naprawiono kontrast aktywnych przycisków „Po polsku” i „Oryginał EN” w trybie jasnym.
- Usunięto zielonkawy charakter przewodnika tekstu w jasnym i ciemnym motywie.
- Uspójniono ciemny motyw dla paneli, chipów, cytowania i pól sterujących.
- Wzmocniono obsługę paneli „O tekście” i „Ustawienia”; ich stan jest teraz jawnie zapisywany i odtwarzany.
- Odświeżono cache PWA, aby pobrać nowe style.

## Gnostyk Biblioteka 1.0.3 - poprawa kontrastu

- Przebudowano tryb ciemny: ciemniejsze powierzchnie, jaśniejszy tekst i wyraźniejsze obramowania.
- Poprawiono czytelność boxów metadanych, przewodnika, paneli i paska narzędzi na telefonie.
- Ustawiono poprawiony tryb ciemny jako domyślny wygląd nowej instalacji.
- Odświeżono cache PWA, aby wymusić pobranie nowego CSS.

## Gnostyk Biblioteka 1.0.2 - warstwa profesjonalna

- Dodano strukturę metadanych biblioteki w plikach `VERSION.json` i `library.json`.
- Dodano panel „O tekście” z informacją o źródle, rękopisie, aparacie cytowania i prawach.
- Dodano pamięć ostatniej strony oraz przycisk kontynuacji lektury.
- Dodano ustawienia czytania: motyw, rozmiar tekstu, interlinię i szerokość kolumny.
- Dodano wybór formatu cytowania przed kopiowaniem fragmentu.
- Dodano komunikat offline i rozszerzono cache PWA o pliki metadanych.
- Uzupełniono manifest PWA o screenshot i pełniejsze metadane instalacyjne.

## Gnostyk Biblioteka 1.0.1 - poprawki mobilne

- Dodano mobilny dolny pasek nawigacyjny.
- Dodano wysuwany panel spisu treści z grupami rozdziałów.
- Dodano mobilne wyszukiwanie w rozdziałach, wyszukiwanie w tekście i szybki dostęp do zakładek.
- Na telefonie ukryto długi boczny panel, żeby czytanie zaczynało się bez wielominutowego przewijania.
- Wybór rozdziału, zakładki lub wyniku na telefonie zamyka panel i przenosi od razu do tekstu.
- Wydzielono wspólne renderowanie przycisków rozdziałów i zakładek dla desktopu oraz telefonu.

## Gnostyk Biblioteka 1.0.0

- Utworzono pierwszą wersję biblioteki gnostyckiej Gnostyk.
- Dodano pierwszą pozycję kolekcji: Pistis Sophia.
- Dodano polski przekład i opracowanie na podstawie publiczno-domenowego wydania G. R. S. Meada z 1921 roku.
- Dodano tryb tekstu źródłowego EN.
- Dodano aparat cytowania z numeracją Mead oraz Schwartze-Petermann.
- Dodano wyszukiwarkę, zakładki, notatki lokalne i tryb skupienia.
- Dodano informację prawną o domenie publicznej źródła oraz prawach do nowej warstwy twórczej.
