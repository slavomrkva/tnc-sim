# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** a newly discovered bug goes HERE,
> and every fix attempt for it is logged here as it happens (what was tried,
> what the result was). When it's finally fixed, the whole entry is **removed
> from this file and moved to `BUG_HISTORY.md`** (with root cause + all the
> attempts). Open bugs live here; resolved bugs live in `BUG_HISTORY.md`.

## Open bugs

## C1 — Editor pri editácii hodnoty preskakuje na prvý riadok
**Repos:** web + Android. **Reported:** 2026-07-13.

### Symptom
Keď kliknem v editore na ľubovoľnú hodnotu a chcem ju editovať, editor chce
skočiť na prvý riadok, ale predchádzajúce úpravy sa snažia držať focus na
editovanom riadku. Výsledok je, že obsah skáče a nie je statický. Pri kliknutí
na ľubovoľnú hodnotu alebo ľubovoľný riadok, pri vysunutí klávesnice a pri
skrytí panelu so zadaním v Learn mode musí editor zostať stabilne tam, kam ho
používateľ ručne prescroloval.

### Status
Open. Súvisí s C3.

### Attempts
- **Web test branch `debug/c1-mobile-focus` (v0.819)** — removed the repeated
  delayed hidden-input focus and 60/200/450/700 ms scroll rewrites, moved
  `#mobileInput` out of the editor scroll flow, made focus use
  `preventScroll`, and explicitly ends field/Q/BLK input sessions before Learn
  replaces or restores the program. Keyboard detection now has hysteresis and
  a baseline fallback for browsers where `innerHeight` shrinks with
  `visualViewport`. Local forced-mobile browser test: opening a field focuses
  `mobileInput` once; `Done` and entering Learn leave it blurred and it does
  not return after 150 ms; no JS console errors. **Awaiting real-phone web
  verification before treating C1 as fixed or porting the shared-core changes
  to Android.**

## C2 — RL/RR korekcia pri záverečnom pohybe Z+20 vedie nástroj šikmo do modelu
**Repos:** web + Android. **Reported:** 2026-07-13.

### Symptom
Pri poslednom bloku `L Z+20 R0` má ísť nástroj rovno hore. V simulácii však ide
šikmo ešte do modelu, akoby sa po ceste snažil napraviť korekciu. To je
nesprávne.

### Repro program
```text
LBL 1
L X-20 Y+235 Z+50 FMAX
L Z+Q1
L Y+230 FAUTO RL
L X+101
CHF 15
L Y+200
RND R5.5
L X+161
RND R5.5
L Y+230
CHF 15
L X+296
CHF 15
L Y+200
RND R5.5
L X+366
CHF 15
L Y+0
CHF 15
L X+0
CHF 15
L Y+231
CHF 16
L X+20
L Z+20 R0
LBL 0
END PGM PROGRAM
```

### Status
Open.

## C3 — Vkladanie RND/CHF niekedy vloží blok na začiatok programu
**Repos:** web + Android. **Reported:** 2026-07-13.

### Symptom
Pri písaní programu vkladanie hodnôt RND a CHF niekedy vloží tieto bloky na
úplný začiatok programu. Pravdepodobne to súvisí so skákaním focusu pri
otváraní panelov na editáciu týchto funkcií.

### Status
Open. Súvisí s C1.

## C4 — Pravidlá vloženia ďalšieho bloku podľa aktívneho riadku
**Repos:** web + Android. **Reported:** 2026-07-13.

### Expected behaviour
Keď je aktívny neprázdny riadok a kurzor bliká na jeho konci, ďalší blok sa má
vložiť pod tento riadok bez pridania prázdneho riadku. Keď kurzor bliká v
prázdnom riadku, ďalší blok sa má vložiť na miesto tohto riadku a nahradiť ho.

### Status
Open.

## C5 — Textové pole prechádza pod ovládacie panely
**Repos:** web + Android. **Reported:** 2026-07-13.

### Symptom
Textové pole ide v pozadí za ovládacie panely s tlačidlami Path functions a
ďalšími ovládacími prvkami. Treba určiť vertikálne hranice textového poľa, aby
obsah neprechádzal pod tieto panely.

### Status
Open.

<!-- Template for a new bug (copy below "Open bugs"):

## <short title> — <one-line symptom>
**Reported:** <date>. **Repro:** <steps / device / browser / only-on-device?>
### Symptom
<verbatim if possible>
### Attempts
- Attempt 1 — <what / hypothesis>: <result>.
- Attempt 2 — …
### Status
<current best understanding / next thing to try>
-->
