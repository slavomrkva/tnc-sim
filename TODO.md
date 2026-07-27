# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open bugs

- **Mobile bottom tabs can leave the visible viewport while scrolling in
  Learn practice / Editor.** Attempt 1 in web v0.914 moves the tab bar into the
  bounded mobile flex layout, sizes that layout from `visualViewport`, and
  prevents browser-chrome resizing without text focus from being mistaken for
  the software keyboard. Pending real-device acceptance.
- **Start Here mobile guidance points to practice instead of Learn for Info
  Slides.** Attempt 1 in web v0.914 sends the coach's Info Slides step to the
  Learn tab and names Learn explicitly in the mobile slide copy. Pending
  real-device acceptance.

## Open work

- **Android Learn port deferred until web acceptance.** The web test branch now
  changes `core/data-tables.js`, `core/learn-tutorial.js`,
  `core/learn-coach.js` and `core/editor-core.js`; Android still ships its
  existing practice UI. After the web layout is accepted, port the four shared
  core files deliberately, adapt Android styles, answer-line overlay and coach
  anchors, then verify the mobile flow on a device without building an APK
  unless explicitly requested.
