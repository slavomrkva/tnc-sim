// Shared VM harness for cycle / cutting-logic regression tests.
// Loads core/parser-engine.js (a classic browser script) into an isolated
// context with the minimal globals the parser reads, and exposes
// parseProgram + validateProgram. A fresh `probs` array and reset TOOL_R are
// provided per parse so runs never leak state into each other.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const parserSource = fs.readFileSync(path.join(root, 'core', 'parser-engine.js'), 'utf8');

// Tool table used by the regressions. Effective compensation radius is always
// R + DR(table) + DR(TOOL CALL); the physical mesh uses table geometry only.
const TOOLS = {
  1:  {T:1,  TYPE:'MILL',        R:5,     R2:0, DR:0, DR2:0, DL:0, RCUTS:4},
  4:  {T:4,  TYPE:'DRILL',       R:3.4,   R2:0, DR:0, DR2:0, DL:0, T_ANGLE:118},
  5:  {T:5,  TYPE:'COUNTERSINK', R:0.001, R2:0, DR:0, DR2:0, DL:0, T_ANGLE:90, LCUTS:4},
  7:  {T:7,  TYPE:'DRILL',       R:4,     R2:0, DR:0, DR2:0, DL:0, PITCH:1.25},
  // R1 radius-compensation probes (effective radius stated in the name):
  20: {T:20, TYPE:'MILL',        R:0.001, R2:0, DR:0, DR2:0, DL:0}, // eff 0.001
  21: {T:21, TYPE:'MILL',        R:0.049, R2:0, DR:0, DR2:0, DL:0}, // eff 0.049
  22: {T:22, TYPE:'MILL',        R:0.05,  R2:0, DR:0, DR2:0, DL:0}, // eff 0.05
  23: {T:23, TYPE:'MILL',        R:2,     R2:0, DR:0, DR2:0, DL:0}, // eff 2 (normal)
  24: {T:24, TYPE:'MILL',        R:1,     R2:0, DR:0, DR2:0, DL:0}, // eff via DR_call: 0 / negative
  25: {T:25, TYPE:'MILL',        R:2,     R2:0, DR:0, DR2:0, DL:0, ANGLE:5},
  26: {T:26, TYPE:'MILL',        R:5,     R2:2, DR:0, DR2:1, DL:0, ANGLE:0, RCUTS:4},
  27: {T:27, TYPE:'MILL',        R:5,     R2:0, DR:0, DR2:0, DL:0, ANGLE:0, RCUTS:0},
  28: {T:28, TYPE:'MILL',        R:10,    R2:0, DR:0, DR2:0, DL:0, ANGLE:0, RCUTS:4}
};

function makeContext(){
  const context = {
    console,
    TOOL_R: 5,
    DEFAULT_FEED: 100,
    probs: [],
    window: {},
    pFloat: value => parseFloat(String(value).replace(',', '.')) || 0,
    inferToolType: tool => (tool && tool.TYPE) || 'MILL',
    getToolByNum: number => TOOLS[number]
  };
  vm.createContext(context);
  vm.runInContext(parserSource, context);
  return context;
}

const ctx = makeContext();

function parse(code){
  ctx.TOOL_R = 5;        // reset the single mutable global before each run
  ctx.probs = [];
  const res = ctx.parseProgram(code);
  // parseProgram now exposes its own diagnostics for the browser Problems
  // panel. Copy the VM-native array into the host realm for ordinary Node
  // assertion callbacks, and keep the mirror as a consistency probe.
  res.resultProblems = Array.from(res.problems || [], problem => Object.assign({}, problem));
  res.probs = ctx.probs; // backward-compatible alias used by older assertions
  return res;
}

function validate(code){
  ctx.TOOL_R = 5;
  return ctx.validateProgram(code);
}

// Wrap a body between a standard BLK FORM header/footer.
function program(body){
  return [
    'BEGIN PGM CYCLES MM',
    'BLK FORM 0.1 Z X-50 Y-50 Z+0',
    'BLK FORM 0.2 X+50 Y+50 Z+20',
    body,
    'END PGM CYCLES MM'
  ].join('\n');
}

// Segments produced by the (single) CYCL CALL line.
function cycleSegments(res, code){
  const callLine = code.split('\n').findIndex(l => l.trim() === 'CYCL CALL');
  return res.sub.filter(s => s.srcLine === callLine);
}

module.exports = { parse, validate, program, cycleSegments, TOOLS, makeContext };
