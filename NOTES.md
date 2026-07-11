# TNC Sim — project notes & map

> **READ THIS FIRST if you are an AI assistant (or a developer) editing this
> project in a fresh session without prior context.** This file is the memory of
> the project. It explains how things work and which non-obvious rules must not
> be broken. **Whenever you make a change, you MUST update this file** (add a line
> to the Changelog at the bottom, and update any section your change affects) and
> **bump `APP_VERSION`** — see "Versioning" below. Keep entries short.
>
> **Also: if the change is user-visible or otherwise important, add a short
> user-facing line to `RELEASE_NOTES.md`** under the current `APP_VERSION`.
> `NOTES.md` Changelog = detailed technical log; `RELEASE_NOTES.md` = the short
> history a user would care about. Purely internal tweaks go only in NOTES.md.
>
> **If you discover a new non-obvious pitfall, a bug caused by a subtle behaviour,
> or something that could easily be broken by a future edit, ADD IT as a new
> numbered rule under "NON-OBVIOUS RULES" below.** These rules are how the project
> protects itself across sessions that have no shared memory — growing this list
> is expected and encouraged. Prefer adding a short, specific rule over assuming
> the next editor will "just know".

---

## What this is
A free browser-based **Heidenhain TNC (Klartext) CNC simulator**. The entire app
is a **single `index.html`** (HTML + CSS + JS, no build step, no framework).
Hosted on **Cloudflare Pages**, repo `slavomrkva/tnc-sim`, live at **tncsim.org**.
Also shipped as an **Android app** (TWA via PWABuilder) and installable as a PWA.

## Files in the repo
- `index.html` — the whole app (everything lives here).
- `manifest.json` — PWA manifest (name, icons, colors, standalone).
- `service-worker.js` — offline cache, "stale-while-revalidate" (offline use +
  auto-update from GitHub on next launch).
- `icon-192.png`, `icon-512.png` — app icons (teal tile + coordinate grid + centre point).
- `feature-graphic.png` — 1024×500 Play Store banner.
- `privacy.html` — privacy policy (served at /privacy.html).
- `.well-known/assetlinks.json` — TWA verification (makes the Android app open
  without a browser address bar). Do not remove.
- `NOTES.md` — this file.

## No build / no tooling
Plain vanilla JS. Do NOT introduce frameworks, bundlers, or npm build steps.
Edit `index.html` directly. Test by opening it in a browser.

---

## Versioning  (single source of truth)
`APP_VERSION` is defined once near the top of the main `<script>` in `index.html`
(search for `var APP_VERSION`). It auto-feeds the header badge, the About popup,
and the bug-report info. **Never hard-code the version anywhere else.**
Convention:
- small fix / tweak -> +0.001  (e.g. 0.801 -> 0.802)
- larger feature    -> +0.1    (e.g. 0.8xx -> 0.9)
**Bump it on every meaningful change.**

---

## Architecture map (where things live in index.html)
- **Parser** — `parseProgram(code)` turns Klartext into motion segments (`sub`).
  Helpers: `expandLblLines` (LBL/CALL expansion), `resolveQLine`/`resolveQLineExpr`
  (Q-variable substitution), `applyRadiusComp` (RL/RR/R0 tool-radius offset).
- **Cycles** — `executeCycle(cy,...)` implements CYCL DEF 200 (drill), 201 (ream),
  208 (bore/circular pocket), 209 (tapping), etc.
- **Voxel cutting / 3D** — `vxCut(...)` removes material from a voxel grid;
  `buildScene(prog)` builds the Three.js scene; `init3D()` sets up the renderer;
  `loop()` is the render loop. Three.js is loaded from a CDN; `THREE_OK` flags it.
- **Tool table** — `toolLibrary` array. Tools have TYPE (MILL / DRILL /
  COUNTERSINK) with distinct cutting behaviour. Countersink R is ~0.001 (tip).
- **Learn mode** — `LESSONS` array (each: `id`, `title`, `slides[]`, `tasks[]`).
  `learnRender`, `learnCheck` (validates the user's program against a task's
  `checks[]`), `learnStartTask`, `learnSolve` (password fill), progress via
  `localStorage` key `tnc_learn`.
- **Mobile** — bottom tab bar (Editor / 3D / Learn); keyboard handling via
  `visualViewport` (`html.kbd-open`); see "Mobile rules" below.

---

## NON-OBVIOUS RULES — do not break these
<!-- Add a new numbered rule here whenever a new critical pitfall is found. -->


### 1. LBL runs where it is written (fall-through!)
`expandLblLines` inlines a `LBL n … LBL 0` body **at its definition location** —
so the body executes once by fall-through even with NO `CALL LBL n`. A `CALL LBL n`
runs the body an **extra** time. Therefore the reuse pattern is:
define the profile in `LBL 1` right after the FIRST tool (it runs via fall-through),
then for the SECOND tool use `CALL LBL 1`. Putting `CALL LBL 1` **and** a
fall-through definition makes the tool cut **twice**. (This bit the parametric-
contour lesson; keep it in mind for any LBL-based lesson or demo.)

### 2. Q-value fallbacks must treat 0 as valid
When reading cycle params, use `Q!==undefined ? Q : default`, NOT `Q || default`.
E.g. `Q202=+0` (full-depth peck) is valid; `Q||5` would wrongly become 5.

### 3. Voxel cell size limits detail
The 3D cut is a voxel grid (~1 mm cells on Default). Details finer than a cell
won't show even at High/after Refine. This is by design; note it, don't "fix" it
by cranking resolution (memory/perf on mobile).

