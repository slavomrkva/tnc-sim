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
- `index.html` — the HTML shell + markup. The JS/CSS previously inline in it
  now live in `core/` and `web/` (see "Module map" below), loaded via plain
  `<script src defer>` / `<link rel=stylesheet>` tags, in the order listed.
- `core/*.js` — engine/UI logic, byte-for-byte identical to the Android app's
  `www/core/*.js`. See "Module map".
- `web/*.js`, `web/styles.css` — web-specific code (genuinely diverged from
  android, or web-only). See "Module map".
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
No `import`/`export` — classic global-scope scripts loaded via
`<script src="..." defer>` tags in `index.html`, in the order they appear.
Edit any file directly; test by opening `index.html` in a browser (or via a
local static server — some browsers won't fetch module scripts over `file://`).

## Module map (core/ vs web/) — read this before editing
`index.html`'s inline `<script>`/`<style>` content was mechanically split
(2026-07-12 refactor, no functionality changed) into:
- **`core/*.js`** (20 files) — verified byte-for-byte identical to the
  Android app's `www/core/*.js` (264 of 268 top-level functions + 5 shared
  data tables are identical between the two repos — mechanically verified,
  not eyeballed). Includes **the CYCL parser / radius-comp engine**
  (`core/parser-engine.js`: `parseProgram`, `validateProgram`,
  `applyRadiusComp`, `offsetRun`, `rebuildRunSegments`, `commitSeg`,
  `buildToolMesh`, `triggerRefine`, `updateATC`, `resetState`), the voxel
  cutting engine (`core/voxel-cutting.js`), 3D rendering
  (`core/render3d.js`), and — notably — **the entire Learn-mode tutorial
  system** (`core/learn-tutorial.js`, 35 functions) and mobile tab-switching
  (`core/mobile-tabs.js`) are now shared with the app too. Other core files:
  `data-tables.js` (`CYCLES`, `Q_FEED_PARAMS`, `Q_FAUTO_PARAMS`,
  `TOOL_CUT_COLORS`, `LESSONS` — must load first, others reference these at
  call time so their own order doesn't matter), `tool-table.js`,
  `editor-core.js`, `field-editing.js`, `view2d.js`, `measure-tool.js`,
  `klartext-syntax.js`, `block-form-panel.js`, `qparam-panel.js`,
  `mcode-panel.js`, `cycle-picker.js`, `bug-report.js`, `help-popups.js`,
  `theme-toast.js`, `sim-controls.js`.
  If you edit one of these files, you diverge it from the app unless you
  also hand-port the change to `tnc-sim-android`'s `www/core/` (or that repo
  runs `./sync-core.sh` afterwards — one-way, web → android, manual only,
  see that script's header).
- **`web/*.js`** (4 files) — only 4 functions are genuinely diverged between
  the two repos, all in the "forced mobile layout" category:
  - `layout.js`: `_isMTab()` (real `matchMedia('(max-width:1024px)')`
    breakpoint check here; android hardcodes `true`), `showKpHelp` (has the
    real desktop-positioning `window.innerWidth > 1024` branches; android
    replaces them with `false`), plus an `isMob()`/`grow()` textarea-autogrow
    IIFE (`isMob()` has the same breakpoint-vs-hardcoded-true divergence as
    `_isMTab`, `grow()` itself is identical).
  - `panels.js`: `renderIdlePanel`/`updateLineNums` — android added a
    `#_idleBlocks` block-count span to its idle toolbar that this repo
    doesn't have; the two functions are a linked pair, kept together.
  - `keyboard.js`: the `visualViewport`/`kbd-open` keyboard-handling IIFE.
    **Materially different from android's**, not just a constant swap — this
    repo runs a continuous `requestAnimationFrame` loop comparing
    `window.innerHeight - (vv.height + vv.offsetTop)`; android instead
    tracks a re-synced baseline (`window.innerHeight` doesn't diverge from
    `visualViewport.height` inside android's Capacitor WebView the way it
    does in a real mobile browser — see the app repo's NOTES.md rule #7).
  - `styles.css` — the full `<style>` block (680 lines; android's is 47
    lines longer — onboarding-tour CSS + extra `kbd-open` selectors).
  - `app.js` — everything that was top-level (non-function) code in the
    original inline script, in original relative order: DOM refs, the
    `APP_VERSION`/version-badge IIFE, the bug-report `window.onerror` hook,
    panel-resize-handle IIFE, view-hint IIFE, the boot sequence
    (`init3D()`/`loop()` kickoff), SW registration. **Order-sensitive** —
    e.g. the version-badge IIFE reads `APP_VERSION` assigned a few lines
    above it, in the same file; don't reorder chunks without checking
    what references what. Small **immediately-executing** anonymous blocks
    like these were deliberately *not* factored into `core/` even though
    their code is byte-identical to android's copy — extracting them into a
    `core/` file that loads before `app.js` would run them before
    `APP_VERSION` (etc.) is assigned. They're harmlessly duplicated between
    `web/app.js` and the app repo's `android/app.js` instead of shared.

Web is a strict subset by name at the top level — every one of web's 268
top-level functions also exists in the Android app (by name); the app has no
extra named functions beyond that anymore (Learn mode and mobile tabs used to
be app-only; not anymore, see above).

### A real gotcha hit during the split
When extracting a `function name(){...}` block, stop exactly at its closing
`}` — do not grab trailing same-line content. `}/* next thing's doc comment
*/` on one line caused a doc-comment to get half-moved with the preceding
function during an early attempt, silently breaking a *different* function's
syntax elsewhere. The page loaded with **zero console errors** and just
failed to boot (blank/empty UI) — browsers don't always surface a deferred
external script's top-level `SyntaxError` the way you'd expect. If a page
looks blank with no console errors after moving code between files, fetch
the suspect file and try `new Function(src)` to catch a swallowed syntax
error.

---

## Versioning  (single source of truth)
`APP_VERSION` is defined once, near the top of `web/app.js` (search for
`var APP_VERSION`). It auto-feeds the header badge, the About popup, and the
bug-report info. **Never hard-code the version anywhere else.**

**Web stays in the `0.80x` series — `0.801`, `0.802`, `0.803`… — do not jump to
`0.9` for a bigger feature; just keep incrementing the third digit.** This is
a deliberate, permanent convention (paired with the Android app's separate
`1.0.x` series — see that repo's NOTES.md) so the two numbering schemes never
collide or get confused with each other.

**Every single push must bump `APP_VERSION` by +0.001 — no exceptions, no
"this one's too small to count".** This is how you (or an AI session with no
memory of prior work) can visually confirm on tncsim.org that a given push
actually went live — check the About popup / footer badge against the commit
you expect.

---

## Architecture map (which module each thing lives in — see "Module map" above for file paths)
- **Parser** (`core/parser-engine.js`) — `parseProgram(code)` turns Klartext into
  motion segments (`sub`). Helpers: `expandLblLines` (LBL/CALL expansion),
  `resolveQLine`/`resolveQLineExpr` (Q-variable substitution), `applyRadiusComp`
  (RL/RR/R0 tool-radius offset).
- **Cycles** (`core/parser-engine.js`, `core/data-tables.js`) — cycle definitions
  live in the `CYCLES` table; CYCL DEF 200 (drill), 201 (ream), 208 (bore/
  circular pocket), 209 (tapping), etc. are handled inside `parseProgram`.
- **Voxel cutting / 3D** (`core/voxel-cutting.js`, `core/render3d.js`) —
  `vxCut(...)` removes material from a voxel grid; `buildScene(prog)` builds
  the Three.js scene; `init3D()` sets up the renderer; `loop()` (per-side,
  `web/app.js` calls it, defined in `core/sim-controls.js`) is the render
  loop. Three.js is vendored in `vendor/`; `THREE_OK` flags availability.
- **Tool table** (`core/tool-table.js`) — `toolLibrary` array. Tools have TYPE
  (MILL / DRILL / COUNTERSINK) with distinct cutting behaviour. Countersink R
  is ~0.001 (tip).
- **Learn mode** (`core/learn-tutorial.js`, `LESSONS` in `core/data-tables.js`)
  — `LESSONS` array (each: `id`, `title`, `slides[]`, `tasks[]`). `learnRender`,
  `learnCheck` (validates the user's program against a task's `checks[]`),
  `learnStartTask`, `learnSolve` (password fill), progress via `localStorage`
  key `tnc_learn`. **Now shared with the Android app** (was app-only before
  the 2026-07-12 module split).
- **Mobile** (`core/mobile-tabs.js` for the shared switching logic;
  `web/layout.js` for the diverged `_isMTab()` breakpoint check) — bottom tab
  bar (Editor / 3D / Learn); keyboard handling via `visualViewport`
  (`html.kbd-open`, `web/keyboard.js` — diverged from android's version, see
  "Module map").

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

### 4. Layout breakpoint: single-column when width ≤1024px OR height ≤600px
Mobile (single-column tabbed) vs desktop (editor-beside-3D) is decided by
`@media(max-width:1024px), (max-height:600px)` (CSS, ~9 blocks) and the JS
`matchMedia('(max-width:1024px), (max-height:600px)')` in `_isMTab()` /
`isMob()`, plus `!_isMTab()` for popup placement (`showKpHelp`). The condition
is an **OR** (comma in a media query = OR): single-column when the viewport is
**too narrow (≤1024px)** OR **too short (≤600px)**. The width clause was raised
700→1024 so portrait tablets don't get the cramped side-by-side (3D too narrow);
the **height clause was added (v0.810)** because the desktop layout's fixed
editor chrome (keypad + toolbar + ctx-panel + status-bar ≈ 480px) collapses the
code textarea to ~0 on short viewports — a phone/foldable in **landscape** (wide
enough to clear 1024 but only ~400px tall), or any short browser window — so the
program became invisible and unscrollable. Below 600px tall we fall back to the
single-column tabbed layout, which scrolls the whole editor-panel as one and
always works. Tall screens (tablet landscape ~768–820px, laptops) stay
side-by-side. **If you add a new layout media query or JS layout check, use the
full `(max-width:1024px), (max-height:600px)` condition (or `_isMTab()`), not a
bare width check** — a partial mix produces a broken hybrid layout. (The Android
app forces single-column always — see the app repo's NOTES — so it never hits
this desktop-collapse case at all; this fix is web-only.)

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

### 10. Resize the 3D renderer from the render loop, not only on window 'resize'
The 3D canvas is CSS-sized (`#view3d canvas{width:100%;height:100%}`) while
`onResize()` calls `renderer.setSize(w,h,false)` — the `false` deliberately
skips the inline style so CSS owns the display size. That means the drawing
buffer/`camera.aspect` must be kept matched to the container's *current* size,
or the browser stretches the last-sized buffer to fill the box and the model
distorts. A window `resize` listener alone is not enough: it misses live
mid-drag frames and misses container resizes that fire no window event at all
(the editor/3D splitter drag, a mobile tab/orientation change). `loop()` calls
`resizeToDisplay()` (`core/view2d.js`) every frame; it's a cheap no-op unless
the container size changed, and returns `true` on the frame it resyncs so the
idle-render throttle still paints that frame. If you add another code path that
resizes the 3D pane, you don't need to do anything — the loop already covers it
— but don't "optimize away" the per-frame check back to a resize-only listener.

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
- v0.811 — Cleaned up comment spacing in the "Angle Mill" demo program
  (`DEMO_PROGRAMS` in `web/app.js`): several inline `;` comments had huge,
  inconsistent runs of padding spaces (up to 32) left over from an attempt to
  column-align them that never actually lined up. Normalized to a single space
  before `;`, matching the convention already used in the default "Complete
  Part" demo. Purely cosmetic — reformatted-only, no code/logic lines touched;
  verified the reformatted program still parses with zero errors/warnings and
  runs to completion with the same Z-ramp values as before. `Q1 = Q1+0,5774`'s
  decimal **comma** was deliberately left as-is: `parseProgram()` normalizes
  `\d,\d` → `\d.\d` globally at the top of the function
  (`core/parser-engine.js` line ~447) before any Q-expression is evaluated, so
  the comma is not a bug — confirmed by instrumenting `evalQExpr` during a real
  parse (values step 10 → 10.5774 → 11.1548 … correctly). `web/app.js` only
  (not `core/`) — mirrored by hand into `tnc-sim-android`'s `www/android/app.js`
  (`APP_VERSION 1.0.13`) since `DEMO_PROGRAMS` is duplicated verbatim between
  the two repos' `app.js` files.
- v0.810 — Fixed scrolling being broken in landscape on large phones / foldables
  (and in any short browser window). Root cause: when the viewport is wide
  enough to clear the 1024px breakpoint but too **short** (e.g. a phone/foldable
  in landscape, ~1180×400), the desktop editor-beside-3D layout's fixed chrome
  (keypad + toolbar + ctx-panel + status-bar ≈ 480px) exceeded the editor-panel
  height and collapsed the code `.editor-wrap`/textarea to ~0px — the program
  became invisible and the page can't scroll in the desktop layout, so scrolling
  appeared dead. Made the mobile single-column tabbed layout trigger on **height
  too** — `@media(max-width:1024px)` → `@media(max-width:1024px),
  (max-height:600px)` across all ~9 layout blocks, and the matching
  `matchMedia(...)` in `_isMTab()`/`isMob()`, plus `showKpHelp`'s two
  `innerWidth > 1024` popup checks → `!_isMTab()`. Below 600px tall the app now
  uses the full-width single-column layout (which scrolls correctly). Verified
  headless with real touch input across phone/tablet/desktop in both
  orientations: the previously-collapsed 1180×390 case now shows the scrollable
  single-column editor; tablet-landscape (1180×820) and desktop stay
  side-by-side. Web-only (the Android app is always single-column). See rule #4.
- v0.809 — Fixed the 3D model changing aspect ratio (stretching) while the
  browser window is being resized. Root cause: the render `loop()`
  (`core/sim-controls.js`) repaints every frame but only re-synced the renderer
  buffer + `camera.aspect` on the window `resize` event; the canvas is
  CSS-stretched to `100%x100%` of its container while `renderer.setSize(w,h,
  false)` leaves the inline style alone, so every intermediate frame of a live
  window drag (and every editor/3D splitter drag, which fires no window resize
  at all) stretched the stale buffer to the new box. Added `resizeToDisplay()`
  (`core/view2d.js`), a cheap per-frame "resize-on-render" check called at the
  top of `loop()` that resyncs only when the container size actually changed.
  Verified in a headless browser: a container resized without a resize event
  went from a 37% horizontal stretch (buffer aspect 1.374 vs container 1.0) to
  1:1. `core/` change — mirrored byte-for-byte into `tnc-sim-android`
  (`APP_VERSION 1.0.12`). See rule #10.
- v0.808 — Pure structural refactor, no functionality changed: split
  `index.html`'s inline `<script>`/`<style>` into `core/*.js` (20 files,
  byte-for-byte identical to the Android app's `www/core/*.js` — mechanically
  verified by extracting every function by name from both repos and diffing,
  not eyeballed) and `web/*.js` + `web/styles.css` (5 files: only 4 functions
  are genuinely diverged from android, all in the forced-mobile-layout
  category). Notably, Learn mode and mobile-tab switching are now `core/` —
  the Android app had fully absorbed web's version by the time of this
  refactor (an earlier attempt at this same refactor was done against a
  stale, ~30-commit-old local checkout and had to be discarded and redone
  against the real `origin/main`). Added `NOTES.md` "Module map" section.
  Verified via per-function diff against the pre-refactor file (zero drift)
  and a full functional pass in browser (Editor, Run/3D sim, Learn mode,
  view switching, theme toggle) — all working, zero console errors. Mirrors
  the same split done in `tnc-sim-android` in the same session; see that
  repo's `sync-core.sh` for the one-way (web→android) manual core/ sync tool.
- v0.807 — Formalized versioning: web stays in the `0.80x` series permanently
  (paired with the Android app's separate `1.0.x` series — never confuse the
  two), and every single push must bump `APP_VERSION`, with no "too small to
  count" exceptions. Documented in this section and CLAUDE.md.
- v0.806 — Reworked the light theme into a high-contrast scheme: dark chrome
  (header/toolbars/panels = #1b1f27) over a light content area (#eef0f3), with a
  pure-white editor. Implemented by re-scoping the CSS vars (`--surface`,
  `--text`, `--border`…) inside the chrome containers so descendants flip to
  light-on-dark automatically, plus explicit filled backgrounds for every
  button/segment/tab/badge (contrast rule). 3D stage bg → #c7cdd8 (light var +
  `_scene3dBgColor()` 0xc7cdd8). Q-params now info-blue (#1558d4). [branch:
  light-theme-rework]
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
