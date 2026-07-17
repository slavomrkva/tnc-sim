# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** a newly discovered bug goes HERE,
> and every fix attempt for it is logged here as it happens (what was tried,
> what the result was). When it's finally fixed, the whole entry is **removed
> from this file and moved to `BUG_HISTORY.md`** (with root cause + all the
> attempts). Open bugs live here; resolved bugs live in `BUG_HISTORY.md`.

## Open bugs

## C19 — Mobile numeric sign toggle in guided editors
**Reported:** 2026-07-17. **Repro:** on a phone, enter a number in BLK FORM or a guided L/C/CC/CR field, then press the mobile keyboard's `-` key.
### Symptom
The sign was appended after the value in BLK FORM, and pressing `-` again on an already negative guided value did not restore the positive value. CR radius also lacked the signed mobile entry needed to select its major/minor arc.
### Attempts
- Attempt 1 — added one shared sign helper, intercepted mobile `beforeinput` with a trailing-sign fallback, and routed BLK FORM, cycle Q editing, guided L/C/CC/CR fields, and CR radius through it. Added a Node regression test; syntax checks and the existing field-editor regression pass.
### Status
Ready for mobile-web verification on the local test branch. Do not port to Android until the web behaviour is accepted.

## C17 — Tool Table CRUD, parameters and import/export audit
**Reported:** 2026-07-16. **Repro:** current GitHub main v0.861, shared with
Android APP_VERSION 1.0.43.
### Symptom
Renumbering could create duplicate T entries; `ANGLE=0` changed to 3 on edit;
import accepted invalid and duplicate tools and rendered imported text as HTML.
Import/delete could leave parsed geometry stale. TL/RT/TIME2 claims were not
enforced, and several numeric fields lacked complete validation.
### Attempts
- Attempt 1 — reproduced the defects with a VM-based harness against the real
  module and mapped every parameter consumer in the parser and voxel paths.
- Attempt 2 — prepared web v0.862 with shared validation, transactional import,
  escaped output, duplicate protection, consistent reset/rebuild behavior,
  locked-tool replacement and current-run TIME2 semantics.
- Attempt 3 — added Tool Table and parser regressions; all web Node tests and
  JavaScript syntax checks pass.
### Status
Web v0.862 is ready for user verification. Keep this entry open until accepted;
then move the evidence to `BUG_HISTORY.md` before merging and porting to Android.

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
