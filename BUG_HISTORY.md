# Bug history — resolved bugs & how they were fixed

Archive of **resolved** bugs. Open/active bugs live in `TODO.md`; when one is
fixed it moves here (see the workflow rule in `NOTES.md` — "Bug lifecycle").

Keep, for every entry: the symptom as reported, the root cause once found, and
**every approach that was tried — including the ones that failed** and why. The
failed attempts are the point — they stop a future session (which has no memory
of this work) from repeating a known dead end.

The Android app (`tnc-sim-android`) keeps its own `BUG_HISTORY.md`; for bugs
that span both repos, each cross-references the other.

Newest first.

---

## C28 — Mobile editor footer and incremental polar blocks
**Repos:** web `tnc-sim` v0.900 and Android `tnc-sim-android`
APP_VERSION 1.0.89. **Accepted:** 2026-07-23.

### Reported symptom
At the bottom of the mobile editor, the horizontal scrollbar covered the final
program row and a native caret blinked on protected `END PGM`. Tapping `M99` in
`LP PR+50 PA+45 FMAX M99` opened the LP editor rather than the M editor.
Incremental polar examples such as `LP IPA+60` and
`CP IPA+360 IZ+5 DR+` were rejected or produced no supported helix.

### Root cause
The textarea and highlight overlay had no matching bottom clearance, and the
protected-row path retained native focus. Line editing classified only the
leading block token, so an embedded M token could not own the edit. The parser
implemented Cartesian incremental coordinates but not the documented modal
polar state, incremental polar angle, incremental CC center, or simultaneous
polar/tool-axis helix.

### Attempts and accepted fix
- Attempt 1 reserved equal mobile bottom space in the textarea and overlay,
  blurred protected BEGIN/END rows, and hit-tested/replaced embedded M tokens
  before whole-block editing.
- Attempt 2 implemented the locally stored TNC 640 semantics: `CC IX/IY`
  relative to the last tool position, omitted modal LP radius/angle, `LP IPA`,
  and `CP IPA` with simultaneous `IZ`, preserved revolutions and matching
  IPA/DR direction. Unsupported `IPR` remains rejected.
- Focused editor/parser tests, both complete suites, JavaScript syntax checks
  and the 38-case cross-repository cutting reference passed.

**Cross-reference:** Android `BUG_HISTORY.md`, C28.

## 2026-07-18 — coloured leftover cut surfaces when re-running without Reset
**Repos:** web `tnc-sim` v0.878; deliberately ported to Android in APP_VERSION 1.0.61.
**Resolved:** 2026-07-18.

### Reported symptom
Both web and app "sometimes" showed coloured artifacts (purple/tool-5 spikes and
walls) at the start of a simulation, in the places where material is removed.
A restart (Reset) made them disappear. The user suspected the light-mode colour
change but was unsure.

### Investigation (what was ruled out)
- **Incremental chunk meshing.** A live carve sequence (slot + tool-5 countersink
  plunge) was replayed through `vxCut` + incremental `vxRebuildMesh`, then
  compared to a single full clean rebuild of the identical final grid/cut state:
  **byte-identical** position, normal and colour buffers. So the chunked renderer
  is faithful and is not the source. (`tests/voxel-chunks.test.js` already asserts
  chunk-union == full for a static state; this extended it to a live carve.)
- **Light-mode colour change.** `data-theme` is set synchronously in `index.html`
  (before the modules load), so `_stockRGB()`/`_stockHex()` read the correct theme
  at mesh-build time. Stock colours are grey, not the purple seen. Red herring.

### Root cause
Only `onReset()` reset the voxel workpiece (`resetState(); vxReset();`).
`onRun()`/`onStep()`, when rewinding a finished/looped run
(`mode==='done' || subIndex>=sub.length`), called `resetState()` **alone**
(`core/sim-controls.js`). `resetState()` (`parser-engine.js`) resets the block
index and tool position but never the voxel grid/cut/mesh. So a run restarted
from the beginning replayed the toolpath onto the previous run's already-carved,
tool-colour-tagged voxels; the earlier carved surfaces stayed in the mesh.
Because each triangle is coloured by `TOOL_CUT_COLORS[VX.cut(nearest voxel)]`
(and the colour is sampled at the rounded triangle centroid, which also bleeds a
tool colour onto vertical walls beside a cut), the leftovers appeared as coloured
spikes/walls. A manual Reset called `vxReset()` and forced a full clean rebuild,
clearing them — matching "after restart it no longer does it".

