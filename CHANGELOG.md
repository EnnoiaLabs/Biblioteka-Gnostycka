# Changelog

## Gnostyk Biblioteka 1.0.58 - korekta paginacji i audytu

- Skorygowano granicę tekstu na Mead s. 195/196, aby cytowanie stron było wierniejsze.
- Potwierdzono audytem automatycznym czyste zakresy Mead s. 81-120, 121-160 oraz 161-200.
- Rozszerzono kontrolę terminologii o odmiany słowa `pokuta`, aby raport nie zgłaszał poprawnych form jako błędów.

## Gnostyk Biblioteka 1.0.57 - ustawienia w bibliotece

- Przeniesiono `Ustawienia` z widoku książki `Pistis Sophia` do głównych zakładek biblioteki.
- Dodano zakładkę `Ustawienia` obok `Księgi`, `Info` i `Zmiany`.
- Usunięto przycisk `Ustawienia` z paska narzędzi książki oraz z mobilnego panelu `Więcej`.
- Ustawienia czytania nadal działają globalnie i zapisują się lokalnie w przeglądarce.

## Gnostyk Biblioteka 1.0.56 - spójny czytnik i ustawienia na pasku

- Ograniczono szerokość widoku czytnika do tego samego webowego kontenera co strona biblioteki.
- Czytnik na dużych ekranach jest teraz wyśrodkowany, zamiast rozciągać się na pełną szerokość okna.
- Przeniesiono panel ustawień czytania z treści strony do wysuwanego panelu przy pasku narzędzi.
- Zachowano działanie ustawień na telefonie jako wysuwany panel nad dolną nawigacją.

## Gnostyk Biblioteka 1.0.55 - profesjonalne info i stopka

- Uproszczono panel `Info` do jednej noty redakcyjnej o bibliotece, zamiast wielu osobnych punktów.
- Dodano spokojny pasek podstawowych informacji bez ciężkiego układu kafelkowego.
- Dodano stopkę strony biblioteki z linkami do `Info`, `Zmiany` i numerem wersji.
- Podłączono wersję w nowej stopce do tego samego mechanizmu, który zczytuje numer z changeloga.

## Gnostyk Biblioteka 1.0.54 - jednolity widok biblioteki

- Usunięto boczny panel książki z widoku biblioteki na desktopie.
- Dodano główny pasek marki w widoku biblioteki, aby desktop i mobile miały tę samą logikę.
- Ułożono katalog ksiąg pod zakładką `Księgi`, zamiast obok bocznego logo.
- Widok książki nadal korzysta z bocznego panelu rozdziałów, motywów i zakładek.

## Gnostyk Biblioteka 1.0.53 - zakładki biblioteki

- Zamieniono pasek biblioteki na działające zakładki `Księgi`, `Info` i `Zmiany`.
- Przeniesiono katalog `Pistis Sophia` do zakładki `Księgi`.
- Przeniesiono historię zmian do osobnej zakładki `Zmiany`.
- Uspokojono wygląd panelu `Info`, zastępując kafle tekstem dzielonym separatorami.

## Gnostyk Biblioteka 1.0.52 - ukryty panel info

- Dodano pasek nawigacyjny biblioteki z przyciskami `Księgi`, `Info` i `Zmiany`.
- Ukryto pełne informacje o aplikacji za panelem `Info`, aby ekran biblioteki był lżejszy.
- Zmieniono układ informacji z siatki kafli na spokojny panel tekstowy z separatorami.

## Gnostyk Biblioteka 1.0.51 - pełne info aplikacji

- Rozbudowano ekran biblioteki o pełny panel informacyjny `O aplikacji i bibliotece`.
- Dodano sekcje: zakres i status, podstawa tekstów, metoda przekładu, prawa, cytowanie, prywatność, PWA/offline oraz autorstwo opracowania.
- Uporządkowano ostatnie zmiany w katalogu biblioteki jako część informacji o aplikacji.

## Gnostyk Biblioteka 1.0.50 - czysty start czytania

- Ustawienia czytania i panel `O przekładzie` nie są już zapamiętywane jako stale otwarte.
- Po wejściu w książkę na mobile domyślnie widoczny jest aparat cytowania i tekst, bez panelu ustawień.
- Przy zmianie strony na mobile oraz przy powrocie do biblioteki panele pomocnicze są automatycznie zamykane.

## Gnostyk Biblioteka 1.0.49 - porządek informacji biblioteki

