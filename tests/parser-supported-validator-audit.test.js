const assert = require('assert');
const H = require('./_cycle-harness.js');

function errors(code){
  return H.validate(code).filter(problem => problem.sev === 'err');
}

function positioningProgram(block){
  const setup = {
    C:  'L X+10 Y+0 F100\nCC X+0 Y+0',
    CR: 'L X+10 Y+0 F100',
    CT: 'L X+0 Y+0 F100\nL X+10 Y+0',
    LP: 'L X+10 Y+0 F100\nCC X+0 Y+0',
    CP: 'L X+10 Y+0 F100\nCC X+0 Y+0'
  };
  return H.program(`TOOL CALL 1 Z S2000 F420
M3
${setup[block]}
${{
  C:  'C X+0 Y+10 DR+',
  CR: 'CR X+0 Y+10 R+10 DR+',
  CT: 'CT X+20 Y+10',
  LP: 'LP PR+10 PA+90',
  CP: 'CP PA+90 DR+'
}[block]}`);
}

for(const block of ['C', 'CR', 'CT', 'LP', 'CP']){
  {
    const code = positioningProgram(block).replace(
      new RegExp(`^${block} `, 'm'), `${block} FAUTO `);
    assert.strictEqual(errors(code).length, 0,
      `${block} accepts FAUTO as a positioning feed`);
    const line = code.split('\n').findIndex(text => text.startsWith(`${block} `));
    const moves = H.parse(code).sub.filter(segment => segment.srcLine === line && !segment.isMseg);
    assert.ok(moves.length > 0, `${block} FAUTO produces a positioning move`);
    assert.ok(moves.every(segment => segment.feed === 420 && !segment.rapid),
      `${block} FAUTO uses the current TOOL CALL feed`);
  }
  {
    const code = positioningProgram(block).replace(
      new RegExp(`^${block} `, 'm'), `${block} F AUTO `);
    assert.strictEqual(errors(code).length, 0,
      `${block} accepts the official F AUTO spelling as a positioning feed`);
    const line = code.split('\n').findIndex(text => text.startsWith(`${block} `));
    const moves = H.parse(code).sub.filter(segment => segment.srcLine === line && !segment.isMseg);
    assert.ok(moves.length > 0, `${block} F AUTO produces a positioning move`);
    assert.ok(moves.every(segment => segment.feed === 420 && !segment.rapid),
      `${block} F AUTO restores the current TOOL CALL feed after a numeric feed`);
  }
  {
    const code = positioningProgram(block).replace(
      new RegExp(`^${block} `, 'm'), `${block} FMAX `);
    assert.strictEqual(errors(code).length, 0,
      `${block} accepts FMAX as a positioning feed`);
    const line = code.split('\n').findIndex(text => text.startsWith(`${block} `));
    const moves = H.parse(code).sub.filter(segment => segment.srcLine === line && !segment.isMseg);
    assert.ok(moves.length > 0, `${block} FMAX produces a positioning move`);
    assert.ok(moves.every(segment => segment.feed === 9999 && segment.rapid),
      `${block} FMAX is rapid and block-local`);
  }
}

const duplicateCases = [
  ['L X+1 X+2', /coordinate X/i],
  ['L X+1 IX+2', /coordinate X/i],
  ['L X+1 F100 F200', /feed/i],
  ['L X+1 R0 RL', /radius compensation/i],
  ['L X+10 Y+0\nCC X+0 IX+1', /coordinate X/i],
  ['L X+10 Y+0\nCC X+0 Y+0\nC X+0 X+1 Y+10 DR+', /coordinate X/i],
  ['L X+10 Y+0\nCC X+0 Y+0\nCP PA+90 Z+1 IZ+2 DR+', /coordinate Z/i]
];
for(const [body, message] of duplicateCases){
  const found = errors(H.program(body));
  assert.ok(found.some(problem => message.test(problem.msg)),
    `${body.split('\n').pop()} rejects an ambiguous duplicate field`);
}

{
  const warnings = H.validate(H.program('L X0 Y+0 F100')).filter(problem => problem.sev === 'warn');
  assert.ok(warnings.some(problem => /Sign missing in X0/.test(problem.msg)),
    'an unsigned coordinate is reported even when another axis has an explicit sign');
}

