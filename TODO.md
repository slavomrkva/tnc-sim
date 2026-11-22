# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** newly discovered bugs and every
> fix attempt are recorded here. Once accepted, their evidence moves to
> `BUG_HISTORY.md`.

## Open work

- **C66 — Mobile Chrome: choppy simulation and slow Refine (implemented on
  `perf/mobile-chrome-refine`, awaiting owner's phone check).** Firefox on the
  same phone is much faster. Cause of the browser difference is not confirmed:
  desktop Chrome is as fast as Firefox, but Chrome with its optimizing JIT off
  is about 12x slower, which would match (Chrome Site settings > JavaScript
  optimization). Attempt 1 (v1.013): lossless speed-up of Refine, live cutting,
  meshing and path uploads; see the changelog. Android port pending.

- **External audit 2026-11-21 — confirmed parser/XSS findings (implemented,
  awaiting acceptance; web only, Android port pending).** An external
  (Gemini) audit listed ~124 findings; these were reproduced in Node and fixed:
  PAR-5 an L block with M99 was batched, so the next block started from the
  parse-time Z and teleported the tool 45 mm between holes (the batch now
  flushes after a cycle call); PAR-2 an inside arc equal to the tool radius
  collapses to a point that `_rcHasLoop` reported as a loop; PAR-4 a standalone
  M3/M8/... segment split an RL/RR run and the rest was rejected (it is now
  lifted out and reinserted by block index); PAR-13 a zero-length RL
  activation was dropped with its `rcActivation`; PAR-1 a Q value such as
  3e-15 was substituted with an exponent and read as 3.06 mm; PAR-6 parser RND
  regex rejected `R+5`; PAR-24 inline `Q206=0.5` read as 0; SEC-1 program text,
  comments, file and tool names went into `innerHTML` unescaped (now
  `toolEsc`). Not reproduced: PAR-7, PAR-20. Regression:
  `tests/gemini-audit-2026-11.test.js`; all 56 Node test files pass. The other
  audit findings (editor, CSS, Learn, service worker) are not yet verified.

- **C65 — L09 task 1 could not add LBL 1 / LBL 0 (implemented, awaiting
  acceptance).** Reported 2026-11-20 on a phone: only the two drilling blocks
  were editable, no new rows could be added. Cause: the wrap task's answer
  range held only the existing blocks and the keypad inserts after the caret
  row. Attempt 1 (v1.008): empty answer rows reserved above/below; sweep test
  extended. Pending: owner check on a phone.

- **C64 — Mobile tap after a block raised the text keyboard (implemented,
  awaiting acceptance).** Reported 2026-11-20 in L07 task 1: tapping the end
  of the highlighted `L Y+0 F300` showed the phone's text keyboard and only
  part of the screen; tapping F300 worked. Cause: free space after a command
  only placed the caret in the editable textarea. Attempt 1 (v1.007): on
  `isMobile()` the tap opens the block's field editor. Attempt 2 (v1.009):
  Enter in that mobile editor commits and opens an empty row below the block,
  restoring tap-end + Enter + key. Pending: owner check on a phone.

- **C63 — BLK FORM Insert did nothing in L01 tasks 2/3 (implemented,
  awaiting acceptance).** Reported 2026-11-19 on mobile: after filling the
  BLK FORM panel, Insert left the editor unchanged. Cause: the panel targets
  the end of BEGIN PGM when no BLK FORM exists; that is locked prefix in
  practice, and `learnLockCaret()` checked only the textarea selection, so the
  insert was rolled back by `learnEnforceLock()`. Attempt 1 (v1.002):
  `insertProgramBlock()` passes its target to `learnLockCaret(start,end)`,
  which redirects it into the answer range. Regression
  `tests/learn-lock-blk-insert.test.js`. Pending: owner check on a phone.

- **Release handoff: version 1.000 (branch `big-update`, not pushed).**
  Everything for this release is committed on the local branch `big-update` in
  this checkout; `main` equals `origin/main` (web v0.950). Nothing was pushed.
  Contents: security headers and service-worker timeout, Learn reference cards
  for all 15 lessons in English and German, `web/ui-shell.js` menus and visual
  pass, calm Learn colours, logo as home link, corrected Help/About/What's new
  copy, all slide figures back on the cards in the owner's redrawn set, L11
  named bore milling throughout, neutral grey running-line and lesson hover
  marks. `APP_VERSION`, `RELEASE_NOTES.md` and `docs/history/changelog.md`
  already say v1.000; `CACHE_VERSION` is `v121` (production has `v118`).
  Steps left before the push, in order:
  1. Done 2026-11-17 (rerun after the figure and text changes): all 53
     `tests/*.test.js` files and `tests/report-worker.test.mjs` pass (run one by one with `node`; there
     is no runner or package.json). One test needed updating
     (`whats-new.test.js` asserted the old announcement items). The tests do
     not cover the look of the ui-shell menus or the new colours.
  2. Look at the app in both themes on desktop and a phone-sized viewport
     (lesson list, one lesson end to end, the three menus, About, Help).
  3. Done: the owner chose version `1.000`; it is set in `web/app.js`,
     `web/whats-new.js`, `RELEASE_NOTES.md` and the changelog.
  4. At release time set `mergedAt` in `web/whats-new.js` to the real merge
     time and update the same timestamp asserted in `tests/whats-new.test.js`.
  5. Merge `big-update` into `main` and push `main` only when the owner says
     so (deploy flow: `NOTES.md`, "Versioning and deploy"); then tag
     `web-v<APP_VERSION>`.
  6. Port the deliberate `core/` changes to Android `www/core/`:
     `data-tables.js` (cards with slide figures, L00 removed, lesson 11
     bore-milling texts, hints),
     `learn-tutorial.js` (card renderer, `LEARN_MANUALS_DE`, final note, all
     redrawn `learnSvg*` figures; the Android CSS also needs the `--fig-*`
     palette from `web/styles.css`),
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
