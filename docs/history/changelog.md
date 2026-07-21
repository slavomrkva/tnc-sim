# TNC Sim web — technical changelog

Append one short entry for every push, newest first. Keep user-facing summaries
in root `RELEASE_NOTES.md`; keep detailed resolved-bug evidence in root
`BUG_HISTORY.md`.

History through v0.845 is preserved in
[`project-notes-through-v0.845.md`](project-notes-through-v0.845.md).

## v0.894 follow-up — keep restored status in the desktop header row

- Kept the normal desktop editor header on one row, allowed long document names
  to truncate, and separated the always-visible block count from wrapping actions.
- Added container-based wrapping so the editor actions move onto their own row
  only below 570 px, while individual button labels remain intact. Advanced the
  offline cache to `v55` and tightened the focused layout regression.

## v0.894 — compact autosave and wrapping editor actions

- Shortened the saved, restored and storage-error status labels while retaining
  their time and existing state colours.
- Made the desktop editor action group wrap within the resized panel while each
  button label remains on one line, preventing it from overlapping 3D controls.
- Added focused status-copy and responsive-header regressions and advanced the
  offline cache to `v54`.

## v0.893 — calmer 30-second autosave cadence

- Replaced the 700 ms reset-on-input debounce with one throttled write 30
  seconds after the first pending change; continuous typing no longer postpones
  persistence, while page hiding still flushes immediately.
- Pending and saving states are neutral gray, saved/restored remain green and
  actual storage failures are orange. Advanced the offline cache to `v53` and
  expanded the timing and styling regressions.

## v0.892 — resume autosave when closing practice

- The practice close button now uses the complete Learn shutdown path instead
  of restoring the editor while leaving `LEARN.open` set.
- The saved main-program status therefore returns immediately without a
  Simulate/Editor tab round trip; added a focused regression and advanced the
  offline cache to `v52`.

## v0.891 — local program autosave with Learn isolation

- Added a debounced local draft containing the NC code, document name and save
  time, with immediate lifecycle flushing and visible unsaved/saving/saved,
  restored and error states.
- Learn now force-saves and suspends the main draft before replacing the
  editor. Lesson work stays transient through Finish and the stored main
  program is restored on exit or reload.
- Added focused persistence, lifecycle and Learn-isolation regressions and
  advanced the offline cache to `v51`.

## v0.890 — expose Q370 throughout Cycle 208

- Replaced the incomplete Cycle 208 builder with the full bore-milling
  parameter set and exposed `Q370` in both cycle insertion paths.
- Added `Q370=+1` to every supplied Cycle 208 demo, Complete Part program and
  applicable Learn example, starter, solution and check, including German UI
  content.
- Added regressions that require the form definition and every shipped Cycle
  208 demo block to contain Q370; advanced the offline cache to `v50`.

## v0.889 — documented feed and cycle semantics

- Preserved decimals in `TOOL CALL F` and made ordinary `L ... FAUTO` select
  that exact current-tool feed.
- Implemented Cycle 208 `Q370` parsing, documented range validation and radial
  stepover behavior; restricted Cycle 209 `Q336` to `0...360` degrees.
- Extended the standalone cutting-logic package with a real Q370 program value,
  independent Q370/Q336 semantic checks and focused parser regressions.

## v0.888 — CNC simulator search metadata

- Reworked the title, description, social metadata and JSON-LD around the
  Heidenhain simulator and CNC mill simulator search terms. The existing logo
  heading is now a semantic H1 without changing its visual hierarchy.

## v0.887 — close the report dialog after success

- After a bug report or suggestion is posted, the send button becomes Close.
  Closing it cannot submit the same report again, and reopening the dialog
  restores the appropriate send action.

## v0.886 — rounded browser favicon

- Added transparent rounded corners to the 16, 32 and 48 px favicon variants.
  The enlarged motif, PWA icons and Android app icons remain unchanged.

## v0.885 — unified color identity

- Unified light and dark themes around cool-neutral grays, teal primary actions
  and an amber warm accent. The 3D scene, PWA launch background, scrollbars and
  toolbar control sizing now follow the same visual system. Enlarged the favicon
  motif for clearer recognition at 16–32 px without changing the app icons, and
  shortened the browser-tab title by removing the redundant language suffix.
