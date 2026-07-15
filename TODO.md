# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** a newly discovered bug goes HERE,
> and every fix attempt for it is logged here as it happens (what was tried,
> what the result was). When it's finally fixed, the whole entry is **removed
> from this file and moved to `BUG_HISTORY.md`** (with root cause + all the
> attempts). Open bugs live here; resolved bugs live in `BUG_HISTORY.md`.

## Open bugs

No open web bugs after user verification of v0.847 on 2026-07-15. New reports
go below this line and follow the template.

## Learn audit fixes — awaiting web preview verification
**Reported:** 2026-07-15. **Scope:** Learn grading, lesson text, diagrams and accessibility.
### Symptom
Some tasks could pass from starter code, comments or movements made by an older
cycle. Several requested Q parameters were not checked, two negative depths
accepted positive signs, and parts of the Learn UI/diagrams were difficult to
read or operate with a keyboard.
### Attempts
- Attempt 1 — replaced raw-source grading with executable-code, scoped-cycle
  and ordered-sequence checks; result: all 46 official solutions pass, all
  starters fail, and comment-only/wrong-sign regressions are rejected.
- Attempt 2 — improved control semantics, contrast, diagram labels and
  machining wording; result: local SVG render inspection and regression suite
  pass, pending user verification in the web preview.
- Attempt 3 — replaced the unclear Lesson 7 compensation thumbnail and tiny
  Lesson 11 helix with dedicated enlarged diagrams; result: local SVG renders
  now separate programmed contour/tool-centre offset and helix/finishing rings.
- Attempt 4 — audited all Learn slide images, redesigned the remaining generic
  or crowded diagrams, and added four missing visual explanations; result: all
  25 slide images render clearly in local dark- and light-theme contact sheets.
- Attempt 5 — corrected the inverted Lesson 14 countersink and moved five
  labels away from intersecting geometry; result: the reported Lessons 7, 9,
  11, 13 and 14 render without lines crossing their text in both themes.
- Attempt 6 — rebuilt Lesson 14.2 with true 90° countersink geometry and visible
  45° finished hole edges, then isolated the remaining 13.1 and 14.1 labels;
  result: the reported geometry and text collisions are absent in both themes.
### Status
Implemented through v0.853; keep open until the web preview is accepted, then move
this evidence to `BUG_HISTORY.md`.

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
