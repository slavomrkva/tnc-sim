const assert = require('assert');
const H = require('./_cycle-harness.js');

// Issue #44: a compensated contour retraces its first edge after four CHF
// corners. The nominal overlap is deliberate; the cutter must not skip the
// entire run after the preceding plunge. A repeated endpoint is a no-op.
const code = `BEGIN PGM PROGRAM MM
BLK FORM 0.1 Z X+0 Y+0 Z-31
BLK FORM 0.2 X+75 Y+75 Z+0
TOOL DEF 1 ; Pre-load tool in magazine for next TOOL CALL
TOOL DEF 8 ; Pre-load tool in magazine for next TOOL CALL
TOOL DEF 9 ; Pre-load tool in magazine for next TOOL CALL
TOOL DEF 10 ; Pre-load tool in magazine for next TOOL CALL
TOOL DEF 3 ; Pre-load tool in magazine for next TOOL CALL
TOOL DEF 11 ; Pre-load tool in magazine for next TOOL CALL
TOOL CALL 1 Z S1000
LBL 1
L X-20 Y-20 FMAX M13
L Z+20 FMAX
L Z-5 F400
L X+0 RL
L Y+75
CHF 3
L X+75
CHF 3
L Y-0
CHF 3
L X+0
CHF 3
L Y+95
L Y+95
L Z+20 R0
LBL 0
L Z-10
CALL LBL 1
L Z-15
CALL LBL 1
L Z-20
CALL LBL 1
L Z-25
CALL LBL 1
L Z-31
CALL LBL 1
END PGM PROGRAM MM`;

const errors = Array.from(H.validate(code)).filter(problem => problem.sev === 'err');
assert.deepStrictEqual(errors, [], 'a repeated XY endpoint must not be called a pure Z move');

const parsed = H.parse(code);
assert.deepStrictEqual(parsed.resultProblems.filter(problem => problem.sev === 'err'), [],
  'retrace must not reject the compensated contour');
assert.strictEqual(parsed.sub.filter(segment => segment.rcActivation).length, 6,
  'fall-through and five calls must each retain their compensated path');
assert.ok(parsed.sub.some(segment => segment.rc === 'RL' && segment.to.x > 70 && segment.to.y > 70),
  'simulator must cut the top and right sides after the plunge');

const withoutNoop = H.parse(code.replace('L Y+95\nL Y+95', 'L Y+95'));
const coordinates = result => JSON.stringify(result.sub.map(segment => [
  segment.from.x, segment.from.y, segment.from.z,
  segment.to.x, segment.to.y, segment.to.z, segment.rc
]));
assert.strictEqual(coordinates(parsed), coordinates(withoutNoop),
  'repeating the endpoint must not change the physical toolpath');

const vertical = code.replace('L Y+95\nL Y+95', 'L Y+95\nL Z-6');
assert.ok(H.validate(vertical).some(problem => /pure Z move/.test(problem.msg)),
  'a real Z move with active RL must still be diagnosed');

// Keep detecting an intersection introduced by compensation when the nominal
// contour has no corresponding crossing or retrace.
const ctx = H.makeContext();
const line = (start, end, nominalStart, nominalEnd) => ({
  type:'line', start, end,
  geom:{type:'line',from:nominalStart,to:nominalEnd}
});
const crossing = [
  line({x:-20,y:-20},{x:-10,y:-20},{x:-20,y:-20},{x:-10,y:-20}),
  line({x:0,y:0},{x:10,y:0},{x:0,y:0},{x:10,y:0}),
  line({x:30,y:30},{x:40,y:30},{x:30,y:30},{x:40,y:30}),
  line({x:5,y:-5},{x:5,y:5},{x:20,y:-5},{x:20,y:5}),
  line({x:50,y:50},{x:60,y:50},{x:50,y:50},{x:60,y:50})
];
assert.strictEqual(ctx._rcHasLoop(crossing), true,
  'a crossing absent from the nominal contour must remain an error');

console.log('radius-compensation retrace regression passed');
