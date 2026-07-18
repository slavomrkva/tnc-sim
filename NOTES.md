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
- Push to GitHub; Cloudflare Pages deploys automatically. For a shipped web
  milestone, create `web-v<APP_VERSION>`. Do not add APK/AAB artifacts here.

## Current non-obvious invariants

1. **LBL fall-through:** `LBL n ... LBL 0` executes where defined; `CALL LBL n`
   executes it again. Do not combine both accidentally in lessons or demos.
2. **Zero is a valid Q value:** use `Q !== undefined ? Q : default`, never
   `Q || default` for cycle parameters.
3. **Voxel detail and budgets:** Low/Default/High are 100/150/200 with
   1/0.7/0.5 mm caps; Refine is 300/400/500 with 0.5/0.4/0.3 mm caps. Keep web
   guards at 24M live and 64M Refine voxels.
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