### Fix
The rewind branch of `onRun()`/`onStep()` now also calls `vxReset()`, so every
fresh run starts from clean stock (identical to Reset+Run). A mid-run resume
(mode not done and not at the end) still leaves the workpiece untouched so
cutting continues on the existing carving. Regression:
`tests/sim-run-resets-workpiece.test.js` (loads the real `sim-controls.js`,
asserts vxReset on a done-run rewind for both Run and Step, and no reset on a
mid-run resume). Verified it fails on the pre-fix tree.

### Not fixed (noted for later)
The centroid-rounded cut-tag colour sampling can still tint a stock wall triangle
with an adjacent cut's tool colour. It is cosmetic and not the reported artifact;
left as a possible future hardening.

## 2026-07-18 — modal feed corrupted to FMAX after a fixed cycle / M99 call
**Repos:** web `tnc-sim` v0.877; deliberately ported to Android in APP_VERSION 1.0.60.
**Resolved:** 2026-07-18.

### Reported symptom
In a user program (`PROGRAM.H`), after `CYCL DEF 208` was called via `M99`, the
next contour cut the material at rapid feed (FMAX) instead of FAUTO. The contour
worked correctly *before* the cycle: identical `L … RL` blocks with no explicit
`F` cut at the TOOL CALL feed (F5000). Only the contours *after* the cycle were
affected.

### Root cause
`feed` is the shared modal feedrate in `core/parser-engine.js`'s `parseProgram`.
The main loop maintains it correctly — an `FMAX` block sets `feed=9999` only for
that block and restores the previous value afterwards, so no-`F` cutting moves
inherit the last real programmed feed.

`flushPending()`, however, reassigns that *same* `feed` variable to each move it
renders (`feed=mv.feed`), including 9999 for FMAX rapids and per-move feeds set
inside a fixed cycle, and never restored it. Almost every `CYCL DEF` / `M99`
block is preceded by a contour that ends in an FMAX retract; the `flushPending()`
triggered by the `CYCL DEF` (and by the M99 call itself) therefore left the
outer modal `feed` stuck at 9999. The next contour's first cutting move that
omitted `F` was then pushed with `feed:9999` while `rapid:false` — i.e. it cut
material at rapid speed. Confirmed by dumping per-`srcLine` feeds: every no-`F`
cutting move before the cycle read 5000; every one after read 9999.

### Fix
`flushPending()` now snapshots `feed` on entry (`var _modalFeed=feed;`) and
restores it on exit (`feed=_modalFeed;`), keeping its per-move bookkeeping local
to rendering. The main-loop modal feed continues to track the last real
programmed feed across cycle calls. Regression added to
`tests/parser-cycles.test.js` (a cycle 208 M99 call between two FMAX-terminated
contours; asserts no non-rapid segment runs at 9999 and the post-cycle no-`F`
cut uses F5000). Verified the test fails on the pre-fix tree.

### Approaches considered but not taken
- Making no-`F` cutting moves fall back to `lastDefinedFeed` at push time: would
  mask the corruption rather than fix it, and would not repair the modal state
  for any other consumer of `feed` after a flush. Fixing the corruption at its
  source (`flushPending`) is narrower and complete.

## 2026-07-17 — mobile numeric editing and TNC 640 RL/RR geometry
**Repos:** web `tnc-sim` v0.868; deliberately ported to Android in APP_VERSION 1.0.55.
**Resolved/accepted:** 2026-07-17.

### Reported symptoms and root causes
- Mobile keyboards appended a newly pressed minus after an entered field value, and an already negative value could not be toggled back to positive. Cycle Q editing requested the full text keyboard.
- The L builder exposed its fields as XYZ/F/R/M instead of XYZ/R/F/M. During an unfinished L edit, the Problems panel emitted several premature RL/RR errors.
- `PROGRAM.H` falsely rejected a valid 5 mm effective tool radius. The old compensation pass offset display chords rather than exact contour geometry; its lead-in and inner-radius checks therefore misclassified a valid circular entry.

### Accepted implementation and verification
- A common mobile sign handler normalizes trailing keyboard signs, toggles an existing negative value, and covers BLK FORM, guided L/C/CC/CR fields, CR radius and cycle Q values. Q editing uses the decimal keypad.
- The L schema now uses XYZ/R/F/M. Live RL/RR editing suppresses only radius-compensation diagnostics and replaces them with one orange notice; complete editing and simulation retain all blocking validation.
- The parser preserves L/C/CR/CT/CP/RND/CHF as analytic primitives through compensation, calculates exact offsets, finite inner intersections and outer transition arcs, then tessellates the finished tool-centre path. RND uses the correct tangency distance `R*tan(turn/2)`; equality with the tool radius is handled as its degenerate geometric limit rather than a false "smaller" error.
- Focused regressions, all parser suites and the supplied PROGRAM.H contour passed locally. The reported entry ends at X0/Y34.5, the entry C centre-path radius is 2.5 mm and each RND centre-path radius is 0.5 mm.

