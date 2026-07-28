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
  getToolByNum: () => ({T:1, TYPE:'MILL', R:5, R2:0, DR:0, DR2:0, DL:0})
};
vm.createContext(context);
vm.runInContext(source, context);

function errors(code){
  return context.validateProgram(code).filter(problem => problem.sev === 'err');
}
function near(actual, expected, message, eps=1e-6){
  assert.ok(Math.abs(actual-expected)<=eps, `${message}: got ${actual}, expected ${expected}`);
}

const polarProgram = `BEGIN PGM POLAR MM
TOOL CALL 1 Z S2000 F200
M3
L X+10 Y+0 Z+0 FMAX
CC X+0 Y+0
LP PR+10 PA+0 F200
LP PA+90
LP IPA+90
CP IPA+360 IZ+5 DR+ F200
END PGM POLAR MM`;

assert.strictEqual(errors(polarProgram).length, 0,
  'modal PR, LP IPA and a CP incremental helix must pass validation');

const polarResult = context.parseProgram(polarProgram);
assert.strictEqual(polarResult.problems.filter(problem => problem.sev === 'err').length, 0);
const cpLine = polarProgram.split('\n').findIndex(line => line.startsWith('CP '));
const cpSegments = polarResult.sub.filter(segment => segment.srcLine === cpLine && segment.rcGeom && segment.rcGeom.kind === 'CP');
assert.ok(cpSegments.length >= 64, 'IPA+360 must retain the complete revolution, not collapse to one target angle');
const cpEnd = cpSegments[cpSegments.length-1].to;
near(cpEnd.x, -10, 'CP helix final X');
near(cpEnd.y, 0, 'CP helix final Y');
near(cpEnd.z, 5, 'CP IZ final Z');
assert.ok(cpSegments.some(segment => segment.to.z > 0 && segment.to.z < 5),
  'CP IZ must interpolate Z along the polar arc');

const incrementalCc = `BEGIN PGM ICC MM
TOOL CALL 1 Z S2000 F200
M3
L X+10 Y+10 Z+0 FMAX
CC IX+5 IY-5
LP PR+10 PA+0 F200
END PGM ICC MM`;
assert.strictEqual(errors(incrementalCc).length, 0, 'CC IX/IY must be accepted relative to the last tool position');
const ccResult = context.parseProgram(incrementalCc);
const lpLine = incrementalCc.split('\n').findIndex(line => line.startsWith('LP '));
const lpSegment = ccResult.sub.find(segment => segment.srcLine === lpLine);
near(lpSegment.to.x, 25, 'incremental CC polar target X');
near(lpSegment.to.y, 5, 'incremental CC polar target Y');

const badDirection = polarProgram.replace('CP IPA+360 IZ+5 DR+', 'CP IPA+360 IZ+5 DR-');
assert.ok(errors(badDirection).some(problem => /same sign/.test(problem.msg)),
  'incremental CP must reject an IPA/DR sign mismatch');

const fullCircle = `BEGIN PGM FULLCP MM
TOOL CALL 1 Z S2000 F200
M3
L X+10 Y+0 Z+0 FMAX
CC X+0 Y+0
CP DR+ F200
END PGM FULLCP MM`;
assert.strictEqual(errors(fullCircle).length, 0,
  'the official angle-less CP DR+ spelling must validate as a full circle');
const fullCircleResult = context.parseProgram(fullCircle);
assert.strictEqual(fullCircleResult.problems.filter(problem => problem.sev === 'err').length, 0,
  'angle-less CP DR+ must parse without a diagnostic');
const fullCircleLine = fullCircle.split('\n').findIndex(line => line.startsWith('CP '));
const fullCircleSegments = fullCircleResult.sub.filter(segment =>
  segment.srcLine === fullCircleLine && segment.rcGeom && segment.rcGeom.kind === 'CP');
assert.ok(fullCircleSegments.length >= 64,
  'angle-less CP DR+ must retain a complete revolution');
near(fullCircleSegments[fullCircleSegments.length - 1].to.x, 10,
  'angle-less CP final X');
near(fullCircleSegments[fullCircleSegments.length - 1].to.y, 0,
  'angle-less CP final Y');

const unsupportedRadius = polarProgram.replace('LP IPA+90', 'LP IPR+2');
assert.ok(errors(unsupportedRadius).some(problem => /Unsupported token "IPR\+2"/.test(problem.msg)),
  'ordinary LP must not invent unsupported IPR syntax');

console.log('parser-polar-incremental.test.js: LP/CP/CC incremental polar semantics verified');