### 4. Layout breakpoint is 1024px (single-column ≤1024, side-by-side >1024)
Mobile vs desktop layout is decided by `@media(max-width:1024px)` (CSS, ~9
blocks) and the JS `matchMedia('(max-width:1024px)')` in `_isMTab()` / `isMob()`
plus `window.innerWidth > 1024` for popup placement. **≤1024px** → single-column
tabbed layout (Editor/3D/Learn bottom bar) so the 3D sim gets full width;
**>1024px** → editor-beside-3D. The breakpoint was raised from 700→1024 so
portrait tablets don't get the cramped side-by-side (the 3D view was too narrow).
If you add a new layout media query or a JS width check, use 1024px to match.
(The Android app forces single-column always — see the app repo's NOTES —
because a tablet running the app would otherwise hit the >1024 desktop layout.)

### 5. WebGL / 3D can fail on some phones (esp. Xiaomi/HyperOS)
Renderer creation is wrapped defensively (tiered options; no `high-performance`
on touch devices — it makes some GPUs kill the context). Context loss is handled:
`webglcontextlost`/`webglcontextrestored` + `glContextLost` guard in `loop()` +
`show3DError()` fallback message. Don't re-add `powerPreference:'high-performance'`
unconditionally. If 3D still fails on a device, the next lever is a smaller voxel
grid on mobile.

### 6. Copyright / trademark
Keep the "not affiliated with HEIDENHAIN GmbH" line in About and the store
listing. "Heidenhain" is a trademark; the project is independent.

### 7. Artifacts / storage
The web app must keep working offline via the service worker. Don't add hard
dependencies on external runtime services for core features (editor, 3D, lessons
all run client-side).

### 8. Service worker: web only, never in the Capacitor app
SW registration in `index.html` is gated with `!window.Capacitor`. The Android
app (repo `tnc-sim-android`) bundles its own copy of the files — a SW-cached
old `index.html` would keep being served after an app update and mask it. Keep
the gate; never copy `service-worker.js` into the app's `www/`.

### 9. Three.js is vendored in `vendor/` — keep SW precache in sync
Three.js r128 + OrbitControls live in `vendor/` (no CDN dependency — required
for offline 3D on the web and inside the Android app bundle; also rule #7).
`index.html` references them with *relative* paths (`vendor/three.min.js`) so
they also work when the file is opened via `file://` and inside Capacitor.
If you ever upgrade Three.js: replace both files in `vendor/`, keep the
`PRECACHE_URLS` list in `service-worker.js` in sync, bump `CACHE_VERSION`,
and sync `vendor/` into the Android repo's `www/` as well.

---

## Deploy flow
Edit `index.html` -> commit -> push to GitHub -> Cloudflare Pages auto-deploys ->
service worker updates web users on their next launch. The Android app
(Capacitor, repo `tnc-sim-android`) bundles its own copy of `index.html` and
does NOT auto-update — shipping web changes to the app requires a manual
sync + rebuild + Play Console release there (see that repo's NOTES.md).

## Testing checklist before pushing
- JS parses (no syntax error). Quick check: load in a browser, console clean.
- If you changed a lesson: its `sol` passes all its `checks`, and it does not cut
  twice (see rule #1).
- If you changed cutting logic: sanity-check a drill/bore/chamfer program in 3D.
- If you changed layout/CSS: check both desktop and a narrow (phone) width.

---

## Changelog  (newest first — add a line for every change)
- v0.805 — Added a browser favicon (`favicon.ico` 16/32/48 + `favicon-32.png`)
  generated from the app icon; `<link rel="icon">` tags in `<head>`, and both
  precached by the service worker (cache bumped to v4). Previously the tab had
  no icon (default /favicon.ico 404'd).
- v0.804 — Raised the layout breakpoint 700→1024px so tablets (and narrow
  laptop windows) use the single-column tabbed layout instead of the cramped
  editor-beside-3D — the 3D simulation now gets full width on tablets. Changed
  the 9 `@media(max-width:700px)` blocks, the `matchMedia` calls in
  `_isMTab()`/`isMob()`, and two `innerWidth > 700` popup checks. See rule #4.
- v0.803 — Vendored Three.js r128 + OrbitControls into `vendor/` and switched
  `index.html` to relative local script paths (was jsDelivr CDN). Removes the
  external runtime dependency (rule #7), makes 3D work offline in the Android
  app bundle from first launch, and simplifies SW caching (v3: precaches
  `/vendor/*` instead of CDN URLs). See rule #9.
- v0.802 — Actually implemented `APP_VERSION` single-sourcing in `index.html`
  (v0.801 documented it but the code still had hard-coded "v0.8" strings);
  About popup now shows the version at the bottom. Service worker v2: precache
  the two Three.js CDN files and accept opaque responses (offline 3D was
  broken — CDN scripts were never cached), ignoreSearch on navigations,
  scheme guard. SW registration gated with `!window.Capacitor` (rule #8).
  Deploy-flow section updated for the Capacitor app (no auto-update).
- v0.801 — Added NOTES.md project map. Version now single-sourced from
  `APP_VERSION` (feeds header badge, About, bug report). Fixed mobile layout to
  survive "Desktop site" (pointer:coarse + max-device-width clause). Hardened
  WebGL init + context-loss recovery for Xiaomi/HyperOS. Reworked lesson
  "Parametric contour" (one profile, Q-depth, mill then chamfer). Removed old
  "Final project" and "Final exam" lessons (now 15 lessons). Cutting fixes for
  CYCL 200/208 (pre-drilled holes, deburring, Q=0 handling). Mobile keyboard UX
  (hide practice panel when keyboard open; blur editor on task switch). SEO +
  manifest updated for lessons & mobile.
