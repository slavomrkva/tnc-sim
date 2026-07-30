# TNC Sim web — current project contract

This is the concise, current operating map. Historical detail through v0.845
is preserved in
[`docs/history/project-notes-through-v0.845.md`](docs/history/project-notes-through-v0.845.md),
and the continuing technical log lives in
[`docs/history/changelog.md`](docs/history/changelog.md). Do not copy those
histories back here.

## Product and source layout

TNC Sim is a static browser/PWA Heidenhain Klartext simulator hosted at
tncsim.org. `index.html` is the shell; classic scripts and CSS load directly
from `core/` and `web/` with no framework, bundler, imports, or build step.

- `core/` contains currently shared parser, simulation, editor, tool-table,
  Learn, and mobile-tab logic. It is the reference when deliberately porting a
  shared change to Android's `www/core/`.
- `web/` contains browser-specific layout, keyboard, panels, styles, and boot
  code. `web/app.js` owns `APP_VERSION` and order-sensitive startup IIFEs.
- `vendor/` contains Three.js r128 and OrbitControls for offline use.
- `service-worker.js` is web-only. Never copy it into the Capacitor app.
- The Android repository is independent; nothing synchronizes automatically.

Detailed module-split history is in the archived project notes linked above.

## Versioning and deploy

- `APP_VERSION` in `web/app.js` is the only app-version source. Stay in the
  permanent `0.80x` sequence and increment by `0.001` on every push.
- Record every push briefly in `docs/history/changelog.md`. Update this file
  only when a current contract changes. Add `RELEASE_NOTES.md` only for a
  meaningful user-visible change.
- When runtime assets change, keep the service-worker cache version and
  precache list synchronized.
- `web/whats-new.js` keeps announcements offline and deterministic: set its
  explicit `mergedAt` value to the real production merge time. The header
  button is visible globally for the following 10 days, then hides itself
  without relying on GitHub or another runtime service.
- Push to GitHub; Cloudflare Workers Builds deploys `wrangler.jsonc`, combining
  the Worker API with the existing Static Assets site. `/api/report` lives in
  `worker/report-worker.mjs`; its GitHub and Turnstile credentials are encrypted
  Worker secrets. For a shipped web milestone, create `web-v<APP_VERSION>`. Do
  not add APK/AAB artifacts here.

## Current non-obvious invariants

1. **LBL fall-through and repeats:** `LBL n ... LBL 0` executes where defined;
   `CALL LBL n` executes it again. `REP 6` and documented compact `REP6` are
   equivalent. A matching `CALL LBL n REPn` can end a program-section repeat
   without `LBL 0`, including a nested section inside a subprogram. Expansion
   is recursive but must remain bounded to 32 levels and 200000 blocks. Do not
   combine fall-through and calls accidentally in lessons or demos.
2. **Zero is a valid Q value:** use `Q !== undefined ? Q : default`, never
   `Q || default` for cycle parameters.
3. **Voxel detail and budgets:** Low/Default/High target 100/150/200 with
   1/0.7/0.5 mm detail caps; Refine targets 300/400/500 with 0.5/0.4/0.3 mm
   caps. One deterministic isotropic planner must preserve those profiles when
   they fit, then coarsen only enough for the rounded grid to remain at or
   below 24M live / 64M Refine voxels. Valid BLK dimensions have no fixed
   millimetre ceiling; keep finite, positive and max-greater-than-min checks.
4. **Responsive layout:** single-column mode is
   `(max-width:1024px), (max-height:600px)`. Use `_isMTab()`; do not introduce a
   width-only variant. In that mode Editor, 3D and Learn are bounded flex
   layouts sized from `visualViewport`; the bottom tab bar is their final
   in-flow row, not a viewport-fixed overlay. A viewport-height drop alone is
   not proof that the software keyboard opened: require active text focus and
   keep ordinary browser-chrome changes below the keyboard threshold. See
   [`docs/history/layout-and-renderer-rationale.md`](docs/history/layout-and-renderer-rationale.md).
5. **Mobile WebGL:** keep defensive renderer creation, context-loss handling,
   and the touch-device avoidance of unconditional `high-performance`.
6. **Trademark:** preserve the independent/not-affiliated HEIDENHAIN notice.
7. **Offline contract:** core features must not depend on external runtime
   services.
8. **Service worker:** register only outside Capacitor and never bundle it in
   Android.
9. **Vendored Three.js:** update both vendor files, service-worker precache, and
   the deliberate Android copy together when upgrading.
10. **Renderer resize:** `loop()` must keep calling `resizeToDisplay()`; window
    `resize` alone misses splitter and container changes. See the layout history.
11. **Bug lifecycle:** new/open bugs live in `TODO.md`; every attempt is logged
    there. On acceptance, move symptom, cause, attempts, and verification to
    `BUG_HISTORY.md` in the same change. Mirror cross-repo bugs.
12. **Chunked Marching Cubes:** dirty bounds require the one-cell XY dependency
    halo; Measure raycasting stays recursive while the live mesh is a group.
