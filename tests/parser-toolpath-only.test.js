const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'core', 'parser-engine.js'), 'utf8');
const context = {
  console,
  TOOL_R: 5,
  DEFAULT_FEED: 100,
  probs: [],
  inferToolType: tool => tool.TYPE || 'MILL',
  getToolByNum: () => ({T: 1, TYPE: 'MILL', R: 5, R2: 0, DR: 0, DR2: 0, DL: 0})
};
vm.createContext(context);
vm.runInContext(source, context);

const body = `TOOL CALL 1 Z S2000 F200
M3
L X+10 Y+20 Z+30 FMAX
L X+40 Y+50 Z+5 F200
M5`;

function program(name, blk){
  return `BEGIN PGM ${name} MM
${blk ? blk+'\n' : ''}${body}
END PGM ${name} MM`;
}

{
  const code = program('NOBLK', '');
  const problems = context.validateProgram(code);
  assert.ok(!problems.some(p => /BLK FORM/.test(p.msg)), 'missing BLK FORM must be a valid toolpath-only mode');
  const parsed = context.parseProgram(code);
  assert.strictEqual(parsed.hasStock, false, 'missing BLK FORM must not create stock');
  assert.ok(parsed.viewMin.x < 10 && parsed.viewMax.x > 40, 'toolpath-only view must frame X motion');
  assert.ok(parsed.viewMin.y < 20 && parsed.viewMax.y > 50, 'toolpath-only view must frame Y motion');
}

{
  const zeroBlk = 'BLK FORM 0.1 Z X+0 Y+0 Z+0\nBLK FORM 0.2 X+0 Y+0 Z+0';
  const code = program('ZEROBLK', zeroBlk);
  const problems = context.validateProgram(code);
  assert.ok(!problems.some(p => p.sev === 'err' && /BLK FORM/.test(p.msg)), 'all-zero BLK FORM must not fail validation');
  assert.strictEqual(context.parseProgram(code).hasStock, false, 'all-zero BLK FORM must not create stock');
}

{
  const validBlk = 'BLK FORM 0.1 Z X+0 Y+0 Z-20\nBLK FORM 0.2 X+100 Y+80 Z+0';
  const parsed = context.parseProgram(program('WITHBLK', validBlk));
  assert.strictEqual(parsed.hasStock, true, 'valid BLK FORM must keep the workpiece');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(parsed.viewMin)), {x:0,y:0,z:-20});
  assert.deepStrictEqual(JSON.parse(JSON.stringify(parsed.viewMax)), {x:100,y:80,z:0});
}

console.log('parser toolpath-only regression tests passed');
