# Graph Report - tnc-sim-web  (2026-07-14)

## Corpus Check
- 42 files · ~125,932 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2044 nodes · 3936 edges · 135 communities (75 shown, 60 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6c718b99`
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
- Raycaster Object Picking
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
- Cycle Picker UI
- Line Geometry Index
- Curve Segment JSON
- Curve Tangent JSON
- Spaced Curve Points
- Arc Curve JSON
- Cubic Bezier JSON
- Quadratic Bezier JSON
- Help Popup UI
- Object Clone JSON
- Klartext Syntax Highlighting
- Theme Toggle UI
- Object Clone Update
- Bounding Box Object
- Matrix Clone Serialization
- Scene Clone Serialization
- Options Loader Configuration
- Keyboard Input Loop
- Layout Tab Helper
- Mobile Tab Switching
- Disposable Constructor
- Scale Parse Utility
- Copy Constructor Object
- Load Constructor Helper
- Polygon Area Geometry
- Interpolation Constructor
- Text Decode URL Base
- Clone Constructor Object
- Service Worker Cache
- .updateMatrices
- TNC Sim
- ds
- .fromArray
- .findNode
- TNC Sim web
- bind
- .setCrossOrigin
- Layout and renderer rationale
- Do
- Rs
- uo

## God Nodes (most connected - your core abstractions)
1. `vt` - 125 edges
2. `copy()` - 121 edges
3. `Lt` - 80 edges
4. `en` - 72 edges
5. `Wn` - 58 edges
6. `St` - 50 edges
7. `Ce` - 43 edges
8. `tn` - 43 edges
9. `ws()` - 42 edges
10. `se` - 38 edges

## Surprising Connections (you probably didn't know these)
- `bugCopyReport()` --indirect_call--> `ta`  [INFERRED]
  core/bug-report.js → vendor/three.min.js
- `buildKeypad()` --indirect_call--> `i()`  [INFERRED]
  core/field-editing.js → vendor/three.min.js

## Import Cycles
- None detected.

## Communities (135 total, 60 thin omitted)

### Community 0 - "WebGL Shader Variables"
Cohesion: 0.03
Nodes (24): ar(), cr(), dr(), fr(), gr(), hr(), ir(), kr() (+16 more)

### Community 1 - "Three.js Material Compilation"
Cohesion: 0.04
Nodes (27): Ba, bo, ci, compileCubemapShader(), compileEquirectangularShader(), _compileMaterial(), Da, fh (+19 more)

### Community 2 - "Quaternion Math Operations"
Cohesion: 0.06
Nodes (5): At, fe, ht(), setFromCartesianCoords(), setFromVector3()

### Community 3 - "Code Editor Core"
Cohesion: 0.07
Nodes (33): _applyEditorFs(), applyFix(), computeBlockNumbers(), deleteCurrentLine(), deleteLineN(), _downloadTextFile(), editorClear(), _editorConfirm() (+25 more)

### Community 6 - "Learn Tutorial Flow"
Cohesion: 0.09
Nodes (22): closeLearn(), learnBackToList(), learnCheck(), _learnEndEditorInput(), learnEvalChecks(), learnExit(), learnFinishIntro(), learnFinishLesson() (+14 more)

### Community 7 - "Audio Clock Input"
Cohesion: 0.08
Nodes (5): bc, getInput(), getOutput(), ic, Lc

### Community 8 - "Color Parsing Utilities"
Cohesion: 0.07
Nodes (6): dt(), $e(), Ke(), Qe(), tn, ut()

### Community 9 - "Voxel Chunk Tests"
Cohesion: 0.05
Nodes (22): appSource, assert, before, boundaryDirty, BufferAttribute, BufferGeometry, chunkTriangles, context (+14 more)

### Community 13 - "Curve Path Utilities"
Cohesion: 0.13
Nodes (5): copy(), cs, hs, Vs, zo

### Community 14 - "Tool Table Management"
Cohesion: 0.11
Nodes (18): buildToolIntoGroup(), calcToolTimes(), field(), getToolByNum(), getToolColor3(), inferToolType(), onToolImportFile(), renderToolForm() (+10 more)

### Community 15 - "Texture Loader Events"
Cohesion: 0.13
Nodes (8): br(), ei, gi(), i(), mi(), rt, Wn, yi()

### Community 16 - "Object Constructor Copies"
Cohesion: 0.11
Nodes (18): ao(), co(), eo(), ho(), io(), ja(), ka(), lo() (+10 more)

### Community 18 - "Field Editing UI"
Cohesion: 0.15
Nodes (25): applySug(), buildKeypad(), _cancelMobileFocus(), enterFieldMode(), enterFieldModeOnLine(), exitFieldMode(), fieldNext(), fieldPrev() (+17 more)

### Community 23 - "Physics Constraint Binding"
Cohesion: 0.11
Nodes (8): cn, dn, fn, hn, jn(), on, pn, un

### Community 29 - "CNC Parser Engine"
Cohesion: 0.16
Nodes (18): applyRadiusComp(), buildToolMesh(), _carryPhysicalXY(), checkRadiusVsTool(), evalQExpr(), expandLblLines(), offsetRun(), parseProgram() (+10 more)

### Community 30 - "Scene Object Traversal"
Cohesion: 0.10
Nodes (7): _a, bs, dispose(), Et, ft(), Tt, ws()

### Community 33 - "Geometric Projection Utils"
Cohesion: 0.15
Nodes (3): as(), Ll, setFromCamera()

### Community 34 - "Raycaster Object Intersection"
Cohesion: 0.19
Nodes (4): an, Ea(), ln, mn

### Community 37 - "Measure Tool UI"
Cohesion: 0.21
Nodes (11): addItem(), clearMeasure(), deleteMeasureItem(), handleMeasureClick(), makeLine(), makeSphere(), renderMeasureOverlay(), setMeasureMode() (+3 more)

### Community 38 - "PMREM Cubemap Processing"
Cohesion: 0.22
Nodes (13): _allocateTargets(), _applyPMREM(), _blur(), _cleanup(), fromCubemap(), fromEquirectangular(), fromScene(), _fromTexture() (+5 more)

### Community 42 - "Object JSON Serialization"
Cohesion: 0.12
Nodes (3): ac, go, tc

### Community 43 - "Buffer Geometry Normals"
Cohesion: 0.06
Nodes (35): Attempts (all reverted — v0.812–v0.814, restored to `main`), Attempts and fix, Attempts and fix, Attempts and fix, Attempts and fix, Bug history — resolved bugs & how they were fixed, C1 — Mobile editor focus/scroll jumping during value editing and Learn, C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour (+27 more)

### Community 44 - "Shadow Map Frustum"
Cohesion: 0.18
Nodes (3): kl, ni, us()

### Community 46 - "Voxel Cutting Simulation"
Cohesion: 0.22
Nodes (12): advance(), placeTool(), segSpeed(), shouldHoldVisibleSegment(), vxBuildGeometryRange(), vxBuildMesh(), vxCut(), vxDisposeObject() (+4 more)

### Community 47 - "Animation JSON Parsing"
Cohesion: 0.17
Nodes (7): ca, Jr(), li(), _o, os(), qr(), uh()

### Community 50 - "Block Form Panel"
Cohesion: 0.29
Nodes (10): blkCommitVal(), blkConfirmStep(), blkKeyDown(), blkNextStep(), blkSetShape(), blkStepRel(), blkUpdateVal(), insertBlkForm() (+2 more)

### Community 53 - "Buffer Attribute Upload"
Cohesion: 0.05
Nodes (7): bt, ct(), es(), qc, ts(), Xe(), ys

### Community 54 - "XR Controller Session"
Cohesion: 0.08
Nodes (25): 10. Resize the 3D renderer from the render loop, not only on window 'resize', 11. Bug lifecycle: TODO.md while open (log every attempt), BUG_HISTORY.md when fixed, 12. Chunked Marching Cubes needs a one-cell dirty halo, 13. Cycle FAUTO feed and short retract visibility are separate concerns, 1. LBL runs where it is written (fall-through!), 2. Q-value fallbacks must treat 0 as valid, 3. Voxel cell size limits detail, 4. Layout breakpoint: single-column when width ≤1024px OR height ≤600px (+17 more)

### Community 55 - "Shape Curve Parameters"
Cohesion: 0.14
Nodes (4): cl, _sceneToCubeUV(), Si(), ti

### Community 57 - "Curve Length Mapping"
Cohesion: 0.06
Nodes (5): clone(), ml, nl, Wl, zl

### Community 58 - "Path Curve Points"
Cohesion: 0.10
Nodes (19): TNC Sim — Release notes, v0.801, v0.802, v0.803, v0.804, v0.806, v0.809, v0.810 (+11 more)

### Community 60 - "3D Render Scene"
Cohesion: 0.30
Nodes (11): _applyRefinedMesh(), buildScene(), hide3DError(), _hideRefineIndicator(), init3D(), _runRefineMainThread(), _scene3dBgColor(), show3DError() (+3 more)

### Community 61 - "2D View Controls"
Cohesion: 0.27
Nodes (7): draw2dFull(), onResize(), resize2d(), resizeToDisplay(), sc2d(), switchView(), tf2d()

### Community 62 - "PWA Manifest Config"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, screenshots (+3 more)

### Community 65 - "Coach Mark Tutorial"
Cohesion: 0.40
Nodes (10): _coachMarkSeen(), _coachPaint(), _coachSeen(), _coachTarget(), learnCoachEnd(), learnCoachMaybeStart(), learnCoachNext(), learnCoachPrev() (+2 more)

### Community 66 - "Simulation Controls UI"
Cohesion: 0.25
Nodes (5): ensurePrepared(), onReset(), onRun(), onStep(), prepare()

### Community 67 - "Radius Compensation Tests"
Cohesion: 0.24
Nodes (10): assert, context, fs, near(), path, point(), segment(), source (+2 more)

### Community 68 - "Interpolant Interval Sampling"
Cohesion: 0.13
Nodes (3): jo, wo, xo

### Community 69 - "App Input Handlers"
Cohesion: 0.27
Nodes (7): applyStockVisibility(), isCycleAnchor(), isLockedLine(), onMove(), onUp(), toggleStockVisibility(), updateStockToggle()

### Community 70 - "Quality Profile Tests"
Cohesion: 0.20
Nodes (9): app, assert, fs, index, parser, path, qualityButtons, root (+1 more)

### Community 71 - "Raycaster Object Picking"
Cohesion: 0.12
Nodes (8): $c(), ge, intersectObject(), intersectObjects(), Kc(), mt(), sl, _t

### Community 73 - "Object Clone Serialize"
Cohesion: 0.13
Nodes (14): Attempts, Attempts, Attempts, C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed, C9 — Short drilling/tapping retracts appear to teleport, Open bugs, <short title> — <one-line symptom>, Status (+6 more)

### Community 74 - "World Transform Helpers"
Cohesion: 0.23
Nodes (3): hh, _s(), updateMatrixWorld()

### Community 75 - "String Trim Utilities"
Cohesion: 0.20
Nodes (9): er(), Hi(), ji(), ki(), nr(), qi(), tr(), vi() (+1 more)

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
Cohesion: 0.14
Nodes (8): constructor(), fi(), pi(), update(), wh(), wi(), Xn(), yn()

### Community 84 - "Cycle Picker UI"
Cohesion: 0.48
Nodes (6): closeCtxPanel(), closeCyclePicker(), openCyclePicker(), selectCycle(), showCycleList(), showCycleParams()

### Community 86 - "Line Geometry Index"
Cohesion: 0.18
Nodes (3): fa, Ga, ta

### Community 89 - "Spaced Curve Points"
Cohesion: 0.20
Nodes (3): parseGeometries(), parseShapes(), Rl

### Community 94 - "Help Popup UI"
Cohesion: 0.60
Nodes (3): hideHelpPopup(), openHelp(), toggleKpHelp()

### Community 96 - "Klartext Syntax Highlighting"
Cohesion: 1.00
Nodes (3): _synEscHtml(), _synHighlightLine(), _synLineWithColor()

### Community 103 - "Keyboard Input Loop"
Cohesion: 0.83
Nodes (3): apply(), kick(), loop()

### Community 107 - "Scale Parse Utility"
Cohesion: 0.29
Nodes (5): bindSkeletons(), il(), parse(), parseAnimations(), parseSkeletons()

### Community 122 - "TNC Sim"
Cohesion: 0.25
Nodes (7): Disclaimer, Found a bug?, License, Running locally, Status, TNC Sim, What it does

### Community 123 - "ds"
Cohesion: 0.25
Nodes (3): ds(), pc, ps()

### Community 128 - "TNC Sim web"
Cohesion: 0.40
Nodes (4): graphify, Non-negotiables, Start of every session, TNC Sim web

### Community 129 - "bind"
Cohesion: 0.50
Nodes (3): bind(), getValue(), setValue()

### Community 131 - "Layout and renderer rationale"
Cohesion: 0.50
Nodes (3): 3D renderer resizing, Layout and renderer rationale, Responsive breakpoint

## Knowledge Gaps
- **148 isolated node(s):** `id`, `name`, `short_name`, `description`, `start_url` (+143 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vt` connect `WebGL Shader Variables` to `Three.js Material Compilation`, `Audio Clock Input`, `Color Parsing Utilities`, `Buffer Attribute UV Transform`, `Skeleton Bone Binding`, `Texture Loader Events`, `Buffer Geometry Construction`, `Scene Object Traversal`, `Geometric Projection Utils`, `Bounding Box Scene Update`, `Shadow Map Frustum`, `Sphere Bounding Volume`, `Animation JSON Parsing`, `Instanced Mesh Skeleton`, `Buffer Attribute Upload`, `Shape Curve Parameters`, `Instanced Geometry Parsing`, `Curve Length Mapping`, `HTTP Asset Loader`, `Matrix World Update`, `String Trim Utilities`, `Animation Weight Blending`, `Geometry Transform Setup`, `Vector Normalize Scale`, `Object Clone Update`, `Options Loader Configuration`, `Scale Parse Utility`, `Copy Constructor Object`, `Load Constructor Helper`, `Polygon Area Geometry`, `Text Decode URL Base`, `ds`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `copy()` connect `Curve Path Utilities` to `Three.js Material Compilation`, `Quaternion Math Operations`, `Do`, `Rs`, `Matrix Transform Operations`, `uo`, `Color Parsing Utilities`, `Skeleton Bone Binding`, `Texture Loader Events`, `Object Constructor Copies`, `Frustum Plane Intersection`, `Geometry Disable Toggle`, `Buffer Attribute Array Copy`, `Scene Object Quaternion`, `Physics Constraint Binding`, `Buffer Geometry Construction`, `Bounding Box Operations`, `Camera Projection Update`, `Scene Object Traversal`, `Box3 Intersection Utils`, `Geometric Projection Utils`, `Raycaster Object Intersection`, `Spherical Harmonics Lighting`, `Ray Geometry Intersection`, `Quaternion Interpolation`, `JSON Scene Parser`, `Bounding Box Scene Update`, `Object JSON Serialization`, `Shadow Map Frustum`, `Sphere Bounding Volume`, `Camera World Raycasting`, `Instanced Mesh Skeleton`, `Buffer Attribute Upload`, `Shape Curve Parameters`, `Instanced Geometry Parsing`, `Curve Length Mapping`, `Matrix World Update`, `World Transform Helpers`, `Line Segment Distance`, `Geometry Transform Setup`, `Bone Matrix Update`, `Line Geometry Index`, `Curve Segment JSON`, `Curve Tangent JSON`, `Spaced Curve Points`, `Arc Curve JSON`, `Cubic Bezier JSON`, `Quadratic Bezier JSON`, `Object Clone JSON`, `Object Clone Update`, `Copy Constructor Object`, `.updateMatrices`, `ds`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `St` connect `3D Vector Math` to `Three.js Material Compilation`, `Geometric Projection Utils`, `Matrix World Update`, `Bounding Box Scene Update`, `Buffer Attribute UV Transform`, `Vector Normalize Scale`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `id`, `name`, `short_name` to the rest of the system?**
  _148 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `WebGL Shader Variables` be split into smaller, more focused modules?**
  _Cohesion score 0.029399585921325053 - nodes in this community are weakly interconnected._
- **Should `Three.js Material Compilation` be split into smaller, more focused modules?**
  _Cohesion score 0.03798947983635301 - nodes in this community are weakly interconnected._
- **Should `Quaternion Math Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.06475485661424607 - nodes in this community are weakly interconnected._