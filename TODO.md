# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open work

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
