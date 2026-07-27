# TNC Sim web — current project contract

This is the concise, current operating map. Historical detail through v0.845
is preserved in
[`docs/history/project-notes-through-v0.845.md`](docs/history/project-notes-through-v0.845.md),
and the continuing technical log lives in
[`docs/history/changelog.md`](docs/history/changelog.md). Do not copy those
histories back here.

## Product and source layout

TNC Sim is a static browser/PWA Heidenhain Klartext simulator hosted at
tncsim.org. `index.html` is the shell; classic scripts and CSS load directly
from `core/` and `web/` with no framework, bundler, imports, or build step.

- `core/` contains currently shared parser, simulation, editor, tool-table,
  Learn, and mobile-tab logic. It is the reference when deliberately porting a
  shared change to Android's `www/core/`.
- `web/` contains browser-specific layout, keyboard, panels, styles, and boot
  code. `web/app.js` owns `APP_VERSION` and order-sensitive startup IIFEs.
- `vendor/` contains Three.js r128 and OrbitControls for offline use.
- `service-worker.js` is web-only. Never copy it into the Capacitor app.
- The Android repository is independent; nothing synchronizes automatically.

Detailed module-split history is in the archived project notes linked above.

## Versioning and deploy

- `APP_VERSION` in `web/app.js` is the only app-version source. Stay in the
  permanent `0.80x` sequence and increment by `0.001` on every push.
- Record every push briefly in `docs/history/changelog.md`. Update this file
  only when a current contract changes. Add `RELEASE_NOTES.md` only for a
  meaningful user-visible change.
- When runtime assets change, keep the service-worker cache version and
  precache list synchronized.
- Push to GitHub; Cloudflare Workers Builds deploys `wrangler.jsonc`, combining
  the Worker API with the existing Static Assets site. `/api/report` lives in
  `worker/report-worker.mjs`; its GitHub and Turnstile credentials are encrypted
  Worker secrets. For a shipped web milestone, create `web-v<APP_VERSION>`. Do
  not add APK/AAB artifacts here.

## Current non-obvious invariants

1. **LBL fall-through:** `LBL n ... LBL 0` executes where defined; `CALL LBL n`
   executes it again. Do not combine both accidentally in lessons or demos.
2. **Zero is a valid Q value:** use `Q !== undefined ? Q : default`, never
   `Q || default` for cycle parameters.
3. **Voxel detail and budgets:** Low/Default/High target 100/150/200 with
   1/0.7/0.5 mm detail caps; Refine targets 300/400/500 with 0.5/0.4/0.3 mm
   caps. One deterministic isotropic planner must preserve those profiles when
   they fit, then coarsen only enough for the rounded grid to remain at or
   below 24M live / 64M Refine voxels. Valid BLK dimensions have no fixed
   millimetre ceiling; keep finite, positive and max-greater-than-min checks.
4. **Responsive layout:** single-column mode is
   `(max-width:1024px), (max-height:600px)`. Use `_isMTab()`; do not introduce a
   width-only variant. See
   [`docs/history/layout-and-renderer-rationale.md`](docs/history/layout-and-renderer-rationale.md).
5. **Mobile WebGL:** keep defensive renderer creation, context-loss handling,
   and the touch-device avoidance of unconditional `high-performance`.
6. **Trademark:** preserve the independent/not-affiliated HEIDENHAIN notice.
7. **Offline contract:** core features must not depend on external runtime
   services.
8. **Service worker:** register only outside Capacitor and never bundle it in
   Android.
9. **Vendored Three.js:** update both vendor files, service-worker precache, and
   the deliberate Android copy together when upgrading.
10. **Renderer resize:** `loop()` must keep calling `resizeToDisplay()`; window
    `resize` alone misses splitter and container changes. See the layout history.
11. **Bug lifecycle:** new/open bugs live in `TODO.md`; every attempt is logged
    there. On acceptance, move symptom, cause, attempts, and verification to
    `BUG_HISTORY.md` in the same change. Mirror cross-repo bugs.
12. **Chunked Marching Cubes:** dirty bounds require the one-cell XY dependency
    halo; Measure raycasting stays recursive while the live mesh is a group.
