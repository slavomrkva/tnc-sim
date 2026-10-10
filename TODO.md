# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open work

- **C61 / GitHub #44 — compensated retrace skips the contour (implemented,
  awaiting acceptance).** The analytic loop check treated a deliberate return
  along an earlier nominal edge as a new tool-center loop because generated
  transition arcs lacked their source geometry and collinear overlap was not
  recognized. It then dropped the entire RL run after the plunge. The parser
  now compares transition intersections with both nominal neighbors and
  recognizes overlapping straight edges. A repeated XY endpoint remains a
  no-op instead of being mislabeled as a pure Z move. The exact reported
  six-pass program and an unrelated genuine loop are regression tested.
  Keep open until the web simulation is accepted.

- **C60 — Path-function X committed the provisional block (implemented,
  awaiting acceptance).**
  Opening a guided Path function immediately inserts its provisional block,
  but the panel X used the same `exitFieldMode()` path as Done and therefore
  left that block in the program. The panel now captures the complete
  pre-session program, selection, dirty state and undo/redo stacks: X restores
  them, while Done/Enter remain commits. Runtime regressions cover every
  Cartesian, polar and APPR/DEP builder, cancellation of edits to an existing
  block, and removal of multi-line guided insert side effects. Keep open until
  accepted in both products.


## Bug report without GitHub tokens (pending device acceptance)

- Replaced the token-dependent dialog with prefilled GitHub issues and email drafts to info@tncsim.org. GitHub requires visitor login; email does not.
- Added full-report export and a visible warning when link length requires shortening. Removed Turnstile loading from current clients; retained the legacy Worker for older versions.
- Verified both regression suites and Chromium dialog flows, including email/GitHub URLs, Unicode, suggestions omitting the NC program, and long-report export. Android native external-app opening still needs device acceptance.
- Manual test: docs/bug-report-manual-test.md.