{
  const badLabel = [
    'BEGIN PGM LABELS MM',
    'LBL 65536',
    'L X+1',
    'LBL 0',
    'END PGM LABELS MM'
  ].join('\n');
  assert.ok(errors(badLabel).some(problem => /1\.\.65535/.test(problem.msg)),
    'numeric label numbers are limited to 1..65535');
}
{
  const badRepeat = [
    'BEGIN PGM LABELS MM',
    'LBL 1',
    'L X+1',
    'LBL 0',
    'CALL LBL 1 REP 65535',
    'END PGM LABELS MM'
  ].join('\n');
  assert.ok(errors(badRepeat).some(problem => /1\.\.65534/.test(problem.msg)),
    'REP is limited to 1..65534 before label expansion');
  assert.ok(H.parse(badRepeat).resultProblems.some(problem => /1\.\.65534/.test(problem.msg)),
    'parser also rejects an oversized REP when validation is switched off');
}
{
  const malformed = [
    'BEGIN PGM LABELS MM',
    'LBL 1 EXTRA',
    'LBL 0',
    'END PGM LABELS MM'
  ].join('\n');
  assert.ok(errors(malformed).some(problem => /expected: LBL/.test(problem.msg)),
    'numeric LBL blocks reject trailing garbage');
}
{
  const compactRepeat = [
    'BEGIN PGM LABELS MM',
    'TOOL CALL 1 Z S2000 F100',
    'M3',
    'LBL 1',
    'L IX+1 F100',
    'LBL 0',
    'CALL LBL 1 REP6',
    'END PGM LABELS MM'
  ].join('\n');
  assert.strictEqual(errors(compactRepeat).length, 0,
    'the documented compact REP6 form is valid');
  const parsed = H.parse(compactRepeat);
  assert.strictEqual(parsed.resultProblems.filter(problem => problem.sev === 'err').length, 0,
    'the compact REP6 form has no parser error');
  assert.strictEqual(parsed.sub[parsed.sub.length - 1].to.x, 7,
    'REP6 executes six repeats in addition to the label fall-through');
}
{
  const programSectionRepeat = [
    'BEGIN PGM SECTION MM',
    'TOOL CALL 1 Z S2000 F100',
    'M3',
    'LBL 1',
    'L IX+1 F100',
    'CALL LBL 1 REP6',
    'END PGM SECTION MM'
  ].join('\n');
  assert.strictEqual(errors(programSectionRepeat).length, 0,
    'a program-section repeat ends at its matching CALL LBL REPn without LBL 0');
  const parsed = H.parse(programSectionRepeat);
  assert.strictEqual(parsed.resultProblems.filter(problem => problem.sev === 'err').length, 0,
    'program-section repeat expansion does not absorb END PGM');
  assert.strictEqual(parsed.sub[parsed.sub.length - 1].to.x, 7,
    'program-section REP6 executes the fall-through plus six repetitions');
}
{
  const nestedSection = [
    'BEGIN PGM NESTED MM',
    'TOOL CALL 1 Z S2000 F100',
    'M3',
    'CALL LBL 1',
    'M30',
    'LBL 1',
    'L X+1 F100',
    'LBL 2',
    'L IX+1',
    'CALL LBL 2 REP3',
    'LBL 0',
    'END PGM NESTED MM'
  ].join('\n');
  assert.strictEqual(errors(nestedSection).length, 0,
    'a program-section repeat may be nested inside an LBL 0 subprogram');
  const parsed = H.parse(nestedSection);
  assert.strictEqual(parsed.resultProblems.filter(problem => problem.sev === 'err').length, 0,
    'nested section expansion has no parser error');
  assert.strictEqual(parsed.sub[parsed.sub.length - 1].to.x, 5,
    'the outer call executes the first move plus the section fall-through and REP3');
}
{
  const recursive = [
    'BEGIN PGM RECURSE MM',
    'CALL LBL 1',
    'M30',
    'LBL 1',
    'CALL LBL 1',
    'LBL 0',
    'END PGM RECURSE MM'
  ].join('\n');
  assert.ok(errors(recursive).some(problem => /32 levels/.test(problem.msg)),
    'recursive label calls are stopped by the expansion depth guard');
  assert.ok(H.parse(recursive).resultProblems.some(problem => /32 levels/.test(problem.msg)),
    'the recursion guard also protects parsing when validation is switched off');
}

