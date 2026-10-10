# Bug reports and suggestions — no tokens required

Both apps prepare reports locally. No GitHub token, Turnstile widget, or
reporting endpoint is required for the in-app dialog.

- **Open GitHub issue** opens a prefilled issue in the relevant app repository.
  The visitor logs in to GitHub, reviews the draft, and submits it publicly.
- **Open email** opens a draft to `info@tncsim.org` using the visitor's configured
  email application. No GitHub account is required. The visitor sends it manually.
- **Download report** exports the complete report as `tnc-sim-report.txt`.
  On Android this uses the native Filesystem/Share plugins.

Bug reports include the current NC program and diagnostics; suggestions omit
the program. The dialog explains the privacy differences before either action.
Links have length limits. If the draft is shortened, a visible message tells the
visitor to download the full report and attach it manually before sending.
Nothing is claimed to be sent merely because a draft was opened.

## Verification

Run `node tests/bug-report-close.test.js` in each repository. Check that both
buttons require a description, special characters survive URL encoding, GitHub
uses the appropriate repository, and long reports retain a complete download.
On a real Android device, verify external GitHub navigation, the mail handler,
and saving/sharing the report. Email requires a configured email app.

## Legacy endpoint

`worker/report-worker.mjs` remains available for older published clients that
still call `/api/report`; those clients still require its server-side GitHub and
Turnstile secrets. Do not remove production secrets until old client support is
no longer needed. New clients do not call that endpoint or load Turnstile.
