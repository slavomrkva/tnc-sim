const assert = require('assert');
const H = require('./_cycle-harness');

function errors(list){
  return Array.from(list || []).filter(problem => problem.sev === 'err');
}

function spindleWarnings(list){
  return Array.from(list || []).filter(problem => /M3\/M4 not programmed before first cutting move/.test(problem.msg));
}

function close(actual, expected, message, tolerance=1e-5){
  assert.ok(Math.abs(actual-expected) <= tolerance,
    `${message}: expected ${expected}, got ${actual}`);
}

// Official HEIDENHAIN TNC 640 example, Klartext Programming User's Manual
// 34059x-18 (10/2023), page 172.
const officialCircular = [
  'BEGIN PGM CIRCULAR MM',
  'BLK FORM 0.1 Z X+0 Y+0 Z-20',
  'BLK FORM 0.2 X+100 Y+100 Z+0',
  'TOOL CALL 1 Z S4000',
  'L Z+250 R0 FMAX',
  'L X-10 Y-10 R0 FMAX',
  'L Z-5 R0 F1000 M3',
  'APPR LCT X+5 Y+5 R5 RL F300',
  'L X+5 Y+85',
  'RND R10 F150',
  'L X+30 Y+85',
  'CR X+70 Y+95 R+30 DR-',
  'L X+95',
  'L X+95 Y+40',
  'CT X+40 Y+5',
  'L X+5',
  'DEP LCT X-20 Y-20 R5 F1000',
  'L Z+250 R0 FMAX M2',
  'END PGM CIRCULAR MM'
].join('\n');

{
  const circularProblems=H.validate(officialCircular);
  assert.deepStrictEqual(errors(circularProblems), [],
    'official circular example validates without errors');
  assert.deepStrictEqual(spindleWarnings(circularProblems), [],
    'official circular example accepts its M3 after the safe FMAX positioning moves');
  const parsed=H.parse(officialCircular);
  assert.deepStrictEqual(errors(parsed.resultProblems), [],
    'official circular example produces a complete toolpath');

  const appr=parsed.sub.filter(segment => /^APPR-LCT/.test(segment.pathFunction || ''));
  const dep=parsed.sub.filter(segment => /^DEP-LCT/.test(segment.pathFunction || ''));
  assert.ok(appr.length>2, 'APPR LCT contains its line and tangential arc');
  assert.ok(dep.length>2, 'DEP LCT contains its tangential arc and line');
  close(appr[0].from.x,-10,'APPR starts at PS.x');
  close(appr[0].from.y,-10,'APPR starts at PS.y');
  close(appr[appr.length-1].to.x,0,'APPR reaches compensated PA.x');
  close(appr[appr.length-1].to.y,5,'APPR reaches compensated PA.y');
  close(dep[dep.length-1].to.x,-20,'DEP reaches programmed PN.x');
  close(dep[dep.length-1].to.y,-20,'DEP reaches programmed PN.y');

  const rndLine=officialCircular.split('\n').findIndex(line => line.startsWith('RND '));
  const rnd=parsed.sub.filter(segment => segment.srcLine===rndLine && segment.rcGeom && segment.rcGeom.kind==='RND');
  assert.ok(rnd.length>0, 'official RND is present');
  rnd.forEach(segment => close(segment.feed,150,'RND block-local feed'));
}

// Official polar helix example from the same manual, page 180.
const officialHelix = [
  'BEGIN PGM HELIX MM',
  'BLK FORM 0.1 Z X+0 Y+0 Z-20',
  'BLK FORM 0.2 X+100 Y+100 Z+0',
  'TOOL CALL 1 Z S1400',
  'L Z+250 R0 FMAX',
  'L X+50 Y+50 R0 FMAX',
  'CC',
  'L Z-12.75 R0 F1000 M3',
  'APPR PCT PR+32 PA-182 CCA180 R+2 RL F100',
  'CP IPA+3240 IZ+13.5 DR+ F200',
  'DEP CT CCA180 R+2',
  'L Z+250 R0 FMAX M2',
  'END PGM HELIX MM'
].join('\n');

