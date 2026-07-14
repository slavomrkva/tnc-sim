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