- Dodano w katalogu biblioteki sekcję `O bibliotece` oraz listę ostatnich zmian.
- Pozostawiono informacje o domenie publicznej i prawach przy widoku książki `Pistis Sophia`.
- Przeniesiono powrót do biblioteki w bardziej intuicyjne miejsce: panel boczny książki oraz mobilny nagłówek książki.
- Dodano automatyczne odczytywanie ostatnich wpisów z `CHANGELOG.md`, gdy aplikacja działa z serwera.

## Gnostyk Biblioteka 1.0.48 - nawigacja wewnątrz książki

- Przeniesiono rozdziały, motywy, zakładki i wyszukiwanie do widoku książki `Pistis Sophia`.
- W widoku biblioteki ukryto panel narzędzi książki, aby katalog nie mieszał się z czytnikiem.
- Przy powrocie do biblioteki zamykany jest mobilny panel książki.

## Gnostyk Biblioteka 1.0.47 - osobny widok książki

- Rozdzielono widok katalogu biblioteki od widoku książki `Pistis Sophia`.
- Ukryto panel książki, metadane, narzędzia i tekst do momentu wejścia w księgę.
- Zmieniono drugi nagłówek z `Biblioteka gnostycka` na `Pistis Sophia`, aby nie dublować poziomów nawigacji.
- Dodano powrót z widoku książki do katalogu biblioteki.

## Gnostyk Biblioteka 1.0.46 - ekran startowy biblioteki

- Dodano ekran startowy `Biblioteka gnostycka` przed czytnikiem.
- Dodano kartę pierwszej księgi `Pistis Sophia` z przyciskiem `Czytaj`.
- Dodano pozycję `Kolejne teksty` jako miejsce na przyszłe księgi biblioteki.
- Podpięto przycisk `Czytaj`, aby przenosił bezpośrednio do narzędzi lektury.

## Gnostyk Biblioteka 1.0.45 - ikona bez tła

- Zastąpiono ikonę PWA wersją bez tła, z samym stosem stylizowanych gnostycznych ksiąg.
- Poprawiono rysunek centralnej księgi: szczelina Światłości znajduje się na wyraźnym grzbiecie książki, a nie na formie przypominającej zagiętą kartkę.
- Odbudowano rozmiary ikon 32, 64, 96, 180, 192 i 512 px z przezroczystością.

## Gnostyk Biblioteka 1.0.44 - ikony PWA biblioteki

- Dodano nową ikonę PWA przedstawiającą stylizowane gnostyczne księgi ze szczeliną Światłości.
- Przygotowano rozmiary ikon dla ekranu głównego i pulpitu: 32, 64, 96, 180, 192 i 512 px.
- Zaktualizowano manifest, ikony Apple/Android oraz cache offline, aby instalowana aplikacja używała nowego znaku.

## Gnostyk Biblioteka 1.0.43 - naprawa kliknięć nawigacji

- Naprawiono kliknięcia w rozdziały, motywy i zakładki po konflikcie atrybutu `data-theme` używanego jednocześnie przez motyw kolorystyczny aplikacji i przyciski motywów tekstu.
- Ograniczono obsługę kliknięcia motywu wyłącznie do prawdziwych przycisków listy motywów.
- Dzięki temu rozdziały i zakładki ponownie przenoszą bezpośrednio do właściwej strony.

## Gnostyk Biblioteka 1.0.42 - mobilny wybór cytowania

- Usunięto systemową listę wyboru z mobilnego formatu cytowania.
- Dodano cztery własne przyciski formatu: `Cytat prosty`, `Cytat naukowy`, `Mead` i `Schw.-Pet.`.
- Ujednolicono wybór języka i cytowania w panelu `Więcej`, aby ciemny motyw nie pokazywał jasnych natywnych list.

## Gnostyk Biblioteka 1.0.41 - mobilny panel narzędzi

- Usunięto systemową listę wyboru z przełącznika języka w panelu `Więcej`, która w ciemnym motywie otwierała się na jasnym tle.
- Dodano mobilny przełącznik segmentowy `Po polsku / Oryginał EN` z czytelnymi stanami aktywnymi.
- Uspokojono wygląd dolnego panelu narzędzi na telefonie: mniejszy ciężar wizualny, ciemniejsze tło i lepsze odstępy.

## Gnostyk Biblioteka 1.0.40 - kontrast przełącznika języka

- Poprawiono ciemny motyw dla przełącznika `Po polsku / Oryginał EN`, żeby oba warianty były czytelne także w widoku mobilnym.
- Wzmocniono osobne kolory stanu aktywnego i nieaktywnego segmentu językowego.

## Gnostyk Biblioteka 1.0.39 - spokojniejszy ekran lektury

