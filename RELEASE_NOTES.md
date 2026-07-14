# TNC Sim — Release notes

User-facing changes, newest first — the stuff a user would actually notice
(new features, visible fixes). The detailed technical/developer changelog lives
in `NOTES.md`; this file is the short, human-readable history.

> **For developers:** whenever you ship a meaningful or user-visible change,
> add a short line here under the current `APP_VERSION`. Skip purely internal
> tweaks (refactors, comments) — those go only in `NOTES.md`.

---

## v0.844 (web test)
- The intro lesson's guided tour now also covers the "give up on this task" ✕
  and gives the hidden password/solve button a playful explanation instead of
  leaving it a mystery.

## v0.843 (web test)
- The intro lesson's guided tour now also points out the ✕ (leave Learn mode)
  and the hamburger menu (back to the lesson list) before walking through the
  assignment, editor, goals, hints and Check button.

## v0.842 (web test)
- Follow-up: the 3D / XY toolpath / Tool Table view switcher tabs are now also
  capped on tablet-sized screens, matching the previous button-width fix.

## v0.841 (web test)
- Capped the width of the 3D view's Run/Step/Stop and quality/speed buttons on
  tablet-sized screens, where they previously stretched edge-to-edge.

## v0.840 (web test)
- Fixed near-invisible text in light theme: the Learn practice tutorial's
  guided-tour tooltip (starting with "The assignment") and the 3D view's
  "TOOLS USED" / Measure panels now show properly readable light text on
  their dark overlay backgrounds.

## v0.839 (web test)
- Fixed the mobile field editor panel jumping/growing when editing a feed (F)
  value on an L/C/CR block. FMAX, FAUTO, Insert Q and Skip are now one compact
  dropdown instead of 4 separate buttons that could wrap to a 2nd row.

## v0.838 (web test)
- Removed the Tool Table's "Click ? Help…" hint on phones/tablets, where that
  hover-based help flow doesn't apply.

## v0.837 (web test)
- Fixed the mobile status bar jumping height while a program runs. The running
  block description now stays on one line (truncated with … if long) instead of
  wrapping and changing the bar's height between blocks.

## v0.835 (web test)
- Tapping Cycle 209 with `Q256=0` now correctly retracts the tool fully out of
  the hole between chip-break steps (instead of ignoring the 0), and `Q257=0`
  again means a single pass with no chip breaking.

## v0.834 (web test)
- Cycle 208 now uses a semicircular entry from the bore center, followed by
  constant-radius helical passes; it no longer expands a helix from zero radius.

## v0.833 (web test)
- The Complete Part demo now uses a 2 mm helix infeed. Cycle FAUTO follows the
  TOOL CALL feed, Cycle 208 keeps every revolution within its programmed Z
  infeed, and short drilling/tapping retracts remain visibly animated.

## v0.832 (Learn test)
- Added a Start here tutorial that explains how lessons and practice work.
- Every practice task now shows its goals and offers three progressive hints.
- Added a guided tour of the assignment, editor, goals, hints and Check button.
- Finishing a lesson now returns to the lesson list on phones and narrow screens.

## v0.831
- Added Low, Default and High simulation profiles. The new Default balances
  smooth machining with visibly finer detail, and Refine scales with each
  selected profile.
- The faster local 3D workpiece updates passed browser testing and are now part
  of the main web version.

## v0.830 (web performance test)
- The 3D workpiece now updates only around the current cut instead of rebuilding
  the complete voxel model every time. Default and High keep the same resolution,
  while machining should run much more smoothly in the browser.

## v0.828 (mobile web test)
- Fixed the Measure panel overlapping `BLKFORM` on phones, and made workpiece
  visibility changes repaint immediately after a tap.

## v0.827 (mobile web test)
- Added a `BLKFORM OFF/ON` control beside Measure and Path. It can hide or
  restore the current workpiece during simulation so the toolpath is easier to
  inspect.

## v0.826 (web test)
- Fixed unreadable tool/function names in light mode interactive panels.
- Programs can now run without a workpiece: omit BLK FORM or set both box
  corners to zero to watch only the tool and its path.

## v0.825 (mobile web test)
- The program editor now has fixed vertical boundaries below its controls, so
  program text no longer scrolls behind the Path functions or practice panels.

## v0.822
- Fixed RL/RR cancellation: `L Z... R0` now retracts vertically instead
  of moving diagonally by the tool-radius compensation offset.

## v0.819 (mobile web test)
- Test fix for editor jumping on phones: field editing and Learn practice now
  manage keyboard focus without repeatedly pulling the program toward the first
  line. This build still needs verification on a real phone.

## v0.812
- Fixed an empty dark strip at the bottom of the Learn tab on phones/narrow
  windows — the lesson panel now fills the screen down to the bottom tabs.

## v0.810
- Fixed scrolling in landscape on large phones and foldables (and in short
  browser windows): the editor no longer collapses so you can see and scroll
  your whole program. Short, wide screens now use the full-width single-column
  layout with the bottom Editor / 3D / Learn tabs.

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