## C19 — Desktop F menu closed prematurely; CALL LBL status was blank
**Repos:** web `tnc-sim` v0.866 and Android `tnc-sim-android` (LBL status only).
**Resolved/accepted:** 2026-07-16 after web preview verification.

### Symptom and root cause
The compact native F selector closed on desktop when the mouse button was released.
It had been introduced to prevent the mobile F controls from wrapping. Expanded
`CALL LBL n` segments retain the CALL source line for editor highlighting, so the
status panel had lost the called LBL number.

### Accepted fix and verification
- Mobile keeps its native F selector. Desktop uses a click-to-open menu below
  the F value, which stays open until selection, Escape or an outside click.
- The LBL resolver recognizes `CALL LBL n` at the segment source line before
  scanning surrounding label definitions, preserving status and highlighting.
- Focused desktop/mobile menu and LBL-status regressions passed with all bundled
  web JavaScript tests. The Android LBL-status port is recorded in Android C19.

## C18 — Heidenhain cycles, cutting logic and validator audit
**Repos:** web `tnc-sim`; accepted implementation ported separately to Android.
**Resolved/accepted:** 2026-07-16 in web v0.863 after the user ran all bundled
programs and approved merging, while noting that real-machine edge cases may
still emerge over time.

### Reproduced defects and root causes
- `Q201=0` fell through to a default depth in cycles 201/208/209; positive
  `Q201` was silently negated. Falsy-default extraction and sign normalization
  made invalid input look executable.
- `Q204=0` became 50 and a lower Q204 could cause a final rapid move downward.
  Final clearance selection did not preserve explicit zero or choose the safer
  of the two retract levels.
- Cycle 208 used the physical tip radius for radial stepping but the effective
  `R+DR` for the wall path. A countersink with R≈0.001 and DR+2 therefore
  generated roughly 290,000 segments. Its final vertical retract also began
  off-centre.
- RL/RR imposed a hidden 0.05 mm radius floor. Gouge checks later treated each
  short display chord of a tessellated C/RND as a real contour primitive, which
  falsely rejected Complete Part even though R20 and the Ø10 tool fit.
- Programmed DL/DR state was not consistently captured per run, and a TOOL CALL
  under active compensation could silently change/cancel the path state.
- The validator accepted syntax that the parser ignored, including unsupported
  blocks/M functions/axes, malformed coordinates and Q expressions, impossible
  arcs, and orphaned RND/CHF. Parser-only errors were not shown in Problems.

### Attempts and accepted fixes
- A VM harness first recorded numerical before-values for A1–A5 and R1. This
  prevented visually plausible toolpaths from being accepted without proving
  depths, segment order, feeds and retract coordinates.
- Cycle parameters now preserve explicit zero, reject positive depth without a
  cutting path, and use a safe conditional second-clearance retract. Cycle 208
  uses one effective radius for wall and stepover, bounds its pass count, returns
  to centre at working depth, and respects Q334/Q342/Q351, spindle direction,
  ANGLE, R2/DR2 and RCUTS. Cycles 200/201 model their feeds/dwells and Q395;
  Cycle 209 models Q239 hand, Q336, Q403, PITCH and synchronized reversal.
- DL/DR is captured per segment/run, program allowance remains separate from
  the physical voxel tool, RL/RR direction is preserved, R0 supports lateral
  lead-out and pure-Z cancellation, outer corners receive transitional arcs,
  and invalid compensated runs emit no nominal/gouging cut.
- The first gouge fix exposed a false positive in Complete Part. Grouping
  tessellated chords by source primitive and checking actual local curvature
  fixed the diagnosis without special-casing R=0.001 or increasing a segment
  guard.
- Parser diagnostics are returned to the editor and merged into Problems, so
  geometrically invalid code blocks Run/Step instead of disappearing. Static
  validation now rejects only unsupported/malformed features in the simulator's
  implemented scope and does not claim those features are invalid on every real
  HEIDENHAIN control.
