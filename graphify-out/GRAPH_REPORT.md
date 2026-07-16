# Graph Report - web-audit  (2026-07-16)

## Corpus Check
- 52 files · ~147,243 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2223 nodes · 4140 edges · 143 communities (91 shown, 52 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `510555e8`
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
- PMREM Cubemap Processing
- Quaternion Interpolation
- JSON Scene Parser
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
- Shape Curve Parameters
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
- Vector Normalize Scale
- Cycle Picker UI
- Bone Matrix Update
- Line Geometry Index
- Curve Segment JSON
- Spaced Curve Points
- Buffer Attribute Cache
- Arc Curve JSON
- Quadratic Bezier JSON
- Help Popup UI
- tool-table.test.js
- Klartext Syntax Highlighting
- Theme Toggle UI
- Object Clone Update
- Bounding Box Object
- Keyboard Input Loop
- Layout Tab Helper
- Mobile Tab Switching
- el
- .addVectors
- C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour
- Mobile bottom tab bar behaviour with the on-screen keyboard (web)
- Polygon Area Geometry
- sc
- Text Decode URL Base
- C6 — Measure panel overlapped the mobile BLKFORM control
- Service Worker Cache
- C1 — Mobile editor focus/scroll jumping during value editing and Learn
- C11 — Learn (desktop): wasted slide space and hints revealed off-screen
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
- .toJSON
- uc
- Ah
- Do
- fo
- hs
- qo
- uo
- Zc

## God Nodes (most connected - your core abstractions)
1. `vt` - 125 edges
2. `copy()` - 121 edges
3. `Lt` - 80 edges
4. `en` - 72 edges
5. `Wn` - 58 edges
6. `St` - 50 edges
7. `TNC Sim — Release notes` - 48 edges
8. `Ce` - 43 edges
9. `tn` - 43 edges
10. `ws()` - 42 edges

## Surprising Connections (you probably didn't know these)
- `buildKeypad()` --indirect_call--> `i()`  [INFERRED]
  core/field-editing.js → vendor/three.min.js
- `bugCopyReport()` --indirect_call--> `ta`  [INFERRED]
  core/bug-report.js → vendor/three.min.js
- `selectCycle()` --references--> `CYCLES`  [EXTRACTED]
  core/cycle-picker.js → tests/parser-cycles-audit.test.js

## Import Cycles
- None detected.

## Communities (143 total, 52 thin omitted)

### Community 0 - "WebGL Shader Variables"
Cohesion: 0.03
Nodes (32): Aa, br(), cr(), dr(), er(), fr(), gr(), Hi() (+24 more)

### Community 1 - "Three.js Material Compilation"
Cohesion: 0.03
Nodes (43): _allocateTargets(), an, _applyPMREM(), Ba, _blur(), $c(), _cleanup(), compileCubemapShader() (+35 more)

### Community 2 - "Quaternion Math Operations"
Cohesion: 0.06
Nodes (3): At, fe, ht()

### Community 3 - "Code Editor Core"
Cohesion: 0.07
Nodes (33): _applyEditorFs(), applyFix(), computeBlockNumbers(), deleteCurrentLine(), deleteLineN(), _downloadTextFile(), editorClear(), _editorConfirm() (+25 more)

### Community 6 - "Learn Tutorial Flow"
Cohesion: 0.06
Nodes (23): closeLearn(), learnBackToList(), learnCheck(), _learnCycleBlocks(), _learnEndEditorInput(), learnEvalChecks(), _learnExecutableCode(), learnExit() (+15 more)

### Community 7 - "Audio Clock Input"
Cohesion: 0.08
Nodes (4): bc, getInput(), getOutput(), Lc

### Community 8 - "Color Parsing Utilities"
Cohesion: 0.08
Nodes (5): dt(), $e(), Qe(), tn, ut()

### Community 9 - "Voxel Chunk Tests"
Cohesion: 0.05
Nodes (22): appSource, assert, before, boundaryDirty, BufferAttribute, BufferGeometry, chunkTriangles, context (+14 more)

### Community 14 - "Tool Table Management"
Cohesion: 0.11
Nodes (28): buildToolIntoGroup(), calcToolTimes(), effectiveToolRadius(), field(), getToolByNum(), getToolColor3(), inferToolType(), insertToolDef() (+20 more)

### Community 16 - "Object Constructor Copies"
Cohesion: 0.11
Nodes (17): co(), eo(), ho(), io(), ja(), ka(), lo(), no() (+9 more)

### Community 18 - "Field Editing UI"
Cohesion: 0.15
Nodes (26): applyFeedMode(), applySug(), buildKeypad(), _cancelMobileFocus(), enterFieldMode(), enterFieldModeOnLine(), exitFieldMode(), fieldNext() (+18 more)

### Community 19 - "Animation Action Crossfade"
Cohesion: 0.05
Nodes (4): jo, Ko, nc, xc

### Community 20 - "Geometry Disable Toggle"
Cohesion: 0.12
Nodes (8): cn, dn, fn, hn, jn(), on, pn, un

### Community 25 - "Buffer Geometry Construction"
Cohesion: 0.16
Nodes (6): fi(), Mh, Si(), ti, update(), wh()

### Community 27 - "Camera Projection Update"
Cohesion: 0.11
Nodes (4): Jl, Kn, vl(), Yl

### Community 29 - "CNC Parser Engine"
Cohesion: 0.15
Nodes (19): applyRadiusComp(), buildToolMesh(), _carryPhysicalXY(), evalQExpr(), expandLblLines(), inspectQExpr(), offsetRun(), parseProgram() (+11 more)

### Community 30 - "Scene Object Traversal"
Cohesion: 0.08
Nodes (10): _a, bindSkeletons(), bs, dispose(), Et, ft(), ni, parseSkeletons() (+2 more)

### Community 32 - "2D Path Drawing"
Cohesion: 0.40
Nodes (3): bind(), getValue(), setValue()

### Community 35 - "Spherical Harmonics Lighting"
Cohesion: 0.06
Nodes (20): ao(), bo, cl, constructor(), Da, ds(), gi(), gn() (+12 more)

### Community 37 - "Measure Tool UI"
Cohesion: 0.21
Nodes (11): addItem(), clearMeasure(), deleteMeasureItem(), handleMeasureClick(), makeLine(), makeSphere(), renderMeasureOverlay(), setMeasureMode() (+3 more)

### Community 38 - "PMREM Cubemap Processing"
Cohesion: 0.14
Nodes (4): ge, mt(), sl, _t

### Community 40 - "JSON Scene Parser"
Cohesion: 0.16
Nodes (3): clone(), kl, us()

### Community 42 - "Object JSON Serialization"
Cohesion: 0.14
Nodes (3): ac, go, tc

### Community 44 - "Shadow Map Frustum"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, screenshots (+3 more)

### Community 46 - "Voxel Cutting Simulation"
Cohesion: 0.22
Nodes (12): advance(), placeTool(), segSpeed(), shouldHoldVisibleSegment(), vxBuildGeometryRange(), vxBuildMesh(), vxCut(), vxDisposeObject() (+4 more)

### Community 48 - "Camera World Raycasting"
Cohesion: 0.14
Nodes (8): ar(), en, ir(), Na, pi(), rr(), sr(), Yh()

### Community 49 - "Keyframe Track Interpolation"
Cohesion: 0.08
Nodes (13): hl, i(), ic, load(), ol, parse(), parseAnimations(), parseImages() (+5 more)

### Community 50 - "Block Form Panel"
Cohesion: 0.29
Nodes (10): blkCommitVal(), blkConfirmStep(), blkKeyDown(), blkNextStep(), blkSetShape(), blkStepRel(), blkUpdateVal(), insertBlkForm() (+2 more)

### Community 51 - "Bug Report UI"
Cohesion: 0.18
Nodes (3): _bugBuildText(), bugCopyReport(), ta

### Community 53 - "Buffer Attribute Upload"
Cohesion: 0.06
Nodes (30): 10. Resize the 3D renderer from the render loop, not only on window 'resize', 11. Bug lifecycle: TODO.md while open (log every attempt), BUG_HISTORY.md when fixed, 12. Chunked Marching Cubes needs a one-cell dirty halo, 13. Cycle FAUTO feed and short retract visibility are separate concerns, 1. LBL runs where it is written (fall-through!), 2. Q-value fallbacks must treat 0 as valid, 3. Voxel cell size limits detail, 4. Layout breakpoint: single-column when width ≤1024px OR height ≤600px (+22 more)

### Community 54 - "XR Controller Session"
Cohesion: 0.10
Nodes (20): TNC Sim web — technical changelog, v0.846 — documentation damage control, v0.847 — light grid and Learn hint state, v0.848 — machining demo library, v0.849 — Learn correctness and accessibility audit, v0.850 — clearer compensation and Cycle 208 diagrams, v0.851 — complete Learn slide-image redesign, v0.852 — Learn diagram collision corrections (+12 more)

### Community 57 - "Curve Length Mapping"
Cohesion: 0.11
Nodes (4): bt, ct(), es(), Xe()

### Community 58 - "Path Curve Points"
Cohesion: 0.04
Nodes (48): TNC Sim — Release notes, v0.801, v0.802, v0.803, v0.804, v0.806, v0.809, v0.810 (+40 more)

### Community 59 - "Asset Loader Parser"
Cohesion: 0.14
Nodes (3): bl, dc, mc()

### Community 60 - "3D Render Scene"
Cohesion: 0.26
Nodes (13): _applyGridTheme(), _applyRefinedMesh(), buildScene(), _gridColors(), hide3DError(), _hideRefineIndicator(), init3D(), _runRefineMainThread() (+5 more)

### Community 61 - "2D View Controls"
Cohesion: 0.27
Nodes (7): draw2dFull(), onResize(), resize2d(), resizeToDisplay(), sc2d(), switchView(), tf2d()

### Community 62 - "PWA Manifest Config"
Cohesion: 0.25
Nodes (7): Disclaimer, Found a bug?, License, Running locally, Status, TNC Sim, What it does

### Community 64 - "HTTP Asset Loader"
Cohesion: 0.25
Nodes (7): Attempt and fix, Bug history — resolved bugs & how they were fixed, C13 — Learn Hint did not scroll the desktop left panel fully down, C3 — RND/CHF occasionally inserted at the start of the program, Root cause and resolution, Symptom, Symptom and root cause

### Community 65 - "Coach Mark Tutorial"
Cohesion: 0.36
Nodes (11): _coachEnsureTabFor(), _coachMarkSeen(), _coachPaint(), _coachSeen(), _coachTarget(), learnCoachEnd(), learnCoachMaybeStart(), learnCoachNext() (+3 more)

### Community 66 - "Simulation Controls UI"
Cohesion: 0.25
Nodes (5): ensurePrepared(), onReset(), onRun(), onStep(), prepare()

### Community 67 - "Radius Compensation Tests"
Cohesion: 0.24
Nodes (10): assert, context, fs, near(), path, point(), segment(), source (+2 more)

### Community 69 - "App Input Handlers"
Cohesion: 0.27
Nodes (7): applyStockVisibility(), isCycleAnchor(), isLockedLine(), onMove(), onUp(), toggleStockVisibility(), updateStockToggle()

### Community 70 - "Quality Profile Tests"
Cohesion: 0.20
Nodes (9): app, assert, fs, index, parser, path, qualityButtons, root (+1 more)

### Community 71 - "Raycaster Object Picking"
Cohesion: 0.14
Nodes (3): fh, la, oi()

### Community 72 - "Matrix World Update"
Cohesion: 0.50
Nodes (3): 3D renderer resizing, Layout and renderer rationale, Responsive breakpoint

### Community 73 - "Object Clone Serialize"
Cohesion: 0.18
Nodes (10): Attempts, Attempts, C17 — Tool Table CRUD, parameters and import/export audit, Open bugs, <short title> — <one-line symptom>, Status, Status, Symptom (+2 more)

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

### Community 81 - "Toolpath Parser Tests"
Cohesion: 0.25
Nodes (6): assert, context, fs, path, source, vm

### Community 83 - "Vector Normalize Scale"
Cohesion: 0.13
Nodes (14): angleCode, angleMatch, appSource, assert, completeMatch, context, fs, indexHtml (+6 more)

### Community 84 - "Cycle Picker UI"
Cohesion: 0.06
Nodes (21): closeCtxPanel(), closeCyclePicker(), openCyclePicker(), selectCycle(), showCycleList(), showCycleParams(), ctx, fs (+13 more)

### Community 85 - "Bone Matrix Update"
Cohesion: 0.12
Nodes (5): copy(), cs, parseObject(), sc, Vs

### Community 89 - "Spaced Curve Points"
Cohesion: 0.08
Nodes (10): ca, hh, li(), _o, os(), ps(), qc, wo (+2 more)

### Community 94 - "Help Popup UI"
Cohesion: 0.60
Nodes (3): hideHelpPopup(), openHelp(), toggleKpHelp()

### Community 95 - "tool-table.test.js"
Cohesion: 0.22
Nodes (4): assert, fs, source, vm

### Community 96 - "Klartext Syntax Highlighting"
Cohesion: 1.00
Nodes (3): _synEscHtml(), _synHighlightLine(), _synLineWithColor()

### Community 99 - "Bounding Box Object"
Cohesion: 0.18
Nodes (3): Al, parseGeometries(), parseShapes()

### Community 103 - "Keyboard Input Loop"
Cohesion: 0.83
Nodes (3): apply(), kick(), loop()

### Community 106 - "el"
Cohesion: 0.40
Nodes (5): Attempts and fix, C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour, Repro contour, Root cause, Symptom

### Community 108 - ".addVectors"
Cohesion: 0.50
Nodes (4): Attempts (all reverted — v0.812–v0.814, restored to `main`), Context, Mobile bottom tab bar behaviour with the on-screen keyboard (web), Resolution

### Community 109 - "C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour"
Cohesion: 0.50
Nodes (4): Attempts and accepted fixes, C18 — Heidenhain cycles, cutting logic and validator audit, Reproduced defects and root causes, Verification and remaining limits

### Community 110 - "Mobile bottom tab bar behaviour with the on-screen keyboard (web)"
Cohesion: 0.50
Nodes (4): Attempts and fix, C7 — 3D stock updates stalled during machining, Root cause, Symptom

### Community 111 - "Polygon Area Geometry"
Cohesion: 0.33
Nodes (5): Documentation budget, graphify, Non-negotiables, Start of every session, TNC Sim web

### Community 114 - "C6 — Measure panel overlapped the mobile BLKFORM control"
Cohesion: 0.50
Nodes (4): Attempts and fix, C6 — Measure panel overlapped the mobile BLKFORM control, Root cause, Symptom

### Community 117 - "C1 — Mobile editor focus/scroll jumping during value editing and Learn"
Cohesion: 0.50
Nodes (4): Attempts and fix, C1 — Mobile editor focus/scroll jumping during value editing and Learn, Root cause, Symptom

### Community 118 - "C11 — Learn (desktop): wasted slide space and hints revealed off-screen"
Cohesion: 0.50
Nodes (4): C11 — Learn (desktop): wasted slide space and hints revealed off-screen, Fix, Root cause, Symptom

### Community 119 - "hl"
Cohesion: 0.50
Nodes (4): Fix, Learn tab: dead near-black empty strip at the bottom (single-column layout), Root cause, Symptom

### Community 124 - "C14 — Revealed hints leaked into a newly opened lesson"
Cohesion: 0.67
Nodes (3): Attempt and fix, C14 — Revealed hints leaked into a newly opened lesson, Symptom and root cause

### Community 125 - "C12 — Light-theme 3D table grid was too dark"
Cohesion: 0.67
Nodes (3): Attempt and fix, C12 — Light-theme 3D table grid was too dark, Symptom and root cause

### Community 126 - "Ah"
Cohesion: 0.67
Nodes (3): Attempts and accepted fixes, C16 — Complete Learn correctness, content and visual audit, Symptom and root causes

### Community 127 - "Et"
Cohesion: 0.67
Nodes (3): Attempts and fix, C10 — Cycle 209 explicit zero values were ignored, Symptom and cause

### Community 128 - "C9 — Short drilling/tapping retracts appeared to teleport"
Cohesion: 0.67
Nodes (3): Attempts and fix, C9 — Short drilling/tapping retracts appeared to teleport, Symptom and cause

### Community 129 - "C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed"
Cohesion: 0.67
Nodes (3): Attempts and fix, C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed, Symptom and cause

### Community 130 - "C14 — Revealed hints leaked into a newly opened lesson"
Cohesion: 0.67
Nodes (3): C4 — Placement of a newly inserted block relative to the active line, Original expectation, Resolution note

### Community 131 - "C5 — Editor text passed behind mobile control panels"
Cohesion: 0.67
Nodes (3): C5 — Editor text passed behind mobile control panels, Root cause and fix, Symptom

### Community 132 - ".toJSON"
Cohesion: 0.33
Nodes (3): oc, Xn(), yn()

### Community 136 - "fo"
Cohesion: 0.22
Nodes (3): fo(), mo(), po

## Knowledge Gaps
- **254 isolated node(s):** `id`, `name`, `short_name`, `description`, `start_url` (+249 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `St` connect `3D Vector Math` to `Three.js Material Compilation`, `Raycaster Object Intersection`, `Interpolant Interval Sampling`, `Buffer Attribute UV Transform`, `Geometry Transform Setup`, `Buffer Attribute Array Copy`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `copy()` connect `Bone Matrix Update` to `WebGL Shader Variables`, `Three.js Material Compilation`, `Quaternion Math Operations`, `.toJSON`, `uc`, `Do`, `fo`, `hs`, `Buffer Attribute UV Transform`, `po`, `Skeleton Bone Binding`, `Curve Path Utilities`, `Color Parsing Utilities`, `Texture Loader Events`, `Object Constructor Copies`, `Frustum Plane Intersection`, `uo`, `Animation Action Crossfade`, `qo`, `Scene Object Quaternion`, `Physics Constraint Binding`, `Buffer Geometry Construction`, `Bounding Box Operations`, `Camera Projection Update`, `Scene Object Traversal`, `Geometric Projection Utils`, `Raycaster Object Intersection`, `Spherical Harmonics Lighting`, `Ray Geometry Intersection`, `PMREM Cubemap Processing`, `Quaternion Interpolation`, `JSON Scene Parser`, `Object JSON Serialization`, `Buffer Geometry Normals`, `Sphere Bounding Volume`, `Animation JSON Parsing`, `Camera World Raycasting`, `Bug Report UI`, `Instanced Mesh Skeleton`, `Curve Length Mapping`, `Asset Loader Parser`, `Raycaster Object Picking`, `World Transform Helpers`, `Animation Weight Blending`, `Line Geometry Index`, `Curve Segment JSON`, `Spaced Curve Points`, `Buffer Attribute Cache`, `Arc Curve JSON`, `Quadratic Bezier JSON`, `Object Clone Update`, `Bounding Box Object`, `.fromArray`, `Text Decode URL Base`, `bind`, `.setFromMatrixColumn`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `vt` connect `WebGL Shader Variables` to `Three.js Material Compilation`, `Audio Clock Input`, `fo`, `Color Parsing Utilities`, `Buffer Attribute UV Transform`, `Skeleton Bone Binding`, `Buffer Attribute Array Copy`, `Buffer Geometry Construction`, `Scene Object Traversal`, `Raycaster Object Intersection`, `Spherical Harmonics Lighting`, `JSON Scene Parser`, `eh`, `Sphere Bounding Volume`, `Camera World Raycasting`, `Keyframe Track Interpolation`, `Interpolant Interval Sampling`, `Raycaster Object Picking`, `Geometry Transform Setup`, `Line Geometry Index`, `Spaced Curve Points`, `Arc Curve JSON`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `id`, `name`, `short_name` to the rest of the system?**
  _254 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `WebGL Shader Variables` be split into smaller, more focused modules?**
  _Cohesion score 0.028703703703703703 - nodes in this community are weakly interconnected._
- **Should `Three.js Material Compilation` be split into smaller, more focused modules?**
  _Cohesion score 0.03305322128851541 - nodes in this community are weakly interconnected._
- **Should `Quaternion Math Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.0636734693877551 - nodes in this community are weakly interconnected._