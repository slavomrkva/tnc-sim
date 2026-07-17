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

function point(x, y, z){ return {x, y, z}; }
function segment(from, to, rc){
  const dx=to.x-from.x, dy=to.y-from.y, dz=to.z-from.z;
  return {
    from, to, rc, toolNum: 1, drPgm: 0,
    rapid: false, feed: 100, spindleOn: true, coolantOn: true,
    blockIndex: 1, srcLine: 1, len: Math.sqrt(dx*dx+dy*dy+dz*dz)
  };
}
function near(actual, expected, message){
  assert.ok(Math.abs(actual-expected)<1e-9, `${message}: expected ${expected}, got ${actual}`);
}

function testPureZ(side, expectedY){
  const sub=[
    segment(point(0,0,0), point(10,0,0), side),
    segment(point(10,0,0), point(10,0,10), 'R0')
  ];
  context.applyRadiusComp(sub);
  const retract=sub.find(s => s.rc==='R0');
  near(retract.from.x, 10, `${side} retract from X`);
  near(retract.to.x, 10, `${side} retract to X`);
  near(retract.from.y, expectedY, `${side} retract from Y`);
  near(retract.to.y, expectedY, `${side} retract to Y`);
}

testPureZ('RL', 5);
testPureZ('RR', -5);

// Carry the actual compensated XY through another Z-only block, then use the
// first later XY move as the lead-out to its nominal target.
{
  const status=segment(point(10,0,10), point(10,0,10), '');
  status.isMseg=true; status.len=0.001;
  const sub=[
    segment(point(0,0,0), point(10,0,0), 'RL'),
    segment(point(10,0,0), point(10,0,10), 'R0'),
    status,
    segment(point(10,0,10), point(10,0,20), 'R0'),
    segment(point(10,0,20), point(20,0,20), 'R0')
  ];
  context.applyRadiusComp(sub);
  const r0=sub.filter(s => s.rc==='R0');
  near(r0[0].from.y, 5, 'first retract start');
  near(r0[0].to.y, 5, 'first retract end');
  near(status.from.y, 5, 'state-only segment start');
  near(status.to.y, 5, 'state-only segment end');
  near(r0[1].from.y, 5, 'second retract start');
  near(r0[1].to.y, 5, 'second retract end');
  near(r0[2].from.y, 5, 'later XY lead-out start');
  near(r0[2].to.y, 0, 'later XY lead-out target');
}

// Existing lateral R0 behaviour remains a lead-out from compensated to nominal.
{
  const sub=[
    segment(point(0,0,0), point(10,0,0), 'RL'),
    segment(point(10,0,0), point(20,0,0), 'R0')
  ];
  context.applyRadiusComp(sub);
  const leadOut=sub.find(s => s.rc==='R0');
  near(leadOut.from.y, 5, 'lateral R0 compensated start');
  near(leadOut.to.y, 0, 'lateral R0 nominal target');
}

console.log('parser radius-comp regression tests passed');

// Full reported contour: the final source block must produce a vertical
// physical segment even after RND/CHF expansion and radius compensation.
{
  const repro=`BEGIN PGM C2 MM
BLK FORM 0.1 Z X-50 Y-50 Z-20
BLK FORM 0.2 X+450 Y+260 Z+50
TOOL CALL 1 Z S3000 F500
Q1 = +0
L X-20 Y+235 Z+50 FMAX R0
L Z+Q1
L Y+230 FAUTO RL
L X+101
CHF 15
L Y+200
RND R5.5
L X+161
RND R5.5
L Y+230
CHF 15
L X+296
CHF 15
L Y+200
RND R5.5
L X+366
CHF 15
L Y+0
CHF 15
L X+0
CHF 15
L Y+231
CHF 16
L X+20
L Z+20 R0
END PGM C2 MM`;
  const finalLine=repro.split('\n').findIndex(line => line==='L Z+20 R0');
  const parsed=context.parseProgram(repro);
  assert.ok(!(parsed.problems||[]).some(problem => /tool radius too large|Cannot calculate tool radius compensation/.test(problem.msg)), 'reported C2 contour must retain its valid compensated cutting run');
  assert.ok(parsed.sub.some(segment => segment.rc==='RL'), 'reported C2 contour must emit compensated motion, not only a nominal retract');
  const retracts=parsed.sub.filter(s => s.srcLine===finalLine);
  assert.strictEqual(retracts.length, 1, 'reported R0 block should produce one segment');
  near(retracts[0].from.x, retracts[0].to.x, 'reported retract X continuity');
  near(retracts[0].from.y, retracts[0].to.y, 'reported retract Y continuity');
}

console.log('reported C2 contour passed');
