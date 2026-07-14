const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const parserSource = fs.readFileSync(path.join(root, 'core', 'parser-engine.js'), 'utf8');
const playbackSource = fs.readFileSync(path.join(root, 'core', 'voxel-cutting.js'), 'utf8');
const tools = {
  1: {T:1, TYPE:'MILL', R:5, R2:0, DR:0, DR2:0, DL:0},
  4: {T:4, TYPE:'DRILL', R:3.4, R2:0, DR:0, DR2:0, DL:0},
  7: {T:7, TYPE:'DRILL', R:4, R2:0, DR:0, DR2:0, DL:0}
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
vm.runInContext(parserSource, context);
vm.runInContext(playbackSource, context);

function program(body){
  return `BEGIN PGM CYCLES MM
BLK FORM 0.1 Z X-50 Y-50 Z+0
BLK FORM 0.2 X+50 Y+50 Z+20
${body}
END PGM CYCLES MM`;
}

function cycleSegments(code){
  const callLine = code.split('\n').findIndex(line => line.trim() === 'CYCL CALL');
  assert.ok(callLine >= 0, 'test program must contain CYCL CALL');
  return context.parseProgram(code).sub.filter(segment => segment.srcLine === callLine);
}

// FAUTO belongs to the current TOOL CALL, not to a later modal contour feed.
{
  const code = program(`TOOL CALL 1 Z S18000 F3500
M3
L X+0 Y+0 Z+30 F2000 R0
CYCL DEF 208
 Q200=+2
 Q201=-20
 Q206 FAUTO
 Q334=+2
 Q203=+20
 Q204=+50
 Q335=+20
 Q342=+0
 Q351=+1
CYCL CALL`);
  const segments = cycleSegments(code);
  const helix = segments.filter(segment => !segment.rapid && segment.to.z < segment.from.z - 1e-9);
  assert.ok(helix.length > 0, 'Cycle 208 should generate a descending helix');
  helix.forEach(segment => assert.strictEqual(segment.feed, 3500, 'FAUTO must use TOOL CALL F3500'));
  assert.strictEqual(helix.length % 32, 0, 'helix revolutions should use 32 segments');
  for(let i=0; i<helix.length; i+=32){
    const zDrop = helix[i].from.z - helix[i+31].to.z;
    assert.ok(zDrop <= 2 + 1e-9, `Q334=2 exceeded in revolution ${i/32 + 1}: ${zDrop}`);
  }
  // Solid stock uses two full-depth paths here: the expanding center ramp and
  // the final wall ring. Each needs 11 revolutions from Z22 to Z0.
  assert.strictEqual(helix.length / 32, 22, 'both solid-stock helix paths should use 11 revolutions');
  assert.ok(segments.some(segment => segment.rapid && segment.ensureVisible && segment.to.z > segment.from.z), 'Cycle 208 retract should be visible');
}

// Cycle 200 chip-release retracts remain FMAX and are marked for a visible frame.
{
  const code = program(`TOOL CALL 4 Z S14000 F300
M3
L X+0 Y+0 Z+30 F1200 R0
CYCL DEF 200
 Q200=+2
 Q201=-24
 Q206 FAUTO
 Q202=+11.5
 Q203=+20
 Q204=+50
CYCL CALL`);
  const segments = cycleSegments(code);
  const retract = segments.find(segment => segment.rapid && segment.ensureVisible && segment.to.z > segment.from.z);
  const returnMove = segments.find(segment => segment.rapid && segment.ensureVisible && segment.to.z < segment.from.z);
  assert.ok(retract, 'Cycle 200 should mark its FMAX chip-release retract as visible');
  assert.ok(returnMove, 'Cycle 200 should mark its FMAX return into the hole as visible');
  segments.filter(segment => !segment.rapid).forEach(segment => {
    assert.strictEqual(segment.feed, 300, 'Cycle 200 FAUTO must use TOOL CALL F300');
  });
}

// Cycle 209 retracts with reversed spindle at synchronized thread feed, not FMAX.
{
  const code = program(`TOOL CALL 7 Z S350 F900
M3
L X+0 Y+0 Z+30 F1200 R0
CYCL DEF 209 Q257=+11 Q256=+0
 Q200=+2
 Q201=-22
 Q239=+1.25
 Q203=+20
 Q204=+50
CYCL CALL`);
  const segments = cycleSegments(code);
  const synchronizedRetracts = segments.filter(segment => segment.ensureVisible && segment.to.z > segment.from.z);
  assert.ok(synchronizedRetracts.length >= 2, 'Cycle 209 should expose chip-break and final retract motion');
  synchronizedRetracts.forEach(segment => {
    assert.strictEqual(segment.rapid, false, 'Cycle 209 thread retract must not be FMAX');
    assert.strictEqual(segment.feed, 437.5, 'Cycle 209 retract must use pitch times spindle RPM');
  });
  assert.ok(segments.some(segment => segment.rapid && segment.to.z > segment.from.z), 'Cycle 209 should use FMAX only after leaving the thread');
}

// A marked segment that would finish inside one frame is held at its midpoint.
assert.strictEqual(context.shouldHoldVisibleSegment({ensureVisible:true}, 0, 0.02, 0.01), true);
assert.strictEqual(context.shouldHoldVisibleSegment({ensureVisible:true}, 0.5, 0.02, 0.01), false);
assert.strictEqual(context.shouldHoldVisibleSegment({ensureVisible:false}, 0, 0.02, 0.01), false);

// The shipped Complete Part demo uses a safe 2 mm helix infeed.
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const firstCycle208 = html.slice(html.indexOf('CYCL DEF 208'), html.indexOf('CYCL DEF 208') + 500);
assert.match(firstCycle208, /Q334=\+2\s*;Infeed per pass/);

console.log('cycle feed, helix and retract-motion regressions passed');
