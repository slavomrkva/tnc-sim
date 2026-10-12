# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open work

- **Web audit 2026-10-12 / A01–A13 — implemented on review branch, awaiting
  acceptance.** First repair pass replaces Q-expression rewriting with one
  bounded evaluator, corrects tiny directed arcs and Cycle 209 reversals,
  invalidates dirty paused playback, checks rapid/stopped-spindle stock contact,
  gates live/Refine cutting by spindle state, handles failed WebGL startup,
  bounds program generation, adapts Cycle 208 tessellation, and fixes M4/tab
  presentation. All 50 Node test files pass, including two new audit suites.
  GPU/browser visual acceptance remains pending: local browser download failed
  and the remote browser cannot access the local server. See
  [acceptance checklist](docs/web-audit-2026-10-12.md).
  **Web repository only; do not merge or port to Android until requested.**


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
