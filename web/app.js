

// ---- Version: single source of truth (see NOTES.md "Versioning") ----
// Feeds the header badge, the About popup, and the bug-report info.
var APP_VERSION = '0.815';
(function(){
  var b = document.getElementById('verBadge');
  if(b) b.textContent = 'v' + APP_VERSION + ' · 3D';
})();

// ===== constants.js =====
// TNC Sim — Constants: CYCLES, BUILDERS, KEYS, defaults


// Q parameter panel (fixed above textarea)
var _qPopupLine = -1;






// qPanelInput keydown is added dynamically in openQPopup

// BLK FORM panel state
var BLK = {
  shape: 'BOX',
  x0:0, y0:0, z0:0,
  x1:100, y1:100, z1:20,
  cx:50, cy:50, cz0:0, cz1:20, cr:50,
  step: 0, typing: false, active: false
};

var BLK_FIELDS_BOX = [
  {id:'x0', lbl:'X0', prompt:'Min X (BLK FORM 0.1)', key:'x0'},
  {id:'y0', lbl:'Y0', prompt:'Min Y (BLK FORM 0.1)', key:'y0'},
  {id:'z0', lbl:'Z0', prompt:'Min Z — bottom of block', key:'z0'},
  {id:'x1', lbl:'X1', prompt:'Max X (BLK FORM 0.2)', key:'x1'},
  {id:'y1', lbl:'Y1', prompt:'Max Y (BLK FORM 0.2)', key:'y1'},
  {id:'z1', lbl:'Z1', prompt:'Max Z — top surface', key:'z1'},
];
var BLK_FIELDS_CYL = [
  {id:'cx',  lbl:'X',  prompt:'Center X of cylinder', key:'cx'},
  {id:'cy',  lbl:'Y',  prompt:'Center Y of cylinder', key:'cy'},
  {id:'cz0', lbl:'Z0', prompt:'Min Z — bottom of cylinder', key:'cz0'},
  {id:'cz1', lbl:'Z1', prompt:'Max Z — top of cylinder', key:'cz1'},
  {id:'cr',  lbl:'R',  prompt:'Radius of cylinder', key:'cr'},
];

// Given a BLK FORM line's text and a caret offset within it, return which axis
// letter (X/Y/Z) the click landed on/nearest to — looks only at the real value
// tokens (X+50, not the bare "Z" axis-flag in "BLK FORM 0.1 Z X+0 Y+0 Z+0").

var toolCallList = []; // [{toolNum, lineNum}, ...]



document.addEventListener('keydown', function(e){
  if(!BLK.active || BLK.step < 1) return;
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||(e.target.tagName==='TEXTAREA'&&e.target!==codeEl)) return;
  if(e.key==='Escape'){ e.preventDefault(); closeCtxPanel(); return; }
  if(e.key==='Enter'||e.key==='Tab'){ e.preventDefault(); e.shiftKey?blkStepRel(-1):blkConfirmStep(); return; }
  if(e.key==='ArrowRight'){ e.preventDefault(); blkStepRel(1); return; }
  if(e.key==='ArrowLeft'){ e.preventDefault(); blkStepRel(-1); return; }
  var fields = BLK.shape==='BOX' ? BLK_FIELDS_BOX : BLK_FIELDS_CYL;
  var f = fields[BLK.step-1]; if(!f) return;

  if(e.key==='Backspace'){
    e.preventDefault();
    if(!BLK.typing){ BLK._str='0'; BLK.typing=true; }
    else { BLK._str = BLK._str.slice(0,-1) || '0'; }
    BLK[f.key] = BLK._str;
    blkRefresh(); return;
  }

  if(e.key==='-' || e.key==='+'){
    e.preventDefault();
    // toggle/set sign on existing value
    var cur = String(BLK[f.key]||'0').replace(/^[+\-]/,'');
    BLK._str = (e.key==='-' ? '-' : '') + cur;
    BLK[f.key] = BLK._str;
    BLK.typing = true;
    blkRefresh(); return;
  }

  if(e.key.length===1 && /[0-9.,]/.test(e.key)){
    e.preventDefault();
    var ch = e.key===',' ? '.' : e.key;
    if(!BLK.typing){
      // first keypress — clear the default value, preserve sign if already negative
      var sign = String(BLK[f.key]).charAt(0)==='-' ? '-' : '';
      BLK._str = sign + ch;
      BLK.typing = true;
    } else {
      BLK._str = String(BLK[f.key]) + ch;
    }
    BLK[f.key] = BLK._str;
    blkRefresh(); return;
  }
});


var M_DEFS = [
  {m:'M0',   desc:'Program stop (press Run to continue)'},
  {m:'M1',   desc:'Optional program stop (only if Single Block / opt. stop is active)'},
  {m:'M2',   desc:'Program end — same as M30 (legacy)'},
  {m:'M3',   desc:'Spindle ON — clockwise'},
  {m:'M4',   desc:'Spindle ON — counter-clockwise'},
  {m:'M5',   desc:'Spindle OFF'},
  {m:'M6',   desc:'Tool change'},
  {m:'M7',   desc:'Coolant ON — mist'},
  {m:'M8',   desc:'Coolant ON — flood'},
  {m:'M9',   desc:'Coolant OFF'},
  {m:'M13',  desc:'Spindle ON clockwise + Coolant ON'},
  {m:'M14',  desc:'Spindle ON counter-clockwise + Coolant ON'},
  {m:'M30',  desc:'End of program'},
  {m:'M89',  desc:'Vacant function / modal cycle call (machine-dependent)'},
  {m:'M91',  desc:'Coordinates referenced to machine datum, not workpiece origin'},
  {m:'M92',  desc:'Coordinates referenced to machine-builder reference point (e.g. tool change position)'},
  {m:'M94',  desc:'Reduce rotary axis display to a value below 360°'},
  {m:'M97',  desc:'Machine small contour steps cleanly'},
  {m:'M98',  desc:'Machine open contour corners completely'},
  {m:'M99',  desc:'Blockwise (non-modal) cycle call'},
  {m:'M101', desc:'Auto tool change with replacement tool when tool life expires'},
  {m:'M102', desc:'Reset M101'},
  {m:'M103', desc:'Reduce feed rate during plunging, by factor F (%)'},
  {m:'M104', desc:'Reactivate the last-defined datum'},
  {m:'M105', desc:'Machining with the 2nd kv (servo gain) factor'},
  {m:'M106', desc:'Machining with the 1st kv (servo gain) factor'},
  {m:'M107', desc:'Suppress error message for oversized replacement tools'},
  {m:'M108', desc:'Reset M107'},
  {m:'M109', desc:'Constant contouring speed at tool cutting edge — increase & decrease feed'},
  {m:'M110', desc:'Constant contouring speed at tool cutting edge — decrease feed only'},
  {m:'M111', desc:'Reset M109/M110'},
  {m:'M112', desc:'Round contour transitions within tolerance'},
  {m:'M113', desc:'Reset M112'},
  {m:'M114', desc:'Auto-compensate machine geometry when working with tilted axes'},
  {m:'M115', desc:'Reset M114'},
  {m:'M116', desc:'Rotary axis feed rate in mm/min instead of °/min'},
  {m:'M117', desc:'Reset M116'},
  {m:'M118', desc:'Superimpose handwheel positioning during program run'},
  {m:'M120', desc:'Look-ahead — precalculate radius-compensated contour'},
  {m:'M124', desc:'Contour filter — smooth small irregularities'},
  {m:'M126', desc:'Shortest-path traverse of rotary axes'},
  {m:'M127', desc:'Reset M126'},
  {m:'M128', desc:'TCPM — keep tool-tip position when positioning tilted axes'},
  {m:'M129', desc:'Reset M128'},
  {m:'M130', desc:'Move to position in untilted system with tilted working plane'},
  {m:'M134', desc:'Exact stop at non-tangential contour transitions with rotary axes'},
  {m:'M135', desc:'Reset M134'},
  {m:'M136', desc:'Feed rate F in mm per spindle revolution'},
  {m:'M137', desc:'Reset M136'},
  {m:'M138', desc:'Select which axes M128/M114 act on'},
  {m:'M140', desc:'Retract from contour along the tool axis'},
  {m:'M141', desc:'Suppress touch-probe monitoring'},
  {m:'M142', desc:'Delete modal program information'},
  {m:'M143', desc:'Delete basic rotation'},
  {m:'M144', desc:'Compensate machine kinematics in ACTUAL/NOMINAL position at block end'},
  {m:'M145', desc:'Reset M144'},
  {m:'M148', desc:'Auto-retract tool from contour at an NC stop'},
  {m:'M149', desc:'Reset M148'},
  {m:'M150', desc:'Suppress limit-switch message'},
  {m:'M200', desc:'Laser cutting — output programmed voltage directly'},
  {m:'M201', desc:'Laser cutting — output voltage as a function of distance'},
  {m:'M202', desc:'Laser cutting — output voltage as a function of speed'},
  {m:'M203', desc:'Laser cutting — output voltage as a function of time (ramp)'},
  {m:'M204', desc:'Laser cutting — output voltage as a function of time (pulse)'},
];

// Popup listing every M function we have defined (the full M_DEFS table above) —
// purely a reference list, opened from the "M list" toolbar button.

// ── Q parameter panel ────────────────────────────────────────────
var QP = { num:'1', op:'=', val:'', fn:'', step:0 };

var QP_OPS = [
  {op:'=',    label:'=',        desc:'Assign value'},
  {op:'=+',   label:'= +',      desc:'Add'},
  {op:'=-',   label:'= -',      desc:'Subtract'},
  {op:'=*',   label:'= ×',      desc:'Multiply'},
  {op:'=/',   label:'= ÷',      desc:'Divide'},
];
var QP_FNS = [
  {fn:'SIN',  label:'SIN'},
  {fn:'COS',  label:'COS'},
  {fn:'TAN',  label:'TAN'},
  {fn:'ASIN', label:'ASIN'},
  {fn:'ACOS', label:'ACOS'},
  {fn:'ATAN', label:'ATAN'},
  {fn:'SQRT', label:'√'},
  {fn:'ABS',  label:'ABS'},
  {fn:'INT',  label:'INT'},
  {fn:'FRAC', label:'FRAC'},
];




// keyboard for QP panel
document.addEventListener('keydown', function(e){
  if(!document.getElementById('ctxPanel') || !document.getElementById('qpFbarVal')) return;
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||(e.target.tagName==='TEXTAREA'&&e.target!==codeEl)) return;
  if(e.key==='Escape'){ e.preventDefault(); closeCtxPanel(); return; }
  if(e.key==='Enter'||e.key==='Tab'){
    e.preventDefault();
    if(QP.step===0){ QP.step=1; renderQParamPanel(); }
    else if(QP.step===1){ QP.step=2; renderQParamPanel(); }
    else { qpInsert(); }
    return;
  }
  // typing into val or num
  var target = QP.step===0 ? 'num' : (QP.step===2 ? 'val' : null);
  if(!target) return;
  if(e.key==='Backspace'){
    e.preventDefault();
    QP[target] = String(QP[target]).slice(0,-1) || (target==='num'?'1':'0');
    document.getElementById('qpFbarVal').textContent = QP[target];
    return;
  }
  var allowed = target==='num' ? /[0-9]/ : /[0-9Q.+\-*\/()]/;
  if(e.key.length===1 && allowed.test(e.key)){
    e.preventDefault();
    if(QP[target]==='0'||QP[target]==='1'&&target==='num') QP[target]='';
    QP[target] = String(QP[target]) + e.key;
    document.getElementById('qpFbarVal').textContent = QP[target];
  }
});
// ────────────────────────────────────────────────────────────────

// ── Context help ─────────────────────────────────────────────────
var kpHelpMode = false;

