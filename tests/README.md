# Web regression coverage

GitHub Actions runs every top-level `*.test.js` and `*.test.mjs` in this folder
on pushes and pull requests to `main`. Any failing assertion fails the job.
No npm installation is required.

- `audit-state-geometry.test.js`: real tool invalidation/preparation/Run;
  queued Refine results after Reset, preparation, Run, Step or replacement;
  valid worker/fallback completion; independent geometric samples of the
  displayed flat core and rounded corner, including DR2, using vendored Three.js.
- `demo-playback-material.test.js`: reads the actual shipped demo catalogue and
  default tools; executes parser → advance → commitSeg → real voxel cutting and
  collision detection for every demo. Requires completion, finite/continuous
  segments, no collisions and actual removal. Compares live material byte-for-byte
  with the real Refine worker at identical resolution.
- `complete-part-collision.test.js`: full Complete Part plus unsafe rapid/feed
  and drill-body contact cases, so suppressing warnings cannot satisfy coverage.

The integration harness stubs rendering, UI and ATC animation only. Never mock
cutting or collision detection in a test intended to validate their geometry.
Material parity is a consistency check, not proof of machining accuracy: retain
independent analytical geometry tests as well.

These tests do not replace browser/WebGL, responsive layout, service-worker or
visual acceptance testing. For a future bug, reproduce the user workflow with
the relevant real modules, assert the correct outcome before fixing it, and
include an opposing case where feasible (safe retract versus real stock contact).
