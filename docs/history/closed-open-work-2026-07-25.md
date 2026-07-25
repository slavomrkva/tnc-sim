# Archived open-work snapshot — 2026-07-25

This is the former `TODO.md` preserved when the current GitHub `main` was
confirmed as the source of truth and the remaining open-work list was cleared.
The statuses below are a historical snapshot; archiving them does not claim
that every earlier manual or device-verification step was performed.

## Former TODO contents

> **Bug lifecycle (see NOTES.md rule #11):** a newly discovered bug goes HERE,
> and every fix attempt for it is logged here as it happens (what was tried,
> what the result was). When it's finally fixed, the whole entry is **removed
> from this file and moved to `BUG_HISTORY.md`** (with root cause + all the
> attempts). Open bugs live here; resolved bugs live in `BUG_HISTORY.md`.

## Open bugs

## C27 — Terminal 180-degree CHF departure was rejected as an inside corner
**Reported:** 2026-07-23. **Repro:** finish an RL contour with `CHF 3`,
`L IX+3.02`, then cancel on `L IY+10 R0` using a 10 mm end mill.
### Symptom
The earlier polyline compensation accepted the program reported as correct,
but the analytic engine reported that the tool radius was too large on the
final compensated line.
### Attempts
- Attempt 1 — traced the regression to the exact 180-degree CHF collapsing to
  one nominal point. The two adjacent line offsets are opposite and parallel,
  so the generic inside-corner intersection check cannot join them. The shared
  core now recognizes only this terminal degenerate-CHF departure before R0
  and leads from the current compensated endpoint to the final line's offset
  endpoint, matching the established path. Added the complete reported
  contour and endpoint regression in both repositories.
  The local TNC 640 manual documents CHF only between two machinable straight
  contour elements and does not explicitly define this degenerate 180-degree
  departure, so this remains a deliberately narrow compatibility exception.
### Status
Implemented in web v0.899 and Android APP_VERSION 1.0.88. Focused analytic
compensation tests pass in both repositories. Keep open until the corrected
web deployment and Android APK are accepted.

## C26 — Enter on a cycle can create a misnumbered row outside the program
**Reported:** 2026-07-23. **Repro:** place the caret on the first, middle or
last physical row of a multi-row `CYCL DEF` and press Enter. Also test Enter
with `END PGM` active and test desktop multi-line paste.
### Symptom
Numbering, selection, deletion and the different insertion paths used physical
textarea rows inconsistently. A new row could be positioned relative to a Q
continuation instead of the complete cycle or appear after `END PGM`.
### Attempts
- Attempt 1 — web v0.898 ports the Android logical-block rules through one
  shared model. A cycle and its directly following Q rows select/delete as one
  unit; Enter inserts or reuses one numbered empty block after it; Enter on
  `END PGM` is a no-op; all programming buttons use the same insertion planner.
  The web path additionally preserves IME composition and allows ordinary
  desktop multi-line paste/drop outside protected structural blocks.
### Status
All 26 web regression tests and JavaScript syntax checks pass. Keep open until
the v0.898 test deployment is accepted in desktop and narrow/mobile layouts.
Android APP_VERSION 1.0.87 implements the matching device behavior.

## C24 — Compensated single-block full circle collapses to zero-length segments
**Reported:** 2026-07-21. **Repro:** on current `main`, program `L ... RL` (or
`RR`), `CC`, then one `C` block whose end point equals the start point (full
circle) and parse it.
### Symptom
Validation and parsing report no problem, but the compensated contour engine
emits only zero-length segments at the arc start point, so the circle cuts
nothing. The same circle as two 180-degree `C` blocks compensates and cuts
correctly, and an uncompensated (`R0`) single-block full circle also works
(verified against the real parser: R0 gives 64 segments over the full extent,
RL/RR give 8 zero-length segments and zero diagnostics).
### Attempts
- Attempt 1 — found while adding arc witnesses to the cutting-logic acceptance
  package; the package documents the limitation and uses the two-block form
  for its compensated circle witness `A-C-RL`.
### Status
Open. Either compensate the single-block full circle or reject it with an
explicit validation error; the defect is the silent zero-cut. Shared core
parser — tracked in both repositories.

## C23 — Closing practice leaves the Lesson autosave status visible
**Reported:** 2026-07-21. **Repro:** open a lesson practice on the web preview,
tap its close button, and return to the editor without switching tabs.
### Symptom
The main program is restored, but the header still says that lesson changes
are not saved. Switching to Simulate and back finally changes it to Saved.
### Attempts
- Attempt 1 — traced the stale status to the practice close button calling the
  partial `learnExit()` path while `LEARN.open` remained true. Changed it to
  the complete `closeLearn()` path so Learn closes before autosave resumes, and
  added a regression that rejects the partial close handler.
- Attempt 2 — user testing accepted the immediate status restoration but found
  the 700 ms green/orange alternation distracting while typing. Web v0.893 now
  schedules one write within 30 seconds, uses a neutral pending state and
  reserves orange for a real storage error.
### Status
The close fix and calmer save cadence are implemented in web v0.893 and await
preview acceptance; the shared cadence is also being ported to Android.

## C22 — Cutting-logic reference failures in feeds and fixed cycles
**Reported:** 2026-07-19. **Repro:** run the offline cutting-logic reference and
the focused parser cycle regression against GitHub `main`.
### Symptom
Decimal `TOOL CALL F` values were truncated; `L ... FAUTO` retained the prior
modal numeric feed instead of using the active Tool Call feed; Cycle 208 ignored
documented `Q370`; and Cycle 209 accepted negative `Q336` although the documented
range is `0...360` degrees.
### Attempts
- Attempt 1 — traced all four failures to the shared parser and verified the
  applicable TNC 640 rules in the locked offline manuals.
- Attempt 2 — preserved decimal Tool Call feeds, implemented ordinary L-block
  FAUTO, added Cycle 208 Q370 parsing/range/stepover behavior, and restricted
  Cycle 209 Q336 to `0...360`. Added focused parser regressions and independent
  semantic checks to the long-form cutting-logic package.
- Attempt 3 — exposed the complete Cycle 208 parameter set, including Q370, in
  both insertion interfaces and added Q370 to every supplied Cycle 208 demo and
  applicable Learn program in web v0.890 and Android APP_VERSION 1.0.70.
### Status
Implemented in web v0.890 and ported to Android APP_VERSION 1.0.70. Automated
verification is in progress; keep open until both repository changes and a
real simulator/device run are accepted.

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
- Attempt 2 — installed the real public production Turnstile Site Key in both
  the web client and the independent Android client; neither private key is
  stored in Git.
### Status
Implemented through web v0.884. Automated verification passes; merge, encrypted
Worker-secret setup, one live website report and one Android device report are
still pending.

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
