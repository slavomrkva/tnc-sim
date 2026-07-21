# TNC Sim cutting-logic acceptance test

This standalone package is a practical regression test for debugging or updating TNC Sim. The main result is one deliberately segmented voxel workpiece. Every cutting feature has its own physical zone, so a wrong result points back to a small part of the cutting logic.

It is not a certificate for a real machine. The reference behavior comes from the offline HEIDENHAIN TNC 640 manuals for NC software 34059x-18, edition 10/2023, plus the explicitly documented limits of TNC Sim.

## Package contents

| File | Purpose |
|---|---|
| `test.h` | Main long-form Klartext program. All valid cutting witnesses are physically separated. |
| `test.tnt` | Reference Tool Table with decimal values. Import this before `test.h`. |
| `expected-layout.svg` | Top-view map showing which source feature owns every workpiece zone. |
| `expected-voxel.json` | Executable zone coordinates, allowed cutting ownership, formulas and measurement rules. |
| `test-crud.h` | Witness cut for adding, editing and deleting T90. |
| `invalid-countersink-angle.tnt` | Import must fail transactionally because T-ANGLE is below the supported limit. |
| `invalid-ball-r2-gt-r.tnt` | Import must fail transactionally because R2 is larger than R. |

## Official references

- `892903-2C.pdf`, *TNC 640 Klartext Programming User's Manual*, 10/2023:
  - feed inputs `FMAX`, `FAUTO` and numeric `F`: page 101;
  - tool radius compensation: pages 139-143;
  - straight line `L`: page 161;
  - Cartesian contour functions, including `C`, `CC` and `CR`: pages 160-169;
  - Q parameters: pages 275-291.
- `1303406-23.pdf`, *Programming of Machining Cycles*, 10/2023:
  - Cycle 200: pages 78-81;
  - Cycle 201: pages 82-83;
  - Cycle 208: pages 106-110;
  - Cycle 209: pages 139-142.

## Fixed test setup

1. Use the accepted GitHub `main` version of the product being checked.
2. Clear the current program, Tool Table and simulation state.
3. Select **High** live quality.
4. Import `test.tnt`.
5. Import `test.h` and confirm that Problems contains no error.
6. Run the complete program without changing the Tool Table.
7. After the run finishes, use **Refine** and record the resulting voxel cell size.
8. Compare the result with `expected-layout.svg` and the checks below.

The blank is `160 x 120 x 20 mm`, from `X-80 Y-60 Z0` to `X+80 Y+60 Z+20`. Measurement tolerance is one actual Refine voxel cell in each measured direction. If Refine is unavailable on a device, record the live cell size and mark that result separately; never compare it as if it had Refine resolution. Never use a hard-coded sub-voxel tolerance.

## Workpiece zones

### M - flat mill: `RL`, `RR`, `R0`, `DL`, `DR`

The two upper witnesses use T1. The programmed contour travels in `+X`.

- `M-RL`, left side: the cutting band must lie on the left side of the nominal direction, therefore at higher Y.
- `M-RR`, right side: the cutting band must lie at lower Y.
- Effective path-compensation radius is `R 3.250 + table DR 0.250 + TOOL CALL DR 0.500 = 4.000 mm`.
- Physical flat-mill radius is `R 3.250 + table DR 0.250 = 3.500 mm`; the visible straight band is therefore `7.000 mm` wide within one voxel cell.
- Programmed `DL+0.750` shifts the cut in Z. Table DL is measured tool compensation and must not independently alter the workpiece.
- The final `R0` block is a pure Z retract. There must be no diagonal scar from the compensated band to the nominal XY coordinate.

Any mirrored band points to reversed `RL/RR`. A band displaced by the wrong amount points to path `DR`. Wrong width points to physical table `DR`. A diagonal scar points to faulty `R0` cancellation.

### A - circular arcs: `C` with `CC`, and `CR`

Two T1 witnesses occupy the free central band between the two M witnesses.

- `A-C-RL`: a tangent `+X` lead-in engages `RL`, then a full clockwise circle
  around `CC X-17 Y+38` with programmed radius `7.000` runs as two 180-degree
  `C` blocks, and a tangent lead-out exits. A compensated single-block full
  circle is deliberately not used: the current parser collapses it to
  zero-length segments, so the two-block form is the supported witness shape.
  The compensated tool-center circle is `7.000 + 4.000 = 11.000 mm`; the
  witness is measured at the south point `X-17 Y+27`, where the annular band
  must be `7.000 mm` wide with a flat floor.
- `A-CR`: an uncompensated minor arc from `X+14 Y+40` to `X+28 Y+40` with
  `R+Q11` (`Q11 = +7.250`) and `DR+` bulges south. The Q-resolved radius and
  the `R+` minor-arc selection place its south extreme at `Y+34.637`; the band
  must be `7.000 mm` wide there. The arc block carries no `F`, so it must
  inherit the modal `275.500` feed from the plunge block.

