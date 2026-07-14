# Graph Report - .  (2026-07-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1915 nodes · 3814 edges · 121 communities (61 shown, 60 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.52)
- Token cost: 5,333 input · 942 output

## Graph Freshness
- Built from commit: `0def2872`
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
- Raycaster Object Picking
- Matrix World Update
- Object Clone Serialize
- World Transform Helpers
- String Trim Utilities
- Shape Extraction Points
- M-Code Panel UI
- Q-Parameter Panel UI
- Line Segment Distance
- Toolpath Parser Tests
- Geometry Transform Setup
- Cycle Picker UI
- Bone Matrix Update
- Line Geometry Index
- Curve Segment JSON
- Curve Tangent JSON
- Spaced Curve Points
- Buffer Attribute Cache
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
- `buildKeypad()` --indirect_call--> `i()`  [INFERRED]
  core/field-editing.js → vendor/three.min.js
- `bugCopyReport()` --indirect_call--> `ta`  [INFERRED]
  core/bug-report.js → vendor/three.min.js

## Import Cycles
- None detected.

## Communities (121 total, 60 thin omitted)

### Community 0 - "WebGL Shader Variables"
Cohesion: 0.03
Nodes (24): ar(), cr(), dr(), fr(), gr(), hr(), ir(), kr() (+16 more)

### Community 1 - "Three.js Material Compilation"
Cohesion: 0.04
Nodes (30): Ba, ci, compileCubemapShader(), compileEquirectangularShader(), _compileMaterial(), Da, fh, fs (+22 more)

### Community 3 - "Code Editor Core"
Cohesion: 0.07
Nodes (33): _applyEditorFs(), applyFix(), computeBlockNumbers(), deleteCurrentLine(), deleteLineN(), _downloadTextFile(), editorClear(), _editorConfirm() (+25 more)

### Community 5 - "Matrix Transform Operations"
Cohesion: 0.05
Nodes (3): as(), se, Yl

### Community 6 - "Learn Tutorial Flow"
Cohesion: 0.09
Nodes (22): closeLearn(), learnBackToList(), learnCheck(), _learnEndEditorInput(), learnEvalChecks(), learnExit(), learnFinishIntro(), learnFinishLesson() (+14 more)

### Community 7 - "Audio Clock Input"
Cohesion: 0.07
Nodes (5): bc, getInput(), getOutput(), ic, Lc

### Community 8 - "Color Parsing Utilities"
Cohesion: 0.07
Nodes (5): dt(), $e(), Qe(), tn, ut()

### Community 9 - "Voxel Chunk Tests"
Cohesion: 0.05
Nodes (22): appSource, assert, before, boundaryDirty, BufferAttribute, BufferGeometry, chunkTriangles, context (+14 more)

### Community 11 - "Skeleton Bone Binding"
Cohesion: 0.07
Nodes (4): bind(), getValue(), jc, vc

### Community 13 - "Curve Path Utilities"
Cohesion: 0.07
Nodes (10): bo, copy(), cs, Do, hs, parseObject(), Rs, uo() (+2 more)

### Community 14 - "Tool Table Management"
Cohesion: 0.11
Nodes (18): buildToolIntoGroup(), calcToolTimes(), field(), getToolByNum(), getToolColor3(), inferToolType(), onToolImportFile(), renderToolForm() (+10 more)

### Community 15 - "Texture Loader Events"
Cohesion: 0.15
Nodes (10): br(), ei, fi(), i(), rt, update(), wi(), Xn() (+2 more)

### Community 16 - "Object Constructor Copies"
Cohesion: 0.11
Nodes (18): ao(), co(), eo(), ho(), io(), ja(), ka(), lo() (+10 more)

### Community 18 - "Field Editing UI"
Cohesion: 0.15
Nodes (25): applySug(), buildKeypad(), _cancelMobileFocus(), enterFieldMode(), enterFieldModeOnLine(), exitFieldMode(), fieldNext(), fieldPrev() (+17 more)

### Community 23 - "Physics Constraint Binding"
Cohesion: 0.08
Nodes (9): cn, dn, fn, hn, jn(), on, pn, _s() (+1 more)

### Community 27 - "Camera Projection Update"
Cohesion: 0.12
Nodes (3): Jl, Kn, vl()