var HELP_MAP = {
  'run':      {title:'▶ Run', desc:'Starts the simulation from the current position. The tool moves through all blocks continuously. Use the speed control (- / +) to adjust playback speed.', ex:''},
  'step':     {title:'▶▶ Step', desc:'Executes one block at a time. Each click advances to the next NC block. Useful for inspecting individual moves.', ex:''},
  'stop':     {title:'⏸ Stop', desc:'Pauses the simulation at the current position. Press Run to continue. After stopping you can also trigger Refine to see the high-resolution mesh.', ex:''},
  'reset':    {title:'↺ Reset', desc:'Resets the simulation back to the beginning. The workpiece returns to its original shape and the tool goes to the start position.', ex:''},
  'q-low':    {title:'Quality: Default (100 vox)', desc:'Voxel grid 100×100. Each voxel ~1mm on a 100mm block. Very fast — smooth on any hardware. Good for testing program logic and tool paths. Fine features below ~1mm are not visible. Use Refine after simulation for a high-resolution mesh at 300 voxels.', ex:''},
  'q-med':    {title:'Quality: High (200 vox)', desc:'Voxel grid 200×200. Each voxel ~0.5mm — shows most machining operations clearly. Slower than Default during an active run; smooth on most modern hardware. Use Refine after simulation for a high-resolution mesh at 500 voxels.', ex:''},
  'view-3d':  {title:'3D view', desc:'Interactive 3D rendering of the workpiece and tool. Drag to orbit, scroll to zoom, right-drag to pan. Use Refine after simulation for a high-resolution mesh.', ex:''},
  'view-2d':  {title:'XY toolpath', desc:'Top-down 2D view of the tool path. Orange = feed moves, blue = rapid moves. Useful for verifying the tool path geometry before running the full simulation.', ex:''},
  'view-tools':{title:'Tool Table', desc:'Define tools with their geometry: radius R, length L, cutting edge length, tip angle, ball nose radius R2, DL/DR offsets. Tools are referenced by number in TOOL CALL.', ex:'TOOL CALL 1 Z S3000 F800'},
  'path':     {title:'Path — toolpath visibility', desc:'Toggles the 3D toolpath lines on/off. Orange lines = cutting moves (feed), blue lines = rapid traverses (FMAX).', ex:''},
  'P':        {title:'P — Polar coordinates', desc:'Switches input to polar mode. PR = radius from CC, PA = angle in degrees (0deg = +X axis, CCW positive). Set CC center first.', ex:'CC X+50 Y+50'},
  'I':        {title:'I — Incremental toggle', desc:'Toggles selected coordinate token between absolute (X+50) and incremental (IX+50). Incremental values are relative to the current position.', ex:'L X+50 F800'},
  'L':        {title:'L — Linear move', desc:'Moves the tool in a straight line to the given coordinates. Omit any axis to keep its current position. F sets feed in mm/min, FMAX is rapid traverse.', ex:'L X+50 Y+20 Z+0 F800'},
  'C':        {title:'C — Circular arc (CC center)', desc:'Arc move around the last CC center point to the endpoint. DR+ = counter-clockwise, DR- = clockwise.', ex:'C X+80 Y+50 DR+ R30 F800'},
  'CC':       {title:'CC — Circle center', desc:'Defines the center point for the next C arc or polar origin for LP/CP. Does not move the tool.', ex:'CC X+50 Y+50'},
  'CR':       {title:'CR — Circular arc (radius)', desc:'Arc defined by radius R. DR+ = CCW, DR- = CW. The sign of R selects the minor (-) or major (+) arc.', ex:'CR X+60 Y+30 R+20 DR+ F800'},
  'CT':       {title:'CT — Tangential arc', desc:'Arc that starts tangentially from the previous move direction to the endpoint. No radius needed.', ex:'CT X+60 Y+70 F800'},
  'RND':      {title:'RND — Corner rounding', desc:'Inserts a rounding arc of radius R at the corner between the preceding and following L blocks.', ex:'RND R5'},
  'CHF':      {title:'CHF — Chamfer', desc:'Inserts a straight chamfer of the given length at the corner between two L blocks.', ex:'CHF 2'},
  'LP':       {title:'LP — Linear polar', desc:'Linear move using polar coordinates. PR = radius from CC, PA = angle in degrees (0° = +X axis, CCW positive).', ex:'LP PR+30 PA+90 FMAX'},
  'CP':       {title:'CP — Circular polar', desc:'Arc move in polar coordinates. PA = target angle. Uses CC as center.', ex:'CP PA+180 DR+ F800'},
  'BLK FORM': {title:'BLK FORM — Workpiece blank', desc:'Defines the raw stock as a rectangular box. 0.1 is the minimum corner, 0.2 is the maximum corner. Z+ is the top surface.', ex:'BLK FORM 0.1 Z X+0 Y+0 Z+0\nBLK FORM 0.2 X+100 Y+100 Z+20'},
  'TOOL CALL':{title:'TOOL CALL — Select tool', desc:'Activates a tool by number. Z = spindle axis. S = spindle speed in RPM. F = feed rate in mm/min.', ex:'TOOL CALL 1 Z S3000 F800'},
  'TOOL DEF': {title:'TOOL DEF — Pre-define tool', desc:'Pre-loads a tool into the magazine so it is ready for the next TOOL CALL without a full ATC cycle.', ex:'TOOL DEF 2'},
  'CYCL DEF': {title:'CYCL DEF — Define cycle', desc:'Defines a fixed drilling/milling cycle with Q parameters. The cycle runs when CYCL CALL is executed at each hole position.', ex:'CYCL DEF 200 ;Drilling'},
  'CYCL CALL':{title:'CYCL CALL — Execute cycle', desc:'Executes the last defined CYCL DEF at the current X/Y position. Move to the hole position with FMAX before calling.', ex:'L X+50 Y+50 FMAX\nCYCL CALL'},
  'LBL':      {title:'LBL — Label (subroutine)', desc:'Marks the start of a subroutine block. LBL 0 marks the end. Labels can be called and repeated with CALL LBL.', ex:'LBL 1\n... moves ...\nLBL 0'},
  'CALL LBL': {title:'CALL LBL — Call label', desc:'Executes a labeled subroutine. REP N repeats it N times (1 REP = 2 executions total).', ex:'CALL LBL 1 REP 5'},
  'M0':       {title:'M0 — Program stop', desc:'Pauses the program. Press Run to continue. Useful for checking tool position or changing fixtures.', ex:'M0 ; Check position'},
  'M3':       {title:'M3 — Spindle ON clockwise', desc:'Starts the spindle rotating clockwise (standard for right-hand tools). Use after TOOL CALL.', ex:'M3'},
  'M4':       {title:'M4 — Spindle ON counter-clockwise', desc:'Starts the spindle rotating counter-clockwise. Used for left-hand tools.', ex:'M4'},
  'M5':       {title:'M5 — Spindle OFF', desc:'Stops the spindle. Use before tool change.', ex:'M5'},
  'M7':       {title:'M7 — Coolant ON (mist)', desc:'Activates mist coolant.', ex:'M7'},
  'M8':       {title:'M8 — Coolant ON (flood)', desc:'Activates flood coolant. Use after TOOL CALL.', ex:'M8'},
  'M9':       {title:'M9 — Coolant OFF', desc:'Turns off all coolant. Use before tool change.', ex:'M9'},
  'M30':      {title:'M30 — End of program', desc:'Ends the program and resets to the beginning. Equivalent to END PGM.', ex:'M30'},
  'M':        {title:'M — Miscellaneous function', desc:'M functions control machine auxiliaries: spindle (M3/M4/M5), coolant (M7/M8/M9), program stop (M0), end of program (M30). Always add M3 and M8 after TOOL CALL, and M5+M9 before tool change.', ex:'M3'},
  'Q':        {title:'Q — Parameter assignment', desc:'Assigns a value or expression to a Q variable. Q variables can be used anywhere in place of numeric values. Supports SIN, COS, TAN, SQRT, ABS and arithmetic.', ex:'Q1 = +50'},
  'Q200':     {title:'Q200 — Safety clearance', desc:'Incremental distance above the workpiece surface where the tool approaches at rapid speed before feeding down.', ex:'Q200=+5'},
  'Q201':     {title:'Q201 — Depth', desc:'Machining depth as a negative incremental value from Q203 (workpiece surface). E.g. -20 = 20mm below surface.', ex:'Q201=-20'},
  'Q206':     {title:'Q206 — Plunging feed', desc:'Feed rate for the downward cutting movement. Use FAUTO to use the feed defined in TOOL CALL.', ex:'Q206 FAUTO'},
  'Q202':     {title:'Q202 — Plunging depth', desc:'Depth of each peck (infeed per pass). Set to 0 or >= |Q201| for single-pass drilling.', ex:'Q202=+5'},
  'Q203':     {title:'Q203 — Surface coordinate', desc:'Absolute Z coordinate of the workpiece surface. Usually the top of BLK FORM 0.2 Z value.', ex:'Q203=+20'},
  'Q204':     {title:'Q204 — 2nd safety clearance', desc:'Incremental height above surface for final retract after the cycle. Tool returns here at FMAX.', ex:'Q204=+50'},
  'Q208':     {title:'Q208 — Retraction feed', desc:'Feed rate for retracting from the hole. Set to 0 to use the same feed as Q206.', ex:'Q208=+0'},
  'Q239':     {title:'Q239 — Thread pitch', desc:'Thread pitch in mm. Positive = right-hand thread, negative = left-hand thread. Feed = pitch × RPM.', ex:'Q239=+1.25'},
  'Q257':     {title:'Q257 — Depth per chip break', desc:'How deep the tap goes before retracting slightly to break chips. 0 = no chip breaking.', ex:'Q257=+5'},
  'Q256':     {title:'Q256 — Chip break retract', desc:'Distance to retract for chip breaking (stays inside the hole). Typically 0.2–0.5mm.', ex:'Q256=+0.2'},
  'measure':  {title:'◎ Measure', desc:'Click to enter measure mode. Click any point on the workpiece surface to record its X/Y/Z coordinates. Click two points to measure the distance between them. Click again to exit measure mode.', ex:''},
  'bug-report':{title:'🐛 Bug report', desc:'Opens the bug report dialog. Describe what went wrong; your program is included automatically. Use "Copy image to clipboard" to grab a screenshot of the 3D view, then paste it (Ctrl+V) into the GitHub issue or email.', ex:''},
  'editor':   {title:'NC Program editor', desc:'Write your Heidenhain Klartext NC program here. Click any line to activate the inline field editor. Use the keypad buttons above to insert commands. Lines starting with ; are comments.', ex:'; This is a comment'},
  'export':   {title:'↓ Export', desc:'Downloads the current NC program as a .H file (Heidenhain format). You can load it into a real TNC control or keep it as a backup.', ex:''},
  'speed':    {title:'Simulation speed', desc:'Controls how fast the simulation plays. − slows down, + speeds up. Range from 0.1× (very slow, useful for step-by-step inspection) to 8× (fast preview). Speed does not affect accuracy.', ex:''},
  'line-nums':{title:'Line numbers', desc:'Shows the block number of each NC line. Orange = currently executing block. Red = error, yellow = warning. Hover to reveal the delete (✕) button for that line. Click a line number to jump to it.', ex:''},

  // ── Tool Table columns ──
  'tt-T':       {title:'T — Tool number', desc:'Tool number used in TOOL CALL. The currently active tool (selected by the last TOOL CALL in the program) is highlighted with ▶.', ex:'TOOL CALL 1 Z S3000 F800'},
  'tt-TYPE':    {title:'TYPE — Tool type', desc:'Mill (flat end mill or ball nose, cuts with R/R2), Drill (twist drill or reamer, fixed radius = R), or Countersink (chamfer/deburring, any angle, R\u22480.001 tip-reference — diameter set by DR in TOOL CALL). Decides which fields matter and how the simulator cuts.', ex:''},
  'tt-NAME':    {title:'NAME — Tool name', desc:'A short identifying label for the tool, e.g. END_MILL_D10. Max 16 characters, no spaces. Purely descriptive — not used by the NC program itself.', ex:''},
  'tt-L':       {title:'L — Tool length (mm)', desc:'Distance from the spindle gauge line to the tool tip. Used for Z-axis length compensation.', ex:''},
  'tt-R':       {title:'R — Tool radius (mm)', desc:'MILL: cutting radius = diameter / 2, used for RL/RR compensation. DRILL/REAMER: the real, fixed cutting radius — the largest radius outside the tip; DR/RR/RL are not applied. COUNTERSINK: usually \u22480.001 (sharp tip); a real R gives a flat/truncated tip of that radius — the cone still widens above it to the LCUTS/T-ANGLE max diameter. Does not change with DR (DR is path-offset only).', ex:''},
  'tt-R2':      {title:'R2 — Corner radius (mm)', desc:'Radius of the rounded cutting corner (toroidal / ball-nose cutter). 0 = flat end mill. R2 = R makes a full ball-nose cutter.', ex:''},
  'tt-DL':      {title:'DL — Length oversize (mm)', desc:'Delta value added to the tool length L. Positive = tool cuts shallower, negative = tool cuts deeper. Used for wear / length compensation in TOOL CALL.', ex:'TOOL CALL 1 Z S3000 F800 DL-0.2'},
  'tt-DR':      {title:'DR — Radius oversize (mm)', desc:'Table DR = physical oversize of the real MILL tool (cuts wider). DR in a TOOL CALL = programmed allowance, ADDED to the table value; it offsets only the tool PATH (RL/RR, cycles) while the physical cut stays the same — e.g. TOOL CALL DR+0.2 leaves 0.2 mm finishing stock on the wall, exactly like the real control. DRILL/REAMER: never reshapes the cut. COUNTERSINK: does NOT reshape the cone — path offset only (RL/RR, CYCL DEF 208). Pair with DL = -DR/tan(T-ANGLE/2) so the cone\u2019s own edge meets that offset path.', ex:'TOOL CALL 1 Z S3000 F800 DR+0.1'},
  'tt-DR2':     {title:'DR2 — R2 oversize (mm)', desc:'Delta value added to the corner radius R2 — the same idea as DR, but for the rounded corner of a toroidal / ball-nose cutter.', ex:''},
  'tt-CUT':     {title:'CUT — Number of teeth', desc:'Number of cutting edges (flutes) on the tool. Used for chip-load style calculations; it does not change the cut geometry in the simulator.', ex:''},
  'tt-LCUTS':   {title:'LCUTS — Tooth length (mm)', desc:'MILL: cutting-edge length along the tool axis — how far up the flutes cut (full ball-nose auto-uses R2). DRILL/REAMER: the real cutting/flute height — purely informational, no link to R or T-ANGLE (rule of thumb: ~6\u00d7 diameter for a standard drill). COUNTERSINK: required, together with T-ANGLE — sets the tool\u2019s max diameter for simulation: \u00d8 = 2\u00d7LCUTS\u00d7tan(T-ANGLE/2), measured from the imaginary sharp apex (independent of R).', ex:''},
  'tt-ANGLE':   {title:'ANGLE — Max ramp angle (°)', desc:'Maximum plunge / ramp-in angle for cycles like CYCL DEF 208 (bore milling). A standard end mill is around 3°; a drill can use 90° (straight plunge).', ex:''},
  'tt-TANGLE':  {title:'T-ANGLE — Tool point angle (°)', desc:'Full included angle of a pointed tool tip — drill 118° (default for new DRILL tools), center drill 142°, countersink/chamfer — any angle (required, together with LCUTS). 0 disables the conical tip (flat end mill / ball nose). DRILL: point widens up to the real R, then a constant-R shank. COUNTERSINK: widens from R (usually \u22480.001) up to the LCUTS-derived max diameter.', ex:''},
  'tt-TL':      {title:'TL — Tool locked', desc:'When set, this tool is locked and cannot be selected by TOOL CALL — useful for marking a broken or unavailable tool.', ex:''},
  'tt-RT':      {title:'RT — Replacement tool', desc:'Tool number of a twin / sister tool that should be swapped in automatically if this tool is locked or reaches its tool-life limit. 0 = no replacement.', ex:''},
  'tt-TIME2':   {title:'TIME2 — Tool life limit (min)', desc:'Maximum allowed cutting time for this tool before it should be replaced. Compared against CUR.TIME, the time accumulated so far.', ex:''},
  'tt-CURTIME': {title:'CUR.TIME — Accumulated cutting time', desc:'Total cutting time used by this tool so far, shown as a progress bar against TIME2 (the tool-life limit). Green = OK, yellow = near limit, red = limit reached.', ex:''},
  'tt-DOC':     {title:'DOC — Documentation note', desc:'A free-text note about the tool (e.g. manufacturer, part number, special notes). Purely informational.', ex:''},
  'undo':       {title:'↺ Undo', desc:'Reverts the last editing change. Snapshots are taken before destructive edits (typing a new line, deleting, pasting, entering field mode on a line). The number in parentheses is how many undo steps are available.', ex:''},
  'redo':       {title:'↻ Redo', desc:'Re-applies a change that was just undone. Available only right after an Undo — any new edit clears the redo stack.', ex:''},
  'editor-reset':{title:'↺ Reset', desc:'Discards all changes and restores the default starter program. Asks for confirmation first.', ex:''},
  'editor-clear':{title:'✕ Clear', desc:'Erases the program body but keeps the BEGIN PGM / END PGM lines, so the validator stays happy. Asks for confirmation first.', ex:''},
  'editor-zoom':{title:'A− / A+ — Editor text size', desc:'Shrinks or enlarges the font size of the code editor and line numbers. Purely a display preference — has no effect on the program itself.', ex:''},
};



