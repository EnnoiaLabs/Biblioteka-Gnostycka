# Strażnik decyzji tłumaczeniowych

Wiążące decyzje dotyczące przekładu *Pistis Sophii* są zapisane w pliku `books/pistis-sophia/translation-decisions.json`. Test automatyczny zatrzymuje wydanie, jeżeli zatwierdzona decyzja jest niepełna albo tekst przestaje być z nią zgodny.

## Wymagane dane decyzji

Każda decyzja musi zawierać:

- wybrany polski termin i dokładny zakres użycia;
- uzasadnienie wyboru;
- wariant Meada z pełnym opisem źródła;
- wariant MacDermot z informacją o koptyjskiej podstawie Schmidta;
- stan świadectwa koptyjskiego oraz dowód lub uczciwą informację o potrzebie dalszej weryfikacji;
- gotowy przypis dla czytelnika;
- reguły automatycznej kontroli zatwierdzonego brzmienia.

Strażnik nie pozwala oznaczyć formy koptyjskiej jako zweryfikowanej bez podania jej dokładnego zapisu i źródła. Gdy świadectwo jest pośrednie, decyzja musi jasno wskazywać granice pewności.

## Dodawanie decyzji

1. Porównaj polski tekst z Meadem i MacDermot.
2. Sprawdź koptyjską podstawę lub oznacz ją jako wymagającą weryfikacji.
3. Zapisz warianty, uzasadnienie, poziom pewności i przypis w rejestrze JSON.
4. Dodaj wzorzec wymagany i — jeśli to potrzebne — wzorce zakazane.
5. Uruchom `npm test`. Nie przygotowuj wydania, jeśli strażnik zgłasza błąd.

Przypis wariantowy pojawia się przy pierwszym ważnym wystąpieniu. Kolejne wystąpienia powinien objaśniać wspólny glosariusz, aby tekst nie został przeciążony.
