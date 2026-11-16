# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open work

- **Release handoff: big update v0.960 (branch `big-update`, not pushed).**
  Everything for this release is committed on the local branch `big-update` in
  this checkout; `main` equals `origin/main` (web v0.950). Nothing was pushed.
  Contents: security headers and service-worker timeout, Learn reference cards
  for all 15 lessons in English and German, `web/ui-shell.js` menus and visual
  pass, calm Learn colours, logo as home link, corrected Help/About/What's new
  copy. `APP_VERSION`, `RELEASE_NOTES.md` and `docs/history/changelog.md`
  already say v0.960; `CACHE_VERSION` is `v120` (production has `v118`).
  Steps left before the push, in order:
  1. Run every file in `tests/` with `node tests/<name>.test.js` (there is no
     runner or package.json). The suite was not run after the Learn and UI
     work, so failures in tests that assert old markup, footer, Help copy or
     Learn hints are expected. Fix the test when it asserts replaced copy or
     markup; fix the code when behaviour broke. Record the result here.
  2. Look at the app in both themes on desktop and a phone-sized viewport
     (lesson list, one lesson end to end, the three menus, About, Help).
  3. The owner decides the version: keep `0.960` or use `1.000`. If it changes,
     update `web/app.js`, `web/whats-new.js` (three places), the newest
     `RELEASE_NOTES.md` heading and the newest changelog entry.
  4. At release time set `mergedAt` in `web/whats-new.js` to the real merge
     time and update the same timestamp asserted in `tests/whats-new.test.js`.
  5. Merge `big-update` into `main` and push `main` only when the owner says
     so (deploy flow: `NOTES.md`, "Versioning and deploy"); then tag
     `web-v<APP_VERSION>`.
  6. Port the deliberate `core/` changes to Android `www/core/`:
     `data-tables.js` (cards, L00 removed, lesson 11 title, hints),
     `learn-tutorial.js` (card renderer, `LEARN_MANUALS_DE`, final note),
     `help-popups.js`, `tool-table.js`, `theme-toast.js` (About copy).
  Not done and not blocking: merge the three stacked light-theme CSS layers,
  make the ui-shell menus native markup, restyle dialogs, translate labels
  inside lesson figures, have a German-speaking machinist read the German
  cards. Commits here use
  `git -c user.name=slavomrkva -c user.email=73587710+slavomrkva@users.noreply.github.com`
  because no git identity is configured.

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
