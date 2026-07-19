# Graph Report - tnc-sim-web-seo  (2026-07-19)

## Corpus Check
- 72 files · ~180,764 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2493 nodes · 4512 edges · 165 communities (112 shown, 53 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `020db438`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WebGL Shader Variables
- Three.js Material Compilation
- Quaternion Math Operations
- Code Editor Core
- 3D Vector Math
- Matrix Transform Operations
- Learn Tutorial Flow
- Audio Clock Input
- Color Parsing Utilities
- Voxel Chunk Tests
- Buffer Attribute UV Transform
- Skeleton Bone Binding
- Vector3 Math Operations
- Curve Path Utilities
- Tool Table Management
- Texture Loader Events
- Object Constructor Copies
- Frustum Plane Intersection
- Field Editing UI
- Animation Action Crossfade
- Geometry Disable Toggle
- Buffer Attribute Array Copy
- Scene Object Quaternion
- Physics Constraint Binding
- Animation Memory Manager
- Buffer Geometry Construction
- Bounding Box Operations
- Camera Projection Update
- Matrix3 Math Operations
- CNC Parser Engine
- Scene Object Traversal
- Box3 Intersection Utils
- 2D Path Drawing
- Geometric Projection Utils
- Raycaster Object Intersection
- Spherical Harmonics Lighting
- Ray Geometry Intersection
- Measure Tool UI
- eh
- Object JSON Serialization
- Buffer Geometry Normals
- Shadow Map Frustum
- Sphere Bounding Volume
- Voxel Cutting Simulation
- Animation JSON Parsing
- Camera World Raycasting
- Keyframe Track Interpolation
- Block Form Panel
- Bug Report UI
- Instanced Mesh Skeleton
- Buffer Attribute Upload
- XR Controller Session
- Instanced Geometry Parsing
- Curve Length Mapping
- Path Curve Points
- Asset Loader Parser
- 3D Render Scene
- 2D View Controls
- PWA Manifest Config
- Orbit Camera Controls
- HTTP Asset Loader
- Coach Mark Tutorial
- Simulation Controls UI
- Radius Compensation Tests
- Interpolant Interval Sampling
- App Input Handlers
- Quality Profile Tests
- Raycaster Object Picking
- Matrix World Update
- Object Clone Serialize
- World Transform Helpers
- String Trim Utilities
- Shape Extraction Points
- M-Code Panel UI
- Q-Parameter Panel UI
- Animation Weight Blending
- Line Segment Distance
- Toolpath Parser Tests
- Geometry Transform Setup
- Vector Normalize Scale
- Cycle Picker UI
- Bone Matrix Update
- Line Geometry Index
- Curve Segment JSON
- Curve Tangent JSON
- Spaced Curve Points
- Buffer Attribute Cache
- Arc Curve JSON
- Hi
- Quadratic Bezier JSON
- Help Popup UI
- tool-table.test.js
- Klartext Syntax Highlighting
- Theme Toggle UI
- Object Clone Update
- Bounding Box Object
- .apply
- .fromArray
- Keyboard Input Loop
- Layout Tab Helper
- Mobile Tab Switching
- ei
- .applyQuaternion
- .addVectors
- C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour
- Polygon Area Geometry
- sc
- Text Decode URL Base
- C6 — Measure panel overlapped the mobile BLKFORM control
- Service Worker Cache
- C1 — Mobile editor focus/scroll jumping during value editing and Learn
- cs
- hl
- bind
- .setFromMatrixColumn
- ds
- C14 — Revealed hints leaked into a newly opened lesson
- C12 — Light-theme 3D table grid was too dark
- Ah
- Et
- C9 — Short drilling/tapping retracts appeared to teleport
- C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed
- C14 — Revealed hints leaked into a newly opened lesson
- C5 — Editor text passed behind mobile control panels
- ge
- uc
- Ah
- Do
- fo
- hs
- .clamp
- C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed
- Rs
- Zc
- .crossFadeFrom
- C4 — Placement of a newly inserted block relative to the active line
- ic
- sc
- vl
- .getNormalMatrix
- Zc
- .rotateX
- .rotateZ
- .scale
- .translate
- .applyMatrix4
- rc
- sc

## God Nodes (most connected - your core abstractions)
1. `vt` - 125 edges
2. `copy()` - 121 edges
3. `Lt` - 80 edges
4. `en` - 72 edges
5. `TNC Sim — Release notes` - 72 edges
6. `Wn` - 58 edges
7. `St` - 50 edges
8. `TNC Sim web — technical changelog` - 44 edges
9. `Ce` - 43 edges
10. `tn` - 43 edges

## Surprising Connections (you probably didn't know these)
- `buildKeypad()` --indirect_call--> `i()`  [INFERRED]
  core/field-editing.js → vendor/three.min.js
- `parseExistingLine()` --indirect_call--> `t()`  [INFERRED]
  core/field-editing.js → web/i18n.js
- `triggerRefine()` --indirect_call--> `t()`  [INFERRED]
  core/parser-engine.js → web/i18n.js
- `constructor()` --indirect_call--> `t()`  [INFERRED]
  vendor/three.min.js → web/i18n.js
- `onToolImportFile()` --indirect_call--> `t()`  [INFERRED]
  core/tool-table.js → web/i18n.js

## Import Cycles
- None detected.

## Communities (165 total, 53 thin omitted)

### Community 0 - "WebGL Shader Variables"
Cohesion: 0.03
Nodes (26): cr(), dr(), er(), fr(), gr(), Hi(), hr(), ji() (+18 more)

### Community 1 - "Three.js Material Compilation"
Cohesion: 0.04
Nodes (41): _allocateTargets(), _applyPMREM(), Ba, _blur(), ci, _cleanup(), compileCubemapShader(), compileEquirectangularShader() (+33 more)

### Community 2 - "Quaternion Math Operations"
Cohesion: 0.06
Nodes (3): At, fe, Ko

### Community 3 - "Code Editor Core"
Cohesion: 0.07
Nodes (39): _applyEditorFs(), applyFix(), applyNumericSign(), computeBlockNumbers(), deleteCurrentLine(), deleteLineN(), _downloadTextFile(), editorClear() (+31 more)

### Community 6 - "Learn Tutorial Flow"
Cohesion: 0.06
Nodes (23): closeLearn(), learnBackToList(), learnCheck(), _learnCycleBlocks(), _learnEndEditorInput(), learnEvalChecks(), _learnExecutableCode(), learnExit() (+15 more)

### Community 7 - "Audio Clock Input"
Cohesion: 0.07
Nodes (5): bc, getInput(), getOutput(), ic, Lc

### Community 8 - "Color Parsing Utilities"
Cohesion: 0.07
Nodes (6): dt(), $e(), Ke(), Qe(), tn, ut()

### Community 9 - "Voxel Chunk Tests"
Cohesion: 0.05
Nodes (22): appSource, assert, before, boundaryDirty, BufferAttribute, BufferGeometry, chunkTriangles, context (+14 more)

### Community 10 - "Buffer Attribute UV Transform"
Cohesion: 0.13
Nodes (4): as(), copy(), parseObject(), setFromCamera()

### Community 13 - "Curve Path Utilities"
Cohesion: 0.19
Nodes (22): env(), request(), responseJson(), testMissingSecretsFailsClosed(), testOptionsAndOrigin(), testOversizedBodyIsRejected(), testStaticAssetFallback(), testSuccessfulReport() (+14 more)

### Community 14 - "Tool Table Management"
Cohesion: 0.09
Nodes (34): triggerRefine(), buildToolIntoGroup(), calcToolTimes(), effectiveToolRadius(), field(), getToolByNum(), getToolColor3(), inferToolType() (+26 more)

### Community 15 - "Texture Loader Events"
Cohesion: 0.09
Nodes (20): anchors, assertCommentsOnlyDiff(), bugReport, deBody, deKeys, deStart, fail(), fs (+12 more)

### Community 16 - "Object Constructor Copies"
Cohesion: 0.11
Nodes (18): ao(), co(), eo(), ho(), io(), ja(), ka(), lo() (+10 more)

### Community 17 - "Frustum Plane Intersection"
Cohesion: 0.07
Nodes (3): ai, ht(), Ne

### Community 18 - "Field Editing UI"
Cohesion: 0.13
Nodes (28): applyFeedMode(), applySug(), buildKeypad(), _cancelMobileFocus(), chooseFeedMode(), closeFeedMenu(), enterFieldMode(), enterFieldModeOnLine() (+20 more)

### Community 19 - "Animation Action Crossfade"
Cohesion: 0.06
Nodes (4): jo, wo, xc, xo

### Community 20 - "Geometry Disable Toggle"
Cohesion: 0.14
Nodes (3): bl, dc, mc()

### Community 25 - "Buffer Geometry Construction"
Cohesion: 0.11
Nodes (18): Attempts, Attempts, Attempts, Attempts, C17 — Tool Table CRUD, parameters and import/export audit, C20 — DE → EN leaves the Complete Part starter program in German, C21 — One-click reports have no endpoint on the Static Assets Worker, Open bugs (+10 more)

### Community 29 - "CNC Parser Engine"
Cohesion: 0.11
Nodes (42): applyRadiusComp(), applyRadiusCompAnalytic(), _applyRadiusCompPolylineFallback(), buildToolMesh(), _carryPhysicalXY(), evalQExpr(), expandLblLines(), inspectQExpr() (+34 more)

### Community 30 - "Scene Object Traversal"
Cohesion: 0.09
Nodes (7): _a, bs, dispose(), Et, ft(), Tt, ws()

### Community 32 - "2D Path Drawing"
Cohesion: 0.18
Nodes (6): assert, cyc(), H, mustError(), seg(), valErrors()

### Community 33 - "Geometric Projection Utils"
Cohesion: 0.22
Nodes (7): assert, desktop, fs, mobile, path, source, vm

### Community 34 - "Raycaster Object Intersection"
Cohesion: 0.14
Nodes (5): bindSkeletons(), parseGeometries(), parseShapes(), parseSkeletons(), pl

### Community 37 - "Measure Tool UI"
Cohesion: 0.21
Nodes (11): addItem(), clearMeasure(), deleteMeasureItem(), handleMeasureClick(), makeLine(), makeSphere(), renderMeasureOverlay(), setMeasureMode() (+3 more)

### Community 41 - "eh"
Cohesion: 0.28
Nodes (15): _bugArea(), _bugBuildBody(), _bugContext(), _bugGetToken(), _bugPrefill(), _bugRenderTurnstile(), bugSetKind(), _bugSetStatus() (+7 more)

### Community 42 - "Object JSON Serialization"
Cohesion: 0.12
Nodes (15): 1. Create the production Turnstile widget, 2. Create the GitHub token, 3. Deploy the Worker code once, 4. Add encrypted Worker secrets, Android app, Endpoint protections, One-click Bug Report / Suggestion — Worker setup, Verification (+7 more)

### Community 44 - "Shadow Map Frustum"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, screenshots (+3 more)

### Community 46 - "Voxel Cutting Simulation"
Cohesion: 0.22
Nodes (12): advance(), placeTool(), segSpeed(), shouldHoldVisibleSegment(), vxBuildGeometryRange(), vxBuildMesh(), vxCut(), vxDisposeObject() (+4 more)

### Community 47 - "Animation JSON Parsing"
Cohesion: 0.06
Nodes (5): il(), Ll, ml, nl, Rl

### Community 48 - "Camera World Raycasting"
Cohesion: 0.25
Nodes (3): fo(), mo(), po

### Community 49 - "Keyframe Track Interpolation"
Cohesion: 0.08
Nodes (13): hl, i(), load(), oc, ol, parse(), parseAnimations(), parseImages() (+5 more)

### Community 50 - "Block Form Panel"
Cohesion: 0.27
Nodes (11): blkBeforeInput(), blkCommitVal(), blkConfirmStep(), blkKeyDown(), blkNextStep(), blkSetShape(), blkStepRel(), blkUpdateVal() (+3 more)

### Community 51 - "Bug Report UI"
Cohesion: 0.18
Nodes (3): fa, Ga, ta

### Community 52 - "Instanced Mesh Skeleton"
Cohesion: 0.39
Nodes (7): closeCtxPanel(), closeCyclePicker(), openCyclePicker(), selectCycle(), showCycleList(), showCycleParams(), CYCLES

### Community 53 - "Buffer Attribute Upload"
Cohesion: 0.08
Nodes (25): 10. Resize the 3D renderer from the render loop, not only on window 'resize', 11. Bug lifecycle: TODO.md while open (log every attempt), BUG_HISTORY.md when fixed, 12. Chunked Marching Cubes needs a one-cell dirty halo, 13. Cycle FAUTO feed and short retract visibility are separate concerns, 1. LBL runs where it is written (fall-through!), 2. Q-value fallbacks must treat 0 as valid, 3. Voxel cell size limits detail, 4. Layout breakpoint: single-column when width ≤1024px OR height ≤600px (+17 more)

### Community 54 - "XR Controller Session"
Cohesion: 0.04
Nodes (44): TNC Sim web — technical changelog, v0.846 — documentation damage control, v0.847 — light grid and Learn hint state, v0.848 — machining demo library, v0.849 — Learn correctness and accessibility audit, v0.850 — clearer compensation and Cycle 208 diagrams, v0.851 — complete Learn slide-image redesign, v0.852 — Learn diagram collision corrections (+36 more)

### Community 57 - "Curve Length Mapping"
Cohesion: 0.11
Nodes (4): bt, ct(), es(), Xe()

### Community 58 - "Path Curve Points"
Cohesion: 0.03
Nodes (72): TNC Sim — Release notes, v0.801, v0.802, v0.803, v0.804, v0.806, v0.809, v0.810 (+64 more)

### Community 59 - "Asset Loader Parser"
Cohesion: 0.25
Nodes (7): assert, callLine, callSegments, code, context, harness, parsed

### Community 60 - "3D Render Scene"
Cohesion: 0.26
Nodes (13): _applyGridTheme(), _applyRefinedMesh(), buildScene(), _gridColors(), hide3DError(), _hideRefineIndicator(), init3D(), _runRefineMainThread() (+5 more)

### Community 61 - "2D View Controls"
Cohesion: 0.27
Nodes (7): draw2dFull(), onResize(), resize2d(), resizeToDisplay(), sc2d(), switchView(), tf2d()

### Community 64 - "HTTP Asset Loader"
Cohesion: 0.10
Nodes (8): cn, dn, fn, hn, jn(), on, pn, un

### Community 65 - "Coach Mark Tutorial"
Cohesion: 0.36
Nodes (11): _coachEnsureTabFor(), _coachMarkSeen(), _coachPaint(), _coachSeen(), _coachTarget(), learnCoachEnd(), learnCoachMaybeStart(), learnCoachNext() (+3 more)

### Community 66 - "Simulation Controls UI"
Cohesion: 0.25
Nodes (5): ensurePrepared(), onReset(), onRun(), onStep(), prepare()

### Community 67 - "Radius Compensation Tests"
Cohesion: 0.24
Nodes (10): assert, context, fs, near(), path, point(), segment(), source (+2 more)

### Community 68 - "Interpolant Interval Sampling"
Cohesion: 0.05
Nodes (23): ar(), br(), $c(), ds(), en, ge, intersectObject(), intersectObjects() (+15 more)

### Community 69 - "App Input Handlers"
Cohesion: 0.20
Nodes (7): applyStockVisibility(), isCycleAnchor(), isLockedLine(), onMove(), onUp(), toggleStockVisibility(), updateStockToggle()

### Community 70 - "Quality Profile Tests"
Cohesion: 0.20
Nodes (9): app, assert, fs, index, parser, path, qualityButtons, root (+1 more)

### Community 72 - "Matrix World Update"
Cohesion: 0.50
Nodes (3): 3D renderer resizing, Layout and renderer rationale, Responsive breakpoint

### Community 73 - "Object Clone Serialize"
Cohesion: 0.25
Nodes (7): Attempts and fix, Bug history — resolved bugs & how they were fixed, C3 — RND/CHF occasionally inserted at the start of the program, C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed, Root cause and resolution, Symptom, Symptom and cause

### Community 75 - "String Trim Utilities"
Cohesion: 0.18
Nodes (8): assert, chamfer, context, fs, intro, path, root, vm

### Community 76 - "Shape Extraction Points"
Cohesion: 0.14
Nodes (11): assert, context, firstCycle208, fs, html, parserSource, path, playbackSource (+3 more)

### Community 77 - "M-Code Panel UI"
Cohesion: 0.42
Nodes (7): _mCommit(), _mDescFor(), _mManualDescUpdate(), _mPanelConfirm(), openMPanel(), openMPanelEdit(), _replaceMOnLine()

### Community 78 - "Q-Parameter Panel UI"
Cohesion: 0.36
Nodes (6): closeQPopup(), openQParamPanel(), openQPopup(), qPanelConfirm(), qPanelSetVal(), renderQParamPanel()

### Community 80 - "Line Segment Distance"
Cohesion: 0.18
Nodes (10): appSource, assert, completedProblems, context, fs, liveProblems, path, qPanelSource (+2 more)

### Community 81 - "Toolpath Parser Tests"
Cohesion: 0.25
Nodes (6): assert, context, fs, path, source, vm

### Community 82 - "Geometry Transform Setup"
Cohesion: 0.22
Nodes (8): assert, codeEl, core, ctx, fs, path, titleEl, vm

### Community 83 - "Vector Normalize Scale"
Cohesion: 0.13
Nodes (14): angleCode, angleMatch, appSource, assert, completeMatch, context, fs, indexHtml (+6 more)

### Community 84 - "Cycle Picker UI"
Cohesion: 0.15
Nodes (7): ctx, fs, parserSource, path, root, TOOLS, vm

### Community 85 - "Bone Matrix Update"
Cohesion: 0.22
Nodes (8): app, assert, ctx, end, fs, path, start, vm

### Community 89 - "Spaced Curve Points"
Cohesion: 0.33
Nodes (6): 2026-07-18 — coloured leftover cut surfaces when re-running without Reset, Fix, Investigation (what was ruled out), Not fixed (noted for later), Reported symptom, Root cause

### Community 91 - "Arc Curve JSON"
Cohesion: 0.33
Nodes (5): Current non-obvious invariants, Product and source layout, Testing before push, TNC Sim web — current project contract, Versioning and deploy

### Community 93 - "Quadratic Bezier JSON"
Cohesion: 0.21
Nodes (3): an, ln, wh()

### Community 94 - "Help Popup UI"
Cohesion: 0.60
Nodes (3): hideHelpPopup(), openHelp(), toggleKpHelp()

### Community 95 - "tool-table.test.js"
Cohesion: 0.22
Nodes (4): assert, fs, source, vm

### Community 96 - "Klartext Syntax Highlighting"
Cohesion: 1.00
Nodes (3): _synEscHtml(), _synHighlightLine(), _synLineWithColor()

### Community 98 - "Object Clone Update"
Cohesion: 0.05
Nodes (19): ca, ei, el, hh, Jr(), li(), ms(), nr() (+11 more)

### Community 100 - ".apply"
Cohesion: 0.10
Nodes (6): fi(), gl, _s(), update(), updateMatrixWorld(), Yl

### Community 103 - "Keyboard Input Loop"
Cohesion: 0.83
Nodes (3): apply(), kick(), loop()

### Community 106 - "ei"
Cohesion: 0.22
Nodes (5): assert, ctx, harness, inProgress, unfitCorner

### Community 107 - ".applyQuaternion"
Cohesion: 0.40
Nodes (5): 2026-07-18 — modal feed corrupted to FMAX after a fixed cycle / M99 call, Approaches considered but not taken, Fix, Reported symptom, Root cause

### Community 108 - ".addVectors"
Cohesion: 0.40
Nodes (5): Attempts and fix, C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour, Repro contour, Root cause, Symptom

### Community 109 - "C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour"
Cohesion: 0.40
Nodes (4): assert, fs, html, path

### Community 111 - "Polygon Area Geometry"
Cohesion: 0.33
Nodes (5): Documentation budget, graphify, Non-negotiables, Start of every session, TNC Sim web

### Community 112 - "sc"
Cohesion: 0.50
Nodes (4): Attempts (all reverted — v0.812–v0.814, restored to `main`), Context, Mobile bottom tab bar behaviour with the on-screen keyboard (web), Resolution

### Community 113 - "Text Decode URL Base"
Cohesion: 0.50
Nodes (4): Attempts and accepted fixes, C18 — Heidenhain cycles, cutting logic and validator audit, Reproduced defects and root causes, Verification and remaining limits

### Community 117 - "C1 — Mobile editor focus/scroll jumping during value editing and Learn"
Cohesion: 0.50
Nodes (4): Attempts and fix, C7 — 3D stock updates stalled during machining, Root cause, Symptom

### Community 119 - "hl"
Cohesion: 0.50
Nodes (4): Attempts and fix, C6 — Measure panel overlapped the mobile BLKFORM control, Root cause, Symptom

### Community 122 - ".setFromMatrixColumn"
Cohesion: 0.50
Nodes (4): Attempts and fix, C1 — Mobile editor focus/scroll jumping during value editing and Learn, Root cause, Symptom

### Community 124 - "C14 — Revealed hints leaked into a newly opened lesson"
Cohesion: 0.50
Nodes (4): C11 — Learn (desktop): wasted slide space and hints revealed off-screen, Fix, Root cause, Symptom

### Community 125 - "C12 — Light-theme 3D table grid was too dark"
Cohesion: 0.18
Nodes (9): assert, classList, context, elements, fs, overlayClasses, path, source (+1 more)

### Community 127 - "Et"
Cohesion: 0.25
Nodes (6): assert, fs, path, root, source, vm

### Community 128 - "C9 — Short drilling/tapping retracts appeared to teleport"
Cohesion: 0.50
Nodes (4): Fix, Learn tab: dead near-black empty strip at the bottom (single-column layout), Root cause, Symptom

### Community 134 - "Ah"
Cohesion: 0.12
Nodes (4): clone(), kl, ts(), us()

### Community 139 - ".clamp"
Cohesion: 0.67
Nodes (3): 2026-07-17 — mobile numeric editing and TNC 640 RL/RR geometry, Accepted implementation and verification, Reported symptoms and root causes

### Community 140 - "C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed"
Cohesion: 0.67
Nodes (3): Accepted fix and verification, C19 — Desktop F menu closed prematurely; CALL LBL status was blank, Symptom and root cause

### Community 142 - "Rs"
Cohesion: 0.67
Nodes (3): Attempt and fix, C14 — Revealed hints leaked into a newly opened lesson, Symptom and root cause

### Community 144 - "Zc"
Cohesion: 0.67
Nodes (3): Attempt and fix, C13 — Learn Hint did not scroll the desktop left panel fully down, Symptom and root cause

### Community 145 - ".crossFadeFrom"
Cohesion: 0.12
Nodes (7): cl, constructor(), fh, gi(), mi(), setDirection(), setLength()

### Community 146 - "C4 — Placement of a newly inserted block relative to the active line"
Cohesion: 0.67
Nodes (3): Attempt and fix, C12 — Light-theme 3D table grid was too dark, Symptom and root cause

### Community 149 - "ic"
Cohesion: 0.67
Nodes (3): Attempts and accepted fixes, C16 — Complete Learn correctness, content and visual audit, Symptom and root causes

### Community 154 - "sc"
Cohesion: 0.67
Nodes (3): Attempts and fix, C10 — Cycle 209 explicit zero values were ignored, Symptom and cause

### Community 155 - "vl"
Cohesion: 0.67
Nodes (3): Attempts and fix, C9 — Short drilling/tapping retracts appeared to teleport, Symptom and cause

### Community 156 - ".getNormalMatrix"
Cohesion: 0.67
Nodes (3): C4 — Placement of a newly inserted block relative to the active line, Original expectation, Resolution note

### Community 157 - "Zc"
Cohesion: 0.67
Nodes (3): C5 — Editor text passed behind mobile control panels, Root cause and fix, Symptom

## Knowledge Gaps
- **413 isolated node(s):** `id`, `name`, `short_name`, `description`, `start_url` (+408 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lt` connect `Vector3 Math Operations` to `HTTP Asset Loader`, `Three.js Material Compilation`, `Spherical Harmonics Lighting`, `PMREM Cubemap Processing`, `Quaternion Interpolation`, `JSON Scene Parser`, `Ah`, `Buffer Attribute UV Transform`, `hs`, `Mobile bottom tab bar behaviour with the on-screen keyboard (web)`, `Sphere Bounding Volume`, `Frustum Plane Intersection`, `Bug Report UI`, `Buffer Attribute Array Copy`, `cs`, `Animation Memory Manager`, `Quadratic Bezier JSON`, `Scene Object Traversal`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `t()` connect `Tool Table Management` to `.crossFadeFrom`, `Field Editing UI`, `Spherical Harmonics Lighting`, `PWA Manifest Config`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `copy()` connect `Buffer Attribute UV Transform` to `Three.js Material Compilation`, `C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed`, `Quaternion Math Operations`, `ge`, `Ah`, `fo`, `Color Parsing Utilities`, `hs`, `Skeleton Bone Binding`, `Object Constructor Copies`, `Frustum Plane Intersection`, `Geometry Disable Toggle`, `Buffer Attribute Array Copy`, `Scene Object Quaternion`, `Physics Constraint Binding`, `Animation Memory Manager`, `Bounding Box Operations`, `Camera Projection Update`, `Scene Object Traversal`, `.rotateX`, `.rotateZ`, `.translate`, `Box3 Intersection Utils`, `Spherical Harmonics Lighting`, `Raycaster Object Intersection`, `Ray Geometry Intersection`, `.scale`, `Quaternion Interpolation`, `sc`, `.applyMatrix4`, `rc`, `Sphere Bounding Volume`, `Animation JSON Parsing`, `Camera World Raycasting`, `Bug Report UI`, `Instanced Geometry Parsing`, `Curve Length Mapping`, `PWA Manifest Config`, `HTTP Asset Loader`, `Interpolant Interval Sampling`, `Raycaster Object Picking`, `Animation Weight Blending`, `Line Geometry Index`, `Curve Segment JSON`, `Buffer Attribute Cache`, `Hi`, `Quadratic Bezier JSON`, `Object Clone Update`, `Bounding Box Object`, `.apply`, `Mobile bottom tab bar behaviour with the on-screen keyboard (web)`, `C6 — Measure panel overlapped the mobile BLKFORM control`, `bind`, `Ah`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `id`, `name`, `short_name` to the rest of the system?**
  _413 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `WebGL Shader Variables` be split into smaller, more focused modules?**
  _Cohesion score 0.03129890453834116 - nodes in this community are weakly interconnected._
- **Should `Three.js Material Compilation` be split into smaller, more focused modules?**
  _Cohesion score 0.03684210526315789 - nodes in this community are weakly interconnected._
- **Should `Quaternion Math Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.0573025856044724 - nodes in this community are weakly interconnected._