- Rozdzielono górny pasek na podstawową nawigację lektury i narzędzia dodatkowe, żeby ekran czytania był lżejszy.
- Poprawiono odstępy w polu numeru strony, aby numer nie był przyklejony do kontrolek zmiany strony.
- Zmieniono status pełnych stron z `przekład roboczy` na `przekład skolacjonowany`, zgodnie z wykonanym audytem przekładu.

## Gnostyk Biblioteka 1.0.38 - nota o przek?adzie i cytowaniu

- Rozbudowano panel ?O przek?adzie? o podstaw? publiczno-domenow?, charakter przek?adu, prawa do nowej warstwy tw?rczej i instrukcj? cytowania.
- Dodano wersj? biblioteki do kopiowanych cytat?w prostych, naukowych i Schwartze-Petermanna.
- Doprecyzowano stopk? prawn?: tekst ?r?d?owy i wydanie Meada 1921 s? w domenie publicznej, a polska warstwa tw?rcza jest obj?ta prawami autorskimi.

## Gnostyk Biblioteka 1.0.37 - kolacja stron 33 i 218

- Skolacjonowano i wyrównano strony 33-34 ze szkieletem systemu oraz początkiem bibliografii Meada.
- Skolacjonowano i wyrównano strony 216-218 z paginacją Meada oraz znacznikami Schwartze-Petermanna `|314`-`|319`.
- Usunięto przesunięcie, przez które strona 218 zawierała nadmiarowy materiał z poprzedniej strony.

## Gnostyk Biblioteka 1.0.36 - kontrola profesjonalna

- Uporz?dkowano techniczne zako?czenie ostatniej strony przek?adu, aby skanery jako?ci jednoznacznie rozpoznawa?y granic? strony 255.
- Wyr?wnano granice stron 200-204 z paginacj? Meada i znacznikami Schwartze-Petermanna `|280`-`|290`.
- Zachowano polskie zako?czenie tekstu: `KONIEC`.
- Ponownie sprawdzono audyt przek?adu i integralno?? PWA.

## Gnostyk Biblioteka 1.0.35 - pełniejsze strony audytu

- Rozwinięto 13 stron oznaczonych przez audyt jako zbyt krótkie: 19, 35-38, 40, 42, 44-47, 191 i 211.
- Uzupełniono pełniejsze brzmienie stron 191 i 211 w tekście głównym Pistis Sophia, bez zmiany numeracji Schwartze-Petermanna.
- Rozszerzono wstępno-bibliograficzne partie Meada, aby nie były skrótem udającym pełny przekład.

## Gnostyk Biblioteka 1.0.34 - ostatnie bramy i objawienia

- Dodano znacznik Schwartze-Petermanna `|62` oraz znaczniki `|359`-`|369`, `|371`-`|387` i `|389`-`|390` do polskiej warstwy stron 79 oraz 237-254.
- Uzupełniono wcześniejsze częściowe oznaczenia stron 57-71: `|22`, `|24`, `|26`, `|28`, `|31`-`|32`, `|35`-`|36`, `|39`-`|40`, `|44`, `|46` i `|50`.
- Skolacjonowano finałowe partie przekładu z nauką o misteriach, losach dusz i ostatnich odpowiedziach Zbawcy.
- Zachowano przerwy numeracyjne źródła: w tym odcinku nie występują znaczniki `|370` i `|388`.

## Gnostyk Biblioteka 1.0.33 - kielich zapomnienia i klucze misteriów

- Dodano znaczniki Schwartze-Petermanna `|337`-`|352`, `|354` oraz `|356`-`|358` do polskiej warstwy stron 227-236.
- Skolacjonowano naukę o kielichu zapomnienia, kształtowaniu duszy, duchu naśladowczym, poczęciu, przeznaczeniu i kluczach misteriów.
- Zachowano przerwy numeracyjne źródła: w tym odcinku nie występują znaczniki `|353` i `|355`.

## Gnostyk Biblioteka 1.0.32 - zewnętrzna ciemność i imiona smoka

- Dodano znaczniki Schwartze-Petermanna `|320`-`|330`, `|332`-`|334` oraz `|336` do polskiej warstwy stron 219-226.
- Skolacjonowano początek czwartej księgi: smoka zewnętrznej ciemności, dwanaście lochów, rodzaje dusz prowadzonych do karania oraz pomoc przez imiona smoka.
- Zachowano przerwy numeracyjne źródła: w tym odcinku nie występują znaczniki `|331` i `|335`.

## Gnostyk Biblioteka 1.0.31 - odpuszczenie, pokuta i próba Piotra