const cycleDefs = {
  200: [
    'Q200=+2', 'Q201=-10', 'Q206=+150', 'Q202=+5', 'Q210=+0',
    'Q203=+0', 'Q204=+10', 'Q211=+0', 'Q395=+0'
  ],
  201: [
    'Q200=+2', 'Q201=-10', 'Q206=+150', 'Q211=+0',
    'Q208=+200', 'Q203=+0', 'Q204=+10'
  ],
  208: [
    'Q200=+2', 'Q201=-10', 'Q206=+150', 'Q334=+1', 'Q203=+0',
    'Q204=+10', 'Q335=+20', 'Q342=+0', 'Q351=+1'
  ],
  209: [
    'Q200=+2', 'Q201=-10', 'Q239=+1.25', 'Q203=+0', 'Q204=+10',
    'Q257=+5', 'Q256=+1', 'Q336=+90', 'Q403=+1'
  ]
};

for(const number of [200, 201, 208, 209]){
  const complete = H.program(`CYCL DEF ${number}\n${cycleDefs[number].join('\n')}`);
  assert.strictEqual(errors(complete).length, 0,
    `complete supported CYCL DEF ${number} remains valid`);

  if(number !== 209){
    const officialAuto = complete.replace(/Q206=\+\d+(?:\.\d+)?/, 'Q206= AUTO');
    assert.strictEqual(errors(officialAuto).length, 0,
      `CYCL DEF ${number} accepts the official AUTO spelling for Q206`);
  }

  const missing = H.program(`CYCL DEF ${number}\n${cycleDefs[number].slice(1).join('\n')}`);
  assert.ok(errors(missing).some(problem => /missing required parameter Q200/.test(problem.msg)),
    `CYCL DEF ${number} rejects a missing required parameter`);

  const unknown = H.program(`CYCL DEF ${number}\n${cycleDefs[number].join('\n')}\nQ999=+1`);
  assert.ok(errors(unknown).some(problem => /Q999 is not supported/.test(problem.msg)),
    `CYCL DEF ${number} rejects unknown Q parameters`);

  const duplicate = H.program(`CYCL DEF ${number}\n${cycleDefs[number].join('\n')}\nQ200=+3`);
  assert.ok(errors(duplicate).some(problem => /Q200 is programmed more than once/.test(problem.msg)),
    `CYCL DEF ${number} rejects duplicate Q parameters`);
}

{
  const code = H.program(`TOOL CALL 1 Z S2000 F420
M3
CYCL DEF 200
${cycleDefs[200].join('\n').replace('Q206=+150', 'Q206= AUTO')}
L X+0 Y+0 Z+10 FMAX
CYCL CALL`);
  assert.strictEqual(errors(code).length, 0,
    'CYCL 200 accepts the official Q206=AUTO form');
  const parsed = H.parse(code);
  const cycleMoves = H.cycleSegments(parsed, code);
  assert.ok(cycleMoves.length > 0, 'CYCL 200 Q206=AUTO generates its cutting path');
  assert.ok(cycleMoves.filter(segment => !segment.rapid && segment.to.z < segment.from.z)
    .every(segment => segment.feed === 420),
  'CYCL 200 Q206=AUTO uses the current TOOL CALL feed');
}

{
  const invalidAuto = H.program(`CYCL DEF 200
${cycleDefs[200].join('\n').replace('Q200=+2', 'Q200= AUTO')}`);
  assert.ok(errors(invalidAuto).some(problem => /Q200: AUTO is not supported/.test(problem.msg)),
    'AUTO remains rejected for non-feed cycle parameters');
}

{
  const code = H.program(`TOOL CALL 7 Z S500 F100
M3
CYCL DEF 209
${cycleDefs[209].join('\n')}
L X+0 Y+0 Z+10 FMAX
CYCL CALL`);
  assert.strictEqual(errors(code).length, 0,
    'CYCL 209 accepts a documented Q336 orientation');
  assert.ok(H.parse(code).sub.some(segment =>
    segment.cycleEvent === 'spindle-orientation' && segment.eventValue === 90),
  'CYCL 209 preserves Q336 orientation in the simulation');
}

console.log('parser-supported-validator-audit.test.js: supported validator scope verified');
