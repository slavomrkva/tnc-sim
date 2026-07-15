# Graph Report - tnc-sim-web-light-debug  (2026-07-15)

## Corpus Check
- 45 files · ~130,766 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2089 nodes · 3988 edges · 125 communities (74 shown, 51 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ad06a2c4`
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
- Animation Weight Blending
- Line Segment Distance
- Toolpath Parser Tests
- Geometry Transform Setup
- Vector Normalize Scale
- Cycle Picker UI
- Line Geometry Index
- Curve Segment JSON
- Curve Tangent JSON
- Buffer Attribute Cache
- Arc Curve JSON
- Help Popup UI
- Object Clone JSON
- Klartext Syntax Highlighting
- Theme Toggle UI
- Object Clone Update
- Scene Clone Serialization
- Keyboard Input Loop
- Layout Tab Helper
- Mobile Tab Switching
- Disposable Constructor
- Copy Constructor Object
- Polygon Area Geometry
- Interpolation Constructor
- Text Decode URL Base
- Service Worker Cache
- hl
- .updateMatrices
- ds
- .equals
- TNC Sim web
- Do
- Rs
- uo
- .clear
- zo

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

## Communities (125 total, 51 thin omitted)

### Community 0 - "WebGL Shader Variables"
Cohesion: 0.03
Nodes (22): ar(), br(), cr(), dr(), fr(), gr(), hr(), ir() (+14 more)

### Community 1 - "Three.js Material Compilation"
Cohesion: 0.04
Nodes (25): Ba, ci, Da, er(), fs, gn(), gs, Hi() (+17 more)

### Community 2 - "Quaternion Math Operations"
Cohesion: 0.06
Nodes (3): At, fe, ps()

### Community 3 - "Code Editor Core"
Cohesion: 0.07
Nodes (33): _applyEditorFs(), applyFix(), computeBlockNumbers(), deleteCurrentLine(), deleteLineN(), _downloadTextFile(), editorClear(), _editorConfirm() (+25 more)

### Community 6 - "Learn Tutorial Flow"
Cohesion: 0.09
Nodes (22): closeLearn(), learnBackToList(), learnCheck(), _learnEndEditorInput(), learnEvalChecks(), learnExit(), learnFinishIntro(), learnFinishLesson() (+14 more)

### Community 7 - "Audio Clock Input"
Cohesion: 0.07
Nodes (5): bc, getInput(), getOutput(), ic, Lc

### Community 8 - "Color Parsing Utilities"
Cohesion: 0.08
Nodes (5): dt(), $e(), Qe(), tn, ut()

### Community 9 - "Voxel Chunk Tests"
Cohesion: 0.05
Nodes (22): appSource, assert, before, boundaryDirty, BufferAttribute, BufferGeometry, chunkTriangles, context (+14 more)

### Community 14 - "Tool Table Management"
Cohesion: 0.11
Nodes (18): buildToolIntoGroup(), calcToolTimes(), field(), getToolByNum(), getToolColor3(), inferToolType(), onToolImportFile(), renderToolForm() (+10 more)

### Community 16 - "Object Constructor Copies"
Cohesion: 0.11
Nodes (18): ao(), co(), eo(), ho(), io(), ja(), ka(), lo() (+10 more)

### Community 18 - "Field Editing UI"
Cohesion: 0.15
Nodes (26): applyFeedMode(), applySug(), buildKeypad(), _cancelMobileFocus(), enterFieldMode(), enterFieldModeOnLine(), exitFieldMode(), fieldNext() (+18 more)

### Community 23 - "Physics Constraint Binding"
Cohesion: 0.06
Nodes (5): il(), Ll, ml, nl, Rl

### Community 25 - "Buffer Geometry Construction"
Cohesion: 0.13
Nodes (3): bo, en, Yh()

### Community 27 - "Camera Projection Update"
Cohesion: 0.12
Nodes (3): Jl, Kn, vl()

### Community 29 - "CNC Parser Engine"
Cohesion: 0.16
Nodes (18): applyRadiusComp(), buildToolMesh(), _carryPhysicalXY(), checkRadiusVsTool(), evalQExpr(), expandLblLines(), offsetRun(), parseProgram() (+10 more)

### Community 30 - "Scene Object Traversal"
Cohesion: 0.09
Nodes (7): _a, bs, dispose(), Et, ft(), Tt, ws()

### Community 31 - "Box3 Intersection Utils"
Cohesion: 0.11
Nodes (8): cn, dn, fn, hn, jn(), on, pn, un

### Community 32 - "2D Path Drawing"
Cohesion: 0.07
Nodes (5): bt, ct(), es(), Xe(), zl

### Community 33 - "Geometric Projection Utils"
Cohesion: 0.10
Nodes (4): as(), copy(), ec, parseObject()

### Community 34 - "Raycaster Object Intersection"
Cohesion: 0.18
Nodes (3): ai, an, ln

### Community 37 - "Measure Tool UI"
Cohesion: 0.21
Nodes (11): addItem(), clearMeasure(), deleteMeasureItem(), handleMeasureClick(), makeLine(), makeSphere(), renderMeasureOverlay(), setMeasureMode() (+3 more)

### Community 38 - "PMREM Cubemap Processing"
Cohesion: 0.11
Nodes (17): _allocateTargets(), _applyPMREM(), _blur(), cl, _cleanup(), fh, fromCubemap(), fromEquirectangular() (+9 more)

### Community 40 - "JSON Scene Parser"
Cohesion: 0.19
Nodes (3): clone(), kl, us()

### Community 42 - "Object JSON Serialization"
Cohesion: 0.13
Nodes (3): ac, go, tc

### Community 43 - "Buffer Geometry Normals"
Cohesion: 0.04
Nodes (48): Attempts (all reverted — v0.812–v0.814, restored to `main`), Attempts and fix, Attempts and fix, Attempts and fix, Attempts and fix, Attempts and fix, Attempts and fix, Attempts and fix (+40 more)

### Community 44 - "Shadow Map Frustum"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, screenshots (+3 more)

### Community 46 - "Voxel Cutting Simulation"
Cohesion: 0.22
Nodes (12): advance(), placeTool(), segSpeed(), shouldHoldVisibleSegment(), vxBuildGeometryRange(), vxBuildMesh(), vxCut(), vxDisposeObject() (+4 more)

### Community 47 - "Animation JSON Parsing"
Cohesion: 0.10
Nodes (9): ca, el, hh, li(), _o, os(), qr(), uh() (+1 more)

### Community 50 - "Block Form Panel"
Cohesion: 0.29
Nodes (10): blkCommitVal(), blkConfirmStep(), blkKeyDown(), blkNextStep(), blkSetShape(), blkStepRel(), blkUpdateVal(), insertBlkForm() (+2 more)

### Community 54 - "XR Controller Session"
Cohesion: 0.06
Nodes (33): TNC Sim web — technical changelog, v0.846 — documentation damage control, v0.847 — light grid and Learn hint state, 10. Resize the 3D renderer from the render loop, not only on window 'resize', 11. Bug lifecycle: TODO.md while open (log every attempt), BUG_HISTORY.md when fixed, 12. Chunked Marching Cubes needs a one-cell dirty halo, 13. Cycle FAUTO feed and short retract visibility are separate concerns, 1. LBL runs where it is written (fall-through!) (+25 more)

### Community 55 - "Shape Curve Parameters"
Cohesion: 0.29
Nodes (3): bind(), getValue(), setValue()

### Community 57 - "Curve Length Mapping"
Cohesion: 0.20
Nodes (3): gl, updateMatrixWorld(), Yl

### Community 58 - "Path Curve Points"
Cohesion: 0.06
Nodes (31): TNC Sim — Release notes, v0.801, v0.802, v0.803, v0.804, v0.806, v0.809, v0.810 (+23 more)

### Community 59 - "Asset Loader Parser"
Cohesion: 0.18
Nodes (3): cs, Ea(), Vs

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
Cohesion: 0.07
Nodes (15): bindSkeletons(), i(), load(), oc, ol, parse(), parseAnimations(), parseGeometries() (+7 more)

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
Cohesion: 0.15
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

### Community 72 - "Matrix World Update"
Cohesion: 0.50
Nodes (3): 3D renderer resizing, Layout and renderer rationale, Responsive breakpoint

### Community 73 - "Object Clone Serialize"
Cohesion: 0.11
Nodes (18): Attempts, Attempts, Attempts, Attempts, C12 — Light-theme 3D table grid is too dark, C13 — Learn Hint does not scroll the desktop left panel fully down, C14 — Revealed hints leak into a newly opened lesson, Open bugs (+10 more)

### Community 75 - "String Trim Utilities"
Cohesion: 0.33
Nodes (5): Jr(), kr(), nr(), vr(), zr()

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
Cohesion: 0.10
Nodes (12): ds(), ei, fi(), gi(), mi(), ms(), ns(), rt (+4 more)

### Community 84 - "Cycle Picker UI"
Cohesion: 0.48
Nodes (6): closeCtxPanel(), closeCyclePicker(), openCyclePicker(), selectCycle(), showCycleList(), showCycleParams()

### Community 88 - "Curve Tangent JSON"
Cohesion: 0.11
Nodes (4): bl, dc, mc(), pc

### Community 94 - "Help Popup UI"
Cohesion: 0.60
Nodes (3): hideHelpPopup(), openHelp(), toggleKpHelp()

### Community 96 - "Klartext Syntax Highlighting"
Cohesion: 1.00
Nodes (3): _synEscHtml(), _synHighlightLine(), _synLineWithColor()

### Community 103 - "Keyboard Input Loop"
Cohesion: 0.83
Nodes (3): apply(), kick(), loop()

### Community 108 - "Copy Constructor Object"
Cohesion: 0.25
Nodes (3): fo(), mo(), po

### Community 111 - "Polygon Area Geometry"
Cohesion: 0.13
Nodes (11): compileCubemapShader(), compileEquirectangularShader(), _compileMaterial(), constructor(), $h(), Kh(), qc, qh() (+3 more)

### Community 128 - "TNC Sim web"
Cohesion: 0.33
Nodes (5): Documentation budget, graphify, Non-negotiables, Start of every session, TNC Sim web

### Community 145 - ".clear"
Cohesion: 0.15
Nodes (7): ni, pi(), Si(), ti, Xn(), yi(), yn()

## Knowledge Gaps
- **179 isolated node(s):** `id`, `name`, `short_name`, `description`, `start_url` (+174 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lt` connect `Vector3 Math Operations` to `Three.js Material Compilation`, `Buffer Attribute UV Transform`, `Frustum Plane Intersection`, `Geometry Disable Toggle`, `Buffer Geometry Construction`, `Bounding Box Operations`, `Matrix3 Math Operations`, `Scene Object Traversal`, `Geometric Projection Utils`, `PMREM Cubemap Processing`, `JSON Scene Parser`, `Bounding Box Scene Update`, `Sphere Bounding Volume`, `Camera World Raycasting`, `Curve Length Mapping`, `Asset Loader Parser`, `Geometry Transform Setup`, `Line Geometry Index`, `.equals`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `vt` connect `WebGL Shader Variables` to `Three.js Material Compilation`, `Quaternion Math Operations`, `Audio Clock Input`, `Color Parsing Utilities`, `Buffer Attribute UV Transform`, `Skeleton Bone Binding`, `Vector3 Math Operations`, `.clear`, `Frustum Plane Intersection`, `Physics Constraint Binding`, `Buffer Geometry Construction`, `Scene Object Traversal`, `Geometric Projection Utils`, `JSON Scene Parser`, `Bounding Box Scene Update`, `Sphere Bounding Volume`, `Animation JSON Parsing`, `Instanced Mesh Skeleton`, `HTTP Asset Loader`, `String Trim Utilities`, `Animation Weight Blending`, `Geometry Transform Setup`, `Object Clone Update`, `Copy Constructor Object`, `Polygon Area Geometry`, `Text Decode URL Base`, `hl`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `xc` connect `Animation Action Crossfade` to `Three.js Material Compilation`, `Interpolant Interval Sampling`, `Audio Clock Input`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `id`, `name`, `short_name` to the rest of the system?**
  _179 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `WebGL Shader Variables` be split into smaller, more focused modules?**
  _Cohesion score 0.029838022165387893 - nodes in this community are weakly interconnected._
- **Should `Three.js Material Compilation` be split into smaller, more focused modules?**
  _Cohesion score 0.03932244404113733 - nodes in this community are weakly interconnected._
- **Should `Quaternion Math Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.06471631205673758 - nodes in this community are weakly interconnected._