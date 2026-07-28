const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const parserSource = fs.readFileSync(path.join(root, 'core', 'parser-engine.js'), 'utf8');
const playbackSource = fs.readFileSync(path.join(root, 'core', 'voxel-cutting.js'), 'utf8');
const context = {
  console,
  TOOL_R: 5,
  DEFAULT_FEED: 100,
  probs: [],
  inferToolType: tool => tool.TYPE || 'MILL',
  getToolByNum: () => ({T:1, TYPE:'MILL', R:5, R2:0, DR:0, DR2:0, DL:0})
};

vm.createContext(context);
vm.runInContext(parserSource, context);
vm.runInContext(playbackSource, context);

function parsedControl(code) {
  const program = `BEGIN PGM MCONTROL MM
TOOL CALL 1 Z S2000 F200
M3
L X+0 Y+0 Z+10 FMAX
${code}
END PGM MCONTROL MM`;
  const result = context.parseProgram(program);
  assert.strictEqual(result.problems.filter(problem => problem.sev === 'err').length, 0);
  return result.sub.find(segment => segment.stopCode === code);
}

['M0', 'M2', 'M6', 'M30'].forEach(code => {
  const segment = parsedControl(code);
  assert.ok(segment, `${code} must retain its identity in the playback segment`);
  assert.strictEqual(segment.stop, true);
});

assert.strictEqual(context.mControlPauseCode(parsedControl('M0')), 'M0');
assert.strictEqual(context.mControlPauseCode(parsedControl('M6')), 'M6');
assert.strictEqual(context.mControlPauseCode(parsedControl('M2')), '');
assert.strictEqual(context.mControlPauseCode(parsedControl('M30')), '');
assert.strictEqual(context.mControlPauseCode({stop:true}), 'M0',
  'legacy boolean stop segments retain their M0 behavior');

console.log('m-control-playback.test.js: M0/M6 pauses remain distinct from M2/M30 end');
