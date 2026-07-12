# TNC Sim

Read `NOTES.md` in this repo root before making any change — it has the
architecture map, non-obvious rules, and deploy flow.

**Every push must bump `APP_VERSION` in `index.html` — no exceptions.** Web
stays in the `0.80x` series (see NOTES.md "Versioning"). After making a
change, also update `NOTES.md`: add a line to its Changelog, and add a new
numbered rule under "NON-OBVIOUS RULES" if you hit a non-obvious pitfall. If
the change is user-visible or important, also add a short line to
`RELEASE_NOTES.md`.
