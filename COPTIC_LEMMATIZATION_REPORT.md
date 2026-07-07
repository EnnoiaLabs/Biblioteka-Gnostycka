# Coptic lemmatization / normalizacja form koptyjskich — 1.0.110

## PL

Dodano pierwszy etap rozpoznawania form odmienionych w interlinii.

Aplikacja próbuje teraz znaleźć hasło słownikowe nie tylko po formie widocznej w tekście, ale także po prostych wariantach:

- forma bezpośrednia,
- forma po zdjęciu prefiksu / rodzajnika,
- forma po zdjęciu prostej końcówki zaimkowej,
- forma po zdjęciu prefiksu i końcówki jednocześnie.

Przykład działania:

```text
ⲡⲕⲟⲥⲙⲟⲥ → ⲕⲟⲥⲙⲟⲥ
ⲛⲉⲩⲁⲓⲱⲛ → ⲁⲓⲱⲛ
```

To jest etap ostrożny. Nie jest to jeszcze pełna gramatyczna lematyzacja koptyjskiego, ale zwiększa szansę znalezienia znaczenia bez ręcznego dopisywania wszystkich form.

## EN

Added the first step of Coptic form normalization for the interlinear view.

The app now attempts dictionary lookup not only by the visible text form, but also by simple derived variants:

- direct form,
- form after removing a prefix / article,
- form after removing a simple pronominal ending,
- form after removing both a prefix and an ending.

This is a cautious first step, not a full grammatical Coptic lemmatizer yet.