var _helpPopup = null;



// ── keypad click — intercept for help mode ────────────────────────

var _mEditLine = -1;
// Look up the known description for an M code (e.g. 'M3' -> 'Spindle ON — clockwise'), or null.
// M codes shown in the panel dropdown — the ones actually used on a 3-axis mill.
// (M_DEFS above stays the full reference table — it's still used to look up a
// description for whatever custom/non-standard M the person types by hand.)
var M_PANEL_CODES = ['M0','M3','M4','M5','M7','M8','M9','M30'];


// Keep the description line in sync with whatever M number is currently in the manual
// field (typing) or was just picked from the dropdown — looks up the full M_DEFS table,
// so it also resolves descriptions for codes outside the curated panel list.

// Resolve the panel's current value — manual input wins if it has something typed,
// otherwise fall back to whatever's selected in the dropdown — then commit it.
// Commit an M code — replace in edit mode, insert otherwise. Looks up a description
// in the full M_DEFS table (covers both the curated panel codes and any custom M).
// Replace the M command on the currently-edited line.
// - Known description for the new code → comment is always rewritten to match it
//   (that's the point of picking an M here — the comment should describe the M you end up with).
// - Unknown/custom new code → leave whatever comment was there (nothing better to put).






// ── Bug report ───────────────────────────────────────────────────
var _bugErrors = [];
(function(){
  var _origErr = window.onerror;
  window.onerror = function(msg, src, line, col, err){
    _bugErrors.push('['+new Date().toISOString().slice(11,19)+'] '+msg+(line?' ('+line+':'+col+')':''));
    if(_bugErrors.length > 20) _bugErrors.shift();
    if(_origErr) return _origErr.apply(this, arguments);
  };
  var _origUnhandled = window.onunhandledrejection;
  window.addEventListener('unhandledrejection', function(e){
    _bugErrors.push('['+new Date().toISOString().slice(11,19)+'] Unhandled promise: '+(e.reason||''));
    if(_bugErrors.length > 20) _bugErrors.shift();
  });
})();







// ────────────────────────────────────────────────────────────────


// ---------- keypad (Heidenhain-style path/program keys) ----------
var PATH_KEYS=[
  {l:'L',  code:'L X+0 Y+0 F500',          icon:'line', sup:true},
  {l:'C',  code:'C X+0 Y+0 DR+ R0 F500',   icon:'arc'},
  {l:'CC', code:'CC X+0 Y+0',              icon:'cc'},
  {l:'CR', code:'CR X+0 Y+0 R0 DR+ F500',  icon:'cr'},
  {l:'RND',code:'RND R0',                  icon:'rnd', sup:true},
  {l:'CHF',code:'CHF 0',                   icon:'chf', sup:true}
];
var PROG_KEYS=[
  {l:'BLK FORM', code:'BLK FORM', blkForm:true},
  {l:'CYCL DEF',  code:'CYCL DEF 208',     bld:'CYCL DEF 208', cyclPicker:true},
  {l:'CYCL CALL', code:'CYCL CALL'},
  {l:'TOOL CALL', code:'TOOL CALL 1 Z S3000 F500', bld:'TOOL CALL'},
  {l:'TOOL DEF', code:'TOOL DEF', toolDef:true},
  {l:'LBL SET',   code:'LBL 1', bld:'LBL'},
  {l:'LBL CALL',  code:'CALL LBL 1', bld:'LBL CALL'},
  {l:'GOTO', code:'GOTO', gotoLine:true},
];
var PI_KEYS=[
  {l:'P', sub:'polar LP',    code:'LP PR+0 PA+0 F500', icon:'polar'},
  {l:'I', sub:'increm.',     code:'L IX+0 IY+0 F500',  icon:'incr'},
  {l:'M', sub:'M function',  code:'M', mPicker:true},
  {l:'Q', sub:'Q parameter', code:'Q', qParam:true},
];
var ALL_KEYS=[];


// ── Tool library ──────────────────────────────────────────────────
var toolLibrary = [
  {T:1, TYPE:'MILL',        NAME:'END_MILL_D10', L:80,  R:5,   R2:0, DL:0, DR:0, DR2:0, TL:false, RT:0, TIME2:0, CUR_TIME:0, CUT:4, LCUTS:30,    ANGLE:0, T_ANGLE:0,   DOC:'End mill D10'},
  {T:2, TYPE:'MILL',        NAME:'BALL_MILL_D8', L:70,  R:4,   R2:4, DL:0, DR:0, DR2:0, TL:false, RT:0, TIME2:0, CUR_TIME:0, CUT:2, LCUTS:4,    ANGLE:0, T_ANGLE:0,   DOC:'Ball nose D8 (R4)'},
  {T:3, TYPE:'DRILL',       NAME:'CENTER_D6',    L:60,  R:3,   R2:0, DL:0, DR:0, DR2:0, TL:false, RT:0, TIME2:0, CUR_TIME:0, CUT:2, LCUTS:8,    ANGLE:0, T_ANGLE:142, DOC:'Center drill D6 142°'},
  {T:4, TYPE:'DRILL',       NAME:'DRILL_D6_8',   L:100, R:3.4, R2:0, DL:0, DR:0, DR2:0, TL:false, RT:0, TIME2:0, CUR_TIME:0, CUT:2, LCUTS:40.8, ANGLE:0, T_ANGLE:118, DOC:'Drill D6.8 118°'},
  {T:5, TYPE:'COUNTERSINK', NAME:'CSINK_D8_90',  L:60,  R:0.001, R2:0, DL:0, DR:0, DR2:0, TL:false, RT:0, TIME2:0, CUR_TIME:0, CUT:4, LCUTS:4, ANGLE:0, T_ANGLE:90,  DOC:'Countersink D8 90° (tip ref)'},
  {T:6, TYPE:'DRILL',       NAME:'REAMER_7H7',   L:100, R:3.5, R2:0, DL:0, DR:0, DR2:0, TL:false, RT:0, TIME2:0, CUR_TIME:0, CUT:6, LCUTS:25,   ANGLE:0, T_ANGLE:0,   DOC:'Reamer 7H7 D7'},
  {T:7, TYPE:'DRILL',       NAME:'TAP_M8',       L:80,  R:4,   R2:0, DL:0, DR:0, DR2:0, TL:false, RT:0, TIME2:0, CUR_TIME:0, CUT:2, LCUTS:18,   ANGLE:0, T_ANGLE:0,   DOC:'Tap M8x1.25'},
];
var TOOL_R = 5;
var TOOL_NUM = 1;
var editingTool = null;
var TOOL_TYPES = ['MILL','DRILL','COUNTERSINK'];
var TOOL_TYPE_LABEL = {MILL:'Mill', DRILL:'Drill', COUNTERSINK:'Countersink'};
var TOOL_TYPE_COLOR = {MILL:'#3b82f6', DRILL:'#5dcaa5', COUNTERSINK:'#e8a23a'};

// Backward-compat: derive TYPE for tools that don't have one yet (older saves / imported .tnt files)




// Re-render the form when TYPE is changed, preserving whatever the user already typed











// Fixed description for TOOL DEF — same text regardless of which tool number is picked.
var TOOL_DEF_DESC = 'Pre-load tool in magazine for next TOOL CALL';



// Edit an existing TOOL DEF line in place (tapped in the editor)
var _toolDefEditLine = -1;


document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeHelp(); closeBugReport(); exitFieldMode(); } });

// ---------- guided block builder (Heidenhain-style conversational entry) ----------
var BUILDERS = {
  'L':  {title:'L — straight line', fields:[
    {p:'X', prompt:'X coordinate', type:'coord', opt:true},
    {p:'Y', prompt:'Y coordinate', type:'coord', opt:true},
    {p:'Z', prompt:'Z coordinate', type:'coord', opt:true},
    {p:'F', prompt:'Feed rate', type:'feed', opt:true},
    {p:'', prompt:'Radius compensation', type:'rc', opt:true},
    {p:'M', prompt:'Miscellaneous function M (e.g. 3,4,5,6,99)', type:'mval', opt:true}
  ]},
  'C':  {title:'C — circular arc', fields:[
    {p:'X', prompt:'End point X', type:'coord', opt:true},
    {p:'Y', prompt:'End point Y', type:'coord', opt:true},
    {p:'DR',prompt:'Rotation direction', type:'dr', opt:false},
    {p:'F', prompt:'Feed rate', type:'feed', opt:true},
    {p:'', prompt:'Radius compensation', type:'rc', opt:true},
    {p:'M', prompt:'Miscellaneous function M (e.g. 3,4,5,6,99)', type:'mval', opt:true}
  ]},
  'CC': {title:'CC — circle center', fields:[
    {p:'X', prompt:'Center X', type:'coord', opt:true},
    {p:'Y', prompt:'Center Y', type:'coord', opt:true}
  ]},
  'CR': {title:'CR — arc by radius', fields:[
    {p:'X', prompt:'End point X', type:'coord', opt:true},
    {p:'Y', prompt:'End point Y', type:'coord', opt:true},
    {p:'R', prompt:'Radius', type:'num', opt:false},
    {p:'DR',prompt:'Rotation direction', type:'dr', opt:false},
    {p:'F', prompt:'Feed rate', type:'feed', opt:true},
    {p:'M', prompt:'Miscellaneous function M (e.g. 3,4,5,6,99)', type:'mval', opt:true}
  ]},
  'CT': {title:'CT — tangential arc', fields:[
    {p:'X', prompt:'End point X', type:'coord', opt:true},
    {p:'Y', prompt:'End point Y', type:'coord', opt:true},
    {p:'F', prompt:'Feed rate', type:'feed', opt:true},
    {p:'M', prompt:'Miscellaneous function M (e.g. 3,4,5,6,99)', type:'mval', opt:true}
  ]},
  'CYCL DEF 201':{title:'CYCL DEF 201 — Reaming', cmd:'CYCL DEF 201', fields:[
    {p:'Q200', prompt:'Safety clearance (mm)', type:'num', opt:false},
    {p:'Q201', prompt:'Depth (mm, negative)', type:'num', opt:false},
    {p:'Q206', prompt:'Feed rate for reaming (mm/min)', type:'num', opt:false},
    {p:'Q211', prompt:'Dwell time at depth (s)', type:'num', opt:false},
    {p:'Q208', prompt:'Retraction feed rate (0 = Q206)', type:'num', opt:false},
    {p:'Q203', prompt:'Surface coordinate (mm)', type:'num', opt:false},
    {p:'Q204', prompt:'2nd safety clearance (mm)', type:'num', opt:false},
  ]},
  'CYCL DEF 209':{title:'CYCL DEF 209 — Tapping with Chip Breaking', cmd:'CYCL DEF 209', fields:[
    {p:'Q200', prompt:'Safety clearance (mm)', type:'num', opt:false},
    {p:'Q201', prompt:'Thread depth (mm, negative)', type:'num', opt:false},
    {p:'Q239', prompt:'Thread pitch (mm, + right-hand / - left-hand)', type:'num', opt:false},
    {p:'Q203', prompt:'Surface coordinate (mm)', type:'num', opt:false},
    {p:'Q204', prompt:'2nd safety clearance (mm)', type:'num', opt:false},
    {p:'Q257', prompt:'Depth per chip break (mm)', type:'num', opt:false},
    {p:'Q256', prompt:'Chip break retract distance (mm)', type:'num', opt:false},
    {p:'Q336', prompt:'Spindle orientation angle (deg)', type:'num', opt:false},
  ]},
  'CYCL DEF 200':{title:'CYCL DEF 200 — Drilling', cmd:'CYCL DEF 200', fields:[
    {p:'Q200', prompt:'Safety clearance (mm)', type:'num', opt:false},
    {p:'Q201', prompt:'Depth (mm, negative)', type:'num', opt:false},
    {p:'Q206', prompt:'Feed rate for plunging (mm/min)', type:'num', opt:false},
    {p:'Q202', prompt:'Plunging depth per peck (mm)', type:'num', opt:false},
    {p:'Q210', prompt:'Dwell time at top (s)', type:'num', opt:false},
    {p:'Q203', prompt:'Surface coordinate (mm)', type:'num', opt:false},
    {p:'Q204', prompt:'2nd safety clearance (mm)', type:'num', opt:false},
    {p:'Q211', prompt:'Dwell time at depth (s)', type:'num', opt:false},
  ]},
  'CYCL DEF 208':{title:'CYCL DEF 208 — Boring/Reaming', cmd:'CYCL DEF 208', fields:[
    {p:'Q200', prompt:'Safety clearance (mm)', type:'num', opt:false},
    {p:'Q201', prompt:'Depth (mm, negative)', type:'num', opt:false},
    {p:'Q206', prompt:'Feed rate for plunging (mm/min)', type:'num', opt:false},
    {p:'Q208', prompt:'Feed rate for retract (mm/min)', type:'num', opt:false},
    {p:'Q203', prompt:'Surface coordinate (mm)', type:'num', opt:false},
    {p:'Q204', prompt:'2nd safety clearance (mm)', type:'num', opt:false},
  ]},

  'TOOL CALL':{title:'TOOL CALL — select tool', cmd:'TOOL CALL', fields:[
    {p:'',   prompt:'Tool number',     type:'tool',  opt:false, lbl:'T'},
    {p:'S',  prompt:'Spindle speed (rpm)', type:'num', opt:false},
    {p:'F',  prompt:'Feed rate (mm/min)',  type:'num', opt:true},
    {p:'DL', prompt:'DL — length offset (mm, e.g. -2)', type:'coord', opt:true},
    {p:'DR', prompt:'DR — radius offset (mm, e.g. +2)', type:'coord', opt:true},
  ], postprocess:function(text){ return text.replace(/^TOOL CALL (\d+)/,'TOOL CALL $1 Z'); }},
  'LBL':{title:'LBL — Label (subroutine)', cmd:'LBL', fields:[
    {p:'',  prompt:'Label number (1–999)', type:'num', opt:false}
  ]},
  'LBL CALL':{title:'CALL LBL — call label', cmd:'CALL LBL', fields:[
    {p:'',  prompt:'Label number', type:'num', opt:false},
    {p:'REP', prompt:'Repeat count (omit = run once)', type:'num', opt:true}
  ]},
  'RND':{title:'RND — corner rounding', fields:[
    {p:'R', prompt:'Rounding radius', type:'num', opt:false}
  ]},
  'CHF':{title:'CHF — chamfer', fields:[
    {p:'', prompt:'Chamfer size', type:'num', opt:false}
  ]},
  'CP': {title:'CP — polar circular arc', cmd:'CP', fields:[
    {p:'PA', prompt:'Target angle (degrees)', type:'coord', opt:false},
    {p:'DR', prompt:'Rotation direction', type:'dr', opt:false},
    {p:'F',  prompt:'Feed rate', type:'feed', opt:true},
    {p:'M',  prompt:'Miscellaneous function', type:'mval', opt:true}
  ]},
  'P':  {title:'LP — polar straight line', cmd:'LP', fields:[
    {p:'PR',prompt:'Polar radius (mm)', type:'coord', opt:false},
    {p:'PA',prompt:'Polar angle (degrees)', type:'coord', opt:false},
    {p:'F', prompt:'Feed rate', type:'feed', opt:true},
    {p:'M', prompt:'Miscellaneous function', type:'mval', opt:true}
  ]},
  'I':  {title:'L — incremental move', cmd:'L', fields:[
    {p:'IX',prompt:'Incremental X', type:'coord', opt:true},
    {p:'IY',prompt:'Incremental Y', type:'coord', opt:true},
    {p:'IZ',prompt:'Incremental Z', type:'coord', opt:true},
    {p:'F', prompt:'Feed rate', type:'feed', opt:true},
    {p:'M', prompt:'Miscellaneous function M (e.g. 3,4,5,6,99)', type:'mval', opt:true}
  ]}
};

