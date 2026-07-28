# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open work

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
