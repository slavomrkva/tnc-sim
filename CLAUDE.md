# TNC Sim web

Static web/PWA app: `index.html` is the HTML shell and loads classic JS/CSS
modules from `core/` and `web/`; there is no build step.

## Start of every session

1. Read `CLAUDE.md`, `NOTES.md`, and `TODO.md`. Read `README.md` only for product
   orientation and `effort.md` only when preparing a coding-agent prompt.
2. For a bug, read only the relevant `BUG_HISTORY.md` entry. Cross-repo bugs
   must be tracked in both repositories.
3. For a user-visible change or deploy, read `RELEASE_NOTES.md` and the deploy
   flow in `NOTES.md`.
4. Read `docs/history/` only when a current document links to the relevant
   topic. Historical files are context, not current instructions.

## Non-negotiables

- Every push bumps `APP_VERSION` in `web/app.js` by `0.001`, adds a short entry
  to `docs/history/changelog.md`, and stays in the `0.80x` series. Update
  `NOTES.md` only when a current contract changes.
- `core/` is the reference for currently shared logic. Port a deliberate shared
  core change to Android's `www/core/`; do not overwrite either product wholesale.
- A user-visible change also gets a short `RELEASE_NOTES.md` entry. Add a new
  numbered NOTES rule only for a durable, non-obvious pitfall.

## Documentation budget

- `CLAUDE.md` routes the session; `NOTES.md` contains current contracts;
  `TODO.md` contains only open work; `BUG_HISTORY.md` preserves resolved bug
  evidence; `docs/history/changelog.md` is the append-only technical log.
- Do not copy historical detail back into root navigation files. Preserve it in
  `docs/history/` and leave one link from the current rule that still matters.
- Prefer tightening an existing rule over adding another. If a rule only
  describes a resolved incident, move the incident to history and keep only
  the invariant that prevents recurrence.

## graphify

Graphify is an optional local aid for large refactors and architecture reviews.
Generate or update it on demand, and use `query`/`path`/`explain` only when the
graph is useful for the current task. `graphify-out/` is generated local state
and must not be committed.