// Helper functions to normalize commas to dots in decimal numbers


// Format signed numeric value: normalize comma, extract sign, return proper format

var SPEEDS = [0.25,0.5,1,2,5,10,20,50,100,500];
var speedIdx = 2;

// ---------- parser ----------
// produces { blkMin, blkMax, sub:[ {from,to,rapid,feed,blockIndex,srcLine} ], totalBlocks }

// ===== editor.js =====
// TNC Sim — Editor: DOM refs, line numbers, validator, Q popup


// --- shared LBL expansion helper (used by both validator and parser) ---
/* ===MAIN_START=== */
"use strict";

// ---------- theme (dark/light) ----------
_applyThemeUI(document.documentElement.getAttribute('data-theme')==='light' ? 'light' : 'dark');

// About popup — shows the disclaimer text, opened from the "About" button next to the theme toggle.

// ---------- DOM ----------
var codeEl = document.getElementById('code');
var DEFAULT_CODE = codeEl ? codeEl.value : '';

// ---------- Demo program library ----------
// The first entry ("General Basic") is the program shipped in the editor.
// To add more demos later, push { name:'...', code:'...' } onto this array.
var DEMO_PROGRAMS = [
  { name: 'Complete Part', code: DEFAULT_CODE },
  { name: 'Angle Mill', code: 'BEGIN PGM PROGRAM MM\n; Angle Mill - 30deg ramp, two passes\n; T1: end mill roughs a 22-step staircase approximating the ramp (X=Q2 0..21, Z=Q1),\n;     DL+0.2 leaves 0.2mm stock on the face for finishing.\n; T2: ball nose (R2=4) reuses the SAME staircase macro. DL-0.536 DR-2 shift the ball\n;     tip/center so it is exactly tangent to the ideal 30deg plane at each step\n;     (no gouge, no leftover stock) - see DL=-R2*(1-cos A), DR=-R2*(1-sin A).\n; Note: the milled surface still looks stepped/staircase in the 3D view because of\n;     the simulation resolution limit (voxel grid size), not the toolpath itself.\nBLK FORM 0.1 Z X+0.5 Y+0 Z+0\nBLK FORM 0.2 X+50 Y+50 Z+20\nCALL LBL 0\nTOOL CALL 1 Z S10000 F5000 DL+0.2 ; T1 end mill - roughing pass\nM8\nM3\nQ1=+10 ; Z start depth\nQ2=+0 ; X start position\nL X-10 Y-10 Z+40 FMAX R0\nLBL 1 ; one ramp step: plunge, cut across Y, retract, return\nL X+Q2 Y-10 Z+Q1 FMAX RL\nL Y+60\nL Z+40 FMAX R0\nL Y-10 FMAX\nQ1 = Q1+0,5774 ; tan(30deg) Z step -> exact 30deg slope\nQ2 = Q2+1 ; 1mm X step\nLBL 0\nCALL LBL 1 REP 21 ; 22 steps total (X=0..21)\nTOOL CALL 2 Z S2000 F5000 DL-0.536 DR-2 ; T2 ball nose - contact-point corrected finishing pass\nM3\nM8\nL X-10 Y-10 Z+40 FMAX R0\nQ1=+10\nQ2=+0\nCALL LBL 1 REP 21\nEND PGM PROGRAM MM' }
];
var _currentDemoIdx = 0; // textarea starts out as DEMO_PROGRAMS[0] ("Complete Part")

// push undo snapshot on typing (debounced — 1.5s after last keystroke)
var _undoLastVal = null;
if(codeEl){
  // snapshot BEFORE destructive keystrokes (delete, backspace, enter)
  codeEl.addEventListener('keydown', function(e){
    if(e.key==='Backspace'||e.key==='Delete'||e.key==='Enter'){
      var cur = codeEl.value;
      if(cur !== _undoLastVal){
        _undoPush();
        _undoLastVal = cur;
        renderIdlePanel();
      }
    }
  });
  // also snapshot on paste/cut
  codeEl.addEventListener('paste',  function(){ _undoPush(); _undoLastVal=codeEl.value; renderIdlePanel(); });
  codeEl.addEventListener('cut',    function(){ _undoPush(); _undoLastVal=codeEl.value; renderIdlePanel(); });

  // Fully lock cycle blocks: the CYCL DEF anchor line AND its Q-param
  // continuation lines are all protected from any DELETE-type input
  // (Backspace, Delete, Cut, word/line deletion) — no exceptions. There are
  // exactly two ways to remove a cycle: the ✕ button in the gutter, or
  // selecting one or more WHOLE lines that touch the cycle and pressing
  // Backspace/Delete — both remove the ENTIRE block (anchor + all its
  // continuation lines) as a unit. Typing/overwriting a value (select
  // digits + type new ones, or just type at the caret) stays allowed within
  // a single line, since that's how individual parameters get edited — but
  // it's blocked if it would insert a newline (Enter), since splitting a
  // locked line in two would corrupt the cycle's fixed line count. No
  // toast/popup — a blocked keystroke just silently does nothing.
  codeEl.addEventListener('beforeinput', function(e){
    var type = e.inputType || '';
    var isDeletion = type.indexOf('delete') === 0;
    var isInsertion = type.indexOf('insert') === 0;
    if(!isDeletion && !isInsertion) return;

    var val = codeEl.value;
    var s = codeEl.selectionStart, en = codeEl.selectionEnd;
    var lines = val.split('\n');
    var blockNums = computeBlockNumbers(lines);
    function lineIdxAt(pos){ return val.slice(0, pos).split('\n').length - 1; }
    function lineStartOffset(idx){ var p=0; for(var i=0;i<idx;i++) p+=lines[i].length+1; return p; }
    function isCycleAnchor(idx){ return /^CYCL\s+DEF\b/i.test(lines[idx].replace(/^\s+/,'')); }
    function isLockedLine(idx){ return blockNums[idx] === null || isCycleAnchor(idx); }

    // ---- Path 1: a whole-line (or whole multi-line) selection touching a
    // cycle, with Backspace/Delete/Cut pressed -> delete the ENTIRE block. ----
    if(isDeletion && s !== en){
      var selStart = lineIdxAt(s), selEnd = lineIdxAt(en - 1);
      var selStartOff = lineStartOffset(selStart);
      var selEndContentOff = lineStartOffset(selEnd) + lines[selEnd].length;
      var hasNL = selEnd < lines.length - 1;
      var isWholeLineSel = (s === selStartOff) && (en === selEndContentOff || (hasNL && en === selEndContentOff + 1));
      if(isWholeLineSel){
        var touchesCycle = false;
        for(var lj=selStart; lj<=selEnd; lj++){ if(isLockedLine(lj)){ touchesCycle = true; break; } }
        if(touchesCycle){
          e.preventDefault();
          var from = selStart, to = selEnd;
          while(from > 0 && blockNums[from] === null) from--;
          while(to + 1 < lines.length && blockNums[to+1] === null) to++;
          _undoPush();
          lines.splice(from, to - from + 1);
          codeEl.value = lines.join('\n');
          var newPos = lines.slice(0, from).join('\n').length;
          if(from > 0) newPos++;
          try{ codeEl.setSelectionRange(newPos, newPos); }catch(err){}
          lastSel = {start:newPos, end:newPos};
          dirty = true; updateLineNums(); runValidation();
          return;
        }
      }
    }

    // ---- Path 2: anything else touching a locked line -> fully blocked
    // (deletions) or confined to safe in-line edits (insertions). ----
    var idxStart = lineIdxAt(s), idxEnd = lineIdxAt(en);
    if(isDeletion && s === en){
      if(type === 'deleteContentBackward'){ if(s===0) return; idxStart = lineIdxAt(s-1); }
      else if(type === 'deleteContentForward'){ if(en===val.length) return; idxEnd = lineIdxAt(en+1); }
    }

    var touchesLocked = false;
    for(var li=idxStart; li<=idxEnd; li++){
      if(isLockedLine(li)){ touchesLocked = true; break; }
    }
    if(!touchesLocked) return;

    if(isDeletion){ e.preventDefault(); return; }

    var inserted = (typeof e.data === 'string' && e.data) ? e.data
      : (e.dataTransfer ? (e.dataTransfer.getData('text/plain') || '') : '');
    var introducesNewline = inserted.indexOf('\n') >= 0
      || type === 'insertLineBreak' || type === 'insertParagraph';
    if(idxStart !== idxEnd || introducesNewline){
      e.preventDefault();
    }
  });
}

// ---- editor undo/redo stack ----
var _undoStack = [];
var _redoStack = [];
var _undoMax = 50;

// ---------- Editor text size (A-/A+ buttons) ----------
var _editorFs = 12;          // px — base editor font size
var _EDITOR_FS_MIN = 8, _EDITOR_FS_MAX = 28;



var lineNums = document.getElementById('lineNums');
var blockCountEl = document.getElementById('blockCount');
var statusMsg = document.getElementById('statusMsg');
var statusDot = document.getElementById('statusDot');
var posDisplay = document.getElementById('posDisplay');
var speedValEl = document.getElementById('speedVal');
var runBtn = document.getElementById('runBtn');
var view3dEl = document.getElementById('view3d');
var view2dEl = document.getElementById('view2d');
var canvas2d = document.getElementById('sim2d');
var ctx2d = canvas2d.getContext('2d');

// ---------- line numbers ----------
var problemsData = [];
var problemsOpen = true;
/* Heidenhain-like behaviour: a real TNC evaluates a block when you confirm
   it, not on every keystroke. While the user is typing on a line, problems
   for THAT line are hidden; they appear the moment the caret leaves the line
   (Enter / click elsewhere) or the editor loses focus. */
var _liveEditLine = -1;

// Computes real Heidenhain block numbers for a program's lines.
// Rules (matching the control): numbering starts at 0 (BEGIN PGM = block 0),
// and a line is a continuation of the PREVIOUS block (no number of its own)
// when EITHER (a) the previous line ends with '~' — the Klartext line-
// continuation marker used by real exported .H files — OR (b) it's a Q-param
// line (Q123=...) immediately following a CYCL DEF, since our own "Insert
// cycle" panel (selectCycle()) builds those without a literal '~'. A lone
// trailing empty line (textarea artifact of a final newline) is unnumbered.
// Left-justifies a block number per the control's listing format: minimum
// 2-character field, then always exactly one separating space (so "0" -> "0  ",
// "12" -> "12 ", "164" -> "164 ").

// Derives the displayed/exported file name from BEGIN PGM <name>, falling
// back to 'program.H' if the program has no (valid) BEGIN PGM line yet.


if(typeof ResizeObserver!=='undefined'){
  new ResizeObserver(function(){
    var hl=document.getElementById('hlLayer');
    if(hl && codeEl){ hl.style.width=codeEl.offsetWidth+'px'; hl.style.height=codeEl.offsetHeight+'px'; }
  }).observe(codeEl);
}


var fixedProblems = {};
var validateTimer = null;







// ===== fieldmode.js =====
// TNC Sim — Field Mode (guided block entry)

// ---------- inline field editing (Heidenhain-style) ----------
var FM={active:false};

var lastMobileVal='';

var SUGS={
  feed:[['100','F100'],['500','F500'],['1000','F1000'],['2000','F2000'],['MAX','FMAX']],
  num:[['5','5'],['10','10'],['25','25'],['50','50']],
  coord:[['+','+ sign'],['-','- sign']]
};




// return focus to codeEl when clicking ctx-panel buttons (so keydown still works)
document.getElementById('ctxPanel').addEventListener('mousedown', function(e){
  // don't intercept clicks on idle panel buttons
  if(e.target && e.target.closest && e.target.closest('.btn')) return;
  saveLastSel();
});
document.getElementById('ctxPanel').addEventListener('mouseup', function(){
  if(FM.active && !isMobile()){
    setTimeout(function(){ codeEl.focus(); }, 0);
  }
});

