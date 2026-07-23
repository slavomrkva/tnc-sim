# TNC Sim — Release notes

User-facing changes, newest first — the stuff a user would actually notice
(new features, visible fixes). The detailed technical/developer changelog lives
in `NOTES.md`; this file is the short, human-readable history.

> **For developers:** whenever you ship a meaningful or user-visible change,
> add a short line here under the current `APP_VERSION`. Skip purely internal
> tweaks (refactors, comments) — those go only in `NOTES.md`.

---

## v0.900 (web test)
- Added documented incremental polar programming: `LP IPA`, `CP IPA` with
  simultaneous `IZ`, incremental `CC IX/IY`, and modal omitted LP coordinates.
- On phones, the last program row now stays above the horizontal scrollbar,
  protected BEGIN/END rows no longer leave a stray caret, and tapping an
  embedded `M89`/`M99` edits only that M function.

## v0.899 (web test)
- Fixed the reported compensated contour ending with a 180-degree CHF lead-out
  being rejected as if the tool were too large for an inside corner.

## v0.898 (web test)
- Program rows now follow logical TNC blocks: Enter on any row of a cycle inserts one numbered empty block after the whole cycle, while Enter on END PGM does nothing. Desktop multi-line paste and IME input remain supported.

## v0.896 (web test)
- Added cookieless, anonymous usage analytics for simulation runs and quality, explicit Refine use, first editor use, Tool Table use and Learn progress. NC programs, filenames, tool values, free text and user IDs are never included.

## v0.894 (web test)
- Autosave results now use compact Saved, Restored and Save failed labels that stay on one line. On narrow desktop editor panels, M list, Export and Import keep their labels intact and wrap cleanly instead of overlapping the simulation controls.
- The restored-program status now stays in the original single desktop header row. Editor actions move to a separate wrapped row only after the side panel is genuinely narrow.

## v0.893 (web test)
- Autosave now writes at most every 30 seconds while typing. Pending changes use a quiet neutral status; orange is reserved for an actual save problem.

## v0.892 (web test)
- Closing a lesson now immediately returns the editor to the saved main program state; the stale “Lesson — changes are not saved” message no longer remains until tabs are switched.

## v0.891 (web test)
- The current NC program is now saved automatically in this browser and restored after a reload. The editor shows the save state; lesson exercises remain temporary and never overwrite the saved main program.

## v0.890 (web test)
- Cycle 208 now offers its full bore-milling parameter set, including `Q370`, and all supplied Cycle 208 programs and lessons include the path-overlap value.

## v0.889 (web test)
- Corrected decimal Tool Call feeds and `L ... FAUTO`, added the documented Cycle 208 `Q370` path overlap, and reject negative Cycle 209 `Q336` spindle angles.

## v0.888 (web test)
- Improved how TNC Sim is described to search engines as an open-source online Heidenhain and CNC mill simulator.

## v0.887 (web test)
- After a report or suggestion is posted, the send button becomes Close instead of allowing the same item to be submitted again.

## v0.886 (web test)
- The browser-tab icon now has transparent rounded corners for a cleaner appearance.

## v0.885 (web test)
- Unified the light and dark themes with consistent neutral grays, teal actions and amber highlights; the 3D view, scrollbars and toolbar controls now match the same visual style. The browser-tab icon is also larger and easier to recognize, with a cleaner tab title.
- The one-click report dialog now explains its privacy behavior and the basic technical diagnostics it sends in a calmer, clearer way.

## v0.884 (web test)
- Enabled the production Turnstile widget for secure one-click problem reports and suggestions from the website and Android app.

## v0.883 (web test)
- Restored the one-click report endpoint on the current Cloudflare Workers deployment while keeping the existing website and offline assets unchanged.

## v0.882 (web test)
- The bug-report endpoint now also accepts reports from the Android app's WebView (same one-click flow), not just the website.

## v0.881 (web test)
- New app icon, site logo and favicon: a cleaner radius-compensation motif — the workpiece with the cutter riding along its offset toolpath — replacing the old grid mark.