- Dodano znaczniki Schwartze-Petermanna `|301`-`|305` oraz `|307`-`|319` do polskiej warstwy stron 209-218.
- Skolacjonowano wyjaśnienie chrztów, wyższych misteriów odpuszczenia, pokuty po wtajemniczeniu oraz próbę Piotra wobec kobiety czyniącej pokutę.
- Zachowano przerwę numeracyjną źródła: w tym odcinku nie występuje znacznik `|306`.

## Gnostyk Biblioteka 1.0.30 - dusza, duch naśladowczy i chrzty

- Dodano znaczniki Schwartze-Petermanna `|282`-`|300` do polskiej warstwy stron 201-208.
- Skolacjonowano naukę o budowie człowieka, stanie duszy po śmierci, duchu naśladowczym, Losie oraz obronach duszy w drodze przez krainy.
- Utrzymano aparat cytowania przy interpretacjach Maryi i wprowadzeniu do misteriów chrztów odpuszczających grzechy.

## Gnostyk Biblioteka 1.0.29 - pokuta, świadkowie i misteria uzdrowienia

- Dodano znaczniki Schwartze-Petermanna `|265`-`|281` do polskiej warstwy stron 193-200.
- Skolacjonowano naukę o wielokrotnym przebaczeniu, granicach przekazywania misteriów, pozorantach oraz pomocy duszom po wyjściu z ciała.
- Utrzymano ciągłość aparatu cytowania przy przejściu do misterium wskrzeszania umarłych i zakazu jego powszechnego przekazywania.

## Gnostyk Biblioteka 1.0.28 - oczyszczenie i granice dróg

- Dodano znaczniki Schwartze-Petermanna `|250`-`|254`, `|256`-`|261` oraz `|263`-`|264` do polskiej warstwy stron 185-192.
- Skolacjonowano naukę o misteriach oczyszczających, zakończenie ksiąg Zbawcy, początek trzeciej księgi oraz katalog wyrzeczeń i dróg godnych.
- Zachowano przerwy numeracyjne źródła: w tym odcinku nie występują znaczniki `|255` i `|262`.

## Gnostyk Biblioteka 1.0.27 - gnoza słowa i Księgi Jeu

- Dodano znaczniki Schwartze-Petermanna `|233`-`|249` do polskiej warstwy stron 177-184.
- Skolacjonowano rozróżnienie między gnozą wszechświata a misteriami Światłości, trzy i pięć misteriów Niewypowiadalnego oraz wprowadzenie do Ksiąg Jeu.
- Utrzymano ciągłość aparatu cytowania w przejściu do pytania Andrzeja o przejście przez porządki i moce.

## Gnostyk Biblioteka 1.0.26 - jedyne słowo Niewypowiadalnego

- Dodano znaczniki Schwartze-Petermanna `|217`-`|232` do polskiej warstwy stron 169-176.
- Skolacjonowano objaśnienie prostoty Misterium Niewypowiadalnego, rozdarcie i emanację mocy oraz rangę duszy, która otrzymuje jedno i jedyne słowo.
- Utrzymano ciągłość aparatu cytowania w przejściu do nauki o godności tronów w królestwie.

## Gnostyk Biblioteka 1.0.25 - Misterium Niewypowiadalnego

- Dodano znaczniki Schwartze-Petermanna `|203`-`|216` do polskiej warstwy stron 161-168.
- Skolacjonowano odpowiedź Jana o porządkach misteriów oraz katalog gnozy Misterium Niewypowiadalnego.
- Zachowano przerwę numeracyjną źródła: w tym odcinku nie występuje znacznik `|202`.

## Gnostyk Biblioteka 1.0.24 - Dziedzictwo Światłości i Pomocnicy

- Dodano znaczniki Schwartze-Petermanna `|187`-`|189` oraz `|192`-`|201` do polskiej warstwy stron 153-160.
- Skolacjonowano naukę o chwale Dziedzictwa, dwunastu zbawcach, rangach królestwa, wzniesieniu dusz doskonałych oraz pierwszych Pomocnikach.
- Zachowano przerwę numeracyjną źródła: w tym odcinku nie występują znaczniki `|190` i `|191`.

## Gnostyk Biblioteka 1.0.23 - niewidzialni i koniec opowieści Sophii

- Dodano znaczniki Schwartze-Petermanna `|174`-`|186` do polskiej warstwy stron 145-152.
- Skolacjonowano mowę Sophii do Adamasa, interpretację Marty, powrót Sophii do trzynastego eonu oraz pieśń pośród dwudziestu czterech niewidzialnych.
- Rozpoczęto kolejny dział nauki: pytanie Maryi o chwałę dwudziestu czterech niewidzialnych i porządki wyższych krain.

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