var validateTimer=null;
var lastSel = {start:0, end:0};
codeEl.addEventListener('mouseup', saveLastSel);
codeEl.addEventListener('keyup',   saveLastSel);
/* live-edit problem suppression (see _liveEditLine above) */
codeEl.addEventListener('input', function(){
  if(document.activeElement===codeEl) _liveEditLine = _caretLineIdx();
});
codeEl.addEventListener('keyup', function(){
  if(_liveEditLine!==-1 && _caretLineIdx()!==_liveEditLine) _liveEditClear();
});
codeEl.addEventListener('click', function(){
  if(_liveEditLine!==-1 && _caretLineIdx()!==_liveEditLine) _liveEditClear();
});
codeEl.addEventListener('blur', _liveEditClear);
var _selectedLine = -1;
// data-help hover popups
document.addEventListener('mouseover', function(e){
  if(!kpHelpMode) return;
  var h = _getHelpElAndKey(e.target);
  if(h) showKpHelp(h.key, h.el);
  else hideHelpPopup();
});
document.addEventListener('mouseout', function(e){
  if(!kpHelpMode) return;
  var to = e.relatedTarget;
  if(!to){ hideHelpPopup(); return; }
  var h = to.closest ? _getHelpElAndKey(to) : null;
  if(!h) hideHelpPopup();
});
// click on data-help: show popup but don't block the action
document.addEventListener('click', function(e){
  if(!kpHelpMode) return;
  // The Help toggle button manages kpHelpMode itself via its own onclick — don't
  // let this generic handler immediately undo that on the same click.
  if(e.target.closest && e.target.closest('#kpHelpBtn')) return;
  var h = _getHelpElAndKey(e.target);
  if(h) showKpHelp(h.key, h.el);
  // Clicking an actual control means the person is done exploring and wants to
  // use it — turn help mode off so this and subsequent clicks act normally
  // instead of staying stuck with the "?" cursor.
  var isControl = e.target.closest && e.target.closest('button, .tab, a[href], select, input');
  if(isControl) toggleKpHelp();
});
codeEl.addEventListener('click', updateSelectedLine);
codeEl.addEventListener('click', saveLastSel);
codeEl.addEventListener('click', function(e){
  if(!kpHelpMode) return;
  var pos2 = codeEl.selectionStart;
  var lineText = codeEl.value.slice(0, pos2).split('\n');
  var line2 = lineText[lineText.length-1] || '';
  // also get full current line
  var allLines = codeEl.value.split('\n');
  line2 = allLines[lineText.length-1] || line2;
  var u2 = line2.trim().toUpperCase().replace(/;.*$/,'').trim();
  // extract first word / command
  var key2 = u2.split(/\s+/)[0] || '';
  // try Q param key (Q200, Q201...)
  var qm2 = u2.match(/^(Q\d+)/);
  if(qm2 && HELP_MAP[qm2[1]]) key2 = qm2[1];
  // try 2-word commands
  if(!HELP_MAP[key2]){
    var two = u2.split(/\s+/).slice(0,2).join(' ');
    if(HELP_MAP[two]) key2 = two;
  }
  if(key2) showKpHelp(key2, codeEl);
});
codeEl.addEventListener('keyup', updateSelectedLine);
codeEl.addEventListener('focus', updateSelectedLine);
codeEl.addEventListener('select',  saveLastSel);
codeEl.addEventListener('input', function(){
  dirty=true;
  updateLineNums();
  if(validateTimer) clearTimeout(validateTimer);
  validateTimer=setTimeout(runValidation, 350);
  syncScrollToLineNums();
  // Editing the program invalidates the current 3D sim/cut — same as editing
  // a tool (see toolSave). Without this, the canvas keeps showing the OLD
  // result and it looks like the edit (e.g. a changed Q value) had no effect,
  // when really the sim just hasn't been re-run yet.
  if(mode==='done' || mode==='stepping' || mode==='idle'){
    var _stale = document.getElementById('staleSimWarning');
    if(_stale) _stale.style.display='';
  }
});
codeEl.addEventListener('scroll', function(){
  syncScrollToLineNums();
});
document.addEventListener('keydown', function(e){
  if(!FM.active) return;
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA'&&e.target!==codeEl) return;
  // ak je označený viac ako jeden znak, exit field mode a nechaj browser mazať normálne
  if(codeEl.selectionStart !== codeEl.selectionEnd &&
     (e.key==='Delete' || e.key==='Backspace')) {
    exitFieldMode(true);
    return;
  }
  var f=FM.fields[FM.idx];
  if(e.key==='Escape'){ e.preventDefault(); exitFieldMode(); return; }
  // Enter = DONE (finish editing); Tab / Shift+Tab step between fields
  if(e.key==='Enter'){ e.preventDefault(); exitFieldMode(); return; }
  if(e.key==='Tab'){ e.preventDefault(); e.shiftKey?fieldPrev():fieldNext(); return; }
  if(e.key==='ArrowRight'){ e.preventDefault(); fieldNext(); return; }
  if(e.key==='ArrowLeft'){ e.preventDefault(); fieldPrev(); return; }
  if(e.key==='ArrowUp'){ e.preventDefault(); fieldPrev(); return; }
  if(e.key==='ArrowDown'){ e.preventDefault(); fieldNext(); return; }
  if(e.key==='Backspace'||e.key==='Delete'){
    e.preventDefault();
    if(e.key==='Delete'){
    // if all fields are null/empty, delete the entire line
    var allEmpty=FM.fields.every(function(ff){ return ff.val===null||ff.val===''||ff.val==='0'; });
    if(allEmpty){ exitFieldMode(false); deleteLineN(codeEl.value.slice(0,FM.lineStart).split('\n').length-1); return; }
    if(f.opt && f.type==='coord'){ f.val=null; FM.typing=false; refreshSelection(); return; }
    return;
  }
    if(f.val===null){ refreshSelection(); return; }
    if(!FM.typing){ f.val=''; FM.typing=true; }
    else { f.val=f.val.slice(0,-1); if(f.val===''&&f.opt&&(f.type==='coord'||f.type==='feed'||f.type==='mval')) f.val=null; }
    refreshSelection(); return;
  }
  if(e.key.length===1){
    e.preventDefault();
    var ch=e.key;
    if(f.type==='dr'){
      if(ch==='+'||ch==='-') setFieldVal(ch);
      return;
    }
    var patterns={coord:/[0-9.,+\-QqAaBbCc]/,num:/[0-9.,Qq]/,feed:/[0-9.QqFfAaXxUuTtOoMm]/,mfunc:/[0-9]/,mval:/[0-9]/};
    if(patterns[f.type] && !patterns[f.type].test(ch)) return;
    if(f.type==='feed' && /[mMaAxXfFuUtToO]/.test(ch)) ch=ch.toUpperCase();
    // + a - na coord poli len zmenia znamienko, nezahadzujú číslo
    if(f.type==='coord' && (ch==='+'||ch==='-')){
      var num = f.val===null ? '' : String(f.val).replace(/^[+\-]/,'');
      f.val = ch + num;
      FM.typing = true;
      refreshSelection(); return;
    }
    if(!FM.typing){ f.val=''; FM.typing=true; }
    f.val+=ch;
    f.val=sanitizeVal(f.val,f.type);
    refreshSelection(); return;
  }
});
// Mobile input handling via hidden input
var mobileInput = document.getElementById('mobileInput');
if(mobileInput){
  // keep mobileInput focused when FM is active
  var MI_SENTINEL = '​'; // zero-width space as sentinel

  function resetMobileInput(){
    mobileInput.value = MI_SENTINEL;
    lastMobileVal = MI_SENTINEL;
  }

  mobileInput.addEventListener('blur', function(){
    if((FM.active || _qpPanelOpen()) && isMobile()){
      setTimeout(function(){ mobileInput.focus(); }, 30);
    }
  });

  mobileInput.addEventListener('input', function(){
    // ── QP (Q parameter) panel routing — takes priority when open ──
    if(_qpPanelOpen()){
      var qTarget = QP.step===0 ? 'num' : (QP.step===2 ? 'val' : null);
      var nv=mobileInput.value;
      if(qTarget){
        if(nv.length < lastMobileVal.length){
          // backspace
          QP[qTarget] = String(QP[qTarget]).slice(0,-1);
          if(QP[qTarget]==='') QP[qTarget] = (qTarget==='num'?'':'');
          var el0=document.getElementById('qpFbarVal'); if(el0) el0.textContent=QP[qTarget]||(qTarget==='num'?'1':'0');
          resetMobileInput(); return;
        }
        var qDiff=nv.replace(MI_SENTINEL,'');
        resetMobileInput();
        if(!qDiff) return;
        var qAllowed = qTarget==='num' ? /[0-9]/ : /[0-9Qq.+\-*\/()]/;
        for(var qi=0;qi<qDiff.length;qi++){
          var qch=qDiff[qi];
          if(qch===MI_SENTINEL || !qAllowed.test(qch)) continue;
          // first typed char replaces the predefined value
          if(!QP._typing){ QP[qTarget]=''; QP._typing=true; }
          QP[qTarget]=String(QP[qTarget])+(qch==='q'?'Q':qch);
        }
        var el1=document.getElementById('qpFbarVal'); if(el1) el1.textContent=QP[qTarget]||(qTarget==='num'?'1':'0');
      } else {
        resetMobileInput();
      }
      return;
    }
    if(!FM.active) return;
    var f=FM.fields[FM.idx];
    var newVal=mobileInput.value;

    if(newVal.length < lastMobileVal.length){
      // backspace detected
      if(f.val!==null && f.val!==''){
        f.val=String(f.val).slice(0,-1);
        if(f.val===''&&f.opt&&(f.type==='coord'||f.type==='feed')) f.val=null;
        FM.typing=true;
        refreshSelection();
      }
      resetMobileInput(); return;
    }

    // chars added — strip sentinel
    var diff=newVal.replace(MI_SENTINEL,'');
    resetMobileInput();
    if(!diff) return;

    for(var di=0;di<diff.length;di++){
      var ch=diff[di];
      if(ch===MI_SENTINEL) continue;
      if(f.type==='dr'){ if(ch==='+'||ch==='-') setFieldVal(ch); continue; }
      if(f.type==='tool') continue; // handled by select element
      var patterns={coord:/[0-9.,+\-QqAaBbCc]/,num:/[0-9.,Qq]/,feed:/[0-9.QqFfAaXxUuTtOoMm]/,mfunc:/[0-9]/,mval:/[0-9]/};
      if(patterns[f.type] && !patterns[f.type].test(ch)) continue;
      if(f.type==='coord' && (ch==='+'||ch==='-')){
        var num2=f.val===null?'':String(f.val).replace(/^[+\-]/,'');
        f.val=ch+num2; FM.typing=true; refreshSelection(); continue;
      }
      if(!FM.typing || f.type==='qval'){ f.val=''; FM.typing=true; }
      f.val+=ch;
      if(f.type==='qval') f.val=f.val.replace(/q/g,'Q').replace(/[^0-9.+\-QAUTOauto]/g,'');
      else f.val=sanitizeVal(f.val,f.type);
      refreshSelection();
    }
  });
}

codeEl.addEventListener('click', function(){
  closeQPopup();
  if(FM.active) exitFieldMode(true);
  if(codeEl.selectionStart !== codeEl.selectionEnd) return;
  var pos=codeEl.selectionStart, val=codeEl.value;
  var ls=val.lastIndexOf('\n',pos-1)+1;
  var lineEnd = val.indexOf('\n',pos); if(lineEnd<0) lineEnd=val.length;
  var lineText=val.slice(ls, lineEnd);

  // Position of the tap within the line + inline comment index (used by several branches)
  var posInLine = pos - ls;
  var ci = lineText.indexOf(';');
  var trimmedEnd = lineText.replace(/\s+$/,'').length;

  // Q line (cycle parameter)
  if(/^\s*Q\d+/i.test(lineText)){
    // Tap on the comment part (at/after ';') → edit text directly in the textarea.
    if(ci >= 0 && posInLine >= ci){
      codeEl.readOnly = false;
      try{ codeEl.focus({preventScroll:true}); }catch(e){ codeEl.focus(); }
      saveLastSel();
      return;
    }
    // Tap PAST the value (no comment) → blinking caret at end, so Enter inserts
    // a new line below — same behavior every other line type already gets.
    if(ci < 0 && posInLine >= trimmedEnd){
      try{ codeEl.setSelectionRange(lineEnd, lineEnd); }catch(e){}
      saveLastSel();
      return;
    }
    // Tap ON the Q parameter or its value → Q popup, unchanged.
    var lineIdx = val.slice(0,pos).split('\n').length - 1;
    openQPopup(lineIdx);
    return;
  }

  // Other line metrics
  var lineIdxNow = val.slice(0,pos).split('\n').length - 1;
  var lt = lineText.trim().toUpperCase();

  // Comment line (starts with ;) → edit directly in the textarea.
  // Give the textarea native focus so the on-screen keyboard appears and the
  // caret stays exactly where tapped; no panel, no field editor.
  if(/^\s*;/.test(lineText)){
    codeEl.readOnly = false;
    try{ codeEl.focus({preventScroll:true}); }catch(e){ codeEl.focus(); }
    saveLastSel();
    return;
  }
  // Empty line → keep caret so Enter adds another line.
  if(lineText.trim()===''){
    codeEl.readOnly = false;
    try{ codeEl.focus({preventScroll:true}); }catch(e){ codeEl.focus(); }
    saveLastSel();
    return;
  }

  // Inline comment: if the line has a ';' and the tap landed AT or AFTER it,
  // edit the comment text directly in the textarea (don't open the command editor).
  if(ci >= 0 && posInLine >= ci){
    codeEl.readOnly = false;
    try{ codeEl.focus({preventScroll:true}); }catch(e){ codeEl.focus(); }
    saveLastSel();
    return;
  }

  // Tap PAST the text → blinking caret at end for Enter (works for every line type).
  if(posInLine >= trimmedEnd){
    try{ codeEl.setSelectionRange(lineEnd, lineEnd); }catch(e){}
    saveLastSel();
    return;
  }

  // Tap ON the token → open the right editor for this line type.
  // BLK FORM → blank-size wizard, jump straight to the tapped field
  if(/^BLK FORM/.test(lt)){
    var _blkRoleM = /^BLK FORM 0\.2/i.test(lt) ? 'second' : 'first';
    var _blkAxisM = getBlkClickedAxis(lineText, posInLine);
    openBlkFormPanel(lineText.trim(), lineIdxNow, _blkAxisM, _blkRoleM);
    return;
  }
  // M function line (M, M3, M8, M0 …) → M picker (edit in place)
  if(/^M\d*(\s|$|\/)/.test(lt) || lt==='M'){
    if(typeof openMPanelEdit==='function'){ openMPanelEdit(lineIdxNow); return; }
  }
  // TOOL DEF → open the tool picker. Same model as CALL LBL and the other builder
  // commands below: a click anywhere on the command text opens the editor. We also
  // explicitly highlight the command text here (same mechanism selectField uses for
  // CALL LBL) so the native caret can't just sit blinking wherever was clicked.
  if(/^TOOL DEF/.test(lt)){
    if(typeof openToolDefEdit==='function'){
      if(!isMobile()){
        var _tdEnd = ci>=0 ? ci : trimmedEnd;
        try{ codeEl.setSelectionRange(ls, ls+_tdEnd); }catch(e){}
      }
      openToolDefEdit(lineIdxNow); return;
    }
  }
  // Command with a builder → field editor
  var info = getCaretLine();
  if(info){ enterFieldModeOnLine(info); return; }

  // Anything else (inline comment after a command, unknown token) → caret where tapped.
  saveLastSel();
});

// ---------- speed ----------

// ===== parser.js =====
// TNC Sim — Parser

