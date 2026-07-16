const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const tools = {
  1: {T:1, TYPE:'MILL', R:5, R2:0, DR:0, DR2:0, DL:0, LCUTS:30, T_ANGLE:0},
  2: {T:2, TYPE:'MILL', R:4, R2:4, DR:0, DR2:0, DL:0, LCUTS:4, T_ANGLE:0},
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

// "Complete Part" is the initial textarea value in index.html rather than an
// EXTRA_DEMO_PROGRAMS entry.  Exercise that exact shipped program as well: a
// regression in the compensated-corner safety check previously discarded both
// of its RL contours while the other demo programs continued to work.
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const completeMatch = indexHtml.match(/<textarea id="code"[^>]*>([\s\S]*?)<\/textarea>/);
assert.ok(completeMatch, 'Complete Part program must exist in the main editor textarea');
const completeCode = completeMatch[1];
const appSource = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
const angleMatch = appSource.match(/\{ name: 'Angle Mill', code: (('[^'\\]*(?:\\.[^'\\]*)*')) \}/);
assert.ok(angleMatch, 'Angle Mill program must exist in the demo library');
const angleCode = vm.runInNewContext(angleMatch[1]);

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

{
  const errors = context.validateProgram(angleCode).filter(problem => problem.sev === 'err');
  assert.strictEqual(errors.length, 0, `Angle Mill validation errors: ${JSON.stringify(errors)}`);
  context.probs = [];
  const angle = context.parseProgram(angleCode);
  const parseErrors = Array.from(angle.problems || []).filter(problem => problem.sev === 'err');
  assert.strictEqual(parseErrors.length, 0, `Angle Mill parse errors: ${JSON.stringify(parseErrors)}`);
  for (const toolNum of [1, 2]) {
    const passes = angle.sub.filter(segment => segment.toolNum === toolNum && segment.rc === 'RL' && segment.to.y > segment.from.y + 50);
    assert.strictEqual(passes.length, 22, `Angle Mill T${toolNum} must cut all 22 ramp strips`);
  }
}

{
  const problems = context.validateProgram(completeCode);
  const errors = problems.filter(problem => problem.sev === 'err');
  assert.strictEqual(errors.length, 0, `Complete Part validation errors: ${JSON.stringify(errors)}`);

  context.probs = [];
  const complete = context.parseProgram(completeCode);
  const parseErrors = context.probs.filter(problem => problem.sev === 'err');
  assert.strictEqual(parseErrors.length, 0, `Complete Part parse errors: ${JSON.stringify(parseErrors)}`);

  const rlByTool = toolNum => complete.sub.filter(segment => segment.toolNum === toolNum && segment.rc === 'RL');
  assert.ok(rlByTool(1).length >= 100, 'Complete Part T1 outer L/C/RND contour must not be discarded');
  assert.ok(rlByTool(5).length >= 100, 'Complete Part T5 chamfer L/C/RND contour must not be discarded');

  const lines = completeCode.split(/\r?\n/);
  const x50Lines = lines.reduce((found, line, index) => {
    if (line.trim() === 'L X+50') found.push(index);
    return found;
  }, []);
  assert.deepStrictEqual(x50Lines.length, 2, 'Complete Part must retain both programmed L X+50 blocks');
  assert.ok(complete.sub.some(segment => segment.toolNum === 1 && segment.rc === 'RL' && segment.srcLine === x50Lines[0]), 'Complete Part T1 L X+50 block must generate compensated cutting motion');
  assert.ok(complete.sub.some(segment => segment.toolNum === 5 && segment.rc === 'RL' && segment.srcLine === x50Lines[1]), 'Complete Part T5 L X+50 block must generate compensated cutting motion');
}

// A genuinely non-fitting compensated corner is discovered only by the actual
// toolpath calculation. Verify that editor validation merges that diagnostic,
// blocks Run, and does not leave it hidden in the console while dropping code.
{
  const unfitCorner = [
    'BEGIN PGM BAD_CORNER MM',
    'BLK FORM 0.1 Z X-10 Y-10 Z+0',
    'BLK FORM 0.2 X+10 Y+10 Z+10',
    'TOOL CALL 1 Z S3000 F500',
    'M3',
    'L X+0 Y+0 R0',
    'L X+2 Y+0 RL',
    'L X+2 Y+2',
    'L X+4 Y+2 R0',
    'END PGM BAD_CORNER MM'
  ].join('\n');
  assert.ok(!context.validateProgram(unfitCorner).some(problem => /tool radius too large/.test(problem.msg)), 'fixture must require a real toolpath geometry check');

  vm.runInContext(fs.readFileSync(path.join(root, 'core', 'editor-core.js'), 'utf8'), context);
  context.codeEl = {value: unfitCorner};
  context.problemsData = [];
  context.LEARN = {open: false};
  context.renderProblems = () => {};
  context.learnUpdateBlank = () => {};
  context.calcEstTime = () => {};
  context.runValidation();
  assert.ok(Array.from(context.problemsData).some(problem => problem.sev === 'err' && /tool radius too large/.test(problem.msg)), 'editor Problems panel must receive a dynamic unfit-corner error');
  assert.strictEqual(context.hasErrors(), true, 'dynamic compensated-corner error must block Run/Step');
}

const thread = context.parseProgram(context.EXTRA_DEMO_PROGRAMS[2].code);
assert.deepStrictEqual(Array.from(new Set(thread.sub.map(segment => segment.toolNum).filter(Boolean))), [4, 5, 7]);
assert.ok(thread.sub.some(segment => segment.toolNum === 7 && segment.to.z <= -2), 'Thread Hole must tap below the stock');

const precise = context.parseProgram(context.EXTRA_DEMO_PROGRAMS[3].code);
assert.deepStrictEqual(Array.from(new Set(precise.sub.map(segment => segment.toolNum).filter(Boolean))), [3, 4, 5, 6]);
assert.ok(precise.sub.some(segment => segment.toolNum === 6 && segment.to.z <= -2), 'Precise Hole must ream below the stock');

console.log('demo program parser regressions passed');
