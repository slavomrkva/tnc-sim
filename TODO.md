# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** a newly discovered bug goes HERE,
> and every fix attempt for it is logged here as it happens (what was tried,
> what the result was). When it's finally fixed, the whole entry is **removed
> from this file and moved to `BUG_HISTORY.md`** (with root cause + all the
> attempts). Open bugs live here; resolved bugs live in `BUG_HISTORY.md`.

## Open bugs

## C18 — Desktop F menu closes before a feed option can be chosen; called LBL is blank
**Reported:** 2026-07-16. **Repro:** current GitHub main v0.864, web desktop.
### Symptom
In field editing of an `L` block, the F menu closes when the mouse button is
released instead of waiting for FMAX, FAUTO, Q or Skip to be chosen. During an
expanded `CALL LBL`, the 3D status panel displays `LBL —`.
### Attempts
- Attempt 1 — traced the F behavior to the compact native selector added for
  mobile layout, and reproduced the LBL status loss with a VM parser harness.
- Attempt 2 — web v0.865 keeps the native selector on mobile and uses a
  persistent desktop menu; `CALL LBL` now resolves its explicit target for the
  status panel. Added focused regressions.
### Status
Web v0.865 is ready for user verification. Do not port to Android or merge
until the web preview is accepted.

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
