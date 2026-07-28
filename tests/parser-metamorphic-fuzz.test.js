'use strict';

const assert = require('assert');
const H = require('./_cycle-harness.js');

function errors(code){
  return H.validate(code).filter(problem => problem.sev === 'err');
}

function rounded(value){
  return Number(Number(value).toFixed(8));
}

function canonical(code){
  const parsed = H.parse(code);
  const parserErrors = parsed.resultProblems.filter(problem => problem.sev === 'err');
  assert.strictEqual(parserErrors.length, 0,
    `parser errors: ${JSON.stringify(parserErrors)}`);
  return parsed.sub.map(segment => ({
    from:[rounded(segment.from.x),rounded(segment.from.y),rounded(segment.from.z)],
    to:[rounded(segment.to.x),rounded(segment.to.y),rounded(segment.to.z)],
    rapid:!!segment.rapid,
    feed:rounded(segment.feed),
    rc:segment.rc || '',
    toolNum:segment.toolNum || 0,
    cycleEvent:segment.cycleEvent || '',
    eventValue:segment.eventValue === undefined ? null : segment.eventValue,
    geom:segment.rcGeom ? segment.rcGeom.kind : ''
  }));
}

const base = `BEGIN PGM META MM
BLK FORM 0.1 Z X-50.0 Y-50.0 Z-20.0
BLK FORM 0.2 X+50.0 Y+50.0 Z+10.0
TOOL CALL 1 Z S2000 F420
M3
L X+10.0 Y+0.0 Z+2.0 R0 FMAX
CC X+0.0 Y+0.0
LP PR+10.0 PA+0.0 F AUTO
LBL 1
LP IPA+45.0
CALL LBL 1 REP6
L X+10.0 Y+0.0 R0
CYCL DEF 200
Q200=+2.0
Q201=-4.0
Q206= AUTO
Q202=+2.0
Q210=+0.0
Q203=+0.0
Q204=+5.0
Q211=+0.0
Q395=+0.0
L X+0.0 Y+0.0 Z+10.0 FMAX M99
END PGM META MM`;

const variants = [
  ['canonical', base],
  ['compact aliases', base
    .replace('F AUTO','FAUTO')
    .replace('Q206= AUTO','Q206=FAUTO')
    .replace('REP6','REP 6')],
  ['lowercase', base.toLowerCase()],
  ['decimal comma', base.replace(/(\d)\.(\d)/g,'$1,$2')],
  ['CRLF', base.replace(/\n/g,'\r\n')],
  ['UTF BOM', '\uFEFF'+base],
  ['block numbers', base.split('\n').map((line,index) => `${index} ${line}`).join('\n')],
  ['extra whitespace', base.split('\n').map(line => `  ${line.replace(/ /g,'   ')}  `).join('\n')],
  ['comments', base.split('\n').map(line => `${line} ; metamorphic`).join('\n')]
];

const baseline = canonical(base);
for(const [name, code] of variants){
  assert.strictEqual(errors(code).length, 0, `${name} must validate`);
  assert.deepStrictEqual(canonical(code), baseline,
    `${name} must preserve the complete canonical toolpath`);
}

function rng(seed){
  let state=seed>>>0;
  return function(){
    state^=state<<13; state^=state>>>17; state^=state<<5;
    return (state>>>0)/0x100000000;
  };
}

function signed(value){
  const fixed=rounded(value).toFixed(3);
  return value>=0?`+${fixed}`:fixed;
}

function emitted(value){
  return Number(rounded(value).toFixed(3));
}