- Angle Mill exposed a regression in the new Q-expression checker: the Q prefix
  itself was classified as unsupported, preventing Q2 increments and creating
  repeated false zero-XY/RL errors. Defined Q references are now accepted, the
  invalid no-op `CALL LBL 0` was removed, and both T1 and T2 execute all 22
  programmed ramp strips.

### Verification and remaining limits
All nine Node suites, 38 JavaScript syntax checks and `git diff --check` passed.
Regression tests cover all four cycles, exact Complete Part and Angle Mill,
segment order, coordinates, feed/FMAX, direction, pass counts, diagnostics and
absence of rejected cutting paths. Thread flanks, machine-specific Q403 RPM
caps and version-dependent Q342 behavior still require an offline control or
real HEIDENHAIN machine; acceptance does not turn those uncertainties into
simulated machine guarantees.

---

## C16 — Complete Learn correctness, content and visual audit
**Repos:** web `tnc-sim`, with the accepted Learn package ported separately to
Android. **Resolved:** web v0.858. **Accepted:** 2026-07-15 after iterative user
review of previews v0.849–v0.857.

### Symptom and root causes
Some tasks could pass from starter code, comments, wrong-sign depths or motion
created by an older cycle. Several Q parameters were not scoped to the requested
cycle. Lesson explanations and hints included ambiguous machining claims, while
many diagrams were generic, too small, geometrically misleading or crowded by
labels. The Start here lesson repeated a nine-step coach instead of giving the
student a short interactive first success.

### Attempts and accepted fixes
- Attempt 1 moved grading from raw source text to executable code, added scoped
  cycle/parameter and ordered-sequence checks, and verified all 46 official
  solutions pass while every starter and the regression cheats fail.
- Attempt 2 improved control semantics, contrast, alternative labels, hint
  progression and machining wording; local Learn regressions passed.
- Attempt 3 replaced the Lesson 7 compensation thumbnail and Lesson 11 spiral
  with enlarged, operation-specific diagrams.
- Attempt 4 audited every slide image in both themes, replaced remaining generic
  drawings and added missing LBL, precision-hole, edge-breaking and final-pass
  visuals.
- Attempt 5 corrected the inverted countersink and moved reported Lesson 7, 9,
  11, 13 and 14 labels away from intersecting geometry.
- Attempt 6 rebuilt Lesson 14.2 with a true 90° countersink, 45° flanks and
  visible finished hole edges, and isolated the remaining 13.1/14.1 labels.
- Attempt 7 positioned the Cycle 208 countersink so its cutting flank coincides
  with the finished edge and visually communicates DL−2/DR+2 without labels.
- Attempt 8 rebuilt Start here around the read/try/check/improve loop, shortened
  its coach to five essential actions and required the checked warm-up.
- Attempt 9 replaced cramped circular status marks with a wider score card.
- Attempt 10 replaced tutorial slide 2's narrow columns with full-width stacked
  Goals, Hint and Check rows. The user accepted the resulting v0.857 preview and
  requested the complete Learn package be merged and ported to Android.
- Attempt 11 reduced Start here to two direct slides. The first shows only
  task → editor → Check; the second explains the three progressive Hint levels
  in text without an image. The accepted five-step coach stayed unchanged. The
  user accepted v0.860 and requested the web and Android merge.

## C14 — Revealed hints leaked into a newly opened lesson
**Repo:** web `tnc-sim`; Android port prepared separately. **Resolved:** web
v0.847. **Accepted:** 2026-07-15 after user testing.

### Symptom and root cause
After revealing hints, returning to the list and opening another lesson could
show the previous task and hints. `learnOpenLesson()` changed the lesson index
but left the global task, result, and hint state untouched.

### Attempt and fix
- Reset `LEARN.task`, `LEARN.lastResults`, and `LEARN.hint` whenever a lesson
  card is newly opened. The existing task-to-task reset remains in place. The
  user confirmed the v0.847 web preview works correctly.

## C13 — Learn Hint did not scroll the desktop left panel fully down
**Repo:** web `tnc-sim` only. **Resolved:** web v0.847. **Accepted:** 2026-07-15
after user testing.

### Symptom and root cause
The v0.845 `scrollIntoView({block:'nearest'})` attempt made the last hint visible
but did not keep the complete left Learn panel at its bottom. `learnRender()`
replaced the `.lp-body` scroll owner on every hint reveal.

### Attempt and fix
- Replaced the nearest-row scroll with an exact `.lp-body.scrollTop =
  .lp-body.scrollHeight` after rendering. It is guarded by `!_isMTab()`, so the
  Android/mobile layout is untouched. The user accepted the desktop behavior.

