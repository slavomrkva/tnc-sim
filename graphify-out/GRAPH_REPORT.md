# Graph Report - tnc-sim-web  (2026-07-16)

## Corpus Check
- 49 files · ~138,413 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2176 nodes · 4089 edges · 151 communities (90 shown, 61 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `af1a0b34`
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
- Bounding Box Scene Update
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
- Interpolant Interval Sampling
- App Input Handlers
- Quality Profile Tests
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
- .fromArray
- Keyboard Input Loop
- Layout Tab Helper
- Mobile Tab Switching
- el
- .applyQuaternion
- C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour
- Mobile bottom tab bar behaviour with the on-screen keyboard (web)
- Polygon Area Geometry
- Text Decode URL Base
- C6 — Measure panel overlapped the mobile BLKFORM control
- Service Worker Cache
- C1 — Mobile editor focus/scroll jumping during value editing and Learn
- C11 — Learn (desktop): wasted slide space and hints revealed off-screen
- hl
- bind
- .setFromMatrixColumn
- ds
- ge
- uc
- Ah
- Et
- ss
- hs
- C14 — Revealed hints leaked into a newly opened lesson
- C13 — Learn Hint did not scroll the desktop left panel fully down
- po
- qo
- rc
- C12 — Light-theme 3D table grid was too dark
- C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed
- C9 — Short drilling/tapping retracts appeared to teleport
- Rs
- C3 — RND/CHF occasionally inserted at the start of the program
- C4 — Placement of a newly inserted block relative to the active line
- C5 — Editor text passed behind mobile control panels
- C16 — Complete Learn correctness, content and visual audit
- uo
- po
- Zc
- zo
- .rotateX
- Do
- oc

## God Nodes (most connected - your core abstractions)
1. `vt` - 125 edges
2. `copy()` - 121 edges
3. `Lt` - 80 edges
4. `en` - 72 edges
5. `Wn` - 58 edges
6. `St` - 50 edges
7. `TNC Sim — Release notes` - 46 edges
8. `Ce` - 43 edges
9. `tn` - 43 edges
10. `ws()` - 42 edges

## Surprising Connections (you probably didn't know these)
- `buildKeypad()` --indirect_call--> `i()`  [INFERRED]
  core/field-editing.js → vendor/three.min.js
- `bugCopyReport()` --indirect_call--> `ta`  [INFERRED]
  core/bug-report.js → vendor/three.min.js

## Import Cycles
- None detected.

## Communities (151 total, 61 thin omitted)

### Community 0 - "WebGL Shader Variables"
Cohesion: 0.03
Nodes (23): ar(), cr(), dr(), fr(), gr(), hr(), ir(), kr() (+15 more)

### Community 1 - "Three.js Material Compilation"
Cohesion: 0.04
Nodes (33): Ba, $c(), ci, compileCubemapShader(), compileEquirectangularShader(), _compileMaterial(), Da, fh (+25 more)

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
Cohesion: 0.07
Nodes (6): dt(), $e(), Ke(), Qe(), tn, ut()

### Community 9 - "Voxel Chunk Tests"
Cohesion: 0.05
Nodes (22): appSource, assert, before, boundaryDirty, BufferAttribute, BufferGeometry, chunkTriangles, context (+14 more)

### Community 13 - "Curve Path Utilities"
Cohesion: 0.12
Nodes (5): gl, qn, _s(), _sceneToCubeUV(), updateMatrixWorld()

### Community 14 - "Tool Table Management"
Cohesion: 0.11
Nodes (28): buildToolIntoGroup(), calcToolTimes(), effectiveToolRadius(), field(), getToolByNum(), getToolColor3(), inferToolType(), insertToolDef() (+20 more)

### Community 16 - "Object Constructor Copies"
Cohesion: 0.10
Nodes (18): ao(), co(), eo(), ho(), io(), ja(), ka(), lo() (+10 more)

### Community 18 - "Field Editing UI"
Cohesion: 0.15
Nodes (26): applyFeedMode(), applySug(), buildKeypad(), _cancelMobileFocus(), enterFieldMode(), enterFieldModeOnLine(), exitFieldMode(), fieldNext() (+18 more)

### Community 20 - "Geometry Disable Toggle"
Cohesion: 0.07
Nodes (9): cn, dn, ec, fn, hn, jn(), on, pn (+1 more)

### Community 23 - "Physics Constraint Binding"
Cohesion: 0.10
Nodes (10): as(), cl, ds(), gi(), Jr(), mi(), qr(), setValue() (+2 more)

### Community 25 - "Buffer Geometry Construction"
Cohesion: 0.20
Nodes (3): br(), en, i()

### Community 27 - "Camera Projection Update"
Cohesion: 0.11
Nodes (4): Jl, Kn, vl(), Yl

### Community 29 - "CNC Parser Engine"
Cohesion: 0.16
Nodes (19): applyRadiusComp(), buildToolMesh(), _carryPhysicalXY(), checkRadiusVsTool(), evalQExpr(), expandLblLines(), offsetRun(), parseProgram() (+11 more)

### Community 30 - "Scene Object Traversal"
Cohesion: 0.10
Nodes (7): _a, bs, dispose(), Et, ft(), Tt, ws()

### Community 34 - "Raycaster Object Intersection"
Cohesion: 0.18
Nodes (3): Al, parseGeometries(), parseShapes()

### Community 37 - "Measure Tool UI"
Cohesion: 0.21
Nodes (11): addItem(), clearMeasure(), deleteMeasureItem(), handleMeasureClick(), makeLine(), makeSphere(), renderMeasureOverlay(), setMeasureMode() (+3 more)

### Community 39 - "Quaternion Interpolation"
Cohesion: 0.11
Nodes (4): bind(), getValue(), Ko, nc

### Community 40 - "JSON Scene Parser"
Cohesion: 0.15
Nodes (3): clone(), ts(), Wl

### Community 42 - "Object JSON Serialization"
Cohesion: 0.10
Nodes (4): ac, go, sc, tc

### Community 43 - "Buffer Geometry Normals"
Cohesion: 0.67
Nodes (3): Attempts and fix, C10 — Cycle 209 explicit zero values were ignored, Symptom and cause

### Community 44 - "Shadow Map Frustum"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, screenshots (+3 more)

### Community 46 - "Voxel Cutting Simulation"
Cohesion: 0.22
Nodes (12): advance(), placeTool(), segSpeed(), shouldHoldVisibleSegment(), vxBuildGeometryRange(), vxBuildMesh(), vxCut(), vxDisposeObject() (+4 more)

### Community 47 - "Animation JSON Parsing"
Cohesion: 0.22
Nodes (13): _allocateTargets(), _applyPMREM(), _blur(), _cleanup(), fromCubemap(), fromEquirectangular(), fromScene(), _fromTexture() (+5 more)

### Community 50 - "Block Form Panel"
Cohesion: 0.29
Nodes (10): blkCommitVal(), blkConfirmStep(), blkKeyDown(), blkNextStep(), blkSetShape(), blkStepRel(), blkUpdateVal(), insertBlkForm() (+2 more)

### Community 51 - "Bug Report UI"
Cohesion: 0.18
Nodes (3): _bugBuildText(), bugCopyReport(), ta

### Community 52 - "Instanced Mesh Skeleton"
Cohesion: 0.10
Nodes (6): bo, copy(), cs, parseObject(), Rs, Vs

### Community 53 - "Buffer Attribute Upload"
Cohesion: 0.06
Nodes (30): 10. Resize the 3D renderer from the render loop, not only on window 'resize', 11. Bug lifecycle: TODO.md while open (log every attempt), BUG_HISTORY.md when fixed, 12. Chunked Marching Cubes needs a one-cell dirty halo, 13. Cycle FAUTO feed and short retract visibility are separate concerns, 1. LBL runs where it is written (fall-through!), 2. Q-value fallbacks must treat 0 as valid, 3. Voxel cell size limits detail, 4. Layout breakpoint: single-column when width ≤1024px OR height ≤600px (+22 more)

### Community 54 - "XR Controller Session"
Cohesion: 0.11
Nodes (18): TNC Sim web — technical changelog, v0.846 — documentation damage control, v0.847 — light grid and Learn hint state, v0.848 — machining demo library, v0.849 — Learn correctness and accessibility audit, v0.850 — clearer compensation and Cycle 208 diagrams, v0.851 — complete Learn slide-image redesign, v0.852 — Learn diagram collision corrections (+10 more)

### Community 57 - "Curve Length Mapping"
Cohesion: 0.08
Nodes (5): bt, ct(), es(), qc, Xe()

### Community 58 - "Path Curve Points"
Cohesion: 0.04
Nodes (46): TNC Sim — Release notes, v0.801, v0.802, v0.803, v0.804, v0.806, v0.809, v0.810 (+38 more)

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
Cohesion: 0.18
Nodes (3): jo, wo, xo

### Community 69 - "App Input Handlers"
Cohesion: 0.27
Nodes (7): applyStockVisibility(), isCycleAnchor(), isLockedLine(), onMove(), onUp(), toggleStockVisibility(), updateStockToggle()

### Community 70 - "Quality Profile Tests"
Cohesion: 0.20
Nodes (9): app, assert, fs, index, parser, path, qualityButtons, root (+1 more)

### Community 72 - "Matrix World Update"
Cohesion: 0.50
Nodes (3): 3D renderer resizing, Layout and renderer rationale, Responsive breakpoint

### Community 73 - "Object Clone Serialize"
Cohesion: 0.18
Nodes (10): Attempts, Attempts, C17 — Tool Table CRUD, parameters and import/export audit, Open bugs, <short title> — <one-line symptom>, Status, Status, Symptom (+2 more)

### Community 74 - "World Transform Helpers"
Cohesion: 0.19
Nodes (4): an, Ea(), ln, mn

### Community 75 - "String Trim Utilities"
Cohesion: 0.20
Nodes (7): assert, chamfer, context, fs, path, root, vm

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

### Community 82 - "Geometry Transform Setup"
Cohesion: 0.21
Nodes (3): kl, ni, us()

### Community 83 - "Vector Normalize Scale"
Cohesion: 0.20
Nodes (9): assert, context, fs, path, precise, root, thread, tools (+1 more)

### Community 84 - "Cycle Picker UI"
Cohesion: 0.48
Nodes (6): closeCtxPanel(), closeCyclePicker(), openCyclePicker(), selectCycle(), showCycleList(), showCycleParams()

### Community 85 - "Bone Matrix Update"
Cohesion: 0.20
Nodes (3): ei, ps(), rt

### Community 89 - "Spaced Curve Points"
Cohesion: 0.16
Nodes (6): ca, li(), mo(), _o, os(), uh()

### Community 90 - "Buffer Attribute Cache"
Cohesion: 0.10
Nodes (12): constructor(), fi(), pi(), setDirection(), Si(), ti, update(), wh() (+4 more)

### Community 91 - "Arc Curve JSON"
Cohesion: 0.50
Nodes (4): bindSkeletons(), parse(), parseAnimations(), parseSkeletons()

### Community 92 - "Hi"
Cohesion: 0.20
Nodes (9): er(), Hi(), ji(), ki(), nr(), qi(), tr(), vi() (+1 more)

### Community 94 - "Help Popup UI"
Cohesion: 0.60
Nodes (3): hideHelpPopup(), openHelp(), toggleKpHelp()

### Community 95 - "tool-table.test.js"
Cohesion: 0.22
Nodes (4): assert, fs, source, vm

### Community 96 - "Klartext Syntax Highlighting"
Cohesion: 1.00
Nodes (3): _synEscHtml(), _synHighlightLine(), _synLineWithColor()

### Community 103 - "Keyboard Input Loop"
Cohesion: 0.83
Nodes (3): apply(), kick(), loop()

### Community 109 - "C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour"
Cohesion: 0.40
Nodes (5): Attempts and fix, C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour, Repro contour, Root cause, Symptom

### Community 110 - "Mobile bottom tab bar behaviour with the on-screen keyboard (web)"
Cohesion: 0.50
Nodes (4): Attempts (all reverted — v0.812–v0.814, restored to `main`), Context, Mobile bottom tab bar behaviour with the on-screen keyboard (web), Resolution

### Community 111 - "Polygon Area Geometry"
Cohesion: 0.33
Nodes (5): Documentation budget, graphify, Non-negotiables, Start of every session, TNC Sim web

### Community 113 - "Text Decode URL Base"
Cohesion: 0.50
Nodes (4): Attempts and fix, C7 — 3D stock updates stalled during machining, Root cause, Symptom

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

### Community 124 - "ge"
Cohesion: 0.14
Nodes (4): ge, mt(), sl, _t

### Community 130 - "C14 — Revealed hints leaked into a newly opened lesson"
Cohesion: 0.67
Nodes (3): Attempt and fix, C14 — Revealed hints leaked into a newly opened lesson, Symptom and root cause

### Community 131 - "C13 — Learn Hint did not scroll the desktop left panel fully down"
Cohesion: 0.67
Nodes (3): Attempt and fix, C13 — Learn Hint did not scroll the desktop left panel fully down, Symptom and root cause

### Community 135 - "C12 — Light-theme 3D table grid was too dark"
Cohesion: 0.67
Nodes (3): Attempt and fix, C12 — Light-theme 3D table grid was too dark, Symptom and root cause

### Community 136 - "C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed"
Cohesion: 0.40
Nodes (4): Attempts and fix, Bug history — resolved bugs & how they were fixed, C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed, Symptom and cause

### Community 137 - "C9 — Short drilling/tapping retracts appeared to teleport"
Cohesion: 0.67
Nodes (3): Attempts and fix, C9 — Short drilling/tapping retracts appeared to teleport, Symptom and cause

### Community 139 - "C3 — RND/CHF occasionally inserted at the start of the program"
Cohesion: 0.67
Nodes (3): C3 — RND/CHF occasionally inserted at the start of the program, Root cause and resolution, Symptom

### Community 140 - "C4 — Placement of a newly inserted block relative to the active line"
Cohesion: 0.67
Nodes (3): C4 — Placement of a newly inserted block relative to the active line, Original expectation, Resolution note

### Community 141 - "C5 — Editor text passed behind mobile control panels"
Cohesion: 0.67
Nodes (3): C5 — Editor text passed behind mobile control panels, Root cause and fix, Symptom

### Community 142 - "C16 — Complete Learn correctness, content and visual audit"
Cohesion: 0.67
Nodes (3): Attempts and accepted fixes, C16 — Complete Learn correctness, content and visual audit, Symptom and root causes

## Knowledge Gaps
- **231 isolated node(s):** `id`, `name`, `short_name`, `description`, `start_url` (+226 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **61 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `copy()` connect `Instanced Mesh Skeleton` to `Three.js Material Compilation`, `Quaternion Math Operations`, `hs`, `Color Parsing Utilities`, `Buffer Attribute UV Transform`, `Skeleton Bone Binding`, `Vector3 Math Operations`, `Curve Path Utilities`, `Texture Loader Events`, `po`, `Frustum Plane Intersection`, `Object Constructor Copies`, `uo`, `Do`, `Geometry Disable Toggle`, `Scene Object Quaternion`, `Physics Constraint Binding`, `Buffer Attribute Array Copy`, `Buffer Geometry Construction`, `Bounding Box Operations`, `Camera Projection Update`, `Animation Memory Manager`, `Scene Object Traversal`, `Box3 Intersection Utils`, `2D Path Drawing`, `Geometric Projection Utils`, `Raycaster Object Intersection`, `Ray Geometry Intersection`, `Quaternion Interpolation`, `JSON Scene Parser`, `Bounding Box Scene Update`, `Object JSON Serialization`, `Sphere Bounding Volume`, `Camera World Raycasting`, `Bug Report UI`, `Instanced Geometry Parsing`, `Curve Length Mapping`, `Asset Loader Parser`, `World Transform Helpers`, `Animation Weight Blending`, `Line Segment Distance`, `Geometry Transform Setup`, `Line Geometry Index`, `Curve Segment JSON`, `Curve Tangent JSON`, `Buffer Attribute Cache`, `Quadratic Bezier JSON`, `zo`, `Object Clone Update`, `Bounding Box Object`, `el`, `.applyQuaternion`, `.setFromMatrixColumn`, `ge`, `Et`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `Ce` connect `Scene Object Quaternion` to `2D Path Drawing`, `Three.js Material Compilation`, `Quaternion Math Operations`, `JSON Scene Parser`, `Object JSON Serialization`, `Curve Path Utilities`, `Instanced Mesh Skeleton`, `Arc Curve JSON`, `Scene Object Traversal`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `nc` connect `Quaternion Interpolation` to `Three.js Material Compilation`, `Raycaster Object Intersection`, `sc`, `Physics Constraint Binding`, `Animation Memory Manager`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `id`, `name`, `short_name` to the rest of the system?**
  _231 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `WebGL Shader Variables` be split into smaller, more focused modules?**
  _Cohesion score 0.03028972783143108 - nodes in this community are weakly interconnected._
- **Should `Three.js Material Compilation` be split into smaller, more focused modules?**
  _Cohesion score 0.03653846153846154 - nodes in this community are weakly interconnected._
- **Should `Quaternion Math Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.06753006475485661 - nodes in this community are weakly interconnected._