var DEFAULT_FEED = 500;
var lastDefinedFeed = DEFAULT_FEED; // tracks last explicitly set F value for FAUTO
var TOOL_R = 5; // tool radius mm — used for radius compensation offset
var _WORKPIECE_TOP_Z = 20; // top surface Z, set during parsing — used for cone chamfer offset
var TOOL_NUM = 1; // current tool number
var currentToolNum = 1;
var currentFeed = 0;
var currentSpindle = 0;
var currentLBL = null;
var currentSpindleOn = false;
var currentCoolantOn = false;
var atcArm = null;
var atcAnim = null; // {phase, t, fromTool, toTool, toolPos}
// tool cut colors - each tool gets a different surface color



// Evaluate a Q expression: "+50", "Q1 + 10", "SIN(Q1)", etc.

// Replace Q references in a line with their current values


var AXIS_TOKENS = /^(I?[XYZABC][+-]?\d+\.?\d*|F[+]?\d+\.?\d*|FMAX|RL|RR|R0|M\d+|DR[+-]|R[+-]?\d+\.?\d*|PR[+-]?\d+\.?\d*|PA[+-]?\d+\.?\d*)$/;




// ── Radius-compensation post-processor ────────────────────────────
// Treats every maximal run of RC-active segments as a polyline and
// offsets it correctly with mitre joins + convex corner arcs.




// ===== renderer3d.js =====
// TNC Sim — 3D Renderer (Three.js + Voxel/Marching Cubes)

// ---------- Three.js scene ----------
var scene, camera, renderer, controls, toolGroup, blockMesh, blockEdges;
var feedLine, rapidLine, feedBuf, rapidBuf;
var _idleFrames = 0;
// ---------- voxel + marching cubes ----------
var VX = null; // voxel grid
var VX_QUALITY = 0; // 0=default, 1=high
var VX_RES_LEVELS = [100, 200];
var VX_RES = VX_RES_LEVELS[VX_QUALITY];

// Marching Cubes lookup tables and implementation
// Based on Paul Bourke's algorithm (public domain)
var MC_EDGE_TABLE = new Int32Array([0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c, 0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00, 0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c, 0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90, 0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c, 0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30, 0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac, 0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0, 0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c, 0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60, 0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc, 0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0, 0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c, 0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950, 0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc, 0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0, 0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc, 0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0, 0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c, 0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650, 0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc, 0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0, 0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c, 0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460, 0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac, 0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0, 0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c, 0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230, 0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c, 0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190, 0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c, 0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0]);
var MC_TRI_TABLE = new Int32Array([- 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 8, 3, 9, 8, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, 1, 2, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 2, 10, 0, 2, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 8, 3, 2, 10, 8, 10, 9, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 11, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 11, 2, 8, 11, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 9, 0, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 11, 2, 1, 9, 11, 9, 8, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 10, 1, 11, 10, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 10, 1, 0, 8, 10, 8, 11, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 9, 0, 3, 11, 9, 11, 10, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 8, 10, 10, 8, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 7, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 3, 0, 7, 3, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 9, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 1, 9, 4, 7, 1, 7, 3, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 4, 7, 3, 0, 4, 1, 2, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 2, 10, 9, 0, 2, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, - 1, - 1, - 1, - 1, 8, 4, 7, 3, 11, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 4, 7, 11, 2, 4, 2, 0, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 0, 1, 8, 4, 7, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, - 1, - 1, - 1, - 1, 3, 10, 1, 3, 11, 10, 7, 8, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, - 1, - 1, - 1, - 1, 4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, - 1, - 1, - 1, - 1, 4, 7, 11, 4, 11, 9, 9, 11, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 5, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 5, 4, 0, 8, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 5, 4, 1, 5, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 5, 4, 8, 3, 5, 3, 1, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, 9, 5, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 0, 8, 1, 2, 10, 4, 9, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 2, 10, 5, 4, 2, 4, 0, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, - 1, - 1, - 1, - 1, 9, 5, 4, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 11, 2, 0, 8, 11, 4, 9, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 5, 4, 0, 1, 5, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, - 1, - 1, - 1, - 1, 10, 3, 11, 10, 1, 3, 9, 5, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, - 1, - 1, - 1, - 1, 5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, - 1, - 1, - 1, - 1, 5, 4, 8, 5, 8, 10, 10, 8, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 7, 8, 5, 7, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 3, 0, 9, 5, 3, 5, 7, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 7, 8, 0, 1, 7, 1, 5, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 5, 3, 3, 5, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 7, 8, 9, 5, 7, 10, 1, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, - 1, - 1, - 1, - 1, 8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, - 1, - 1, - 1, - 1, 2, 10, 5, 2, 5, 3, 3, 5, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 9, 5, 7, 8, 9, 3, 11, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, - 1, - 1, - 1, - 1, 2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, - 1, - 1, - 1, - 1, 11, 2, 1, 11, 1, 7, 7, 1, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, - 1, - 1, - 1, - 1, 5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, - 1, 11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, - 1, 11, 10, 5, 7, 11, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 0, 1, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 8, 3, 1, 9, 8, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 6, 5, 2, 6, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 6, 5, 1, 2, 6, 3, 0, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 6, 5, 9, 0, 6, 0, 2, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, - 1, - 1, - 1, - 1, 2, 3, 11, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 0, 8, 11, 2, 0, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 9, 2, 3, 11, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, - 1, - 1, - 1, - 1, 6, 3, 11, 6, 5, 3, 5, 1, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, - 1, - 1, - 1, - 1, 3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, - 1, - 1, - 1, - 1, 6, 5, 9, 6, 9, 11, 11, 9, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 10, 6, 4, 7, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 3, 0, 4, 7, 3, 6, 5, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 9, 0, 5, 10, 6, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, - 1, - 1, - 1, - 1, 6, 1, 2, 6, 5, 1, 4, 7, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, - 1, - 1, - 1, - 1, 8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, - 1, - 1, - 1, - 1, 7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, - 1, 3, 11, 2, 7, 8, 4, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, - 1, - 1, - 1, - 1, 0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, - 1, - 1, - 1, - 1, 9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, - 1, 8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, - 1, - 1, - 1, - 1, 5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, - 1, 0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, - 1, 6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, - 1, - 1, - 1, - 1, 10, 4, 9, 6, 4, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 10, 6, 4, 9, 10, 0, 8, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 0, 1, 10, 6, 0, 6, 4, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, - 1, - 1, - 1, - 1, 1, 4, 9, 1, 2, 4, 2, 6, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, - 1, - 1, - 1, - 1, 0, 2, 4, 4, 2, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 3, 2, 8, 2, 4, 4, 2, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 4, 9, 10, 6, 4, 11, 2, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, - 1, - 1, - 1, - 1, 3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, - 1, - 1, - 1, - 1, 6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, - 1, 9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, - 1, - 1, - 1, - 1, 8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, - 1, 3, 11, 6, 3, 6, 0, 0, 6, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 6, 4, 8, 11, 6, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 10, 6, 7, 8, 10, 8, 9, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, - 1, - 1, - 1, - 1, 10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, - 1, - 1, - 1, - 1, 10, 6, 7, 10, 7, 1, 1, 7, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, - 1, - 1, - 1, - 1, 2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, - 1, 7, 8, 0, 7, 0, 6, 6, 0, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 3, 2, 6, 7, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, - 1, - 1, - 1, - 1, 2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, - 1, 1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, - 1, 11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, - 1, - 1, - 1, - 1, 8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, - 1, 0, 9, 1, 11, 6, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, - 1, - 1, - 1, - 1, 7, 11, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 0, 8, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 9, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 1, 9, 8, 3, 1, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 1, 2, 6, 11, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, 3, 0, 8, 6, 11, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 9, 0, 2, 10, 9, 6, 11, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, - 1, - 1, - 1, - 1, 7, 2, 3, 6, 2, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 0, 8, 7, 6, 0, 6, 2, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 7, 6, 2, 3, 7, 0, 1, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, - 1, - 1, - 1, - 1, 10, 7, 6, 10, 1, 7, 1, 3, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, - 1, - 1, - 1, - 1, 0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, - 1, - 1, - 1, - 1, 7, 6, 10, 7, 10, 8, 8, 10, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 6, 8, 4, 11, 8, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 6, 11, 3, 0, 6, 0, 4, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 6, 11, 8, 4, 6, 9, 0, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, - 1, - 1, - 1, - 1, 6, 8, 4, 6, 11, 8, 2, 10, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, - 1, - 1, - 1, - 1, 4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, - 1, - 1, - 1, - 1, 10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, - 1, 8, 2, 3, 8, 4, 2, 4, 6, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 4, 2, 4, 6, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, - 1, - 1, - 1, - 1, 1, 9, 4, 1, 4, 2, 2, 4, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, - 1, - 1, - 1, - 1, 10, 1, 0, 10, 0, 6, 6, 0, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, - 1, 10, 9, 4, 6, 10, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 9, 5, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, 4, 9, 5, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 0, 1, 5, 4, 0, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, - 1, - 1, - 1, - 1, 9, 5, 4, 10, 1, 2, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, - 1, - 1, - 1, - 1, 7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, - 1, - 1, - 1, - 1, 3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, - 1, 7, 2, 3, 7, 6, 2, 5, 4, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, - 1, - 1, - 1, - 1, 3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, - 1, - 1, - 1, - 1, 6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, - 1, 9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, - 1, - 1, - 1, - 1, 1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, - 1, 4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, - 1, 7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, - 1, - 1, - 1, - 1, 6, 9, 5, 6, 11, 9, 11, 8, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, - 1, - 1, - 1, - 1, 0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, - 1, - 1, - 1, - 1, 6, 11, 3, 6, 3, 5, 5, 3, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, - 1, - 1, - 1, - 1, 0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, - 1, 11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, - 1, 6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, - 1, - 1, - 1, - 1, 5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, - 1, - 1, - 1, - 1, 9, 5, 6, 9, 6, 0, 0, 6, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, - 1, 1, 5, 6, 2, 1, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, - 1, 10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, - 1, - 1, - 1, - 1, 0, 3, 8, 5, 6, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 5, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 5, 10, 7, 5, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 5, 10, 11, 7, 5, 8, 3, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 11, 7, 5, 10, 11, 1, 9, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, - 1, - 1, - 1, - 1, 11, 1, 2, 11, 7, 1, 7, 5, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, - 1, - 1, - 1, - 1, 9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, - 1, - 1, - 1, - 1, 7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, - 1, 2, 5, 10, 2, 3, 5, 3, 7, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, - 1, - 1, - 1, - 1, 9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, - 1, - 1, - 1, - 1, 9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, - 1, 1, 3, 5, 3, 7, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 7, 0, 7, 1, 1, 7, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 0, 3, 9, 3, 5, 5, 3, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 8, 7, 5, 9, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 8, 4, 5, 10, 8, 10, 11, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, - 1, - 1, - 1, - 1, 0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, - 1, - 1, - 1, - 1, 10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, - 1, 2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, - 1, - 1, - 1, - 1, 0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, - 1, 0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, - 1, 9, 4, 5, 2, 11, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, - 1, - 1, - 1, - 1, 5, 10, 2, 5, 2, 4, 4, 2, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, - 1, 5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, - 1, - 1, - 1, - 1, 8, 4, 5, 8, 5, 3, 3, 5, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 4, 5, 1, 0, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, - 1, - 1, - 1, - 1, 9, 4, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 11, 7, 4, 9, 11, 9, 10, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, - 1, - 1, - 1, - 1, 1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, - 1, - 1, - 1, - 1, 3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, - 1, 4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, - 1, - 1, - 1, - 1, 9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, - 1, 11, 7, 4, 11, 4, 2, 2, 4, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, - 1, - 1, - 1, - 1, 2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, - 1, - 1, - 1, - 1, 9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, - 1, 3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, - 1, 1, 10, 2, 8, 7, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 9, 1, 4, 1, 7, 7, 1, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, - 1, - 1, - 1, - 1, 4, 0, 3, 7, 4, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 8, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 10, 8, 10, 11, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 0, 9, 3, 9, 11, 11, 9, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 10, 0, 10, 8, 8, 10, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 1, 10, 11, 3, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 11, 1, 11, 9, 9, 11, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, - 1, - 1, - 1, - 1, 0, 2, 11, 8, 0, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 2, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 3, 8, 2, 8, 10, 10, 8, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 10, 2, 0, 9, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, - 1, - 1, - 1, - 1, 1, 10, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 3, 8, 9, 1, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 9, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 3, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1]);

var THREE_OK = (typeof THREE !== 'undefined');
var glContextLost = false;
var TOOL_COLOR = 0xe8530a;
var RAPID_MMS = 150;        // visual rapid speed mm/s at 1x (fast but visible)
var VISUAL_GAIN = 3;        // overall liveliness factor


// Uncut stock (workpiece) colour — darker in light theme so it stands out
// against the light 3D stage instead of blending into it.

// ---------- dexel implementation ----------
// Each column (ix,iy) stores a sorted list of [zTop, zBot] segments (material present between zBot and zTop)
// On init: one segment [maxZ, minZ] = full block
// On cut: remove material from zBot_cut to zTop (tool tip to top of block within tool radius)




// Marching Cubes mesh generation


// ---------- high-res precise mesh (chunked main-thread) ----------
var _refineChunks = null;

