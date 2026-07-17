# Graph Report - tnc-sim-web  (2026-07-17)

## Corpus Check
- 56 files · ~150,891 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2305 nodes · 4275 edges · 148 communities (93 shown, 55 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dd4c6b3f`
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
- Mobile bottom tab bar behaviour with the on-screen keyboard (web)
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
- Mh
- .clamp
- C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed
- hs
- Rs
- uo
- Zc
- zo
- ic

## God Nodes (most connected - your core abstractions)
1. `vt` - 125 edges
2. `copy()` - 121 edges
3. `Lt` - 80 edges
4. `en` - 72 edges
5. `Wn` - 58 edges
6. `TNC Sim — Release notes` - 52 edges
7. `St` - 50 edges
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

## Communities (148 total, 55 thin omitted)

### Community 0 - "WebGL Shader Variables"
Cohesion: 0.03
Nodes (26): cr(), dr(), er(), fr(), gr(), Hi(), hr(), ji() (+18 more)

### Community 1 - "Three.js Material Compilation"
Cohesion: 0.03
Nodes (22): Ah, an, Ba, ci, Da, dn, fs, gn() (+14 more)

### Community 3 - "Code Editor Core"
Cohesion: 0.07
Nodes (38): _applyEditorFs(), applyFix(), applyNumericSign(), computeBlockNumbers(), deleteCurrentLine(), deleteLineN(), _downloadTextFile(), editorClear() (+30 more)

### Community 6 - "Learn Tutorial Flow"
Cohesion: 0.06
Nodes (23): closeLearn(), learnBackToList(), learnCheck(), _learnCycleBlocks(), _learnEndEditorInput(), learnEvalChecks(), _learnExecutableCode(), learnExit() (+15 more)

### Community 7 - "Audio Clock Input"
Cohesion: 0.07
Nodes (5): bc, getInput(), getOutput(), ic, Lc

### Community 8 - "Color Parsing Utilities"
Cohesion: 0.07
Nodes (5): dt(), $e(), Qe(), tn, ut()

### Community 9 - "Voxel Chunk Tests"
Cohesion: 0.05
Nodes (22): appSource, assert, before, boundaryDirty, BufferAttribute, BufferGeometry, chunkTriangles, context (+14 more)

### Community 14 - "Tool Table Management"
Cohesion: 0.11
Nodes (28): buildToolIntoGroup(), calcToolTimes(), effectiveToolRadius(), field(), getToolByNum(), getToolColor3(), inferToolType(), insertToolDef() (+20 more)

### Community 16 - "Object Constructor Copies"
Cohesion: 0.11
Nodes (18): ao(), co(), eo(), ho(), io(), ja(), ka(), lo() (+10 more)

### Community 18 - "Field Editing UI"
Cohesion: 0.13
Nodes (28): applyFeedMode(), applySug(), buildKeypad(), _cancelMobileFocus(), chooseFeedMode(), closeFeedMenu(), enterFieldMode(), enterFieldModeOnLine() (+20 more)

### Community 20 - "Geometry Disable Toggle"
Cohesion: 0.12
Nodes (4): bl, dc, mc(), pc

### Community 21 - "Buffer Attribute Array Copy"
Cohesion: 0.06
Nodes (19): ar(), br(), $c(), ds(), en, ge, intersectObject(), intersectObjects() (+11 more)

### Community 23 - "Physics Constraint Binding"
Cohesion: 0.05
Nodes (3): Ga, ls(), sn

### Community 24 - "Animation Memory Manager"
Cohesion: 0.15
Nodes (3): qn, _s(), updateMatrixWorld()

### Community 25 - "Buffer Geometry Construction"
Cohesion: 0.14
Nodes (15): _allocateTargets(), _applyPMREM(), _blur(), _cleanup(), fromCubemap(), fromEquirectangular(), fromScene(), _fromTexture() (+7 more)

### Community 27 - "Camera Projection Update"
Cohesion: 0.10
Nodes (4): Jl, Kn, vl(), Yl

### Community 29 - "CNC Parser Engine"
Cohesion: 0.10
Nodes (42): applyRadiusComp(), applyRadiusCompAnalytic(), _applyRadiusCompPolylineFallback(), buildToolMesh(), _carryPhysicalXY(), evalQExpr(), expandLblLines(), inspectQExpr() (+34 more)

### Community 30 - "Scene Object Traversal"
Cohesion: 0.14
Nodes (5): _a, bs, Et, ft(), ws()

### Community 32 - "2D Path Drawing"
Cohesion: 0.18
Nodes (6): assert, cyc(), H, mustError(), seg(), valErrors()

### Community 33 - "Geometric Projection Utils"
Cohesion: 0.22
Nodes (7): assert, desktop, fs, mobile, path, source, vm

### Community 34 - "Raycaster Object Intersection"
Cohesion: 0.17
Nodes (3): Al, parseGeometries(), parseShapes()

### Community 37 - "Measure Tool UI"
Cohesion: 0.21
Nodes (11): addItem(), clearMeasure(), deleteMeasureItem(), handleMeasureClick(), makeLine(), makeSphere(), renderMeasureOverlay(), setMeasureMode() (+3 more)

### Community 38 - "PMREM Cubemap Processing"
Cohesion: 0.22
Nodes (4): ms(), ns(), Wn, Yh()

### Community 39 - "Quaternion Interpolation"
Cohesion: 0.18
Nodes (3): gi(), mi(), ys

### Community 42 - "Object JSON Serialization"
Cohesion: 0.67
Nodes (3): Attempts and fix, C10 — Cycle 209 explicit zero values were ignored, Symptom and cause

### Community 44 - "Shadow Map Frustum"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, screenshots (+3 more)

### Community 46 - "Voxel Cutting Simulation"
Cohesion: 0.22
Nodes (12): advance(), placeTool(), segSpeed(), shouldHoldVisibleSegment(), vxBuildGeometryRange(), vxBuildMesh(), vxCut(), vxDisposeObject() (+4 more)

### Community 47 - "Animation JSON Parsing"
Cohesion: 0.13
Nodes (4): clone(), kl, us(), Wl

### Community 49 - "Keyframe Track Interpolation"
Cohesion: 0.07
Nodes (15): bindSkeletons(), gl, hl, i(), load(), oc, ol, parse() (+7 more)

### Community 50 - "Block Form Panel"
Cohesion: 0.27
Nodes (11): blkBeforeInput(), blkCommitVal(), blkConfirmStep(), blkKeyDown(), blkNextStep(), blkSetShape(), blkStepRel(), blkUpdateVal() (+3 more)

### Community 51 - "Bug Report UI"
Cohesion: 0.13
Nodes (4): _bugBuildText(), bugCopyReport(), fa, ta

### Community 52 - "Instanced Mesh Skeleton"
Cohesion: 0.39
Nodes (7): closeCtxPanel(), closeCyclePicker(), openCyclePicker(), selectCycle(), showCycleList(), showCycleParams(), CYCLES

### Community 53 - "Buffer Attribute Upload"
Cohesion: 0.08
Nodes (25): 10. Resize the 3D renderer from the render loop, not only on window 'resize', 11. Bug lifecycle: TODO.md while open (log every attempt), BUG_HISTORY.md when fixed, 12. Chunked Marching Cubes needs a one-cell dirty halo, 13. Cycle FAUTO feed and short retract visibility are separate concerns, 1. LBL runs where it is written (fall-through!), 2. Q-value fallbacks must treat 0 as valid, 3. Voxel cell size limits detail, 4. Layout breakpoint: single-column when width ≤1024px OR height ≤600px (+17 more)

### Community 54 - "XR Controller Session"
Cohesion: 0.06
Nodes (29): TNC Sim web — technical changelog, v0.846 — documentation damage control, v0.847 — light grid and Learn hint state, v0.848 — machining demo library, v0.849 — Learn correctness and accessibility audit, v0.850 — clearer compensation and Cycle 208 diagrams, v0.851 — complete Learn slide-image redesign, v0.852 — Learn diagram collision corrections (+21 more)

### Community 57 - "Curve Length Mapping"
Cohesion: 0.11
Nodes (4): bt, ct(), es(), Xe()

### Community 58 - "Path Curve Points"
Cohesion: 0.04
Nodes (52): TNC Sim — Release notes, v0.801, v0.802, v0.803, v0.804, v0.806, v0.809, v0.810 (+44 more)

### Community 59 - "Asset Loader Parser"
Cohesion: 0.25
Nodes (7): assert, callLine, callSegments, code, context, harness, parsed

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

### Community 69 - "App Input Handlers"
Cohesion: 0.22
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

### Community 79 - "Animation Weight Blending"
Cohesion: 0.08
Nodes (8): cn, cs, fn, je, jn(), on, pn, Vs

### Community 80 - "Line Segment Distance"
Cohesion: 0.18
Nodes (10): appSource, assert, completedProblems, context, fs, liveProblems, path, qPanelSource (+2 more)

### Community 81 - "Toolpath Parser Tests"
Cohesion: 0.25
Nodes (6): assert, context, fs, path, source, vm

### Community 83 - "Vector Normalize Scale"
Cohesion: 0.13
Nodes (14): angleCode, angleMatch, appSource, assert, completeMatch, context, fs, indexHtml (+6 more)

### Community 84 - "Cycle Picker UI"
Cohesion: 0.15
Nodes (7): ctx, fs, parserSource, path, root, TOOLS, vm

### Community 85 - "Bone Matrix Update"
Cohesion: 0.19
Nodes (10): compileCubemapShader(), compileEquirectangularShader(), _compileMaterial(), constructor(), $h(), Kh(), qh(), setDirection() (+2 more)

### Community 89 - "Spaced Curve Points"
Cohesion: 0.18
Nodes (3): jo, wo, xo

### Community 93 - "Quadratic Bezier JSON"
Cohesion: 0.10
Nodes (4): ai, Ea(), ln, setFromCamera()

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
Nodes (19): ca, cl, el, fh, fo(), hh, Jr(), li() (+11 more)

### Community 100 - ".apply"
Cohesion: 0.29
Nodes (3): bind(), getValue(), setValue()

### Community 103 - "Keyboard Input Loop"
Cohesion: 0.83
Nodes (3): apply(), kick(), loop()

### Community 107 - ".applyQuaternion"
Cohesion: 0.13
Nodes (10): dispose(), fi(), ni, pi(), update(), wh(), wi(), Xn() (+2 more)

### Community 108 - ".addVectors"
Cohesion: 0.40
Nodes (5): Attempts and fix, C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour, Repro contour, Root cause, Symptom

### Community 109 - "C2 — Pure-Z R0 cancellation moved diagonally after an RL/RR contour"
Cohesion: 0.50
Nodes (4): Attempts (all reverted — v0.812–v0.814, restored to `main`), Context, Mobile bottom tab bar behaviour with the on-screen keyboard (web), Resolution

### Community 110 - "Mobile bottom tab bar behaviour with the on-screen keyboard (web)"
Cohesion: 0.50
Nodes (4): Attempts and accepted fixes, C18 — Heidenhain cycles, cutting logic and validator audit, Reproduced defects and root causes, Verification and remaining limits

### Community 111 - "Polygon Area Geometry"
Cohesion: 0.33
Nodes (5): Documentation budget, graphify, Non-negotiables, Start of every session, TNC Sim web

### Community 112 - "sc"
Cohesion: 0.50
Nodes (4): Attempts and fix, C7 — 3D stock updates stalled during machining, Root cause, Symptom

### Community 113 - "Text Decode URL Base"
Cohesion: 0.50
Nodes (4): Attempts and fix, C6 — Measure panel overlapped the mobile BLKFORM control, Root cause, Symptom

### Community 117 - "C1 — Mobile editor focus/scroll jumping during value editing and Learn"
Cohesion: 0.50
Nodes (4): Attempts and fix, C1 — Mobile editor focus/scroll jumping during value editing and Learn, Root cause, Symptom

### Community 119 - "hl"
Cohesion: 0.50
Nodes (4): C11 — Learn (desktop): wasted slide space and hints revealed off-screen, Fix, Root cause, Symptom

### Community 122 - ".setFromMatrixColumn"
Cohesion: 0.50
Nodes (4): Fix, Learn tab: dead near-black empty strip at the bottom (single-column layout), Root cause, Symptom

### Community 124 - "C14 — Revealed hints leaked into a newly opened lesson"
Cohesion: 0.25
Nodes (7): Accepted fix and verification, Bug history — resolved bugs & how they were fixed, C19 — Desktop F menu closed prematurely; CALL LBL status was blank, C4 — Placement of a newly inserted block relative to the active line, Original expectation, Resolution note, Symptom and root cause

### Community 127 - "Et"
Cohesion: 0.67
Nodes (3): Attempt and fix, C12 — Light-theme 3D table grid was too dark, Symptom and root cause

### Community 128 - "C9 — Short drilling/tapping retracts appeared to teleport"
Cohesion: 0.67
Nodes (3): Attempts and accepted fixes, C16 — Complete Learn correctness, content and visual audit, Symptom and root causes

### Community 129 - "C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed"
Cohesion: 0.67
Nodes (3): Attempts and fix, C9 — Short drilling/tapping retracts appeared to teleport, Symptom and cause

### Community 130 - "C14 — Revealed hints leaked into a newly opened lesson"
Cohesion: 0.67
Nodes (3): C3 — RND/CHF occasionally inserted at the start of the program, Root cause and resolution, Symptom

### Community 135 - "Do"
Cohesion: 0.67
Nodes (3): Attempt and fix, C14 — Revealed hints leaked into a newly opened lesson, Symptom and root cause

### Community 137 - "hs"
Cohesion: 0.67
Nodes (3): C5 — Editor text passed behind mobile control panels, Root cause and fix, Symptom

### Community 139 - ".clamp"
Cohesion: 0.67
Nodes (3): 2026-07-17 — mobile numeric editing and TNC 640 RL/RR geometry, Accepted implementation and verification, Reported symptoms and root causes

### Community 140 - "C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed"
Cohesion: 0.67
Nodes (3): Attempts and fix, C8 — Cycle 208 used the wrong FAUTO feed and uneven helix infeed, Symptom and cause

### Community 149 - "ic"
Cohesion: 0.67
Nodes (3): Attempt and fix, C13 — Learn Hint did not scroll the desktop left panel fully down, Symptom and root cause

## Knowledge Gaps
- **292 isolated node(s):** `id`, `name`, `short_name`, `description`, `start_url` (+287 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **55 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `tn` connect `Color Parsing Utilities` to `Three.js Material Compilation`, `Object Clone Update`, `Spherical Harmonics Lighting`, `Buffer Attribute UV Transform`, `Buffer Attribute Array Copy`, `Physics Constraint Binding`, `Buffer Geometry Construction`, `Quadratic Bezier JSON`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `copy()` connect `Buffer Attribute UV Transform` to `Three.js Material Compilation`, `ge`, `uc`, `Ah`, `fo`, `Color Parsing Utilities`, `Skeleton Bone Binding`, `Vector3 Math Operations`, `hs`, `Rs`, `Texture Loader Events`, `Object Constructor Copies`, `Frustum Plane Intersection`, `Curve Path Utilities`, `uo`, `Geometry Disable Toggle`, `Buffer Attribute Array Copy`, `Scene Object Quaternion`, `Physics Constraint Binding`, `Animation Memory Manager`, `Buffer Geometry Construction`, `Bounding Box Operations`, `Camera Projection Update`, `Scene Object Traversal`, `Box3 Intersection Utils`, `Raycaster Object Intersection`, `Spherical Harmonics Lighting`, `Ray Geometry Intersection`, `Quaternion Interpolation`, `JSON Scene Parser`, `Sphere Bounding Volume`, `Animation JSON Parsing`, `Camera World Raycasting`, `Keyframe Track Interpolation`, `Bug Report UI`, `Instanced Geometry Parsing`, `Curve Length Mapping`, `Raycaster Object Picking`, `Animation Weight Blending`, `Geometry Transform Setup`, `Line Geometry Index`, `Curve Segment JSON`, `Buffer Attribute Cache`, `zo`, `Quadratic Bezier JSON`, `Object Clone Update`, `Bounding Box Object`, `.fromArray`, `.applyQuaternion`, `C6 — Measure panel overlapped the mobile BLKFORM control`, `cs`, `bind`, `C12 — Light-theme 3D table grid was too dark`, `Ah`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `vt` connect `WebGL Shader Variables` to `Three.js Material Compilation`, `Audio Clock Input`, `Color Parsing Utilities`, `Buffer Attribute UV Transform`, `Skeleton Bone Binding`, `Vector3 Math Operations`, `Buffer Attribute Array Copy`, `Physics Constraint Binding`, `Scene Object Traversal`, `PMREM Cubemap Processing`, `Quaternion Interpolation`, `eh`, `Sphere Bounding Volume`, `Animation JSON Parsing`, `Keyframe Track Interpolation`, `Instanced Geometry Parsing`, `Line Geometry Index`, `Object Clone Update`, `.applyQuaternion`, `C6 — Measure panel overlapped the mobile BLKFORM control`, `Ah`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `id`, `name`, `short_name` to the rest of the system?**
  _292 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `WebGL Shader Variables` be split into smaller, more focused modules?**
  _Cohesion score 0.029988893002591634 - nodes in this community are weakly interconnected._
- **Should `Three.js Material Compilation` be split into smaller, more focused modules?**
  _Cohesion score 0.03333333333333333 - nodes in this community are weakly interconnected._
- **Should `Quaternion Math Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._