### Community 29 - "CNC Parser Engine"
Cohesion: 0.16
Nodes (18): applyRadiusComp(), buildToolMesh(), _carryPhysicalXY(), checkRadiusVsTool(), evalQExpr(), expandLblLines(), offsetRun(), parseProgram() (+10 more)

### Community 30 - "Scene Object Traversal"
Cohesion: 0.10
Nodes (7): _a, bs, dispose(), Et, ft(), Tt, ws()

### Community 32 - "2D Path Drawing"
Cohesion: 0.13
Nodes (3): bl, dc, mc()

### Community 34 - "Raycaster Object Intersection"
Cohesion: 0.17
Nodes (4): an, Ea(), ln, mn

### Community 37 - "Measure Tool UI"
Cohesion: 0.21
Nodes (11): addItem(), clearMeasure(), deleteMeasureItem(), handleMeasureClick(), makeLine(), makeSphere(), renderMeasureOverlay(), setMeasureMode() (+3 more)

### Community 38 - "PMREM Cubemap Processing"
Cohesion: 0.16
Nodes (15): _allocateTargets(), _applyPMREM(), _blur(), _cleanup(), fromCubemap(), fromEquirectangular(), fromScene(), _fromTexture() (+7 more)

### Community 40 - "JSON Scene Parser"
Cohesion: 0.14
Nodes (7): bindSkeletons(), el, parse(), parseAnimations(), parseGeometries(), parseShapes(), parseSkeletons()

### Community 42 - "Object JSON Serialization"
Cohesion: 0.13
Nodes (3): ac, go, tc

### Community 43 - "Buffer Geometry Normals"
Cohesion: 0.19
Nodes (3): en, pi(), ti

### Community 44 - "Shadow Map Frustum"
Cohesion: 0.16
Nodes (4): gl, kl, ni, us()

### Community 46 - "Voxel Cutting Simulation"
Cohesion: 0.23
Nodes (11): advance(), placeTool(), segSpeed(), vxBuildGeometryRange(), vxBuildMesh(), vxCut(), vxDisposeObject(), vxInit() (+3 more)

### Community 47 - "Animation JSON Parsing"
Cohesion: 0.15
Nodes (7): ca, li(), mo(), _o, os(), ps(), uh()

### Community 48 - "Camera World Raycasting"
Cohesion: 0.18
Nodes (3): setFromCamera(), wh(), xs

### Community 50 - "Block Form Panel"
Cohesion: 0.29
Nodes (10): blkCommitVal(), blkConfirmStep(), blkKeyDown(), blkNextStep(), blkSetShape(), blkStepRel(), blkUpdateVal(), insertBlkForm() (+2 more)

### Community 51 - "Bug Report UI"
Cohesion: 0.16
Nodes (3): _bugBuildText(), bugCopyReport(), ta

### Community 53 - "Buffer Attribute Upload"
Cohesion: 0.18
Nodes (3): ct(), es(), Xe()

### Community 55 - "Shape Curve Parameters"
Cohesion: 0.13
Nodes (9): cl, ds(), gi(), Jr(), mi(), qr(), setValue(), Wn (+1 more)

### Community 59 - "Asset Loader Parser"
Cohesion: 0.15
Nodes (4): ol, parseImages(), setTexturePath(), ul

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
Cohesion: 0.18
Nodes (3): jo, wo, xo

### Community 69 - "App Input Handlers"
Cohesion: 0.27
Nodes (7): applyStockVisibility(), isCycleAnchor(), isLockedLine(), onMove(), onUp(), toggleStockVisibility(), updateStockToggle()

### Community 70 - "Quality Profile Tests"
Cohesion: 0.20
Nodes (9): app, assert, fs, index, parser, path, qualityButtons, root (+1 more)

### Community 71 - "Raycaster Object Picking"
Cohesion: 0.22
Nodes (7): $c(), intersectObject(), intersectObjects(), Kc(), mt(), sl, _t

### Community 75 - "String Trim Utilities"
Cohesion: 0.20
Nodes (9): er(), Hi(), ji(), ki(), nr(), qi(), tr(), vi() (+1 more)

### Community 77 - "M-Code Panel UI"
Cohesion: 0.42
Nodes (7): _mCommit(), _mDescFor(), _mManualDescUpdate(), _mPanelConfirm(), openMPanel(), openMPanelEdit(), _replaceMOnLine()

### Community 78 - "Q-Parameter Panel UI"
Cohesion: 0.36
Nodes (6): closeQPopup(), openQParamPanel(), openQPopup(), qPanelConfirm(), qPanelSetVal(), renderQParamPanel()

