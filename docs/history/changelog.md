# TNC Sim web — technical changelog

Append one short entry for every push, newest first. Keep user-facing summaries
in root `RELEASE_NOTES.md`; keep detailed resolved-bug evidence in root
`BUG_HISTORY.md`.

History through v0.845 is preserved in
[`project-notes-through-v0.845.md`](project-notes-through-v0.845.md).

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
