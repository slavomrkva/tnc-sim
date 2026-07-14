# TODO / known open items

> **Bug lifecycle (see NOTES.md rule #11):** a newly discovered bug goes HERE,
> and every fix attempt for it is logged here as it happens (what was tried,
> what the result was). When it's finally fixed, the whole entry is **removed
> from this file and moved to `BUG_HISTORY.md`** (with root cause + all the
> attempts). Open bugs live here; resolved bugs live in `BUG_HISTORY.md`.

## Open bugs

## 3D stock updates stutter during machining
**Reported:** 2026-07-13. **Repro:** Run a program that repeatedly cuts the
default 100×100×20 stock in a browser; visible pauses also occur at Default
quality despite the moderate viewport resolution. The same architecture exists
in Android, but this first test fix is intentionally web-only.

### Symptom
The tool animation stalls when the voxel workpiece is refreshed, especially on
longer cuts or High quality.

### Attempts
- Attempt 1 — profile the stock pipeline against an otherwise identical
  toolpath-only run: pauses above 50 ms appeared with stock but not without it.
  Root cause was `vxRebuildMesh()` scanning the entire voxel grid, allocating a
  complete new mesh and uploading it after every changed segment.
- Attempt 2 — v0.830 web test branch: split Marching Cubes into 32×32-cell XY
  chunks, mark touched chunks with a one-cell dependency halo, and replace only
  their geometries. Removed per-cell temporary corner/edge arrays and the
  redundant normal recomputation. A regression test proved that 20,844
  generated triangles, normals and colors exactly match a full rebuild; a Node
  microbenchmark measured a local Default-grid scan about 11× faster.

### Status
Automated geometry and parser regressions pass. Awaiting verification through
the published web test link on a real browser/device before moving this entry to
`BUG_HISTORY.md` or porting the shared-core change to Android.

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