13. **Cycle feeds and visibility:** cycle `FAUTO` uses the active `TOOL CALL`
   feed. Cycle 200 retracts stay FMAX; Cycle 209 stays pitch×RPM. Only marked
   cycle-internal sub-frame reversals get the held midpoint render.
14. **Radius compensation geometry:** preserve L/C/CR/CT/CP/RND/CHF as exact
   contour primitives through RL/RR calculation and validation; tessellate only
   the finished tool-center path. The activating L is one approach movement
   ending at the following contour's exact offset start, never a nominal move
   plus a hidden lateral segment.
15. **Collision is a warning, never a stop:** a rapid-into-material (FMAX)
   collision must report a pinned warning but must NOT halt the run — real
   machine-proven programs (e.g. a rapid onto a pre-drilled floor) play through
   to the end. `rapidCollision` leaves `mode` untouched and latches
   `window._collisionActive` so `updateStatus` keeps the warning until reset;
   never re-add `mode='idle'` there. The voxel check is resolution-bound, so
   sub-voxel gouges surface only at finer quality — do not "fix" that by
   stopping the sim.
16. **Defer only in-progress radius-comp errors:** while editing
   (`runValidation` defaults to `liveEdit=true`) suppress the "contour not
   finished yet" compensation diagnostics — the `validateProgram` "RL/RR still
   active … END PGM" completeness checks and the `_rcReport` calls flagged
   `incomplete` (`rcDefer`). They return at Run/Step, which call
   `runValidation(false)`. Genuine geometry errors (tool radius too large,
   non-positive radius, no valid intersection) always stay live — never blanket
   all radius-comp errors into the deferred set.
17. **Header name is the file identity, not BEGIN PGM:** `#progTitleName`
   shows `_docName`, set on demo pick (friendly name), import (filename),
   export (saved filename) and Clear (`program.H`); `_setDocName` is the only
   writer and app.js seeds it with the starter demo. Do not revert the header
   to `_progFileName(code)` — every demo/imported file uses `BEGIN PGM PROGRAM`
   internally, so parsing the body always yields `PROGRAM.H`.
18. **Autosave protects only the main program:** persist the current NC code,
    document name and save time in the local `tncsim.programDraft.v1` record,
    restore it before normal editor boot, and surface neutral pending/saving,
    green saved and orange error state in the editor header. Schedule at most
    one write 30 seconds after the first pending change, without postponing it
    on further typing; lifecycle hiding still flushes immediately. Entering Learn must first force-save the main
    program and then suspend autosave; lesson code is transient and closing
    Learn restores the main draft. A reload during Learn must also recover the
    main draft, never browser-restored lesson text.

19. **Program operations use logical NC blocks, not textarea rows:**
    `analyzeProgramRows()` is the source of truth for gutter numbering,
    selection, Problems labels, insertion, deletion and export. `CYCL DEF` plus
    its directly following Q parameter rows is one block; tilde continuations
    belong to their anchor block; an internal empty row is a numbered
    placeholder; only the final textarea newline is an artifact. Enter from
    anywhere in a cycle targets the first block after the complete cycle, and
    Enter on `END PGM` remains a no-op. Every programming-key insertion routes
    through `insertProgramBlock()`. On web, never reclassify desktop multi-line
    paste/drop as Enter and never intercept Enter while an IME composition is
    active.

20. **Learn practice is rendered once in core:** `_learnPracticeHtml()` returns
    `{body, foot}` for every layout; web code may synchronize external editor
    chrome but must never re-parent or rebuild the rendered practice DOM.
    `; >>>` is a reserved answer marker and must be stripped anywhere it could
    affect grading. Live grading may show only pending/met states while typing;
    failed verdicts appear only after Check. During practice, theory remains a
    collapsible slide-by-slide reference rather than a second long document.

Add a numbered rule only for a durable invariant that is not already covered.
Resolved narratives belong in `BUG_HISTORY.md`; retired architecture detail and
the technical log belong in `docs/history/`.

## Testing before push

- Confirm changed JavaScript parses and the browser console is clean.
- For parser/cutting changes, run the relevant Node regression and a 3D sanity
  program.
- For Learn changes, ensure the solution passes its checks and LBL content does
  not run twice.
- For CSS/layout changes, check desktop plus a narrow or short viewport.
- Verify the intended diff, bump `APP_VERSION`, update the technical changelog,
  and keep `origin/main` current after acceptance.
