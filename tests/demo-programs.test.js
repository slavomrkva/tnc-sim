const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const tools = {
  1: {T:1, TYPE:'MILL', R:5, R2:0, DR:0, DR2:0, DL:0, LCUTS:30, T_ANGLE:0},
  3: {T:3, TYPE:'DRILL', R:3, R2:0, DR:0, DR2:0, DL:0, LCUTS:8, T_ANGLE:142},
  4: {T:4, TYPE:'DRILL', R:3.4, R2:0, DR:0, DR2:0, DL:0, LCUTS:40.8, T_ANGLE:118},
  5: {T:5, TYPE:'COUNTERSINK', R:0.001, R2:0, DR:0, DR2:0, DL:0, LCUTS:4, T_ANGLE:90},
  6: {T:6, TYPE:'DRILL', R:3.5, R2:0, DR:0, DR2:0, DL:0, LCUTS:25, T_ANGLE:0},
  7: {T:7, TYPE:'DRILL', R:4, R2:0, DR:0, DR2:0, DL:0, LCUTS:18, T_ANGLE:0}
};
const context = {
  console,
  TOOL_R: 5,
  DEFAULT_FEED: 100,
  probs: [],
  pFloat: value => parseFloat(String(value).replace(',', '.')) || 0,
  inferToolType: tool => tool.TYPE || 'MILL',
  getToolByNum: number => tools[number] || tools[1]
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'core', 'demo-programs.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'core', 'parser-engine.js'), 'utf8'), context);

assert.deepStrictEqual(
  Array.from(context.EXTRA_DEMO_PROGRAMS, demo => demo.name),
  ['Chamfering', 'Rough & Finish', 'Thread Hole', 'Precise Hole']
);

context.EXTRA_DEMO_PROGRAMS.forEach(demo => {
  const problems = context.validateProgram(demo.code);
  const errors = problems.filter(problem => problem.sev === 'err');
  assert.strictEqual(errors.length, 0, `${demo.name} validation errors: ${JSON.stringify(errors)}`);

  const parsed = context.parseProgram(demo.code);
  assert.strictEqual(parsed.hasStock, true, `${demo.name} must create a workpiece`);
  assert.ok(parsed.sub.length > 0, `${demo.name} must create simulated movement`);
  parsed.sub.forEach(segment => {
    ['x', 'y', 'z'].forEach(axis => {
      assert.ok(Number.isFinite(segment.from[axis]), `${demo.name} has invalid from.${axis}`);
      assert.ok(Number.isFinite(segment.to[axis]), `${demo.name} has invalid to.${axis}`);
    });
  });
});

const thread = context.parseProgram(context.EXTRA_DEMO_PROGRAMS[2].code);
assert.deepStrictEqual(Array.from(new Set(thread.sub.map(segment => segment.toolNum).filter(Boolean))), [4, 5, 7]);
assert.ok(thread.sub.some(segment => segment.toolNum === 7 && segment.to.z <= -2), 'Thread Hole must tap below the stock');

const precise = context.parseProgram(context.EXTRA_DEMO_PROGRAMS[3].code);
assert.deepStrictEqual(Array.from(new Set(precise.sub.map(segment => segment.toolNum).filter(Boolean))), [3, 4, 5, 6]);
assert.ok(precise.sub.some(segment => segment.toolNum === 6 && segment.to.z <= -2), 'Precise Hole must ream below the stock');

console.log('demo program parser regressions passed');
