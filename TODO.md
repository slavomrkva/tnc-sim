# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** a newly discovered bug goes HERE,
> and every fix attempt for it is logged here as it happens (what was tried,
> what the result was). When it's finally fixed, the whole entry is **removed
> from this file and moved to `BUG_HISTORY.md`** (with root cause + all the
> attempts). Open bugs live here; resolved bugs live in `BUG_HISTORY.md`.

## Open bugs

## C21 — One-click reports have no endpoint on the Static Assets Worker
**Reported:** 2026-07-19. **Repro:** deploy web v0.882 through the current
Cloudflare Workers project and post to `https://tncsim.org/api/report`.
### Symptom
The repository contains a Pages Function at `functions/api/report.js`, but the
production resource is a Worker with only static assets. `/api/report` is not
executed, and Worker secrets cannot be attached to the missing script.
### Attempts
- Attempt 1 — replaced the Pages-only function with a Worker entrypoint and an
  assets binding. `run_worker_first` is scoped to `/api/*`; ordinary requests
  stay on the static-assets path. Removed the committed always-pass Turnstile
  Site Key, added origin/hostname validation and focused Worker tests, and
  documented the two-stage deploy then encrypted-secret setup.
### Status
Implemented in web v0.883. Automated and preview-deployment verification are
pending, followed by one live website report and one Android device report.

## C20 — DE → EN leaves the Complete Part starter program in German
**Reported:** 2026-07-18. **Repro:** start with Complete Part, switch the UI to
German, then switch it back to English.
### Symptom
The UI returns to English but the editor still shows the German-comment version
of the Complete Part starter program.
### Attempts
- Attempt 1 — identified browser form-state restoration across the language
  reload: startup read the restored German `textarea.value` as its English
  default. The fix uses the markup's English `defaultValue` and replaces only
  the exact German starter value; a custom restored program remains untouched.
  Added a focused DE → EN regression and repaired the CRLF-sensitive existing
  i18n CYCLES test so the full localization suite runs on Windows.
### Status
Implemented in web v0.879; automated verification is pending, followed by a
browser retest and user acceptance before moving this evidence to BUG_HISTORY.md.

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
