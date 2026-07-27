# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open bugs

- **Desktop field-panel values cannot be selected and edited directly.**
  `#fbarVal` is rendered as a non-editable span and the panel mouseup handler
  returns focus to the program textarea. In addition, TOOL CALL inserts its
  fixed `Z` token after calculating field ranges, so activating `S3000`
  selects `Z S30` in the underlying editor. Reproduced on current v0.914.
  Fix all generic field values through one real desktop input, preserve mobile
  input ownership, and calculate ranges from the final postprocessed line.

## Open work

- **Port the accepted web Learn redesign to Android.** Web v0.914 is accepted
  and merged; Android still ships its existing practice UI. Port
  `core/data-tables.js`, `core/learn-tutorial.js`, `core/learn-coach.js` and
  `core/editor-core.js` deliberately, adapt Android styles, answer-line overlay
  and coach anchors, then verify the mobile flow on a device without building
  an APK unless explicitly requested.