- Renamed the report entry point to “One-click bug report / Suggest an
  improvement” and changed the orange warning into a neutral privacy note. It
  now states that reports are anonymous and do not collect personal data, while
  clearly listing the description, NC program and basic technical diagnostics
  sent to the public tracker.

## v0.879 — Complete Part returns to English after a DE → EN switch

- A language switch reloads the page. Browser form-state restoration can retain
  the German Complete Part in `textarea.value` on the next English load; the
  former startup code then treated that restored value as the English default.
- `web/app.js` now uses the textarea markup's `defaultValue` as the canonical
  English starter. On English startup it replaces only the exact German starter
  value, preserving any other restored user program. Added
  `tests/i18n-demo-switch.test.js` for DE → EN plus custom-program coverage.
- Fixed `tests/i18n-de.test.js` to extract the CYCLES table with CRLF-safe line
  endings, so the existing localization coverage runs on Windows as intended.

## v0.878 — Run/Step from the start resets the voxel workpiece (no leftover coloured cuts)

- Re-running or stepping a finished program showed leftover coloured cut
  surfaces from the previous run (e.g. purple tool-5 countersink walls / spikes)
  where material had been removed, until a manual Reset cleared them. Root cause:
  only `onReset()` reset the workpiece (`vxReset()`); `onRun()`/`onStep()` rewound
  the sim with `resetState()` alone (`core/sim-controls.js`), which resets the
  block index but never the voxel grid/cut/mesh. A run restarted from the
  beginning therefore replayed onto the previous run's carved, tool-colour-tagged
  voxels. Each mesh triangle is coloured by `TOOL_CUT_COLORS[VX.cut(nearest)]`, so
  the stale surfaces kept their cutting tool's colour.
- Fix: the rewind branch in `onRun()`/`onStep()` now also calls `vxReset()`, so a
  fresh run always starts from clean stock — identical to Reset+Run. A mid-run
  resume (not done, not at the end) still leaves the workpiece untouched.
  Regression added in `tests/sim-run-resets-workpiece.test.js`. Cross-repo —
  same fix ported to Android.
- Investigation also ruled out two suspected causes: the incremental chunk
  meshing (a live carve produces byte-identical geometry+colour to a full clean
  rebuild) and the light-mode colour change (the theme attribute is applied
  synchronously in `index.html` before the mesh is built).

## v0.877 — modal feed no longer corrupted by a fixed cycle / M99 call

- A contour that came after a fixed cycle (e.g. CYCL DEF 208 called with M99)
  cut the material at rapid feed (FMAX / 9999) instead of the last programmed /
  FAUTO feed whenever its first cutting move omitted an explicit `F`. Root cause:
  `flushPending()` in `core/parser-engine.js` reassigns the shared modal `feed`
  to each move it renders (including 9999 for FMAX rapids and per-move feeds set
  inside a cycle) and never restored it. A contour ending in an FMAX retract —
  which is exactly what precedes most `CYCL DEF`/`M99` blocks — left the modal
  feed stuck at 9999, so the next no-`F` cutting block inherited rapid speed.
- Fix: `flushPending()` snapshots `feed` on entry and restores it on exit, so
  its per-move bookkeeping stays local to rendering and the main-loop modal feed
  keeps tracking the last real programmed feed. Regression added to
  `tests/parser-cycles.test.js`. Cross-repo bug — same fix ported to Android.

## v0.876 — header shows the document (file) name

- The `#progTitleName` header no longer always reads "PROGRAM.H". It now tracks
  a `_docName` set from the file identity: the friendly demo name on demo pick,
  the imported filename on import, the saved filename on export, and `program.H`
  on Clear. `editor-core.js` owns `_docName`/`_setDocName`; `web/panels.js`
  renders it; `web/app.js` seeds it with the starter demo. Root cause: every
  demo/imported program uses `BEGIN PGM PROGRAM` internally, so the old
  `_progFileName(code)` parse always yielded `PROGRAM.H`.
- Export prefers a `.H` `_docName` (round-trips an imported filename), else
  falls back to the BEGIN PGM-derived name, then reflects it in the header.
  Ported from Android `tnc-sim-android` 1.0.59. Adds
  `tests/doc-name-header.test.js` and NOTES rule 17.

