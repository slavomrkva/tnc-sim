# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** a newly discovered bug goes HERE,
> and every fix attempt for it is logged here as it happens (what was tried,
> what the result was). When it's finally fixed, the whole entry is **removed
> from this file and moved to `BUG_HISTORY.md`** (with root cause + all the
> attempts). Open bugs live here; resolved bugs live in `BUG_HISTORY.md`.

## Open bugs

## C10 — Cycle 209 Q256=0 not treated as full retract to surface
**Repos:** web `tnc-sim` (fix v0.835) + Android `tnc-sim-android` (not yet ported).
**Reported:** 2026-07-14. **Repro:** Run tapping Cycle 209 with chip breaking
(`Q257`>0) and `Q256=+0`, all Q params on one `CYCL DEF 209` line.

### Symptom
`Q256=0` should make the tool fully retract out of the hole to set-up clearance
between chip-break steps, then re-enter and continue. Instead the tool behaved as
if chip breaking were effectively disabled — it stayed in the hole doing a small
in-hole retract rather than coming out to the surface.

### Root cause
`parseProgram`'s single-line `CYCL DEF 209` parse (`core/parser-engine.js`) read
its defaults with `+(qm[256]||0.2)`. An explicit `Q256=0` is falsy, so `||`
dropped it and substituted the default `0.2`, so the engine never saw 0. The
`executeCycle` branch `chipFullRetract = (cy.Q256===0)` was correct; it just
never received 0. The same `||` pattern also broke `Q257=0` (single pass → 5).
This is exactly the failure NOTES rule #2 warns about; Cycle 200 already uses the
safe `!==undefined` pattern, Cycle 209 did not.

### Attempts
- Web v0.835 converted all Cycle 209 defaults to the `Q!==undefined?Q:default`
  pattern (matching Cycle 200). `Q256=0` now reaches the engine as 0 → full
  retract to `safeZ` and re-tap; `Q257=0` → single pass. The multi-line
  conversational form already stored an explicit 0 correctly via the per-line
  Q-assignment path; only the single-line inline form was affected.

### Status
Fix pushed on `claude/debug-effort-estimation-ivbkid` (web only). Awaiting visual
web verification before merge and the deliberate Android port.

## C9 — Short drilling/tapping retracts appear to teleport
**Repos:** web `tnc-sim` + Android `tnc-sim-android`.
**Reported:** 2026-07-14. **Repro:** Run drilling Cycle 200 with multiple
Q202 plunges or tapping Cycle 209 with Q257 chip breaking and watch the tool
reverse in Z.

### Symptom
The tool appears instantly at the retraction height instead of visibly moving
there. Cycle 200 should retract at FMAX. Cycle 209 must retract at synchronized
thread feed (pitch × spindle speed), not FMAX, but that motion must still be
visible.

### Attempts
- Web v0.833 parser inspection proved that the retract segments existed and had
  the correct motion types. At the default visual gain, a short FMAX retract can
  finish in less than one display frame, so `advance()` committed it without an
  intermediate tool position.
- Web branch `agent/fix-cycle-feed-retract-motion` marks only cycle-internal
  retract/return segments and holds any marked sub-frame move at its midpoint
  for one render. Ordinary rapid moves and short arc segments are unchanged.
  Regression coverage confirms Cycle 200 remains FMAX and Cycle 209 remains at
  synchronized feed.

### Status
Automated web tests pass. Awaiting visual web verification before merge and the
deliberate Android port.

## C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed
**Repos:** web `tnc-sim` + Android `tnc-sim-android`.
**Reported:** 2026-07-14. **Repro:** Run the Complete Part demo's first Cycle
208 after changing Q334 from 0 to 2 mm.

### Symptom
The shipped demo used Q334=0, which plunged to full depth in one revolution.
After setting Q334=2, the initial helical cut still ran too quickly instead of
using TOOL CALL F3500, and the final revolution could take a larger Z step.

### Attempts
- Instrumenting the current demo proved that `Q206 FAUTO` produced F2000:
  `lastDefinedFeed` was first set by TOOL CALL F3500 and then overwritten by the
  preceding contour's modal `L ... F2000` block.
- Web v0.833 separates the current TOOL CALL feed from ordinary modal feed and
  uses the former for cycle FAUTO. Cycle 208 now calculates revolutions over the
  full safeZ-to-depthZ distance, including Q200, so every revolution respects
  Q334. The Complete Part demo now uses Q334=2.

### Status
Automated web regression verifies F3500, a semicircular entry followed by one
11-revolution constant-radius solid-stock helix from Z22 to Z0, and at most 2 mm per revolution. Awaiting visual web verification
before merge and the deliberate Android port.

<!-- Template for a new bug (copy below "Open bugs"):

## <short title> — <one-line symptom>
**Reported:** <date>. **Repro:** <steps / device / browser / only-on-device?>
### Symptom
<verbatim if possible>
### Attempts
- Attempt 1 — <what / hypothesis>: <result>.
- Attempt 2 — …
### Status
<current best understanding / next thing to try>
-->
