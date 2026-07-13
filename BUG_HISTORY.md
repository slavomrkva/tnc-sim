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