{
  const helixProblems=H.validate(officialHelix);
  assert.deepStrictEqual(errors(helixProblems), [],
    'official polar helix validates without errors');
  assert.deepStrictEqual(spindleWarnings(helixProblems), [],
    'official polar helix accepts its M3 after the safe FMAX positioning moves');
  const parsed=H.parse(officialHelix);
  assert.deepStrictEqual(errors(parsed.resultProblems), [],
    'official polar helix produces a complete toolpath');
  const appr=parsed.sub.filter(segment => segment.pathFunction==='APPR-CT');
  const helix=parsed.sub.filter(segment =>
    segment.pathFunction==='CP' || (segment.rcGeom && segment.rcGeom.kind==='CP'));
  const dep=parsed.sub.filter(segment => segment.pathFunction==='DEP-CT');
  assert.ok(appr.length>2, 'official APPR PCT generates its circular approach');
  assert.ok(helix.length>100, 'official nine-turn CP helix is generated');
  assert.ok(dep.length>2, 'official DEP CT generates its circular departure');
  close(helix[helix.length-1].to.z,0.75,'official CP helix final Z');
  close(dep[dep.length-1].to.z,0.75,'official DEP CT stays in the contour plane');
}

// CT uses the exact tangent of an arc, supports documented LIN_Z
// superposition, and does not accept a pure-Z positioning block as tangent.
{
  const code=H.program(`TOOL CALL 23 Z S2000 F200
L X+0 Y+0 Z+5 R0 FMAX
L Z-2 F100
CC X+0 Y+10
C X+10 Y+10 DR+
CT X+20 Y+20 LIN_Z-6 F80`);
  assert.deepStrictEqual(errors(H.validate(code)), [], 'CT with LIN_Z validates');
  const parsed=H.parse(code);
  assert.deepStrictEqual(errors(parsed.resultProblems), [], 'CT with LIN_Z parses');
  const ctLine=code.split('\n').findIndex(line => line.startsWith('CT '));
  const ct=parsed.sub.filter(segment => segment.srcLine===ctLine);
  assert.ok(ct.length>2, 'CT arc is tessellated');
  close(ct[ct.length-1].to.z,-6,'CT LIN_Z endpoint');
  const primitive=ct[0].rcGeom;
  const startTangent={
    x:-Math.sin(primitive.a0)*(primitive.sweep>=0?1:-1),
    y: Math.cos(primitive.a0)*(primitive.sweep>=0?1:-1)
  };
  close(startTangent.x,0,'CT exact start tangent.x');
  close(startTangent.y,1,'CT exact start tangent.y');

  const invalid=H.program(`TOOL CALL 23 Z S2000 F200
L X+0 Y+0 Z+5 R0 FMAX
L X+10 Y+0 F100
L Z-2
CT X+20 Y+10`);
  assert.ok(errors(H.validate(invalid)).some(problem => /preceding XY contour move/.test(problem.msg)),
    'CT after pure Z is rejected');
}

// Cartesian APPR/DEP forms, signed CT radius and automatic RC cancellation.
[
  ['LT','LEN10','LT','LEN8'],
  ['LN','LEN+10','LN','LEN+8'],
  ['CT','CCA180 R+10','CT','CCA90 R-8']
].forEach(([apprForm,apprArgs,depForm,depArgs]) => {
  const code=H.program(`TOOL CALL 23 Z S2000 F200
L X-15 Y-10 Z-2 R0 FMAX
APPR ${apprForm} X+0 Y+0 ${apprArgs} RL F120
L X+30 Y+0
L X+30 Y+20
DEP ${depForm} ${depArgs} F300
L Z+20 FMAX`);
  assert.deepStrictEqual(errors(H.validate(code)), [], `${apprForm}/${depForm} validates`);
  const parsed=H.parse(code);
  assert.deepStrictEqual(errors(parsed.resultProblems), [], `${apprForm}/${depForm} parses`);
  assert.ok(parsed.sub.some(segment => (segment.pathFunction||'').startsWith(`APPR-${apprForm}`)),
    `APPR ${apprForm} path is generated`);
  assert.ok(parsed.sub.some(segment => (segment.pathFunction||'').startsWith(`DEP-${depForm}`)),
    `DEP ${depForm} path is generated`);
  const afterDep=parsed.sub.filter(segment => segment.srcLine===code.split('\n').findIndex(line => line==='L Z+20 FMAX'));
  assert.ok(afterDep.length && afterDep.every(segment => segment.rc!=='RL'&&segment.rc!=='RR'),
    'DEP cancels radius compensation automatically');
});

