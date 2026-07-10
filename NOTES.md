# TNC Sim — project notes & map

> **READ THIS FIRST if you are an AI assistant (or a developer) editing this
> project in a fresh session without prior context.** This file is the memory of
> the project. It explains how things work and which non-obvious rules must not
> be broken. **Whenever you make a change, you MUST update this file** (add a line
> to the Changelog at the bottom, and update any section your change affects) and
> **bump `APP_VERSION`** — see "Versioning" below. Keep entries short.
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

### 4. Mobile layout must survive "Desktop site"
Mobile vs desktop is decided by CSS media queries AND JS. "Desktop site" widens
the viewport and spoofs the UA, which would flip a phone to desktop layout. To
prevent that, every mobile gate also tests
`(pointer:coarse) and (max-device-width:500px)` — a real phone can't hide its
physical screen size or touch pointer. This clause is in ~8 `@media` blocks and in
`_isMTab()`, `isMob()`, `isMobile()`. If you add a new mobile media query or
mobile JS check, add the same clause.

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

---

## Deploy flow
Edit `index.html` -> commit -> push to GitHub -> Cloudflare Pages auto-deploys ->
service worker updates users on their next launch. The Android app (TWA) loads the
live site, so it updates automatically too (after first launch, which needs
network once).

## Testing checklist before pushing
- JS parses (no syntax error). Quick check: load in a browser, console clean.
- If you changed a lesson: its `sol` passes all its `checks`, and it does not cut
  twice (see rule #1).
- If you changed cutting logic: sanity-check a drill/bore/chamfer program in 3D.
- If you changed layout/CSS: check both desktop and a narrow (phone) width.

---

## Changelog  (newest first — add a line for every change)
- v0.801 — Added NOTES.md project map. Version now single-sourced from
  `APP_VERSION` (feeds header badge, About, bug report). Fixed mobile layout to
  survive "Desktop site" (pointer:coarse + max-device-width clause). Hardened
  WebGL init + context-loss recovery for Xiaomi/HyperOS. Reworked lesson
  "Parametric contour" (one profile, Q-depth, mill then chamfer). Removed old
  "Final project" and "Final exam" lessons (now 15 lessons). Cutting fixes for
  CYCL 200/208 (pre-drilled holes, deburring, Q=0 handling). Mobile keyboard UX
  (hide practice panel when keyboard open; blur editor on task switch). SEO +
  manifest updated for lessons & mobile.
