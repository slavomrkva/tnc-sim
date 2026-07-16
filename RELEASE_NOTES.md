# TNC Sim — Release notes

User-facing changes, newest first — the stuff a user would actually notice
(new features, visible fixes). The detailed technical/developer changelog lives
in `NOTES.md`; this file is the short, human-readable history.

> **For developers:** whenever you ship a meaningful or user-visible change,
> add a short line here under the current `APP_VERSION`. Skip purely internal
> tweaks (refactors, comments) — those go only in `NOTES.md`.

---

## v0.863
- Corrected cycles 200, 201, 208 and 209 for zero/positive depths, safe final
  retracts, feeds, dwell behavior, spindle direction and tapping parameters.
- Reworked Cycle 208 and RL/RR/R0 cutting paths, including countersink DR,
  centre-before-retract motion, small effective radii and valid rounded corners.
- Invalid or unsupported Heidenhain blocks now appear in Problems and block the
  run instead of being silently ignored; Complete Part and Angle Mill execute
  their full intended toolpaths.

## v0.862 (web test)
- Repaired Tool Table add/edit/delete state handling, strict parameter checks,
  safe transactional import and duplicate-number protection.
- Locked tools now use an available RT replacement, TIME2 locks a tool for the
  next run, and the table explains which reference values do not alter motion.
- Tool Table imports now reject malformed data without replacing the current
  table, while valid `.tnt` export/import remains compatible.

## v0.861
- Released the accepted shorter Start here lesson: two direct slides, a simple
  task → editor → Check diagram, and a text-only explanation of progressive
  hints. The five-step guided tour remains unchanged.

## v0.860 (web test)
- Replaced the second Start here diagram with a direct explanation of the three
  progressive Hint levels and confirmed that hints never reset student code.

## v0.859 (web test)
- Replaced the Start here lesson's three detailed slides with two direct,
  simpler visuals. The existing five-step guided tour is unchanged.

## v0.858
- Released the accepted complete Learn audit: stricter task checking, clearer
  lesson and hint wording, redesigned diagrams and the shorter interactive
  Start here tutorial.

## v0.857 (web test)
- Rebuilt the tutorial's second diagram as three full-width horizontal cards so
  Goals, Hint and Check text stays well clear of both side borders.

## v0.856 (web test)
- Removed the overlapping status circles from the tutorial's Goals card and
  replaced the final circular result with a wider 2/2-goals panel.

## v0.855 (web test)
- Rebuilt the Start here tutorial as a short visual two-minute introduction:
  read, try, check and improve, with clear diagrams for Goals, Hint and Check.
- Shortened the first-run interface tour from nine steps to the five actions a
  student needs for their first task.
- Made the warm-up genuinely interactive: add one comment, press Check, pass
  both visible goals, then finish the tutorial.

## v0.854 (web test)
- Positioned the Lesson 14 Cycle 208 countersink inside the bore so its 45°
  cutting flank sits exactly on the finished material edge, visually showing
  the configured DL−2/DR+2 offset without extra labels.

## v0.853 (web test)
- Redrew Lesson 14's hole-edge diagram with a dimensioned 90° countersink,
  45° flanks and the resulting chamfer visible in the hole section.
- Fully separated the remaining tapping and DL/DR labels from dimension and
  geometry lines in Lessons 13 and 14.

## v0.852 (web test)
- Corrected the countersink orientation in Lesson 14 so its wide cutting body
  is above the tip and the tip points into the hole.
- Repositioned diagram labels and guide lines in Lessons 7, 9, 11, 13 and 14
  so no line runs through explanatory text.

## v0.851 (web test)
- Reviewed every Learn slide image in dark and light themes and redesigned the
  unclear diagrams for safe motion, slots, arcs, corners, drilling, tapping,
  counterboring, chamfering and the final profile.
- Added missing visual explanations for label reuse, the spot-drill-ream
  sequence, small-hole versus large-bore edge breaking, and the two final
  machining passes.
- Enlarged labels, added axes, datum/contact/tangent markers and separated
  multi-stage operations so each diagram teaches one clear idea.

## v0.850 (web test)
- Replaced the confusing final diagram in Lesson 7 with a dedicated RL
  compensation view showing the programmed X+50 wall, the X+45 tool-centre
  path, and the R5 contact offset.
- Replaced Lesson 11's tiny top-view spiral with a large side-view Cycle 208
  diagram showing helical infeed, depth per turn, total depth, and widening
  finishing rings.

## v0.849 (web test)
- Learn now grades executable Klartext instead of accepting answers hidden in
  comments, and cycle tasks verify the requested parameters in the correct
  tool/cycle sequence.
- Fixed practice tasks that could pass before the student wrote anything, plus
  incorrect acceptance of positive values where a negative depth was required.
- Improved Learn keyboard accessibility, progress feedback, hint wording,
  diagram labels, light-theme contrast, and several overly absolute machining
  explanations.

## v0.848
- Added four ready-to-run demos: Chamfering, Rough & Finish, Thread Hole, and
  Precise Hole.

## v0.847 (web test)
- The light-theme 3D table grid is now a softer neutral grey instead of nearly
  black.
- Learn (desktop): revealing a Hint now takes the left panel fully to the
  bottom. Opening another lesson starts with its practice hints closed.

## v0.845 (web test)
- Learn (desktop): the theory slide box now hugs its content instead of always
  reserving a tall fixed area, so short slides no longer leave empty space above
  practice. Revealing a new Hint now scrolls it into view automatically instead
  of jumping the panel back to the top and leaving you to scroll down to find it.

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
