# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open bugs

None.

## Open work

- **Android Learn port deferred until web acceptance.** The web test branch now
  changes `core/learn-tutorial.js` and `core/learn-coach.js`; Android still
  ships its existing practice UI. After the web layout is accepted, port the
  two shared core files deliberately, adapt Android styles and coach anchors,
  then verify the mobile flow on a device without building an APK unless
  explicitly requested.