### Community 81 - "Toolpath Parser Tests"
Cohesion: 0.25
Nodes (6): assert, context, fs, path, source, vm

### Community 84 - "Cycle Picker UI"
Cohesion: 0.48
Nodes (6): closeCtxPanel(), closeCyclePicker(), openCyclePicker(), selectCycle(), showCycleList(), showCycleParams()

### Community 94 - "Help Popup UI"
Cohesion: 0.60
Nodes (3): hideHelpPopup(), openHelp(), toggleKpHelp()

### Community 96 - "Klartext Syntax Highlighting"
Cohesion: 1.00
Nodes (3): _synEscHtml(), _synHighlightLine(), _synLineWithColor()

### Community 103 - "Keyboard Input Loop"
Cohesion: 0.83
Nodes (3): apply(), kick(), loop()

## Knowledge Gaps
- **51 isolated node(s):** `id`, `name`, `short_name`, `description`, `start_url` (+46 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `copy()` connect `Curve Path Utilities` to `Three.js Material Compilation`, `Quaternion Math Operations`, `Matrix Transform Operations`, `Color Parsing Utilities`, `Skeleton Bone Binding`, `Texture Loader Events`, `Object Constructor Copies`, `Frustum Plane Intersection`, `Geometry Disable Toggle`, `Buffer Attribute Array Copy`, `Scene Object Quaternion`, `Physics Constraint Binding`, `Buffer Geometry Construction`, `Bounding Box Operations`, `Camera Projection Update`, `Scene Object Traversal`, `Box3 Intersection Utils`, `2D Path Drawing`, `Geometric Projection Utils`, `Raycaster Object Intersection`, `Spherical Harmonics Lighting`, `Ray Geometry Intersection`, `PMREM Cubemap Processing`, `Quaternion Interpolation`, `JSON Scene Parser`, `Bounding Box Scene Update`, `Object JSON Serialization`, `Buffer Geometry Normals`, `Shadow Map Frustum`, `Sphere Bounding Volume`, `Camera World Raycasting`, `Bug Report UI`, `Instanced Mesh Skeleton`, `Shape Curve Parameters`, `Instanced Geometry Parsing`, `Curve Length Mapping`, `Matrix World Update`, `Object Clone Serialize`, `World Transform Helpers`, `Shape Extraction Points`, `Line Segment Distance`, `Bone Matrix Update`, `Line Geometry Index`, `Curve Segment JSON`, `Curve Tangent JSON`, `Spaced Curve Points`, `Arc Curve JSON`, `Cubic Bezier JSON`, `Quadratic Bezier JSON`, `Object Clone JSON`, `Object Clone Update`, `Copy Constructor Object`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `vt` connect `WebGL Shader Variables` to `Three.js Material Compilation`, `Matrix Transform Operations`, `Audio Clock Input`, `Color Parsing Utilities`, `Buffer Attribute UV Transform`, `Skeleton Bone Binding`, `Texture Loader Events`, `Geometry Disable Toggle`, `Scene Object Traversal`, `Geometric Projection Utils`, `Bounding Box Scene Update`, `Shadow Map Frustum`, `Sphere Bounding Volume`, `Animation JSON Parsing`, `Instanced Mesh Skeleton`, `Shape Curve Parameters`, `Path Curve Points`, `HTTP Asset Loader`, `Object Clone Serialize`, `String Trim Utilities`, `Vector Normalize Scale`, `Buffer Attribute Cache`, `Object Clone Update`, `Options Loader Configuration`, `Scale Parse Utility`, `Copy Constructor Object`, `Load Constructor Helper`, `Text Decode URL Base`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `At` connect `Quaternion Math Operations` to `Three.js Material Compilation`, `Quaternion Interpolation`, `Buffer Attribute UV Transform`, `Scene Object Quaternion`, `Scene Object Traversal`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `id`, `name`, `short_name` to the rest of the system?**
  _51 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `WebGL Shader Variables` be split into smaller, more focused modules?**
  _Cohesion score 0.0289738430583501 - nodes in this community are weakly interconnected._
- **Should `Three.js Material Compilation` be split into smaller, more focused modules?**
  _Cohesion score 0.03648863035430989 - nodes in this community are weakly interconnected._
- **Should `Quaternion Math Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.06560283687943262 - nodes in this community are weakly interconnected._