13. **Cycle feeds and visibility:** cycle `FAUTO` uses the active `TOOL CALL`
   feed. The official `AUTO` spelling is equivalent only for Q206 in supported
   Cycles 200, 201 and 208; reject it on non-feed Q parameters. Positioning
   `F AUTO` is equivalent to `FAUTO` in every supported positioning family.
   Cycle 200 retracts stay FMAX; Cycle 209 stays pitch×RPM. Only marked
   cycle-internal sub-frame reversals get the held midpoint render.
14. **Radius compensation geometry:** preserve L/C/CR/CT/CP/RND/CHF as exact
   contour primitives through RL/RR calculation and validation; tessellate
   only the finished tool-center path. The activating L or LP is one approach
   movement ending at the following contour's exact offset start, never a
   nominal move plus a hidden lateral segment. An angle-less `CP DR+`/`CP DR-`
   is one full revolution, and analytic joins must preserve every complete
   revolution of compensated full/multi-turn CP paths. APPR/DEP geometry must
   derive from the exact first/last compensated primitive tangent: retain the
   documented PS/PH/PA/PE/PN and optional-Z behavior, and let DEP cancel RL/RR
   automatically. Standalone CT uses the immediately preceding analytic
   contour tangent; `LIN_Z` changes only the simultaneous tool-axis endpoint.
15. **Collision is a warning, never a stop:** a rapid-into-material (FMAX)
   collision must report a pinned warning but must NOT halt the run — real
   machine-proven programs (e.g. a rapid onto a pre-drilled floor) play through
   to the end. `rapidCollision` leaves `mode` untouched and latches
   `window._collisionActive` so `updateStatus` keeps the warning until reset;
   never re-add `mode='idle'` there. The voxel check is resolution-bound, so
   sub-voxel gouges surface only at finer quality — do not "fix" that by
   stopping the sim.
16. **Validation starts only with simulation:** every program edit, programming
   function, guided panel, import, tool change and Learn transition calls
   `runValidation()` only to invalidate stale Problems and preserve edit-side
   lifecycle work such as autosave. That path must never call `validateProgram`
   or `parseProgram`. Only Run and Step call `runValidation(false)` immediately
   before simulation; they cancel any pending edit-invalidation timer, merge
   static and parser diagnostics, refresh the estimate and block on every
   complete error, including radius-compensation and trailing CHF/RND errors.
17. **Header name is the file identity, not BEGIN PGM:** `#progTitleName`
   shows `_docName`, set on demo pick (friendly name), import (filename),
   export (saved filename) and Clear (`program.H`); `_setDocName` is the only
   writer and app.js seeds it with the starter demo. Do not revert the header
   to `_progFileName(code)` — every demo/imported file uses `BEGIN PGM PROGRAM`
   internally, so parsing the body always yields `PROGRAM.H`.
18. **Autosave protects only the main program:** persist the current NC code,
    document name and save time in the local `tncsim.programDraft.v1` record,
    restore it before normal editor boot, and surface neutral pending/saving,
    green saved and orange error state in the editor header. Schedule at most
    one write 30 seconds after the first pending change, without postponing it
    on further typing; lifecycle hiding still flushes immediately. Entering Learn must first force-save the main
    program and then suspend autosave; lesson code is transient and closing
    Learn restores the main draft. A reload during Learn must also recover the
    main draft, never browser-restored lesson text.

19. **Program operations use logical NC blocks, not textarea rows:**
    `analyzeProgramRows()` is the source of truth for gutter numbering,
    selection, Problems labels, insertion, deletion and export. `CYCL DEF` plus
    its directly following Q parameter rows is one block; tilde continuations
    belong to their anchor block; an internal empty row is a numbered
    placeholder; only the final textarea newline is an artifact. Enter from
    anywhere in a cycle targets the first block after the complete cycle, and
    Enter on `END PGM` remains a no-op. Every programming-key insertion routes
    through `insertProgramBlock()`. On web, never reclassify desktop multi-line
    paste/drop as Enter and never intercept Enter while an IME composition is
    active. `BEGIN PGM` and `END PGM` stay protected against native text edits,
    but each exposes the gutter `×` and `deleteLineN()` may remove the complete
    structural block. Their logical Enter behavior remains special (insert
    after BEGIN, no-op on END).

