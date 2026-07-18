# Checklista publikacji

Wydanie można opublikować dopiero po zaznaczeniu wszystkich punktów.

## Kontrola automatyczna

- [ ] `python tools/release.py check` kończy się komunikatem `OK`.
- [ ] `python tools/release.py audit` potwierdza deterministyczność i zawartość ZIP.
- [ ] Automatyczna kontrola PWA potwierdza manifest i kompletność cache offline.
- [ ] Budżety rozmiaru zasobów startowych nie zostały przekroczone.
- [ ] Nieużywane materiały źródłowe nie powiększają paczki publikacyjnej.
- [ ] `npm run test:browser` uruchamia aplikację bez błędów w Chromium.
- [ ] Numer w `VERSION.json`, aplikacji, cache PWA i changelogu jest zgodny.
- [ ] Historia wersji nie ma luk ani powtórzeń.
- [ ] Typ `public` lub `technical` odpowiada znaczeniu zmiany dla czytelnika.
- [ ] Wszystkie pliki tekstowe są poprawnym UTF-8.

## Test ręczny aplikacji

- [ ] Aplikacja uruchamia się bez błędów w konsoli przeglądarki.
- [ ] Strona główna pokazuje właściwy numer i trzy ostatnie wersje.
- [ ] Pistis Sophia, Ewangelia Tomasza i Ewangelia Filipa otwierają się poprawnie.
- [ ] Tryby polski, angielski, koptyjski i interlinearny działają.
- [ ] Sidebar przewija do właściwego rozdziału lub strony `P`.
- [ ] Wyrównanie do lewej, justowanie i wyśrodkowanie działają.
- [ ] Motywy Dark, Light i Sepia nie mają jasnego mignięcia.
- [ ] Cytowanie i kopiowanie zwracają poprawny tekst z aktualną wersją.
- [ ] Odświeżenie offline/PWA nie ładuje starego cache.
- [ ] Nie zmieniono elementów poza zakresem wydania.

## Pakiet końcowy

- [ ] ZIP nazywa się `pistis-sophia-app-vX.Y.Z-opis.zip`.
- [ ] ZIP rozpakowano do pustego folderu i uruchomiono ponownie.
- [ ] Zachowano poprzedni stabilny ZIP jako kopię bezpieczeństwa.
- [ ] Wpis `CHANGELOG.md` opisuje rzeczywiście wykonane zmiany po polsku i angielsku.

**Decyzja:** [ ] PUBLIKUJĘ  [ ] WSTRZYMUJĘ