var REFINE_WORKER_CODE = "'use strict';\nvar MC_EDGE_TABLE = new Int32Array([0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c, 0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00, 0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c, 0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90, 0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c, 0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30, 0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac, 0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0, 0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c, 0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60, 0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc, 0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0, 0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c, 0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950, 0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc, 0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0, 0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc, 0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0, 0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c, 0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650, 0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc, 0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0, 0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c, 0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460, 0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac, 0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0, 0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c, 0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230, 0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c, 0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190, 0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c, 0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0]);\nvar MC_TRI_TABLE = new Int32Array([- 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 8, 3, 9, 8, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, 1, 2, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 2, 10, 0, 2, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 8, 3, 2, 10, 8, 10, 9, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 11, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 11, 2, 8, 11, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 9, 0, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 11, 2, 1, 9, 11, 9, 8, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 10, 1, 11, 10, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 10, 1, 0, 8, 10, 8, 11, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 9, 0, 3, 11, 9, 11, 10, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 8, 10, 10, 8, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 7, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 3, 0, 7, 3, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 9, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 1, 9, 4, 7, 1, 7, 3, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 4, 7, 3, 0, 4, 1, 2, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 2, 10, 9, 0, 2, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, - 1, - 1, - 1, - 1, 8, 4, 7, 3, 11, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 4, 7, 11, 2, 4, 2, 0, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 0, 1, 8, 4, 7, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, - 1, - 1, - 1, - 1, 3, 10, 1, 3, 11, 10, 7, 8, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, - 1, - 1, - 1, - 1, 4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, - 1, - 1, - 1, - 1, 4, 7, 11, 4, 11, 9, 9, 11, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 5, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 5, 4, 0, 8, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 5, 4, 1, 5, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 5, 4, 8, 3, 5, 3, 1, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, 9, 5, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 0, 8, 1, 2, 10, 4, 9, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 2, 10, 5, 4, 2, 4, 0, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, - 1, - 1, - 1, - 1, 9, 5, 4, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 11, 2, 0, 8, 11, 4, 9, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 5, 4, 0, 1, 5, 2, 3, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, - 1, - 1, - 1, - 1, 10, 3, 11, 10, 1, 3, 9, 5, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, - 1, - 1, - 1, - 1, 5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, - 1, - 1, - 1, - 1, 5, 4, 8, 5, 8, 10, 10, 8, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 7, 8, 5, 7, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 3, 0, 9, 5, 3, 5, 7, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 7, 8, 0, 1, 7, 1, 5, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 5, 3, 3, 5, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 7, 8, 9, 5, 7, 10, 1, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, - 1, - 1, - 1, - 1, 8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, - 1, - 1, - 1, - 1, 2, 10, 5, 2, 5, 3, 3, 5, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 9, 5, 7, 8, 9, 3, 11, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, - 1, - 1, - 1, - 1, 2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, - 1, - 1, - 1, - 1, 11, 2, 1, 11, 1, 7, 7, 1, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, - 1, - 1, - 1, - 1, 5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, - 1, 11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, - 1, 11, 10, 5, 7, 11, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 0, 1, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 8, 3, 1, 9, 8, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 6, 5, 2, 6, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 6, 5, 1, 2, 6, 3, 0, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 6, 5, 9, 0, 6, 0, 2, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, - 1, - 1, - 1, - 1, 2, 3, 11, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 0, 8, 11, 2, 0, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 9, 2, 3, 11, 5, 10, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, - 1, - 1, - 1, - 1, 6, 3, 11, 6, 5, 3, 5, 1, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, - 1, - 1, - 1, - 1, 3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, - 1, - 1, - 1, - 1, 6, 5, 9, 6, 9, 11, 11, 9, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 10, 6, 4, 7, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 3, 0, 4, 7, 3, 6, 5, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 9, 0, 5, 10, 6, 8, 4, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, - 1, - 1, - 1, - 1, 6, 1, 2, 6, 5, 1, 4, 7, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, - 1, - 1, - 1, - 1, 8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, - 1, - 1, - 1, - 1, 7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, - 1, 3, 11, 2, 7, 8, 4, 10, 6, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, - 1, - 1, - 1, - 1, 0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, - 1, - 1, - 1, - 1, 9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, - 1, 8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, - 1, - 1, - 1, - 1, 5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, - 1, 0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, - 1, 6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, - 1, - 1, - 1, - 1, 10, 4, 9, 6, 4, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 10, 6, 4, 9, 10, 0, 8, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 0, 1, 10, 6, 0, 6, 4, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, - 1, - 1, - 1, - 1, 1, 4, 9, 1, 2, 4, 2, 6, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, - 1, - 1, - 1, - 1, 0, 2, 4, 4, 2, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 3, 2, 8, 2, 4, 4, 2, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 4, 9, 10, 6, 4, 11, 2, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, - 1, - 1, - 1, - 1, 3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, - 1, - 1, - 1, - 1, 6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, - 1, 9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, - 1, - 1, - 1, - 1, 8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, - 1, 3, 11, 6, 3, 6, 0, 0, 6, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 6, 4, 8, 11, 6, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 10, 6, 7, 8, 10, 8, 9, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, - 1, - 1, - 1, - 1, 10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, - 1, - 1, - 1, - 1, 10, 6, 7, 10, 7, 1, 1, 7, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, - 1, - 1, - 1, - 1, 2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, - 1, 7, 8, 0, 7, 0, 6, 6, 0, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 3, 2, 6, 7, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, - 1, - 1, - 1, - 1, 2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, - 1, 1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, - 1, 11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, - 1, - 1, - 1, - 1, 8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, - 1, 0, 9, 1, 11, 6, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, - 1, - 1, - 1, - 1, 7, 11, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 0, 8, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 9, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 1, 9, 8, 3, 1, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 1, 2, 6, 11, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, 3, 0, 8, 6, 11, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 9, 0, 2, 10, 9, 6, 11, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, - 1, - 1, - 1, - 1, 7, 2, 3, 6, 2, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 7, 0, 8, 7, 6, 0, 6, 2, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 7, 6, 2, 3, 7, 0, 1, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, - 1, - 1, - 1, - 1, 10, 7, 6, 10, 1, 7, 1, 3, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, - 1, - 1, - 1, - 1, 0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, - 1, - 1, - 1, - 1, 7, 6, 10, 7, 10, 8, 8, 10, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 6, 8, 4, 11, 8, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 6, 11, 3, 0, 6, 0, 4, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 6, 11, 8, 4, 6, 9, 0, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, - 1, - 1, - 1, - 1, 6, 8, 4, 6, 11, 8, 2, 10, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, - 1, - 1, - 1, - 1, 4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, - 1, - 1, - 1, - 1, 10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, - 1, 8, 2, 3, 8, 4, 2, 4, 6, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 4, 2, 4, 6, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, - 1, - 1, - 1, - 1, 1, 9, 4, 1, 4, 2, 2, 4, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, - 1, - 1, - 1, - 1, 10, 1, 0, 10, 0, 6, 6, 0, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, - 1, 10, 9, 4, 6, 10, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 9, 5, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, 4, 9, 5, 11, 7, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 0, 1, 5, 4, 0, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, - 1, - 1, - 1, - 1, 9, 5, 4, 10, 1, 2, 7, 6, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, - 1, - 1, - 1, - 1, 7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, - 1, - 1, - 1, - 1, 3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, - 1, 7, 2, 3, 7, 6, 2, 5, 4, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, - 1, - 1, - 1, - 1, 3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, - 1, - 1, - 1, - 1, 6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, - 1, 9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, - 1, - 1, - 1, - 1, 1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, - 1, 4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, - 1, 7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, - 1, - 1, - 1, - 1, 6, 9, 5, 6, 11, 9, 11, 8, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, - 1, - 1, - 1, - 1, 0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, - 1, - 1, - 1, - 1, 6, 11, 3, 6, 3, 5, 5, 3, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, - 1, - 1, - 1, - 1, 0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, - 1, 11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, - 1, 6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, - 1, - 1, - 1, - 1, 5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, - 1, - 1, - 1, - 1, 9, 5, 6, 9, 6, 0, 0, 6, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, - 1, 1, 5, 6, 2, 1, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, - 1, 10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, - 1, - 1, - 1, - 1, 0, 3, 8, 5, 6, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 5, 6, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 5, 10, 7, 5, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 5, 10, 11, 7, 5, 8, 3, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 11, 7, 5, 10, 11, 1, 9, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, - 1, - 1, - 1, - 1, 11, 1, 2, 11, 7, 1, 7, 5, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, - 1, - 1, - 1, - 1, 9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, - 1, - 1, - 1, - 1, 7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, - 1, 2, 5, 10, 2, 3, 5, 3, 7, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, - 1, - 1, - 1, - 1, 9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, - 1, - 1, - 1, - 1, 9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, - 1, 1, 3, 5, 3, 7, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 7, 0, 7, 1, 1, 7, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 0, 3, 9, 3, 5, 5, 3, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 8, 7, 5, 9, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 8, 4, 5, 10, 8, 10, 11, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, - 1, - 1, - 1, - 1, 0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, - 1, - 1, - 1, - 1, 10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, - 1, 2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, - 1, - 1, - 1, - 1, 0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, - 1, 0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, - 1, 9, 4, 5, 2, 11, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, - 1, - 1, - 1, - 1, 5, 10, 2, 5, 2, 4, 4, 2, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, - 1, 5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, - 1, - 1, - 1, - 1, 8, 4, 5, 8, 5, 3, 3, 5, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 4, 5, 1, 0, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, - 1, - 1, - 1, - 1, 9, 4, 5, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 11, 7, 4, 9, 11, 9, 10, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, - 1, - 1, - 1, - 1, 1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, - 1, - 1, - 1, - 1, 3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, - 1, 4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, - 1, - 1, - 1, - 1, 9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, - 1, 11, 7, 4, 11, 4, 2, 2, 4, 0, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, - 1, - 1, - 1, - 1, 2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, - 1, - 1, - 1, - 1, 9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, - 1, 3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, - 1, 1, 10, 2, 8, 7, 4, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 9, 1, 4, 1, 7, 7, 1, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, - 1, - 1, - 1, - 1, 4, 0, 3, 7, 4, 3, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 4, 8, 7, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 10, 8, 10, 11, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 0, 9, 3, 9, 11, 11, 9, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 10, 0, 10, 8, 8, 10, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 1, 10, 11, 3, 10, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 2, 11, 1, 11, 9, 9, 11, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, - 1, - 1, - 1, - 1, 0, 2, 11, 8, 0, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 3, 2, 11, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 3, 8, 2, 8, 10, 10, 8, 9, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 9, 10, 2, 0, 9, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, - 1, - 1, - 1, - 1, 1, 10, 2, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 1, 3, 8, 9, 1, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 9, 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 3, 8, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1]);\n\nself.onmessage = function(e){\n  var d = e.data;\n  var type = d.type;\n\n  if(type === 'refine'){\n    var min = d.min, max = d.max;\n    var nx = d.nx, ny = d.ny, nz = d.nz;\n    var dx = d.dx, dy = d.dy, dz = d.dz;\n    var subArr = d.subArr;    // array of segment objects\n    var vxCut  = new Uint8Array(d.vxCut);   // low-res cut grid\n    var vxNx = d.vxNx, vxNy = d.vxNy, vxNz = d.vxNz;\n    var vxOx = d.vxOx, vxOy = d.vxOy, vxOz = d.vxOz;\n    var vxDx = d.vxDx, vxDy = d.vxDy, vxDz = d.vxDz;\n    var blkCyl = d.blkCyl || null;\n    var tools  = d.tools;  // {T: {R, R2, T_ANGLE, LCUTS}} map\n\n    // \u2500\u2500 Phase 1: init grid \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n    var grid    = new Uint8Array(nx*ny*nz);\n    var cutGrid = new Uint8Array(nx*ny*nz);\n\n    // Pre-populate cutGrid from low-res\n    for(var piz=0;piz<nz;piz++) for(var piy=0;piy<ny;piy++) for(var pix=0;pix<nx;pix++){\n      var wx=min.x+pix*dx, wy=min.y+piy*dy, wz=min.z+piz*dz;\n      var vi=Math.round((wx-vxOx)/vxDx), vj=Math.round((wy-vxOy)/vxDy), vk=Math.round((wz-vxOz)/vxDz);\n      if(vi>=0&&vi<vxNx&&vj>=0&&vj<vxNy&&vk>=0&&vk<vxNz){\n        var cv=vxCut[vk*vxNy*vxNx+vj*vxNx+vi];\n        if(cv) cutGrid[piz*ny*nx+piy*nx+pix]=cv;\n      }\n    }\n\n    // Init solid/air grid\n    for(var iz=0;iz<nz;iz++) for(var iy=0;iy<ny;iy++) for(var ix=0;ix<nx;ix++){\n      var border=(ix===0||ix===nx-1||iy===0||iy===ny-1||iz===0||iz===nz-1);\n      var inShape=true;\n      if(!border && blkCyl){\n        var rwx=min.x+ix*dx, rwy=min.y+iy*dy;\n        var rddx=rwx-blkCyl.cx, rddy=rwy-blkCyl.cy;\n        inShape=(rddx*rddx+rddy*rddy)<=(blkCyl.r-dx)*(blkCyl.r-dx);\n      }\n      grid[iz*ny*nx+iy*nx+ix]=(border||!inShape)?0:1;\n    }\n    self.postMessage({type:'progress', pct:10});\n\n    // \u2500\u2500 Phase 2: apply cuts \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n    var nSub = subArr.length;\n    for(var si=0;si<nSub;si++){\n      var sm = subArr[si];\n      if(sm.rapid) continue;\n      var tnum = sm.toolNum||1;\n      var _ct = tools[tnum] || null;\n      var _isDrill = _ct && _ct.TYPE==='DRILL';\n      var _isMillT = _ct && (_ct.TYPE==='MILL' || !_ct.TYPE);\n      var _dlOv = sm.dlPgm||0;\n      var _drTab = _isMillT ? ((_ct&&_ct.DR)||0) : 0;\n      var toolR = _ct ? (_ct.R + _drTab) : 5;\n      var r2base = toolR*toolR;\n      var _isBall  = _ct && _ct.R2>0 && _ct.R2>=_ct.R;\n      var _isTorus = _ct && _ct.R2>0 && _ct.R2<_ct.R;\n      var _isCone  = _ct && _ct.T_ANGLE>0 && !(_ct.R2>0);\n      var _ballR2  = (_isBall||_isTorus) ? (_ct.R2+(_ct.DR2||0)) : 0;\n      var _ballR2eff = _ballR2;\n      var _tCore   = _isTorus ? (toolR-_ballR2) : 0;\n      var _coneHR  = _isCone  ? (_ct.T_ANGLE/2)*Math.PI/180 : 0;\n      var _lcuts   = _ct ? (_ct.LCUTS||99999) : 99999;\n\n      // scan range\n      var scanR = toolR;\n      if(_isCone && !_isDrill){ var _coneMaxS=(_lcuts||9999)*Math.tan(_coneHR); scanR=Math.max(toolR,_coneMaxS); }\n      var segLen = sm.len || 0;\n      var steps = Math.max(2, Math.ceil(segLen/Math.min(dx,dy)*1.5));\n\n      for(var st=0;st<=steps;st++){\n        var t=st/steps;\n        var tx=sm.from.x+(sm.to.x-sm.from.x)*t;\n        var ty=sm.from.y+(sm.to.y-sm.from.y)*t;\n        var tz=sm.from.z+(sm.to.z-sm.from.z)*t + _dlOv;\n        if(tz>max.z) continue;\n\n        var ixMin=Math.max(0,Math.floor((tx-scanR-min.x)/dx)-1);\n        var ixMax=Math.min(nx-1,Math.ceil((tx+scanR-min.x)/dx)+1);\n        var iyMin=Math.max(0,Math.floor((ty-scanR-min.y)/dy)-1);\n        var iyMax=Math.min(ny-1,Math.ceil((ty+scanR-min.y)/dy)+1);\n        var izMin=Math.max(0,Math.floor((tz-min.z)/dz)-1);\n\n        for(var vz=izMin;vz<nz;vz++){\n          var pz=min.z+vz*dz; if(pz<tz-dz*0.5) continue;\n          var _dzRef=pz-tz;\n          var effR2=r2base;\n          if(_isBall && _dzRef<_ballR2){\n            var _frac=_dzRef/_ballR2;\n            var _eR=_ballR2eff*Math.sqrt(Math.max(0,1-(1-_frac)*(1-_frac)));\n            effR2=_eR*_eR;\n          } else if(_isTorus && _dzRef<_ballR2){\n            var _eRt=_tCore+Math.sqrt(Math.max(0,_ballR2*_ballR2-(_ballR2-_dzRef)*(_ballR2-_dzRef)));\n            effR2=_eRt*_eRt;\n          } else if(_isCone){\n            if(_isDrill){\n              var _eR2=Math.min(toolR,_dzRef*Math.tan(_coneHR));\n              effR2=_eR2*_eR2;\n            } else {\n              var _coneCapW=(_lcuts||9999)*Math.tan(_coneHR);\n              var _eR2b=Math.min(_coneCapW,toolR+_dzRef*Math.tan(_coneHR));\n              effR2=_eR2b*_eR2b;\n            }\n          }\n          var colorVal=(_dzRef<=_lcuts)?(tnum||1):255;\n          for(var vy=iyMin;vy<=iyMax;vy++){\n            var py=min.y+vy*dy;\n            for(var vx2=ixMin;vx2<=ixMax;vx2++){\n              var px=min.x+vx2*dx;\n              var ddx=px-tx,ddy=py-ty;\n              if(ddx*ddx+ddy*ddy<=effR2){\n                var gi2=vz*ny*nx+vy*nx+vx2;\n                if(grid[gi2]){ grid[gi2]=0; cutGrid[gi2]=colorVal; }\n              }\n            }\n          }\n        }\n      }\n      if(si%50===0) self.postMessage({type:'progress', pct:10+Math.round(si/nSub*40)});\n    }\n    self.postMessage({type:'progress', pct:50});\n\n    // \u2500\u2500 Phase 3: Marching Cubes \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n    var vertsOut=[], normsOut=[], triColorsOut=[];\n\n    function vInterp(iso,p1x,p1y,p1z,v1,p2x,p2y,p2z,v2,out){\n      if(Math.abs(v1-v2)<1e-6){out[0]=p1x;out[1]=p1y;out[2]=p1z;return;}\n      var t=(iso-v1)/(v2-v1);\n      out[0]=p1x+t*(p2x-p1x);out[1]=p1y+t*(p2y-p1y);out[2]=p1z+t*(p2z-p1z);\n    }\n\n    var iso=0.5;\n    var ep=[];\n    for(var ei=0;ei<12;ei++) ep.push([0,0,0]);\n    var edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];\n\n    for(var miz=0;miz<nz-1;miz++){\n      for(var miy=0;miy<ny-1;miy++){\n        for(var mix=0;mix<nx-1;mix++){\n          var x0=min.x+mix*dx,y0=min.y+miy*dy,z0=min.z+miz*dz;\n          var x1=x0+dx,y1=y0+dy,z1=z0+dz;\n          var g=function(a,b,c){ return grid[c*ny*nx+b*nx+a]||0; };\n          var cv=[g(mix,miy,miz),g(mix+1,miy,miz),g(mix+1,miy+1,miz),g(mix,miy+1,miz),\n                  g(mix,miy,miz+1),g(mix+1,miy,miz+1),g(mix+1,miy+1,miz+1),g(mix,miy+1,miz+1)];\n          var ci=0;\n          if(cv[0]>iso)ci|=1;if(cv[1]>iso)ci|=2;if(cv[2]>iso)ci|=4;if(cv[3]>iso)ci|=8;\n          if(cv[4]>iso)ci|=16;if(cv[5]>iso)ci|=32;if(cv[6]>iso)ci|=64;if(cv[7]>iso)ci|=128;\n          if(ci===0||ci===255) continue;\n          var et=MC_EDGE_TABLE[ci];\n          var cx2=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],\n                   [x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];\n          for(var e=0;e<12;e++){\n            if(et&(1<<e)){\n              var ea=edges[e][0],eb=edges[e][1];\n              vInterp(iso,cx2[ea][0],cx2[ea][1],cx2[ea][2],cv[ea],\n                          cx2[eb][0],cx2[eb][1],cx2[eb][2],cv[eb],ep[e]);\n            }\n          }\n          var triBase=ci*16;\n          for(var ti=0;ti<15;ti+=3){\n            if(MC_TRI_TABLE[triBase+ti]<0) break;\n            var pa=ep[MC_TRI_TABLE[triBase+ti]];\n            var pb=ep[MC_TRI_TABLE[triBase+ti+1]];\n            var pc=ep[MC_TRI_TABLE[triBase+ti+2]];\n            // normal\n            var ax=pb[0]-pa[0],ay=pb[1]-pa[1],az=pb[2]-pa[2];\n            var bx=pc[0]-pa[0],by=pc[1]-pa[1],bz=pc[2]-pa[2];\n            var nnx=ay*bz-az*by,nny=az*bx-ax*bz,nnz=ax*by-ay*bx;\n            var nl=Math.sqrt(nnx*nnx+nny*nny+nnz*nnz)||1;\n            nnx/=nl;nny/=nl;nnz/=nl;\n            vertsOut.push(pa[0],pa[1],pa[2],pb[0],pb[1],pb[2],pc[0],pc[1],pc[2]);\n            normsOut.push(nnx,nny,nnz,nnx,nny,nnz,nnx,nny,nnz);\n            // color from cutGrid corners\n            var triTool=0;\n            var corners8=[mix,miy,miz, mix+1,miy,miz, mix+1,miy+1,miz, mix,miy+1,miz,\n                           mix,miy,miz+1, mix+1,miy,miz+1, mix+1,miy+1,miz+1, mix,miy+1,miz+1];\n            for(var ci8=0;ci8<24&&!triTool;ci8+=3){\n              var gv8=corners8[ci8+2]*ny*nx+corners8[ci8+1]*nx+corners8[ci8];\n              if(cutGrid[gv8]) triTool=cutGrid[gv8];\n            }\n            if(!triTool){\n              for(var dz3=-1;dz3<=2&&!triTool;dz3++){\n                for(var ci9=0;ci9<24&&!triTool;ci9+=3){\n                  var gz9=(corners8[ci9+2]+dz3)*ny*nx+corners8[ci9+1]*nx+corners8[ci9];\n                  if(gz9>=0&&gz9<cutGrid.length&&cutGrid[gz9]) triTool=cutGrid[gz9];\n                }\n              }\n            }\n            triColorsOut.push(triTool);\n          }\n        }\n      }\n      if(miz%50===0) self.postMessage({type:'progress', pct:50+Math.round(miz/(nz-1)*50)});\n    }\n\n    // Transfer as Float32Array / Int32Array for zero-copy\n    var vertsF  = new Float32Array(vertsOut);\n    var normsF  = new Float32Array(normsOut);\n    var colorsI = new Int32Array(triColorsOut);\n\n    self.postMessage({\n      type: 'done',\n      verts:  vertsF.buffer,\n      norms:  normsF.buffer,\n      colors: colorsI.buffer\n    }, [vertsF.buffer, normsF.buffer, colorsI.buffer]);\n  }\n};";

