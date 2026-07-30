const assert = require('assert');
const H = require('./_cycle-harness.js');

function errors(code){
  return H.validate(code).filter(problem => problem.sev === 'err');
}
function spindleWarnings(code){
  return Array.from(H.validate(code)).filter(problem => /M3\/M4 not programmed before first cutting move/.test(problem.msg));
}
function body(text){
  return H.program(`TOOL CALL 1 Z S2000 F500
${text}`);
}

// Every supported positioning-block family accepts the same two-M tail.
const positioningPrograms = [
  body('L X+10 Y+0 F500 M3 M8'),
  body('L X+10 Y+0 F500 M3\nCC X+0 Y+0\nC X+0 Y+10 DR+ M5 M9'),
  body('L X+10 Y+0 F500 M3\nCR X+0 Y+10 R+10 DR+ M5 M9'),
  body('L X+0 Y+0 F500 M3\nL X+10 Y+0\nCT X+20 Y+10 M5 M9'),
  body('L X+10 Y+0 F500 M3\nCC X+0 Y+0\nLP PR+10 PA+90 M5 M9'),
  body('L X+10 Y+0 F500 M3\nCC X+0 Y+0\nCP PA+90 DR+ M5 M9')
];
positioningPrograms.forEach((code,index) => {
  assert.strictEqual(errors(code).length,0,`positioning M-tail fixture ${index + 1} is valid`);
});

// FMAX positioning before spindle start is safe. The first feed move is the
// point at which the spindle warning becomes relevant, including M3/M4 in that
// same block because those functions are effective at the start of the block.
{
  const code=body(`L Z+250 R0 FMAX
L X-10 Y-10 R0 FMAX
L Z-5 R0 F1000 M3
L X+10 Y+0 F300`);
  assert.deepStrictEqual(spindleWarnings(code), [],
    'M3 on the first feed move is accepted after safe FMAX positioning');
}
{
  const code=body(`L Z+250 R0 FMAX
L X+10 Y+0 F300`);
  const feedLine=code.split('\n').findIndex(text => /X\+10/.test(text));
  assert.deepStrictEqual(spindleWarnings(code).map(problem => problem.line), [feedLine],
    'missing spindle is reported on the first feed move, not on preceding FMAX positioning');
}
['M3','M4','M13','M14'].forEach(mCode => {
  assert.deepStrictEqual(spindleWarnings(body(`L X+10 Y+0 F300 ${mCode}`)), [],
    `${mCode} is effective before the first feed move in its own block`);
});
assert.deepStrictEqual(spindleWarnings(body(`L Z+250 R0 FMAX
M3
L X+10 Y+0 F300`)), [],
  'standalone M3 after FMAX positioning starts the spindle before the first feed move');
assert.strictEqual(spindleWarnings(body(`M3
L Z+250 R0 FMAX M5
L X+10 Y+0 F300`)).length,1,
  'end-effective M5 on a rapid block stops the spindle before the following feed move');

assert.ok(errors(body('L M3 X+10 F500')).some(problem => /M3 does not use parameters/.test(problem.msg)),
  'M must remain at the end of a positioning block');
assert.ok(errors(body('L X+10 F500 M3 M8 M9')).some(problem => /at most two M functions/i.test(problem.msg)),
  'the deliberate two-M simulator limit is explicit');

// Documented parameter dialogs are parsed as M parameters, never as motion.
const parameterCases = [
  'L X+10 F500 M103 F20',
  'L X+10 F500 M118 X1 Y1 B5',
  'L X+10 RL F500 M120 LA10\nL X+20 R0',
  'L X+10 F500 M128 F1000',
  'L X+10 F500 M138 C',
  'L X+10 F500 M140 MB 50 F750',
  'L X+10 RL F500 M197 DL0.876\nL X+20 R0'
];
parameterCases.forEach(text => {
  const code=body(text);
  assert.strictEqual(errors(code).length,0,`${text.split('\n')[0]} has documented parameter syntax`);
  assert.ok(H.validate(code).some(problem => problem.sev==='warn' && /not simulated/.test(problem.msg)),
    `${text.split('\n')[0]} discloses its unsimulated machine effect`);
});

