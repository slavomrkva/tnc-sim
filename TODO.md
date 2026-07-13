# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** a newly discovered bug goes HERE,
> and every fix attempt for it is logged here as it happens (what was tried,
> what the result was). When it's finally fixed, the whole entry is **removed
> from this file and moved to `BUG_HISTORY.md`** (with root cause + all the
> attempts). Open bugs live here; resolved bugs live in `BUG_HISTORY.md`.

## Open bugs

## C5 — Textové pole prechádza pod ovládacie panely
**Repos:** web + Android. **Reported:** 2026-07-13.

### Symptom
Textové pole ide v pozadí za ovládacie panely s tlačidlami Path functions a
ďalšími ovládacími prvkami. Treba určiť vertikálne hranice textového poľa, aby
obsah neprechádzal pod tieto panely.

### Status
Open — the web test fix on `fix/c5-bounded-editor-viewport` was confirmed by
the user; the branch is awaiting the final two web changes and merge. Android
is unchanged.

### Attempts
- Web v0.825 test fix: replaced the single scrolling `.editor-panel` plus
  sticky overlays with a fixed flex column where only `#code` scrolls. The
  header, Path functions, context/cycle panel and optional practice strip now
  consume real rows above the code, whose bottom ends at the mobile tab bar.
  Local Chrome checks at 390×844 confirmed exact adjacent boundaries, synced
  textarea/line-number/highlight scrolling, dynamic L-panel resizing, practice
  resizing, and no desktop-layout change. Existing `kbd-open` still hides the
  practice strip and now also removes the bottom-tab reservation.
- User verification (2026-07-13): the web C5 fix works. Keep C5 open until the
  branch is merged and the separate Android side is handled.

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
