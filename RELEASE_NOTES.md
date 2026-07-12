# TNC Sim — Release notes

User-facing changes, newest first — the stuff a user would actually notice
(new features, visible fixes). The detailed technical/developer changelog lives
in `NOTES.md`; this file is the short, human-readable history.

> **For developers:** whenever you ship a meaningful or user-visible change,
> add a short line here under the current `APP_VERSION`. Skip purely internal
> tweaks (refactors, comments) — those go only in `NOTES.md`.

---

## v0.809
- Fixed the 3D model looking stretched/squashed while resizing the browser
  window (or dragging the editor/3D divider) — it now keeps its correct
  proportions at every size.

## v0.806
- Reworked light theme: a crisper high-contrast look with dark toolbars, a
  light workspace, and a pure-white editor.

## v0.804
- Better layout on tablets: the app now uses the full-width single-column view
  on tablet-sized screens, so the 3D simulation is no longer cramped.

## v0.803
- 3D engine is now bundled with the app — the 3D view loads faster and works
  fully offline (no more loading it from the internet).

## v0.802
- The app version is now shown at the bottom of the About dialog.
- Fixed offline mode so the 3D view keeps working without a connection.

## v0.801
- More reliable 3D on a wider range of phones (incl. Xiaomi/HyperOS), with a
  clear message if a device can't start 3D instead of a blank screen.
- Mobile layout fixes; the app keeps its mobile layout even in "Desktop site".
- Learn mode: 15 interactive Klartext lessons, from the basics to full
  contours and cycles.
- Installable as an app (PWA) with offline support.