## C12 — Light-theme 3D table grid was too dark
**Repo:** web `tnc-sim`; Android port prepared separately. **Resolved:** web
v0.847. **Accepted:** 2026-07-15 after user visual testing.

### Symptom and root cause
The table grid used the same near-black blue-grey colors in both themes, so it
looked too dark against the light scene.

### Attempt and fix
- Added neutral grey light-theme GridHelper colors while preserving the dark
  palette, plus live buffer recoloring when the theme changes. The user
  confirmed the v0.847 result.

## C10 — Cycle 209 explicit zero values were ignored
**Repos:** web `tnc-sim` + Android `tnc-sim-android`.
**Resolved:** web v0.835; Android 1.0.35. **Accepted:** 2026-07-15 after the user
confirmed the current web and Android versions work correctly.

### Symptom and cause
In a single-line `CYCL DEF 209`, `Q256=0` should fully retract between
chip-break steps and `Q257=0` should disable chip breaking. Defaults were read
with `qm[n] || default`, so valid zero values were replaced as falsy. The
execution branch was correct but never received zero.

### Attempts and fix
- The multi-line conversational form already preserved zero, isolating the bug
  to the inline parser.
- v0.835 changed Cycle 209 defaults to
  `Q !== undefined ? Q : default`, matching Cycle 200 and the durable zero-value
  rule. Automated tests passed; the fix was later deliberately ported to Android
  1.0.35 and accepted in the current builds.

## C9 — Short drilling/tapping retracts appeared to teleport
**Repos:** web `tnc-sim` + Android `tnc-sim-android`.
**Resolved:** web v0.833; Android 1.0.33. **Accepted:** 2026-07-15.

### Symptom and cause
Short Cycle 200/209 reversals could complete inside one display frame, so the
tool appeared instantly at the retract height even though parser inspection
proved the correct segments and feeds existed. Cycle 200 had to remain FMAX;
Cycle 209 had to remain synchronized at pitch × spindle speed.

### Attempts and fix
- Parser instrumentation ruled out missing segments and incorrect motion types.
- Only cycle-internal retract/return segments are marked `ensureVisible` and a
  sub-frame marked move is held at its midpoint for one render. Ordinary rapid
  and short arc moves are unchanged. Regression coverage preserves the distinct
  Cycle 200 and Cycle 209 feeds; the Android port and current builds were
  accepted by the user.

## C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed
**Repos:** web `tnc-sim` + Android `tnc-sim-android`.
**Resolved:** web v0.833/v0.834; Android 1.0.33. **Accepted:** 2026-07-15.

### Symptom and cause
Cycle 208 `Q206 FAUTO` followed a later modal contour feed instead of the active
`TOOL CALL` feed, and helix depth calculation excluded the Q200 safety travel,
allowing an uneven final step. Solid-stock entry also expanded from zero radius
instead of entering the constant-radius helix smoothly.

### Attempts and fix
- Instrumentation showed `lastDefinedFeed` being overwritten by `L ... F2000`
  after `TOOL CALL F3500`.
- The parser now keeps `toolCallFeed` separate, calculates revolutions over the
  full safeZ-to-depthZ travel, and uses a semicircular center lead-in followed
  by constant-radius helices. Automated regression verifies F3500, the complete
  11-revolution path, and at most 2 mm per revolution. The user accepted the
  current web and Android behavior.

## C11 — Learn (desktop): wasted slide space and hints revealed off-screen
**Repos:** web `tnc-sim` only (desktop layout; the Android app's mobile Learn
layout already scrolls the active practice panel independently, see C5).
**Resolved:** 2026-07-15 in web v0.845. **Verified:** headless Playwright
check (1400×900 and 1400×700 viewports) confirmed the slide box now sizes to
its content and each revealed hint lands fully inside the visible panel.

### Symptom
On desktop, the THEORY slide box (`.lp-slide-view`) always reserved a fixed
390px, leaving a large empty gap under short slides. Pressing **Hint** in
PRACTICE appended a new hint below the fold; the panel view jumped back to the
top instead of following it, so the user had to manually scroll down to find
the hint they just revealed.

### Root cause
`.lp-slide-view{height:390px;...}` (`web/styles.css`) was a fixed height
regardless of content length. Separately, `learnRender()`
(`core/learn-tutorial.js`) rebuilds `#learnPanel`'s entire `innerHTML` on every
call — including a brand-new `.lp-body` element each time — so `.lp-body`'s
`scrollTop` (the shared scroll container for slides + practice) always resets
to 0. `learnHint()` never accounted for this, so a newly revealed hint had no
way to end up visible unless it happened to fit within the reset-to-top view.

