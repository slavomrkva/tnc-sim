'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const parserSource = fs.readFileSync(path.join(root, 'core', 'parser-engine.js'), 'utf8');
const voxelSource = fs.readFileSync(path.join(root, 'core', 'voxel-cutting.js'), 'utf8');
const renderSource = fs.readFileSync(path.join(root, 'core', 'render3d.js'), 'utf8');
const context = {
  console,
  TOOL_R: 5,
  DEFAULT_FEED: 100,
  inferToolType: tool => tool.TYPE || 'MILL',
  getToolByNum: () => ({T: 1, TYPE: 'MILL', R: 5, R2: 0, DR: 0, DR2: 0, DL: 0})
};
vm.createContext(context);
vm.runInContext(parserSource, context);

function program(name, blk) {
  return `BEGIN PGM ${name} MM
${blk}
TOOL CALL 1 Z S2000 F200
M3
L X+10 Y+10 Z+10 F200
M5
END PGM ${name} MM`;
}

function blkProblems(code) {
  return context.validateProgram(code).filter(problem => /BLK FORM/.test(problem.msg));
}

{
  const plan = context.planLiveVoxelGrid(1600, 100, 50, 1);
  assert.strictEqual(plan.limited, false, 'an elongated 1600x100x50 blank must retain Default detail');
  assert.ok(plan.total <= context.LIVE_VOXEL_BUDGET, 'safe elongated blank must remain inside the live budget');
  assert.ok(plan.effectiveCell < 0.71, 'safe elongated blank must stay near the 0.7 mm Default profile');
}

{
  const plan = context.planLiveVoxelGrid(500, 500, 500, 1);
  assert.strictEqual(plan.limited, true, 'a 500 mm cube must be adaptively coarsened');
  assert.ok(plan.total <= context.LIVE_VOXEL_BUDGET, 'rounded live grid must never exceed its exact budget');
  assert.ok(plan.effectiveCell > 1.7, 'large cube must report its real coarser cell size');
}

{
  const cases = [
    [500, 500, 500],
    [800, 100, 50],
    [1000, 1000, 100],
    [2000, 1000, 100],
    [10000, 100, 50]
  ];
  for (const dims of cases) {
    for (let quality = 0; quality < 3; quality++) {
      const live = context.planLiveVoxelGrid(...dims, quality);
      const refine = context.planRefineVoxelGrid(...dims, quality);
      assert.ok(live.total <= context.LIVE_VOXEL_BUDGET, `live ${dims}/${quality} must fit`);
      assert.ok(refine.total <= context.REFINE_VOXEL_BUDGET, `Refine ${dims}/${quality} must fit`);
    }
  }
}

{
  const code = program('LONG', 'BLK FORM 0.1 Z X+0 Y+0 Z+0\nBLK FORM 0.2 X+1600 Y+100 Z+50');
  const problems = blkProblems(code);
  assert.ok(!problems.some(problem => problem.sev === 'err'), 'safe >500 mm box must not be blocked');
  assert.ok(!problems.some(problem => /detail will be reduced/.test(problem.msg)), 'safe box must not get a false coarsening warning');
}

{
  const code = program('CUBE', 'BLK FORM 0.1 Z X+0 Y+0 Z+0\nBLK FORM 0.2 X+500 Y+500 Z+500');
  const problems = blkProblems(code);
  assert.ok(!problems.some(problem => problem.sev === 'err'), 'large cube must remain runnable');
  assert.ok(problems.some(problem => problem.sev === 'warn' && /1\.74 mm\/voxel/.test(problem.msg)),
    'large cube must expose its effective Default detail');
}

{
  const code = program('CYL', 'BLK FORM CYLINDER Z X+0 Y+0 Z+0\nBLK FORM 0.2 X+400 Y+0 Z+100');
  const problems = blkProblems(code);
  assert.ok(!problems.some(problem => problem.sev === 'err'), '>500 mm cylinder diameter must not be blocked');
  assert.ok(problems.some(problem => problem.sev === 'warn' && /detail will be reduced/.test(problem.msg)),
    'large cylinder must expose adaptive coarsening');
}

{
  const reversed = program('BAD', 'BLK FORM 0.1 Z X+0 Y+0 Z+0\nBLK FORM 0.2 X-1 Y+100 Z+50');
  assert.ok(blkProblems(reversed).some(problem => problem.sev === 'err' && /X max/.test(problem.msg)),
    'max<=min remains a blocking geometry error');
  const huge = '9'.repeat(400);
  const nonFinite = program('HUGE', `BLK FORM 0.1 Z X+0 Y+0 Z+0\nBLK FORM 0.2 X+${huge} Y+100 Z+50`);
  assert.ok(blkProblems(nonFinite).some(problem => problem.sev === 'err' && /finite numbers/.test(problem.msg)),
    'non-finite parsed dimensions remain blocked');
}

assert.match(voxelSource, /planLiveVoxelGrid\(w,d,h,VX_QUALITY\)/);
assert.match(voxelSource, /gridPlan:vxPlan/);
assert.match(parserSource, /planRefineVoxelGrid\(w,d,h,VX_QUALITY\)/);
assert.match(renderSource, /gridDivisions = Math\.max\(2,Math\.min\(400,/);
assert.match(renderSource, /camera\.far=Math\.max\(5000,dist\*4\)/);
assert.match(renderSource, /camera\.updateProjectionMatrix\(\)/);

console.log('blk-form-adaptive-limits.test.js: adaptive BLK FORM budgets and large-scene guards verified');