// R0 is documented for LT/LCT, but not for LN/CT.
{
  const valid=H.program(`TOOL CALL 23 Z S2000 F200
L X-20 Y-10 Z-2 R0 FMAX
APPR LT X+0 Y+0 LEN10 R0 F100
L X+20 Y+0 F150`);
  assert.deepStrictEqual(errors(H.validate(valid)), [], 'APPR LT R0 validates');
  assert.ok(H.parse(valid).sub.some(segment => (segment.pathFunction||'').startsWith('APPR-LT')),
    'APPR LT R0 path is generated');

  const validLct=H.program(`TOOL CALL 23 Z S2000 F200
L X-20 Y-10 Z-2 R0 FMAX
APPR LCT X+0 Y+0 R5 R0 F100
L X+20 Y+0 F150`);
  assert.deepStrictEqual(errors(H.validate(validLct)), [], 'APPR LCT R0 validates');
  assert.ok(H.parse(validLct).sub.some(segment => (segment.pathFunction||'').startsWith('APPR-LCT')),
    'APPR LCT R0 path is generated');

  ['LN','CT'].forEach(form => {
    const args=form==='LN'?'LEN10':'CCA90 R+10';
    const invalid=H.program(`TOOL CALL 23 Z S2000 F200
L X-20 Y-10 Z-2 R0 FMAX
APPR ${form} X+0 Y+0 ${args} R0 F100
L X+20 Y+0`);
    assert.ok(errors(H.validate(invalid)).some(problem => /not permitted with R0/.test(problem.msg)),
      `APPR ${form} R0 is rejected`);
  });
}

// All polar approach forms use the current CC pole.
[
  ['PLT','LEN8','L X+10 Y+20','DEP LT LEN8'],
  ['PLN','LEN8','L X+10 Y+20','DEP LN LEN8'],
  ['PCT','CCA180 R+5','CP IPA+90 DR+','DEP CT CCA90 R+5']
].forEach(([form,args,contour,departure]) => {
  const code=H.program(`TOOL CALL 23 Z S2000 F200
L X-20 Y-10 Z-2 R0 FMAX
CC X+0 Y+0
APPR ${form} PR+10 PA+0 ${args} RL F100
${contour} F150
${departure} F300`);
  assert.deepStrictEqual(errors(H.validate(code)), [], `APPR ${form} validates`);
  const parsed=H.parse(code);
  assert.deepStrictEqual(errors(parsed.resultProblems), [], `APPR ${form} parses`);
  assert.ok(parsed.sub.some(segment => (segment.pathFunction||'').startsWith(`APPR-${form.replace(/^P/,'')}`)),
    `APPR ${form} path is generated`);
});

// Polar LCT approach/departure forms use the current CC pole.
{
  const code=H.program(`TOOL CALL 23 Z S2000 F200
L X-20 Y-10 Z-2 R0 FMAX
CC X+0 Y+0
APPR PLCT PR+10 PA+0 R5 RL F100
L X+10 Y+20
DEP PLCT PR+25 PA+180 R5 F300`);
  assert.deepStrictEqual(errors(H.validate(code)), [], 'polar PLCT forms validate');
  const parsed=H.parse(code);
  assert.deepStrictEqual(errors(parsed.resultProblems), [], 'polar PLCT forms parse');
  const dep=parsed.sub.filter(segment => /^DEP-LCT/.test(segment.pathFunction||''));
  close(dep[dep.length-1].to.x,-25,'DEP PLCT PN.x');
  close(dep[dep.length-1].to.y,0,'DEP PLCT PN.y');
}

// With LT/LN/CT, optional Z is interpolated only from PH to PA. With LCT,
// PS-to-PH is simultaneous in XYZ and the circular PH-to-PA part stays in XY.
{
  const lt=H.program(`TOOL CALL 23 Z S2000 F200
L X-20 Y-10 Z+10 R0 FMAX
APPR LT X+0 Y+0 Z-5 LEN8 RL F100
L X+20 Y+0
DEP LCT X+30 Y-15 Z+5 R5 F300`);
  const parsed=H.parse(lt);
  assert.deepStrictEqual(errors(parsed.resultProblems), [], 'APPR/DEP optional Z parses');
  const entry=parsed.sub.filter(segment => segment.pathFunction==='APPR-LT-ENTRY');
  const approach=parsed.sub.filter(segment => segment.pathFunction==='APPR-LT');
  const depArc=parsed.sub.filter(segment => segment.pathFunction==='DEP-LCT');
  const depLine=parsed.sub.filter(segment => segment.pathFunction==='DEP-LCT-L');
  close(entry[entry.length-1].to.z,10,'APPR LT keeps Z through PS-PH');
  close(approach[approach.length-1].to.z,-5,'APPR LT reaches PA.Z');
  close(depArc[depArc.length-1].to.z,-5,'DEP LCT circle stays in contour plane');
  close(depLine[depLine.length-1].to.z,5,'DEP LCT line reaches PN.Z');
}

console.log('parser-appr-dep-ct.test.js: official APPR/DEP examples and analytic CT verified');
