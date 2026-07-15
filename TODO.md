# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** a newly discovered bug goes HERE,
> and every fix attempt for it is logged here as it happens (what was tried,
> what the result was). When it's finally fixed, the whole entry is **removed
> from this file and moved to `BUG_HISTORY.md`** (with root cause + all the
> attempts). Open bugs live here; resolved bugs live in `BUG_HISTORY.md`.

## Open bugs

## C12 — Light-theme 3D table grid is too dark
**Reported:** 2026-07-15. **Repro:** open the 3D simulation in the light theme.
### Symptom
The table grid below the workpiece uses near-black blue-grey lines and looks too
dark against the light scene.
### Attempts
- Attempt 1 — use neutral grey light-theme grid colors and update the existing
  GridHelper when the theme is toggled; dark-theme colors remain unchanged.
### Status
Implemented in the web v0.847 debug branch; awaiting user visual verification.

## C13 — Learn Hint does not scroll the desktop left panel fully down
**Reported:** 2026-07-15. **Repro:** on desktop, reveal a Hint in a practice task.
### Symptom
The previous `scrollIntoView({block:'nearest'})` attempt only makes the last hint
visible; it does not keep the complete left Learn panel at its bottom.
### Attempts
- Attempt 1 — after rendering a hint, set the desktop `.lp-body` scroll owner to
  its full `scrollHeight`; mobile/single-column behavior is explicitly untouched.
### Status
Implemented in the web v0.847 debug branch; awaiting user verification.

## C14 — Revealed hints leak into a newly opened lesson
**Reported:** 2026-07-15. **Repro:** reveal hints, return to the lesson list, then
open another lesson.
### Symptom
The other lesson can open with the previous task and its revealed hints still
shown.
### Attempts
- Attempt 1 — reset `task`, check results and hint level whenever a lesson card
  is newly opened. Existing task-to-task reset remains in place.
### Status
Implemented in the web v0.847 debug branch; awaiting user verification.

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