const random=rng(0x544e4336);
for(let caseIndex=0;caseIndex<200;caseIndex++){
  let x=0,y=0,z=5;
  const lines=[
    `BEGIN PGM FUZZ${caseIndex} MM`,
    'BLK FORM 0.1 Z X-100 Y-100 Z-30',
    'BLK FORM 0.2 X+100 Y+100 Z+20',
    'TOOL CALL 1 Z S3000 F600',
    'M3',
    'L X+0 Y+0 Z+5 R0 FMAX'
  ];
  for(let moveIndex=0;moveIndex<30;moveIndex++){
    const useIncremental=random()<0.45;
    const nx=emitted(-80+random()*160);
    const ny=emitted(-80+random()*160);
    const nz=emitted(-20+random()*35);
    const feedChoice=Math.floor(random()*4);
    const feed=feedChoice===0?' FMAX':feedChoice===1?' FAUTO':
      feedChoice===2?` F${100+Math.floor(random()*1900)}`:'';
    if(useIncremental){
      const dx=emitted((random()-0.5)*12);
      const dy=emitted((random()-0.5)*12);
      const dz=emitted((random()-0.5)*4);
      x=rounded(x+dx); y=rounded(y+dy); z=rounded(z+dz);
      lines.push(`L IX${signed(dx)} IY${signed(dy)} IZ${signed(dz)}${feed}`);
    } else {
      x=nx; y=ny; z=nz;
      lines.push(`L X${signed(x)} Y${signed(y)} Z${signed(z)}${feed}`);
    }
  }
  lines.push(`END PGM FUZZ${caseIndex} MM`);
  let code=lines.join(caseIndex%2?'\r\n':'\n');
  if(caseIndex%3===0) code=code.split(/\r?\n/).map((line,index)=>`${index} ${line}`).join('\n');
  if(caseIndex%5===0) code=code.split(/\r?\n/).map(line=>`${line} ; seeded fuzz`).join('\n');
  const validationErrors=errors(code);
  assert.strictEqual(validationErrors.length,0,
    `valid seeded case ${caseIndex}: ${JSON.stringify(validationErrors)}`);
  const parsed=H.parse(code);
  assert.strictEqual(parsed.resultProblems.filter(problem=>problem.sev==='err').length,0,
    `valid seeded case ${caseIndex} parser diagnostics`);
  const movements=parsed.sub.filter(segment=>!segment.isMseg);
  assert.ok(movements.length>=31,`valid seeded case ${caseIndex} movement count`);
  for(const segment of movements){
    for(const point of [segment.from,segment.to]){
      assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y)&&Number.isFinite(point.z),
        `valid seeded case ${caseIndex} contains a non-finite point`);
    }
    assert.ok(Number.isFinite(segment.feed),
      `valid seeded case ${caseIndex} contains a non-finite feed`);
  }
  const end=movements[movements.length-1].to;
  assert.ok(Math.abs(end.x-x)<1e-7&&Math.abs(end.y-y)<1e-7&&Math.abs(end.z-z)<1e-7,
    `valid seeded case ${caseIndex} final state differs: parser=${JSON.stringify(end)}, generated=${JSON.stringify({x,y,z})}`);
}

const invalidCases = [
  ['duplicate coordinate',base.replace('L X+10.0 Y+0.0 Z+2.0','L X+10.0 X+11.0 Y+0.0 Z+2.0'),/coordinate X/i],
  ['unknown token',base.replace('LP PR+10.0 PA+0.0 F AUTO','LP PR+10.0 PA+0.0 BANANA'),/Unsupported token/i],
  ['undefined Q',base.replace('L X+10.0 Y+0.0 R0','L X+Q999 Y+0.0 R0'),/Q999 has no value/i],
  ['zero repeat',base.replace('REP6','REP0'),/REP must be/i],
  ['AUTO on non-feed Q',base.replace('Q200=+2.0','Q200=AUTO'),/Q200: AUTO is not supported/i]
];
for(const [name,code,message] of invalidCases){
  assert.ok(errors(code).some(problem=>message.test(problem.msg)),
    `${name} must be rejected with a specific validator error`);
}

const recursive=`BEGIN PGM RECURSE MM
CALL LBL 1
M30
LBL 1
CALL LBL 1
LBL 0
END PGM RECURSE MM`;
assert.ok(errors(recursive).some(problem=>/32 levels/.test(problem.msg)),
  'recursive labels must trip the validator depth guard');
assert.ok(H.parse(recursive).resultProblems.some(problem=>/32 levels/.test(problem.msg)),
  'recursive labels must also trip the parser depth guard');

console.log(`parser-metamorphic-fuzz.test.js: ${variants.length} equivalent spellings, 200 seeded valid programs and ${invalidCases.length+1} invalid guards passed`);
