# TNC Sim web

Static web/PWA app: `index.html` is the HTML shell and loads classic JS/CSS
modules from `core/` and `web/`; there is no build step.

## Start of every session

1. Read every root Markdown file before analysing or editing.
2. For a bug, read `TODO.md` and the relevant `BUG_HISTORY.md` entry. Cross-repo
   bugs must be tracked in both repositories.
3. For a release/deploy, read `RELEASE_NOTES.md` and the Deploy flow in
   `NOTES.md`.
4. Read `docs/history/` only when a current root document links to the relevant
   topic.
5. When shortening documentation, move durable detail to `docs/history/` and
   leave a focused root link; do not discard project context.

## Non-negotiables

- Every push bumps `APP_VERSION` in `web/app.js` by `0.001`, updates `NOTES.md`,
  and stays in the `0.80x` series.
- `core/` is the reference for currently shared logic. Port a deliberate shared
  core change to Android's `www/core/`; do not overwrite either product wholesale.
- A user-visible change also gets a short `RELEASE_NOTES.md` entry. Add a new
  numbered NOTES rule only for a durable, non-obvious pitfall.
