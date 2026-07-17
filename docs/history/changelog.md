# TNC Sim web — technical changelog

Append one short entry for every push, newest first. Keep user-facing summaries
in root `RELEASE_NOTES.md`; keep detailed resolved-bug evidence in root
`BUG_HISTORY.md`.

History through v0.845 is preserved in
[`project-notes-through-v0.845.md`](project-notes-through-v0.845.md).

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
