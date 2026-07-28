# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open work

- **Validator audit excluding M functions — findings pending repair.** Compared
  the implemented grammar and parser behavior with the offline TNC 640
  Conversational Programming manual (10/2019) and Machining Cycles manual
  (01/2021). Confirmed issues:
  - LBL expansion occurs before the documented `REP 1..65534` bound is checked;
    very large repeats can expand tens of thousands of blocks and diagnostics.
    Label numbers are not limited to `1..65535`, extra tokens are accepted, and
    documented named labels are not implemented (Conversational pp. 244, 247).
  - The documented one-block cylinder blank is rejected in favor of a custom
    two-block form; incremental MAX coordinates on `BLK FORM 0.2` are not
    recognized, while duplicate/reversed definitions and trailing garbage can
    pass (Conversational pp. 90–91).
  - Duplicate coordinates and conflicting absolute/incremental values can pass
    and are then resolved by regex order instead of being rejected.
  - `FMAX` is falsely rejected on `C`, `CR`, `CT` and `CP`, although feed is
    permitted in every positioning block. The wider documented `FU`/`FZ`
    vocabulary is also outside the simulator grammar (Conversational p. 122).
  - Documented block-local feeds are rejected on `CHF` and `RND`, and `RND` is
    restricted to two straight simulator moves instead of preceding/subsequent
    contour elements (Conversational pp. 156–157).
  - `TOOL DEF <tool> L... R...` is rejected because the simulator currently
    treats TOOL DEF only as a preload. Valid TOOL CALL names/QS, alternate tool
    axes and additional feed/tool fields are outside its grammar
    (Conversational pp. 126–127).
  - `STOP` is a documented block but is rejected as unsupported
    (Conversational p. 224).
  - Supported cycles accept incomplete definitions and unknown Q parameters by
    inventing defaults. Required/allowed parameter sets and documented ranges
    are not enforced; `FU`/`FZ` feed values and negative Q336 are falsely
    rejected in applicable cycles (Cycles pp. 84, 86, 108, 134).
  - The coordinate-sign warning can miss `X0` when another coordinate in the
    same block has an explicit sign.

- **Port the accepted web Learn redesign to Android.** Web v0.914 is accepted
  and merged; Android still ships its existing practice UI. Port
  `core/data-tables.js`, `core/learn-tutorial.js`, `core/learn-coach.js` and
  `core/editor-core.js` deliberately, adapt Android styles, answer-line overlay
  and coach anchors, then verify the mobile flow on a device without building
  an APK unless explicitly requested.
