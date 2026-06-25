# Changelog

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