A missing or displaced annulus points to arc interpolation or arc radius
compensation. A wrong `A-CR` extreme points to `CR` center selection (`R`
sign against `DR`) or Q resolution inside a movement block.

### B - ball mills with non-zero `R2`

T2, T3 and T4 are full-ball mills where `R2 = R`: `1.250`, `2.500` and `4.750 mm`. Each tool makes one `RL` and one `RR` witness.

- Every groove bottom must be round, never flat.
- The three cross-sections must visibly scale with their programmed radius.
- `TOOL CALL DR` moves the compensated path but must not inflate the physical ball.
- Decimal `DL` changes the Z position by the programmed amount.
- The pure-Z `R0` retract must not create a diagonal cut.

A flat bottom points to lost `R2`. The wrong groove width or curvature points to mixing physical `R/R2/DR2` with programmed path allowance `DR`.

### C - countersinks

T5, T6 and T7 cover included angles `10`, `90` and `170 degrees`, decimal `LCUTS`, programmed decimal `DL/DR`, and both `RL` and `RR`. T5 deliberately uses `LCUTS=20.500`, because a 10-degree countersink needs a long cutting edge for its shallow cone to remain visibly measurable.

For visibility, every countersink uses `DR+0.500`. Its matching Z allowance is `DL = -DR / tan(T-ANGLE/2)`: `-5.715`, `-0.500` and `-0.044 mm`. The resulting separation between equivalent `RL` and `RR` center paths is approximately `1.002 mm`, large enough to inspect on the Refine result.

- Each witness must be conical in cross-section.
- The 10-degree tool is narrow and requires Refine quality.
- The 90-degree tool must show an approximately 45-degree side in section.
- The 170-degree tool must be broad and shallow.
- `DR` offsets the path; it must not be used as an extra cone radius.
- `DL` shifts the programmed cutting depth.

Mirrored witnesses indicate wrong `RL/RR`. A cone that becomes wider merely because `TOOL CALL DR` is present indicates that programmed path allowance was incorrectly applied to physical tool geometry.

### D - cycles and feed modes

Five isolated holes lie on `Y-45`:

| X | Witness | Required behavior |
|---:|---|---|
| -60 | Cycle 200, center drill | `FAUTO`, pecking, decimal dwell and Q parameters. |
| -30 | Cycle 200, drill | Numeric `Q206`, `Q395=1`, decimal depth and peck. |
| 0 | Cycle 201 | `FAUTO` downfeed and explicit numeric retraction feed. |
| +30 | Cycle 208 | Bore milling with decimal Q parameters, `Q370=0.500` path overlap and a centered final retract. |
| +60 | Cycle 209 | Pitch-synchronized feed, chip breaking, `Q336` orientation and retract factor. |

All five features must be centered at the coordinates above. Cycle 208 must finish at its bore center before retracting. A missing hole means that the Q value or cycle call was lost. A wrong depth points to Q resolution, `DL`, surface coordinate or cycle-depth handling.

The automated reference also runs isolated semantic variants that cannot be identified from the final outer voxel alone: `Q370=0.500` must create more radial paths than `Q370=1.500`; invalid Cycle 208 values `-0.100`, `0.050` and `1999.100` must be rejected; and negative Cycle 209 `Q336` must be rejected because the documented range is `0...360` degrees.

## Feed verification

The final voxel shape cannot distinguish two different feed rates when both follow the same path. Feed is therefore checked during the same real-simulator run, but not inferred from the finished workpiece:

1. Step through one `L ... FMAX` block: it must be marked rapid and must not make `FMAX` modal for the following block.
2. Step through one `L ... FAUTO` block: it must use the active `TOOL CALL F` value.
3. Step through the `L X-45.000 F+Q7` block: the Q-resolved feed must report exactly `333.300`.
4. Step through the zone A `C` blocks: they carry no `F` and must inherit the active `FAUTO` Tool Call feed `420.500`; the `CR` block must inherit the modal `275.500` from its plunge block.
5. Cycle 200 at `X-60` and Cycle 201 at `X0` must use their active `TOOL CALL F` for `Q206 FAUTO`.
6. Cycle 200 at `X-30` must use `Q206=222.200`.
7. Cycle 201 must retract at `Q208=111.100`, not at FMAX.
8. Cycle 209 cutting feed must equal `abs(Q239) x spindle RPM = 1.250 x 400 = 500.000 mm/min`; Q403 affects synchronized retraction.
9. Cycle-internal positioning and the final move to the second clearance must retain their documented FMAX/feed classification.

Record any feed failure separately from voxel geometry, because it has no unique final-shape signature.