20. **Learn practice is rendered once in core:** `_learnPracticeHtml()` returns
    `{body, foot}` for every layout; web code may synchronize external editor
    chrome but must never re-parent or rebuild the rendered practice DOM.
    `; >>>` is a reserved answer marker and must be stripped anywhere it could
    affect grading. Requirements stay hidden until Check, which renders the
    DONE WHEN verdict with green/red rows and failed hints; editing clears the
    verdict and hides that checklist again. During practice, theory remains a
    collapsible slide-by-slide reference rather than a second long document.
    Start/Continue practice is available only on the final information slide.
    Every graded task exposes an answer range: insertion tasks reserve
    highlighted blank blocks, while direct-edit tasks highlight the existing
    source blocks that must be changed. In desktop practice the host mirrors
    the current task into the banner above the editor and visually hides the
    core task card; mobile continues to use the core-rendered task card. The
    three desktop practice columns remain equal thirds, and the mirrored task
    uses a distinct question surface rather than answer-area styling. Lesson
    selection and pre-practice views retain that same one-third panel width.
    Amber connects the question and exact answer range; Check and Start practice
    use the established green action colour.
    The question surface ends with a small regular-weight `After writing your
    answer, press Check.` instruction without a divider or separate strip.
    Answer-row Backspace/Delete may edit text but must never merge the outer
    highlighted boundaries into neighbouring program blocks. The Start Here
    tutorial must exercise this real flow and target only visible UI: question
    panel, highlighted answer row, Info Slides, Hint, then Check.
    A password-provided solution and every carried-forward starter must use the
    same NC block serialization as the editor. If the task instructs the user
    to press Run, its completed official program must also pass
    `validateProgram(code, false)`; passing Learn's task checks alone is not
    sufficient.

21. **Desktop guided values are real inputs:** every generic numeric/text value
    rendered by the desktop field panel uses the shared `#fbarVal` input, so
    its current value can be selected, partially replaced and edited directly
    for L/C/CC/CR/CT, polar/incremental blocks, labels and TOOL CALL. Mobile
    retains the established hidden-input owner and special choices remain
    buttons/pickers. Optional fields serialize omission as an empty token,
    never JavaScript `null`. `lineParts()` must calculate field ranges from the
    final postprocessed line; otherwise fixed tokens such as TOOL CALL's
    inserted `Z` shift S/F/DL/DR highlighting away from their real text. The
    single standard-size APPR/DEP path key stacks APPR above DEP and toggles a
    compact picker in place of the idle Undo/Redo/Reset/Clear/text-size control
    strip, never over the program text and never at a greater strip height.
    A horizontal rule separates APPR from DEP on the key, and the picker uses
    neutral grey subfunction buttons.
    The picker is ordered APPR LT/LN/CT/LCT then DEP LT/LN/CT/LCT; selecting a
    function opens its guided fields, while pressing APPR/DEP again closes it.
    Any transition that replaces the context strip, including Learn/Practice,
    must also reset the key's `aria-expanded` and active visual state even when
    the picker node has already been removed.
22. **Web positioning-block M and validator contract:** every implemented
    positioning block (`L`, `C`, `CR`, `CT`, `LP`, `CP`) accepts at most two
    syntactically valid `M<number>` functions at its end. The official TNC 640
    manual permits up to four M functions on a positioning block (page 224);
    two is our deliberate product limit. Parameters documented for M103, M118,
    M120, M128, M138, M140 and M197 belong to the preceding M function and
    must never be parsed as coordinates or positioning feed. Both M fields and
    rendered tokens remain independently editable; clicking either rendered M
    routes to the complete guided editor of its positioning block and selects
    the corresponding M field, never the standalone M panel. A standalone M
    editor likewise opens only when the rendered `M<number>` token itself is
    clicked. Because textarea selection clamps a click on the final glyph and a
    click in trailing free space to the same offset, desktop routing must use
    the measured character cell; trailing free space keeps the caret at line
    end so Enter inserts the next block. Known shared M
    functions retain their simulator state effects: M0 and M6 pause with their
    own message, while M2 and M30 finish without requiring another Run. Other valid standard or
    machine-specific numbers are preserved and accepted with a warning that
    their machine effect is not simulated; never invent such behavior.
    The missing-spindle warning applies to the first non-FMAX positioning
    motion, not to preceding rapid positioning. M3, M4, M13 or M14 at the end
    of that same first feed block is start-effective and satisfies the check;
    an end-effective M5 on an earlier rapid block still leaves the following
    feed move without a running spindle.
    The persisted validator switch defaults ON and exists only in the bottom Problems row
    when a blocking error is visible. Changing it never starts validation;
    the new state applies on the next Run/Step. OFF suppresses validator/parser
    diagnostics and therefore removes Run/Step blocking, but parsing still
    runs to build the simulation; keep the compact bottom OFF row visible so
    the user can turn validation back on. Fresh web `TOOL CALL` insertion uses
    the Android defaults `S10000 F2000`.
23. **NC transport formatting is not program semantics:** repeated spaces and
    tabs outside comments, a leading Unicode BOM, and CRLF/CR versus LF line
    endings must not change validation, BLK FORM geometry, LBL expansion or
    the generated toolpath. File import normalizes these before editing;
    direct pasted/parser input remains tolerant as well.

Add a numbered rule only for a durable invariant that is not already covered.
Resolved narratives belong in `BUG_HISTORY.md`; retired architecture detail and
the technical log belong in `docs/history/`.

## Testing before push

- Confirm changed JavaScript parses and the browser console is clean.
- For parser/cutting changes, run the relevant Node regression and a 3D sanity
  program.
- For Learn changes, ensure the solution passes its checks and LBL content does
  not run twice.
- For CSS/layout changes, check desktop plus a narrow or short viewport.
- Verify the intended diff, bump `APP_VERSION`, update the technical changelog,
  and keep `origin/main` current after acceptance.
