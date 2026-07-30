# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open work

- **C59 — Learn Cycle 209 used a non-editor block format and incomplete
  follow-on starters (implemented, awaiting acceptance).**
  The password solution placed Q257/Q256 on the `CYCL DEF 209` header, while
  the editor serializes every Q parameter on its own row; the following two
  tasks also omitted required Q336/Q403. The solution and both carried-forward
  starters now use the editor order Q200/Q201/Q239/Q203/Q204/Q257/Q256/Q336/
  Q403, and the guided Cycle 209 schema exposes Q403. Full Run-validation
  regressions cover all three tasks. Keep open until accepted in both products.

- **C58 — Lesson 7 task 1 left RR active on its retract (implemented,
  awaiting acceptance).**
  The password-completed program reached `L Z+50 FMAX` while RR was still
  active, so Check passed but Run correctly rejected the pure-Z compensated
  move and the uncancelled contour. The starter now uses the agreed
  `L Z+50 R0 FMAX`, with a full Run-validator regression. Keep open until
  accepted in both products.

- **C57 — APPR/DEP key stayed visually expanded after entering Practice
  (implemented, awaiting acceptance).**
  Replacing the context strip could remove the picker before its trigger state
  was cleared. Every idle-panel render now unconditionally collapses the
  APPR/DEP trigger, and desktop editor-owner cleanup recognizes the picker
  explicitly. Keep open until accepted in both products.

- **C56 — False missing-spindle warning after safe FMAX positioning
  (implemented, awaiting acceptance).**
  The validator used its first positioning move as the gate for the
  first-cutting-move warning, so a safe `L ... FMAX` block could emit the
  warning before a later first feed block started the spindle with an embedded
  `M3`. Web 0.926 now tracks the first non-FMAX motion separately, while
  retaining tool checks on all positioning moves and the documented
  start/end-of-block M timing. Official circular/helix programs and dedicated
  M3/M4/M13/M14/M5 regressions cover both accepted and warning cases. Keep
  open until the behavior is accepted in both products.

- **C55 — Validator ran during every programming action (implemented,
  awaiting acceptance).**
  Programming keys, guided panels, imports and raw text edits all shared
  `runValidation()` with simulation start, so inserting any function could
  immediately run both static validation and toolpath parsing. Web 0.926 now
  uses the no-argument call only to discard stale diagnostics; only Run and
  Step invoke full validation with `runValidation(false)`. A pending edit timer
  is cancelled before simulation validation so it cannot erase a blocking
  result. Runtime and whole-source regressions prove that no programming
  function or editor panel can request full validation. Keep open until the
  behavior is accepted in both products.

- **C54 — Desktop click after a terminal M function opened M editing
  (implemented, awaiting acceptance).**
  A textarea reports the same `selectionStart` at the end of `M3` for a click
  on its final glyph and for a click in empty space to its right. The desktop
  handler therefore treated both actions as an M-token click. Web 0.926 now
  measures the clicked character cell: clicking directly on `M<number>` still
  opens the appropriate standalone or positioning-block editor, while clicking
  after the command leaves the caret at line end so Enter inserts the next
  block. Deterministic geometry regressions cover standalone `M3` and terminal
  `M99`. Keep open until the desktop behavior is accepted.

- **C47-C48 — Import whitespace and Unicode normalization (implemented,
  awaiting acceptance).**
  The pre-production metamorphic audit found that repeated spaces/tabs were
  accepted by validation after command normalization, but the parser's
  separate BLK FORM pre-scan still missed the blank. Simulation therefore
  began at the fallback home position even though the remaining path looked
  valid. Direct/imported input could also retain a leading Unicode BOM or
  mixed CRLF/CR endings and fail structural recognition. Web 0.922 now applies
  the same whitespace normalization to validator, label expansion, BLK FORM
  pre-scan and motion parsing, strips BOMs, and normalizes imported line
  endings. Deterministic tests cover nine equivalent spellings and 200 seeded
  programs. Keep open until the release candidate is accepted.

- **C39-C46 — Official HEIDENHAIN import compatibility (implemented,
  awaiting acceptance).**
  The 2026-07-28 Android pre-publish audit confirmed the same shared-core
  failures on web `main`: documented positioning `F AUTO` produces three false
  validator errors; Cycle 200 `Q206=AUTO` is rejected and generates no cutting
  path; compact `REP6` is rejected and silently skipped. The same flat numeric
  LBL expander also lacks program-section boundaries and nested sections.
  A second official-program pass additionally confirmed that LP radius-
  compensation activation is rejected, angle-less `CP DR+` full circles are
  rejected/skipped, and compensated full/multi-turn CP paths need turn-
  preserving joins.
  Implemented deliberately in Android 1.0.96 and web 0.921, preserving the
  platform-specific parser differences and the 32-level/200000-block guards.
  Focused regressions cover validator, parser, guided editor, full-circle CP
  and compensated 25-turn helices. Keep this item open until both builds are
  accepted; on acceptance move the full evidence to each repo's bug history.

- **Port the accepted web Learn redesign to Android.** Web v0.914 is accepted
  and merged; Android still ships its existing practice UI. Port
  `core/data-tables.js`, `core/learn-tutorial.js`, `core/learn-coach.js` and
  `core/editor-core.js` deliberately, adapt Android styles, answer-line overlay
  and coach anchors, then verify the mobile flow on a device without building
  an APK unless explicitly requested.
