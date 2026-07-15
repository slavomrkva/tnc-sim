# TNC Sim web — technical changelog

Append one short entry for every push, newest first. Keep user-facing summaries
in root `RELEASE_NOTES.md`; keep detailed resolved-bug evidence in root
`BUG_HISTORY.md`.

History through v0.845 is preserved in
[`project-notes-through-v0.845.md`](project-notes-through-v0.845.md).

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