### Fix
- `.lp-slide-view` (both the desktop rule and the `@media(max-width:1024px),
  (max-height:600px)` one) changed from a fixed `height` to `max-height`, so
  the box hugs actual slide content and only scrolls internally past the cap.
  Slide content is plain `<p>` text (`core/data-tables.js`) with no
  height-100%/flex-centering that depended on the old fixed box.
- `learnHint()` now scrolls the last `.lp-hint-row` inside `#learnPanel` into
  view (`scrollIntoView({block:'nearest', behavior:'smooth'})`) right after
  `learnRender()`, so the newly revealed hint ends up visible instead of
  requiring a manual scroll.
- Not ported to Android's `www/core/learn-tutorial.js` — desktop-only report;
  Android's mobile Learn layout is a different bounded-flex arrangement (C5)
  and wasn't part of this report.

## C7 — 3D stock updates stalled during machining
**Repos:** web `tnc-sim`; Android port tracked separately until device testing.
**Resolved:** 2026-07-14 in web v0.831. **Verified:** automated exact-geometry
regression, browser workflow, and user testing of the published v0.830 branch.

### Symptom
The tool animation visibly stalled whenever the voxel workpiece refreshed,
including Default quality on the moderate 100×100×20 stock. High quality made
the pauses more prominent.

### Root cause
Every changed segment made `vxRebuildMesh()` scan the entire voxel grid,
allocate a complete replacement mesh and upload it to the GPU. Profiling against
an otherwise identical toolpath-only run isolated pauses above 50 ms to this
stock rebuild path.

### Attempts and fix
- First profiled stock and toolpath-only runs; this ruled out the renderer loop
  and tool motion and identified full-grid meshing as the bottleneck.
- The v0.830 test split Marching Cubes into 32×32-cell XY chunks. Cuts now mark
  their actual changed bounds plus the one-cell dependency halo and rebuild only
  intersecting chunk geometries. It also reuses per-cell buffers and removes a
  redundant normal pass.
- Regression coverage proved all 20,844 triangle, normal and color values match
  a full rebuild and verifies boundary invalidation and selective replacement.
  A Node microbenchmark measured an approximately 11× local scan speedup. The
  user reported that the published browser fix works very well, so it was
  accepted and merged in v0.831.

## C5 — Editor text passed behind mobile control panels
**Repos:** web `tnc-sim` + Android `tnc-sim-android`.
**Resolved:** 2026-07-13; web implementation v0.825, merged in v0.829, and
Android port 1.0.30.

### Symptom
Program text scrolled behind Path functions, contextual editors and practice
controls because the whole editor panel was the scroll owner and those controls
were sticky overlays without firm vertical boundaries.

### Root cause and fix
The mobile editor is now a bounded flex column: controls remain real rows in
normal flow, while only the code viewport scrolls in the remaining space.
Opening a context or practice row therefore reduces the code height instead of
covering it. Web checks at 390×844 covered normal, scrolled, practice and field
editing states; the user accepted the web result, and the same layout was then
ported to Android while preserving its WebView keyboard handling.

## C6 — Measure panel overlapped the mobile BLKFORM control
**Repo:** web `tnc-sim`. **Resolved:** 2026-07-13 in v0.828.

### Symptom
The new `BLKFORM OFF` control appeared not to work on mobile. Enabling Measure
also placed its floating panel over the BLKFORM button.

### Root cause
`#measureOverlay` was fixed at `top:10px; right:10px`, the same top strip used
by the left-aligned, wrapping `#canvasTopButtons`. Adding BLKFORM made those two
independently positioned regions intersect on a phone-sized simulation view.
The published v0.827 handler itself responded in an isolated check, but the
overlap made the mobile control obstructed/ambiguous. Idle rendering could also
delay visible feedback after a tap.

### Attempts and fix
- Reproduced the published v0.827 button and confirmed it changed to
  `BLKFORM ON`; this ruled out a missing handler in the branch build.
- Positioned Measure from the live bottom edge of the complete button row plus
  6px instead of a fixed top coordinate, with a mobile-safe maximum width.
- Forced one immediate WebGL render after BLKFORM changes and bumped the web
  service-worker cache to v5. At 390×844, Measure and BLKFORM have no geometric
  intersection; toggling BLKFORM while Measure is open closes Measure and hides
  the stock immediately.

