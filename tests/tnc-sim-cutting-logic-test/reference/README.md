# Independent cutting-logic oracle

This directory builds an offline expected result for `test.h` without treating TNC Sim output as truth.

## Source of truth

- HEIDENHAIN TNC 640 Klartext Programming User's Manual, document `892903-2C`, edition 10/2023.
- HEIDENHAIN TNC 640 Programming of Machining Cycles User's Manual, document `1303406-23`, edition 10/2023.
- The exact local PDF hashes and relevant pages are locked in `oracle-spec.json`.
- `test.h` and `test.tnt` define the programmed inputs, not the expected output.

The oracle implements only documented geometry needed by the witnesses: RL/RR path compensation, physical versus programmed DR, programmed DL, flat/ball/conical/drill profiles, cycle dimensions and feed formulas. It also runs isolated semantic checks for Cycle 208 Q370 path overlap and Cycle 209 Q336 range rejection, because these behaviors cannot be proven from the final outer voxel alone. Every measured result has a stated voxel tolerance based on the actual generated grid cell size.

## Run

1. Fetch `origin/main` in the web and Android repositories.
2. Keep both working trees clean. They may remain locally behind; the script reads the accepted files directly from `origin/main`.
3. From the package root run `node reference/build-reference.js`.
4. Read `generated/report.md`.

The script verifies the PDF hashes, program and Tool Table hashes, repository state, parser validation and both voxel results. It exits with failure when either platform differs. `generated/approved-reference.json` is created only on a complete PASS and is removed before every new comparison, so a previous approval cannot survive a failed run.

## Generated evidence

- `oracle.json`: independently calculated expectation.
- `observed-web.json`: measured GitHub web result with commit and source hashes.
- `observed-android.json`: measured GitHub Android result with commit and source hashes.
- `comparison.json`: machine-readable PASS/FAIL per witness.
- `report.md`: concise human-readable comparison.
- `approved-reference.json`: present only after a complete two-platform PASS.

Do not edit the oracle to copy current simulator output. Change it only when a cited manual rule, the test input, or a demonstrable oracle defect requires the change.

## GitHub Actions

The web repository contains `.github/workflows/cutting-logic-test.yml`. Open **Actions**, select **Cutting Logic Reference Test**, and choose **Run workflow**. An AI assistant with authenticated GitHub CLI access can trigger the same run with:

```text
gh workflow run cutting-logic-test.yml --repo slavomrkva/tnc-sim --ref main
```

The workflow checks out current `main` from both the web and Android repositories, runs the comparison, writes the Markdown report to the GitHub job summary, and uploads the complete `reference/generated` directory as an artifact. A mismatch makes the GitHub check fail while still preserving all evidence.

The official PDF manuals remain offline. Local runs use the default `verify-files` mode and verify their actual SHA-256 hashes. GitHub explicitly uses `TNC_SIM_DOCS_MODE=locked-spec`, which accepts only the checked-in page citations, rules and expected PDF hashes from `oracle-spec.json`; it never silently falls back when local manuals are missing.