## v0.880 (web test)
- Rebuilt the bug report as a one-click **Report a problem / Suggest improvement** dialog. Pick a type, optionally add a note, and hit Send — a public GitHub issue is opened for you, no GitHub account needed. Bug reports attach the current program, version and device details automatically; suggestions attach only basic context (no program). A clear warning explains the report becomes a public GitHub issue.
- Removed the old GitHub-account / Email / Copy report / Copy screenshot buttons and the technical previews from the dialog.
- Desktop footer: dropped "Buy me a coffee" and moved the report button to the right; "Buy me a coffee" now lives only in the About box as a small link.
- Refreshed the site title/description ("open" / "open-source" instead of "free") and updated the privacy policy to explain that bug reports upload the NC program and become public GitHub issues.

## v0.879 (web test)
- Switching from German back to English now restores the English Complete Part starter program instead of leaving its German-comment version in the editor.

## v0.878 (web test)
- Opätovné spustenie (Run/Step) dokončeného programu už nenechá farebné zvyšky rezov z predchádzajúceho behu (napr. fialové steny/ihličky po zahĺbení) v miestach, kde sa odoberal materiál — každý beh teraz začína z čistého polotovaru, rovnako ako po Reset. Doteraz to čistil až manuálny Reset.

## v0.877 (web test)
- Kontúra po vŕtacom/frézovacom cykle (napr. CYCL DEF 208 volanom cez M99) už nereže materiál rýchloposuvom FMAX, keď prvý rezný pohyb nemá zadané F — použije sa posledný naprogramovaný posuv (FAUTO). Predtým sa modálny posuv po cykle chybne „zasekol" na FMAX.

## v0.876 (web test)
- Názov programu vľavo hore teraz sleduje súbor: pri výbere demo ukáže názov dema, pri importe názov súboru, pri exporte uložený názov a pri novom (vyčistenom) programe „program.H" — namiesto stáleho „PROGRAM.H".

## v0.875 (web test)
- Začatie korekcie polomeru (RL/RR) už počas písania nehlási chyby „still active / program R0" — objavia sa až pri Run/Step. Skutočné geometrické chyby (napr. príliš veľký polomer nástroja) sa zobrazia hneď.

## v0.874 (web test)
- Rýchloposuv (FMAX) do materiálu teraz zobrazí varovanie o kolízii, ale už nezastaví simuláciu — dobehne do konca, aby si videl celý program.

## v0.873 (web test)
- SEO: title/description/OG/JSON-LD teraz spomínajú nemčinu (Deutsch) a opravený počet lekcií (15→16).

## v0.872 (web test)
- Preložené okno „About" (popis aplikácie, tlačidlá GitHub / Fehler melden / Kaffee).

## v0.871 (web test)
- Q335 sa v nemeckom preklade správne volá „SOLL-Durchmesser" (namiesto „Nenndurchmesser").
- Prepínač jazyka teraz ukazuje jazyk, na ktorý prepnete, nie aktuálny (anglická stránka zobrazuje „DE", nemecká „EN").

## v0.870 (web test)
- Nemecký preklad rozšírený o komentáre v demo programoch, zoznam M-funkcií (M list), automaticky vkladané komentáre pri výbere M-funkcie a komentáre pri všetkých parametroch cyklov (CYCL DEF / Q-parametre). Klartext ostáva nepreložený.

## v0.869 (web test)
- Nemecká jazyková verzia — prepínač EN/DE, celé UI, Help/Tool Table tooltipy a všetkých 16 Learn lekcií.

## v0.868
- Corrected TNC 640 RL/RR tool-centre geometry for supported L, C, CC, CR, CT, CP, RND and CHF contours, removing false radius errors on valid paths.
- While completing an L block, interim RL/RR diagnostics are now one orange notice rather than multiple blocking errors.
- In the L editor, Radius compensation now precedes Feed on desktop and mobile.

## v0.867 (web test)
- On mobile, `−` now moves in front of an entered BLK FORM, guided path or cycle value; pressing `−` again restores the positive value.

## v0.866 (web test)
- The desktop F-field menu now opens downward below the selected feed value.

## v0.865 (web test)
- Fixed the desktop F-field menu so its options stay open until selected.
- The 3D simulation now shows the LBL currently invoked by `CALL LBL`.

## v0.864 (web test)
- Reworked the first Start here lesson into three concise orientation slides,
  with a visual preview of Hint 1–3 and an ungraded editor walkthrough.

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