## v0.875 — defer in-progress radius-comp errors to Run

- Starting an RL/RR contour no longer flags "RL/RR still active … program R0
  before END PGM" while typing. `validateProgram(code, liveEdit)` gates the two
  completeness checks behind `!liveEdit`, and the "contour not finished yet"
  `_rcReport` diagnostics carry an `incomplete`→`rcDefer` flag.
- `runValidation(liveEdit)` (editor-core) defaults to `liveEdit=true` and skips
  the deferred diagnostics; `onRun`/`onStep` (sim-controls) call
  `runValidation(false)` so those checks run — and block Run — at simulation
  start. Genuine geometry errors (tool radius too large, etc.) still show live.
- Ported from Android `tnc-sim-android` 1.0.58. Adds
  `tests/radius-comp-live-defer.test.js` and NOTES rule 16.

## v0.874 — rapid-into-material collision warns without stopping

- `rapidCollision` (voxel-cutting.js) no longer sets `mode='idle'`, so a
  detected FMAX-into-material collision reports its pinned red warning but the
  simulation plays through to the end instead of halting. Real machine-proven
  programs (e.g. a rapid onto a pre-drilled floor) must not be blocked.
- Re-report guard changed from `mode==='idle'` to `window._collisionActive`, so
  only the first hit is reported and it stays latched via `updateStatus` until
  reset; `mode` is left untouched. Ported from Android `tnc-sim-android` 1.0.57.
- Added NOTES rule 15. Verified headless: at High quality the warning fires and
  all segments still run; a 0.5 mm sub-voxel step goes undetected at coarser
  quality (known voxel-resolution limit).

## v0.873 — bilingual SEO metadata (test branch)

- Fixed stale "15 lessons" → 16 across `<title>`, description, OG/Twitter tags and JSON-LD `featureList`.
- Appended German keywords/phrases to title, description, OG/Twitter description and `<meta keywords>` (visible in the single English-served page, no separate `/de/` route — a full hreflang setup would need a second physical HTML entry point, out of scope here).
- Added `"inLanguage": ["en", "de"]` and an "English and German (Deutsch) interface" line to the JSON-LD `featureList`.

## v0.872 — German About popup (test branch)