## Program and Tool Table import/export round trip

1. After the first accepted run, export the program and Tool Table.
2. Save the first voxel result or record every measurement listed in `expected-voxel.json`.
3. Clear the program, Tool Table and simulation.
4. Import both exported files.
5. Confirm all decimal fields survived: `R`, `R2`, `DL`, `DR`, `DR2`, `LCUTS`, `T-ANGLE`, `PITCH`, feeds and Q values.
6. Run at the same High live quality and apply Refine after completion.
7. The second workpiece must match the first within one voxel cell, and all feed observations must match.

Line endings or exported block numbers may differ. Program meaning, tool values, path and voxel result may not.

## Tool Table add, edit and delete

1. Import `test.tnt`.
2. Add T90 exactly as follows: `TYPE=MILL`, `NAME=CRUD_WITNESS`, `L=80.500`, `R=1.750`, `R2=0`, `DL=0`, `DR=0`, `DR2=0`, `CUT=2`, `RCUTS=2`, `LCUTS=20.000`, `ANGLE=0`, `T-ANGLE=0`, `PITCH=0`.
3. Import and run `test-crud.h`. The witness groove must exist and its physical width must be `3.500 mm`, within one voxel cell.
4. Edit table `DR` from `0.000` to `0.250` and rerun from a reset blank. The physical width must become `4.000 mm`, an increase of `0.500 mm` in diameter.
5. Edit T90 back to `DR=0`, then renumber it to T91. The unchanged program must report that T90 is missing; it must not cut with a fallback tool.
6. Restore T90, delete it, and validate again. The same explicit missing-tool error is required.
7. Re-import the saved valid table and confirm that the original state and original witness return.

## Transactional invalid Tool Table imports

With the valid table already loaded, import each invalid `.tnt` separately:

- `invalid-countersink-angle.tnt` must be rejected without changing the current table.
- `invalid-ball-r2-gt-r.tnt` must be rejected without changing the current table.

After each rejection, rerun either `test.h` or `test-crud.h`. An unchanged result proves that a failed import did not partially replace tool data.

## Independent offline reference

The `reference` directory prevents the current simulator from becoming its own source of truth:

1. `oracle-spec.json` states the documented compensation and tool-geometry rules, locks the approved test-input hashes after canonical LF line-ending normalization and cites exact pages and SHA-256 hashes of the two local HEIDENHAIN manuals.
2. `oracle-spec.json` contains independently reviewed witness constants; `build-reference.js` derives their expected widths and profiles without using simulator output. The locked hashes ensure those constants cannot silently drift away from `test.h`, `test.tnt` or `expected-voxel.json`.
3. It reads the real web and Android parser/voxel sources from an explicit Git ref (`origin/main` by default and in CI; an explicit `HEAD` ref is supported for a checked-out commit) or an opted-in local worktree, and measures both resulting workpieces on the same 500-cell grid.
4. It rejects every removed voxel outside the allowed zones in `expected-voxel.json` and every non-matching tool attribution inside them.
   It also runs the shared tool-table validation directly: every `test.tnt`
   entry must be accepted with zero errors, and both invalid `.tnt` files must
   be rejected, so the transactional-import contract is machine-checked on
   every reference run, not only during the manual walkthrough.
5. Results are written to the untracked `reference/generated` directory. `approved-reference.json` exists only if every check passes on both platforms. Any failed run removes a stale approval file.

Before running, update the remote references with `git fetch origin --prune` in both repositories. Then run `node reference/build-reference.js` from this package. A non-zero exit code means that no reference is approved; inspect `reference/generated/report.md` and `comparison.json`.

On GitHub, use **Actions -> Cutting Logic Reference Test -> Run workflow**. The same workflow can be triggered by an authenticated AI assistant. GitHub checks out current `main` from both repositories, publishes the report in the job summary, and stores all generated evidence as a downloadable artifact. The official manuals stay offline; CI uses the locked citations, rules and PDF hashes from `oracle-spec.json`, while local runs continue to verify the actual PDF files.

The generated `oracle.json` is the independent expected result. `observed-web.json` and `observed-android.json` are measurements, never truth. The current product must not be used to rewrite an expectation merely to obtain PASS; a changed expectation requires a cited documentation or test-program reason.

## Acceptance record

For both web and Android record:

- Git commit and application version;
- device/browser and selected voxel quality;
- actual voxel cell size;
- PASS/FAIL for every zone ID in `expected-voxel.json`;
- measured widths/depths and screenshots of failed zones;
- feed observations from the Feed verification section;
- import/export result;
- T90 add/edit/renumber/delete result;
- any Problems diagnostics.

The package passes only when all geometrically relevant zones pass, all feed observations pass, both round trips reproduce the result, and web and Android agree within the same stated voxel-cell tolerance.