{
  const code=body('M3\nL X+10 F500 M118 X1 Y1 B5');
  const line=code.split('\n').findIndex(text => /M118/.test(text));
  const move=H.parse(code).sub.find(segment => segment.srcLine===line && !segment.isMseg);
  assert.strictEqual(move.to.x,10,'M118 X1 parameter is not mistaken for the programmed X+10 endpoint');
}
{
  const code=body('M3\nL Z-5 F500 M103 F20');
  const line=code.split('\n').findIndex(text => /M103/.test(text));
  const move=H.parse(code).sub.find(segment => segment.srcLine===line && !segment.isMseg);
  assert.strictEqual(move.feed,500,'M103 F20 parameter is not mistaken for the positioning feed');
}

// Valid standalone functions are accepted; block-specific cycle calls are not.
assert.strictEqual(errors(body('M1')).length,0,'standalone M1 is valid syntax');
assert.strictEqual(errors(body('M6')).length,0,'standalone M6 is valid syntax');
assert.ok(errors(body('M99')).some(problem => /end of a positioning block/.test(problem.msg)),
  'standalone M99 reports the documented placement rule');

// End-effective program-control functions take effect after the positioning move.
{
  const code=body('M3\nL X+10 F500 M2\nL X+20 F500');
  const parsed=H.parse(code);
  const lines=code.split('\n');
  const first=lines.findIndex(text => /X\+10/.test(text));
  const after=lines.findIndex(text => /X\+20/.test(text));
  assert.ok(parsed.sub.some(segment => segment.srcLine===first && segment.to.x===10),
    'embedded M2 executes its positioning move');
  assert.ok(!parsed.sub.some(segment => segment.srcLine===after),
    'embedded M2 ends the program before the following move');
}
{
  const code=body('M3\nM0\nL X+10 F500');
  const line=code.split('\n').findIndex(text => /X\+10/.test(text));
  const move=H.parse(code).sub.find(segment => segment.srcLine===line && !segment.isMseg);
  assert.strictEqual(move.spindleOn,false,'M0 stops the spindle before execution resumes');
}
{
  const code=body('M3\nL X+10 F500 M5 M3\nL X+20 F500');
  const lines=code.split('\n'), parsed=H.parse(code);
  const first=parsed.sub.find(segment => segment.srcLine===lines.findIndex(text => /X\+10/.test(text)) && !segment.isMseg);
  const second=parsed.sub.find(segment => segment.srcLine===lines.findIndex(text => /X\+20/.test(text)) && !segment.isMseg);
  assert.strictEqual(first.spindleOn,true,'start-effective M3 applies to its block');
  assert.strictEqual(second.spindleOn,false,'end-effective M5 applies after that block regardless of programmed order');
}

// A new CYCL DEF cancels modal M89, while M89 applies to every positioning family.
const cycle200=`CYCL DEF 200
 Q200=+2
 Q201=-2
 Q206=+100
 Q202=+2
 Q203=+0
 Q204=+10`;
const cycle201=`CYCL DEF 201
 Q200=+2
 Q201=-2
 Q206=+100
 Q211=+0
 Q208=+100
 Q203=+0
 Q204=+10`;
{
  const code=H.program(`TOOL CALL 4 Z S2000 F150
M3
${cycle200}
L X+0 Y+0 Z+20 FMAX M89
${cycle201}
L X+10 Y+0 Z+20 FMAX`);
  const lastLine=code.split('\n').findIndex(text => /X\+10/.test(text));
  assert.strictEqual(H.parse(code).sub.filter(segment => segment.srcLine===lastLine).length,1,
    'new CYCL DEF cancels modal M89 before the next positioning block');
}
{
  const code=H.program(`TOOL CALL 4 Z S2000 F150
M3
${cycle200}
L X+0 Y+0 Z+20 FMAX M89
CR X+10 Y+0 R+10 DR+
L X+20 Y+0 FMAX
CT X+30 Y+10
CC X+20 Y+10
CP PA+90 DR+`);
  const parsed=H.parse(code), lines=code.split('\n');
  ['CR ','CT ','CP '].forEach(prefix => {
    const line=lines.findIndex(text => text.startsWith(prefix));
    const hasCycleDepth=parsed.sub.some(segment =>
      segment.srcLine===line && Math.abs(segment.from.x-segment.to.x)<1e-9 &&
      Math.abs(segment.from.y-segment.to.y)<1e-9 && Math.abs(segment.from.z-segment.to.z)>1e-6);
    assert.ok(hasCycleDepth,`modal M89 executes after ${prefix.trim()} positioning`);
  });
}

console.log('parser-m-functions.test.js: M syntax, state, parameters and cycle modality verified');