## C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour
**Repos:** web `tnc-sim` (v0.822; `cc1f5ea`, merged by `67b8393`) + Android
`tnc-sim-android` (1.0.27; `55c0ace`).
**Resolved:** 2026-07-13. **Verified:** automated full-contour regression and
user testing on current mobile web and Android app.

### Symptom
At the end of an RL/RR contour, `L Z+20 R0` should retract straight up. The
simulator instead moved diagonally back toward the programmed contour and could
cut into the model while retracting.

### Repro contour
```text
LBL 1
L X-20 Y+235 Z+50 FMAX
L Z+Q1
L Y+230 FAUTO RL
L X+101
CHF 15
L Y+200
RND R5.5
L X+161
RND R5.5
L Y+230
CHF 15
L X+296
CHF 15
L Y+200
RND R5.5
L X+366
CHF 15
L Y+0
CHF 15
L X+0
CHF 15
L Y+231
CHF 16
L X+20
L Z+20 R0
LBL 0
END PGM PROGRAM
```

### Root cause
The shared radius-compensation postprocessor ended the RL/RR run at the
laterally offset physical tool-centre point. `offsetRun()` then rewrote only
the following R0 segment's `from`, while its `to` retained the nominal XY.
Because `L Z+20 R0` has zero programmed XY displacement, this manufactured a
diagonal exactly equal to the compensation offset. It was a path-segment bug,
not voxel cutting or rendering.

### Attempts and fix
- The first tempting one-endpoint changes were rejected during analysis:
  modifying only `from` preserves the diagonal, while modifying only `to`
  creates a segment discontinuity.
- Web branch `fix/c2-r0-pure-z` made a zero-XY R0 keep the full retract at the
  last compensated physical XY. That actual position is carried through later
  Z/state-only segments; the first later XY move leads out to its nominal
  target. The user verified the web result, then the identical shared-core
  change was ported to Android.
- Added `tests/parser-radius-comp.test.js` in both repos. It covers RL, RR,
  ordinary lateral R0, repeated Z retracts, a state-only segment, later XY
  lead-out, and the complete reported RND/CHF contour. Android also passed
  Capacitor sync and debug build before its main push.

The user subsequently confirmed the current Android app also retracts correctly.

---

## C4 — Placement of a newly inserted block relative to the active line
**Repos:** web `tnc-sim` + Android `tnc-sim-android`.
**Resolved/accepted:** 2026-07-13 in web v0.823 and Android 1.0.28.
**Verified:** user testing in the current Android app.

### Original expectation
With the caret at the end of a non-empty active line, the next block should be
inserted directly below it without an extra blank line. On an empty active
line, the new block should replace that line.

### Resolution note
This entry described a desired interaction rule rather than a separately
isolated runtime failure. After the C1 focus/selection stabilisation, the user
confirmed that current insertion placement works according to their intended
workflow. It is not necessarily a literal implementation of every sentence in
the original expectation, but the observed behaviour is explicitly accepted
as correct. No additional C4 code change was made. Do not reopen or rewrite the
placement logic merely to match the old wording without a new concrete repro.

---

## C3 — RND/CHF occasionally inserted at the start of the program
**Repos:** web `tnc-sim` + Android `tnc-sim-android`.
**Resolved:** 2026-07-13 in web v0.823 and Android 1.0.28.
**Verified:** user no longer observes the symptom in the current Android app.

### Symptom
While programming, inserting RND or CHF could place the block at the very
start of the program instead of near the active line.

### Root cause and resolution
No independent RND/CHF parser or insertion defect was isolated. The strongest
evidence is that the stale/default selection produced by C1's competing focus
and delayed-refocus paths sometimes made insertion use position zero. C1
removed that race and stabilised the saved caret/selection. No separate C3 code
change was required, and the user confirmed the symptom is absent in the
current app. If it ever recurs, capture the active line, selection offsets and
exact insertion button; treat that as a new concrete repro rather than
reapplying the old focus timers.

---

## C1 — Mobile editor focus/scroll jumping during value editing and Learn
**Repos:** web `tnc-sim` (v0.819, `b1e111d`) + Android
`tnc-sim-android` (1.0.25, `e5a8fb6`).
**Resolved:** 2026-07-13. **Verified:** local forced-mobile browser checks and
user testing on real mobile web and Android devices.

### Symptom
Opening or editing a field could pull the editor toward the first line and
fight the user's scroll position. Showing/dismissing the keyboard and changing
or leaving a Learn task could also jump the editor or reopen the keyboard.