var _refineWorker = null;













// ===== renderer2d.js =====
// TNC Sim — 2D XY Toolpath View

// ---------- 2D XY view ----------


// ===== app.js =====
// TNC Sim — App: simulation state, UI handlers, boot

// ---------- animation state ----------
var prog = null;
var sub = [];
var subIndex = 0;
var activeSrcLine = -1;
var subProgress = 0;
var leftoverApplied = false;
var mode = 'idle';            // idle | running | stepping | paused | done
var stepTargetBlock = -1;
var dirty = true;
var clock = THREE_OK ? new THREE.Clock() : null;
var toolPos = {x:0,y:0,z:0};





var pendingToolGroup = null;
var pendingToolNum = 0; // tool number waiting in magazine









var pathsVisible = true;












// ---------- UI handlers ----------





// ---------- view switch ----------
var curView='3d';


// ---------- panel resize ----------
(function(){
  var handle = document.getElementById('panelResize');
  var panel  = handle && handle.closest('.editor-panel');
  if(!handle || !panel) return;
  var startX, startW;
  handle.addEventListener('mousedown', function(e){
    startX = e.clientX;
    startW = panel.getBoundingClientRect().width;
    handle.classList.add('dragging');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  });
  function onMove(e){
    var w = Math.min(700, Math.max(260, startW + (e.clientX - startX)));
    panel.style.width = w + 'px';
  }
  function onUp(){
    handle.classList.remove('dragging');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
})();

// ---------- measure ----------
var measureMode = false;
var measureSubMode = 'point'; // 'point' | 'dist'
var measureItems = [];   // {type:'point'|'dist', data, markers:[]}
var measurePending = null; // first click for distance
var measureMouseDown = null;
var measureRaycaster = null;













// ---------- boot ----------
updateLineNums();
runValidation();
buildKeypad();
renderIdlePanel();

// View hint — desktop vs touch
(function(){
  var h = document.getElementById('viewHint');
  if(!h) return;
  if(window.matchMedia('(pointer:coarse)').matches){
    h.innerHTML = '<span style="color:var(--text2)">1 finger</span> orbit &nbsp; <span style="color:var(--text2)">2 fingers pinch</span> zoom &nbsp; <span style="color:var(--text2)">2 fingers drag</span> pan';
  } else {
    h.innerHTML = '<span style="color:var(--text2)">&#x2B2F; drag</span> orbit &nbsp; <span style="color:var(--text2)">&#x25CE; scroll</span> zoom &nbsp; <span style="color:var(--text2)">&#x2B2F; right</span> pan';
  }
})();
if(THREE_OK){
  init3D();
  initMeasureRaycaster();
  prepare();
  loop();
} else {
  // fallback: 2D only
  document.getElementById('tab3d').style.display='none';
  switchView('2d');
  prepare();
  draw2dFull(false);
  updateStatus('3D unavailable — using XY view', false);
  // loop() (which calls advance() to actually progress the simulation) is gated
  // behind THREE_OK/renderer and is never started in this branch — without this,
  // Run/Step would set mode='running'/'stepping' and just sit there forever.
  // Drive playback independently here, redrawing the 2D canvas each frame.
  (function loop2d(){
    requestAnimationFrame(loop2d);
    var now = performance.now();
    var dt = Math.min((now - (loop2d._last || now)) / 1000, 0.1);
    loop2d._last = now;
    if(mode==='running' || mode==='stepping'){
      advance(dt);
      if(curView==='2d') draw2dFull(true);
    }
  })();
}
/* ===MAIN_END=== */




/* ══════════════════════════════════════════════════════════════════
   LEARN MODE — interactive beginner lessons
   Slides teach one concept, then 3 tasks are solved in the REAL editor
   and verified by running the actual parser over the student's code.
   ══════════════════════════════════════════════════════════════════ */

/* Parametric SVG: isometric blank with labeled MIN/MAX corners */

/* Syntax-highlight a multi-line snippet using the editor's own highlighter */

/* Top-view toolpath drawn by the REAL parser — diagrams that can't lie.
   dashed grey = FMAX, orange = cutting (below surface), green = feed above. */

/* Cross-section: a 90° countersink breaking an edge. The workpiece edge is cut
   by the SIDE (cutting face) of the cone, not the tip. DL-2 drops the tip below
   the surface, DR+2 shifts the tool path off the edge; both are equal (2 mm). */
/* Side view: a tap / threaded hole — shows PITCH (one turn = one pitch deeper)
   and the spindle rotation direction locked to the downfeed. */

/* Side view: mill with L (length) and R (radius) dimensions */

/* Side view: safe approach — rapid high, rapid to clearance, feed below surface */

/* Top view: RL / RR — tool circle left/right of motion direction */

/* Two corners side by side: RND radius arc vs CHF chamfer */

/* Dimensioned exam drawing: top view of the cover plate */

/* Dimensioned engineering drawing of the parametric-depth contour part (lesson 15):
   a 90x90 profile (X5..X95) with an R15 rounded corner top-left and a 15x45 chamfer
   bottom-right, inside a 100x100 blank with 5 mm of stock (top Z+5, floor Z0). */

/* Polar diagram: pole CC, radius PR, angle PA — with concrete values */

/* Bolt circle diagram: three holes at the same PR, angles stepped 120\u00b0 */

/* Section view: counterbore for a screw head in a pre-drilled hole */

/* Arc by centre: CC + C with concrete values (like the polar diagrams) */

/* Arc by radius: CR with concrete values — no centre needed */

/* Side view: cycle 200 depths with Q labels */

/* ── Lesson content ─────────────────────────────────────────── */

/* ── Check engine (pure: code string + task -> results) ─────── */

/* ── State + persistence ────────────────────────────────────── */
var LEARN = { open:false, lesson:-1, slide:0, task:-1, savedCode:null, lastResults:null };

/* ── UI: docked Learn panel (list / slides / task in one column) ── */

/* 3D blank visibility in Learn mode: no BLK FORM written yet -> no blank shown.
   The moment both BLK FORM lines parse, rebuild + reveal the block so the
   student SEES their blank appear. Outside Learn mode: always visible. */
var _learnBlankShown = null; // tri-state so we only rebuild on transitions

/* ── Mobile bottom-tab controller (no-op on desktop) ── */
document.body.setAttribute('data-mtab','editor');







// Never register the service worker inside the Capacitor Android app: the app
// ships its own bundled files, and a SW-cached old index.html would keep being
// served after an app update (masking it). Web/PWA only.
if('serviceWorker' in navigator && !window.Capacitor){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/service-worker.js').then(function(reg){
      reg.addEventListener('updatefound', function(){
        var newWorker = reg.installing;
        if(!newWorker) return;
        newWorker.addEventListener('statechange', function(){
          if(newWorker.state === 'installed' && navigator.serviceWorker.controller){
            // A new version is cached and will take over on the next launch.
            console.log('TNC Sim: update ready, will be used next launch.');
          }
        });
      });
    }).catch(function(err){ console.warn('Service worker registration failed:', err); });
  });
}