- Added `web/i18n-about-de.js`, a web-only German override of `openAboutPopup()` (core/theme-toast.js builds the popup from an inline string at call time, so it can't be reached via `data-i18n`). Loaded after `core/theme-toast.js` so the German version wins when the UI language is German; `core/` itself is untouched.

## v0.871 — Q335 naming fix + language-toggle label (test branch)

- Corrected the German name for cycle parameter Q335 from "Nenndurchmesser" to the Heidenhain-standard "SOLL-Durchmesser" in `web/i18n-cycles-de.js`, `web/i18n-demos-de.js` and the embedded `DEFAULT_CODE_DE`/Angle Mill program comments in `web/app.js`.
- The EN/DE toggle button now shows the language you'd switch *to* rather than the current one (English page shows "DE", German page shows "EN") — changed in `web/i18n.js`'s `init()`.

## v0.870 — German localization: comments, M list, cycle parameters (test branch)

- Added `M_DEFS_DE` overlay in `web/app.js` translating every M-function description; feeds the M-list popup, the auto-inserted comment when picking an M code, and the manual-entry lookup from a single source.
- Added `web/i18n-cycles-de.js` overlaying `CYCLES` (core/data-tables.js) cycle and Q-parameter names in place, so both the cycle picker dropdown and the auto-inserted `CYCL DEF`/Q-param comments come out localized. CYCL DEF numbers, Q-numbers and default values are untouched.
- Added `web/i18n-demos-de.js` with parallel German-comment `code` text for the four `EXTRA_DEMO_PROGRAMS` entries (Chamfering, Rough & Finish, Thread Hole, Precise Hole), swapped in by name when building `DEMO_PROGRAMS`; `core/demo-programs.js` stays byte-identical to Android.
- Added `DEFAULT_CODE_DE` and a German `Angle Mill` variant in `web/app.js`, swapped in for the starter/editor-reset program and demo library when the UI language is German.
- Extended `tests/i18n-de.test.js` with an invariant check (`assertCommentsOnlyDiff`) verifying every DE program overlay changes only text after `;` — Klartext stays byte-for-byte identical to the English source, line by line.

## v0.869 — German localization (test branch)

- Added `web/i18n.js` (EN/DE dictionary, `I18N.cycleLang()`) and `web/i18n-lessons-de.js` (German overlay for all 16 Learn lessons); wired `data-i18n*` attributes across `index.html` (header, toolbar, panels, bug report, help modal, footer).
- Added `HELP_MAP_DE` in `web/app.js` for German Help/Tool Table tooltips, applied only when `I18N.getLang()==='de'`; Klartext (BLK FORM, TOOL CALL, CYCL DEF, M-functions, Q-tokens, `learnSnippet` programs) stays untranslated.
- Added `tests/i18n-de.test.js` guarding key coverage (no missing/orphan German keys) and lesson-overlay parity.

## v0.868 — analytic TNC 640 radius compensation

- Kept L/C/CR/CT/CP/RND/CHF as exact primitives through RL/RR calculation, including exact L activation, finite inner intersections, outer transition arcs and the equal-radius RND limit; only the completed tool-center path is tessellated.
- Collapsed temporary radius-compensation diagnostics during a live L edit into one warning, reordered L fields to XYZ/R/F/M and added regressions for the reported PROGRAM.H contour.

## v0.867 — mobile numeric sign toggle

- Added shared sign handling for BLK FORM, guided L/C/CC/CR entry and cycle Q-value editing: a mobile minus is normalized to the front of the value and toggles an existing negative value back to positive.
- Added CR-radius sign entry for the documented minor/major-arc choice and focused regression coverage, including soft-keyboard fallback behaviour.

## v0.866 — desktop F menu placement

- Open the desktop-only F menu below its trigger, preserving its mobile-native
  selector and click-to-select behavior.

## v0.865 — desktop F menu and called-LBL status

- Kept the compact native F selector on mobile, while desktop now uses a
  persistent click-to-open menu that closes only after a choice, Escape or an
  outside click.
- Made simulation LBL status recognize expanded `CALL LBL` segments without
  changing their existing editor-line highlighting; added focused regressions.

## v0.864 — first tutorial orientation lesson

- Ported only `L00` Start here from the older preview branch onto the current
  main: three information slides, visual Hint 1–3 progression and an ungraded
  editor/3D walkthrough.
- Hid the solution control for this intro lesson and added focused regressions;
  all later lessons and current parser, cycle and 3D behavior remain unchanged.

## v0.862 — Tool Table audit fixes

- Added one validation path for CRUD and imported tools, transactional `.tnt`
  import, duplicate-T protection, HTML escaping and complete simulation-state
  invalidation after table changes.
- Preserved valid zero values, kept RT references consistent across renames and
  deletes, and implemented TL/RT replacement plus TIME2 locking semantics.
- Added focused Tool Table and parser regressions covering CRUD, import/export,
  invalid input, active radius refresh, locked tools and replacements.

## v0.861 — accepted shorter tutorial release

- Recorded user acceptance of the two-slide Start here tutorial and prepared
  the final web merge plus deliberate Android port.
- Kept the existing five-step guided coach unchanged.

## v0.860 — direct Hint slide

- Removed the second tutorial diagram and its extra warm-up wording.
- Made the slide solely explain the three progressive Hint levels and their
  non-destructive behavior.

## v0.859 — shorter Start here lesson

- Replaced three explanation-heavy tutorial slides with two direct slides:
  task → editor → Check, followed by the exact comment warm-up.
- Simplified both tutorial diagrams and shortened the warm-up wording while
  deliberately keeping the accepted five-step guided coach unchanged.

## v0.858 — accepted Learn audit release

- Moved the user-accepted Learn audit from TODO into BUG_HISTORY with all ten
  implementation and visual-review attempts preserved.
- Prepared the complete v0.849–v0.857 Learn package for production merge and
  deliberate Android port.

## v0.857 — full-width tutorial helper cards

- Replaced the three narrow columns in tutorial slide 2 with three stacked,
  full-width rows.
- Split longer Check guidance into separate phrases with generous side margins.

## v0.856 — tutorial card spacing correction

- Replaced the Goals card's outlined status dots with centred text rows.
- Replaced the final circular score badge with a wider rounded rectangle so
  the check mark and 2/2 label remain clear at narrow rendered widths.

## v0.855 — shorter interactive Start here tutorial

- Replaced the intro lesson's three dense text slides with three focused visual
  explanations: the learning loop, practice helpers and the first one-line win.
- Reduced the coach overlay to assignment, editor, goals, Hint and Check; moved
  secondary navigation and password controls out of the first-run tour.
- Required the checked comment warm-up before the tutorial can be completed.
- Preserved specific SVG accessibility labels and removed two stray drawing
  statements from the Learn render path.

## v0.854 — Cycle 208 countersink contact position

- Shifted the Lesson 14 Cycle 208 tool down and into the bore so its right 45°
  flank coincides with the highlighted finished edge.
- Kept the offset visual rather than adding DL/DR labels to the diagram.

## v0.853 — accurate 90-degree countersink section

- Rebuilt Lesson 14's second diagram as a section through real open holes,
  showing a 90° included tool angle, 45° flanks and highlighted finished edges.
- Kept the Cycle 208 panel's orbit while showing the same finished edge at the
  bore rim.
- Moved the last Lesson 13 and 14 labels into line-free regions.

## v0.852 — Learn diagram collision corrections

- Flipped both Lesson 14 countersink silhouettes to the physically correct
  tip-down orientation.
- Moved compensation, LBL reuse, Cycle 208, tapping and DL/DR annotations into
  dedicated clear areas instead of letting geometry cross their text.
- Re-rendered the affected slides in dark and light themes.

## v0.851 — complete Learn slide-image redesign

- Audited and locally rendered every Learn SVG in both supported themes.
- Replaced generic or misleading thumbnails with lesson-specific diagrams for
  safe retracts, slot width, radius-sign arc selection, RND/CHF, peck drilling,
  counterboring, tapping and the final two-pass workflow.
- Added diagrams for LBL execution/reuse, spot-drill-ream sequencing and the
  two hole-edge chamfer methods where the lesson previously relied on text.
- Improved existing drawings with clearer axes, datums, dimensions, contact
  and tangent points, phase labels and stock/profile coordinates.

## v0.850 — clearer compensation and Cycle 208 diagrams

- Replaced Lesson 7's generic toolpath thumbnail with an explanatory RL offset
  diagram and rewrote the slide around the X+50 / X+45 / R5 relationship.
- Replaced Lesson 11's full-blank top view with a large Cycle 208 side view
  separating helical infeed from the floor-level widening rings.

## v0.849 — Learn correctness and accessibility audit

- Made text-based Learn checks ignore comments and added scoped cycle/parameter
  and sequence checks for cycles 200, 201, 208, and 209.
- Added a Learn regression suite covering every official solution, every
  starter, comment-only answers, and wrong-sign chamfer depths.
- Fixed task-specific false positives and missing parameter checks in the arc,
  drilling, pocket, reaming, tapping, and chamfering lessons.
- Improved keyboard semantics, slide controls, diagram alternatives, progress
  feedback, final-answer labeling, light-theme contrast, and crowded diagrams.
- Clarified safety, H7 finishing, tool preselection, Q342, and DL/DR wording.

## v0.848 — machining demo library

- Added four shared demo programs for chamfering, rough/finish contouring,
  drilling/deburring/tapping, and center-drilling/drilling/deburring/reaming.
- Added parser and motion regression coverage for every new demo.
- Closed C12–C14 after the user accepted the v0.847 web preview.

## v0.847 — light grid and Learn hint state

- Added neutral grey 3D table-grid colors for the light theme, including live
  recoloring when the theme is toggled.
- Made desktop Hint actions pin the left Learn scroll container to its bottom.
- Reset the active task, results, and progressive hints when opening a lesson.

## v0.846 — documentation damage control

- Closed C8–C10 after the user confirmed the current web and Android versions
  work correctly; moved their evidence from `TODO.md` to `BUG_HISTORY.md`.
- Replaced the growing root project notes with a concise current contract,
  archived the complete former notes, and routed future technical entries here.
- Tightened `CLAUDE.md` session routing so history is loaded only when relevant.
## v0.863 — 2026-07-16
- Accepted and released the C18 Heidenhain cycle/cutting/validator audit: fixed
  A1–A5 and R1, completed cycle 200/201/208/209 behavior, DL/DR plus RL/RR/R0
  state/geometry, and explicit parser diagnostics for rejected toolpaths.
- Replaced broad radius assumptions with effective-radius and source-primitive
  geometry checks; Complete Part no longer loses valid L blocks and Angle Mill
  validates with 22 roughing plus 22 finishing strips.
- Added full validator/parser regressions, returned dynamic problems to the
  editor, refreshed graphify, and advanced the offline cache to v39.

## v0.880 — 2026-07-18 — one-click bug report / suggestion (web only)
- Replaced the multi-button Bug Report dialog with a single problem/suggestion
  chooser plus one textarea. Bug reports pre-fill a state-based description (JS
  error / lesson active / validator error / default) and attach program,
  version, device, validator messages, app area and recent JS errors;
  suggestions require text, attach only basic context, and never include the
  program. Removed the GitHub-account/Email/Copy/screenshot controls and the
  program/debug previews. `core/bug-report.js` now diverges from Android on
  purpose and posts to `/api/report`.
- Added `functions/api/report.js` (Cloudflare Pages Function): origin-restricted
  to `https://tncsim.org`, verifies a Cloudflare Turnstile token, bounds field
  lengths, and opens a public GitHub issue with a fine-grained `GITHUB_TOKEN` —
  no visitor account required. Public site key in `web/turnstile-config.js`
  (invisible Turnstile), secrets kept as Pages secrets. Setup documented in
  `docs/bug-report-setup.md`.
- Marketing "Free" → "Open" in the titles and "open-source" in the descriptions, meta/OG/Twitter
  descriptions, JSON-LD, manifest, README and privacy page (technical phrases
  untouched). Desktop footer drops "Buy me a coffee" and right-aligns the report
  button; coffee stays only in About as a small link. Privacy policy updated for
  public-issue uploads. English + German UI kept complete; i18n DE test extended
  to scan `core/bug-report.js`. Offline cache advanced to v41.

## v0.881 — 2026-07-18 — new icon / logo / favicon (web)
- Replaced the grid-and-dot brand mark with a radius-compensation motif: a
  rounded workpiece with the cutter tangent on its left edge and the faint
  cutter-centre offset toolpath around it (teal gradient tile, white marks).
- Regenerated `favicon.ico` (16/32/48 PNG-in-ICO), `favicon-32.png`,
  `icon-192.png` and `icon-512.png` (full-bleed for maskable) from one master
  SVG, and replaced the inline header logo to match. Offline cache → v42.

## v0.882 — 2026-07-18 — /api/report accepts the Android app
- Generalised the report Function's origin check from a single origin to an
  allowlist (website + Capacitor app `https://localhost`/`capacitor://localhost`),
  echoing the matched origin in the CORS headers so the app's WebView can post
  to the same endpoint. `ALLOWED_ORIGIN` may override the list (comma-separated).
  Documented the Turnstile `localhost` hostname requirement and the shared site
  key in `docs/bug-report-setup.md`. Offline cache → v43.

## v0.883 — 2026-07-19 — move /api/report from Pages Functions to Workers
- Replaced the unused `functions/api/report.js` Pages Function with
  `worker/report-worker.mjs`, a real Worker entrypoint that handles
  `/api/report` and delegates ordinary requests to the Static Assets binding.
- Added `wrangler.jsonc` with assets-first routing and `run_worker_first` scoped
  to `/api/*`, plus `.assetsignore` so Worker sources, tests, docs, and local
  configuration are not published as site assets.
- Kept the endpoint fail-closed until encrypted `GITHUB_TOKEN` and
  `TURNSTILE_SECRET_KEY` values are installed. Added Turnstile hostname checks,
  stricter request validation, Worker regressions, and corrected deployment
  documentation. Removed the committed always-pass Site Key; production waits
  for the real public key. Offline cache → v44.

## v0.884 — 2026-07-19 — production Turnstile Site Key
- Replaced the fail-closed empty Turnstile configuration with the real public
  Site Key for the Invisible `tncsim.org`/`localhost` widget. The same public
  key is versioned in the independent Android client; both private secrets stay
  outside Git as encrypted Worker secrets. Offline cache → v45.