### Root cause
Focus had several competing owners. The hidden `#mobileInput` lived at the top
of the scroll flow, multiple render paths scheduled delayed focus, and
`_preserveEditorScroll()` repeatedly rewrote `scrollTop` during the keyboard
animation. A global blur handler then refocused the hidden input even after an
edit session had ended. Learn could replace the program while a field/Q/BLK
editor or pending focus still referred to the old code. Keyboard visibility
also lacked hysteresis in changing viewport regimes.

### Attempts and fix
- The old mitigation used delayed focus plus scroll restores at 60, 200, 450
  and 700 ms. It did not stabilise the UI; it fought the browser's own keyboard
  scrolling and produced the visible oscillation.
- Web branch `debug/c1-mobile-focus` replaced those timers with one cancellable
  focus request using `preventScroll`, moved the hidden input to a fixed
  off-content position, cancelled focus when editing ends, and explicitly
  closed editor input before Learn replaces/restores code. Keyboard state got
  a baseline fallback and open/close hysteresis. Forced-mobile checks confirmed
  no delayed refocus; real-phone web testing then confirmed the behaviour.
- Android branch `debug/c1-android-focus` ported the shared fix, removed its
  blur-refocus loop, and kept the Capacitor-specific remembered
  `visualViewport` baseline while adding hysteresis. The debug APK built and
  the user verified the app on device before merge.

The related C3 insertion report remains open for an independent retest; fixing
the shared focus race removes its suspected trigger but does not prove C3 by
itself.

---

## Learn tab: dead near-black empty strip at the bottom (single-column layout)
**Repos:** web `tnc-sim` (v0.812) + android `tnc-sim-android` (1.0.16).
**Resolved:** 2026-07-13. **Verified:** headless (Playwright 390×844) + on device.

### Symptom
In the single-column (mobile / narrow) layout the **Learn** tab had a strip of
bare near-black page background at the bottom, between the last visible lesson
and the bottom tab bar — wasted space.

### Root cause
Unlike the Editor and 3D tabs, the Learn tab had **no full-height flex layout**.
It relied on default block flow plus an arbitrary cap
`body[data-mtab="learn"] #learnPanel .lp-body{max-height:calc(100svh - 220px)}`,
so `#learnPanel` ended at its content height and everything below it down to the
tab bar was body background (`--bg`).

### Fix
Gave the Learn tab the same full-height flex treatment as the 3D tab
(`body[data-mtab="learn"]{height:100svh;display:flex;flex-direction:column;
padding-bottom:calc(46px + safe-area)}`, `.sim-container`/`.sim-main` `flex:1`,
`#learnPanel` `flex:1`) and replaced the `max-height` cap with
`max-height:none;flex:1` so `.lp-body` fills to just above the tab bar. CSS-only,
`web/styles.css` (mirrored into `www/android/styles.css`). Verified headless:
measured gap panel→bar **71px → 0**.

---

## Mobile bottom tab bar behaviour with the on-screen keyboard (web)
**Repo:** web `tnc-sim`. **Outcome:** no code change shipped — the live behaviour
was already acceptable; an attempt to "improve" it regressed and was reverted.

### Context
`web/keyboard.js` hides `.mtab-bar` (`visibility:hidden`) while the keyboard is
open, detected by `offset = window.innerHeight - visualViewport.height > 140`.
On a real mobile browser the fixed `bottom:0` bar can briefly ride up as the
keyboard opens before the hide trips.

### Attempts (all reverted — v0.812–v0.814, restored to `main`)
- **Early-hide on `focusin`** to kill the open-animation rise, keeping the
  viewport check for re-show → the bar could stay hidden after dismiss, because
  dismissing the keyboard often keeps the field focused (no `focusout`).
- **Drop-focusHold-on-`offset>140`** to fix that → on the tester's browser the
  layout viewport itself shrinks (`offset ≈ 0`), so the fix didn't engage and
  the bar sat above the keyboard.
- **`translateY(offset)` counter-lift / baseline-height counter-lift** to keep
  the bar pinned/static → different browser regimes lift the bar differently;
  still ended up above the keyboard or jumping.

### Resolution
Reverted `web/keyboard.js` to the `main` version. The live site's behaviour was
fine; the "fix" was worse. Lesson: this is real-device/real-browser-timing
territory and shouldn't be changed blind — see the android `BUG_HISTORY.md` for
the parallel (and far longer) native saga and NOTES rule #11.
