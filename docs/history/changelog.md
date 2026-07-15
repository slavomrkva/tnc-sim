# TNC Sim web — technical changelog

Append one short entry for every push, newest first. Keep user-facing summaries
in root `RELEASE_NOTES.md`; keep detailed resolved-bug evidence in root
`BUG_HISTORY.md`.

History through v0.845 is preserved in
[`project-notes-through-v0.845.md`](project-notes-through-v0.845.md).

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
