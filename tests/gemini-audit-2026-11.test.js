// Regressions for the confirmed findings of the external audit of 2026-11-21
// (PAR-1, PAR-2, PAR-4, PAR-5, PAR-6, PAR-13, PAR-24 and SEC-1).
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const H = require('./_cycle-harness.js');

const root = path.join(__dirname, '..');
const near = (a, b, tol = 1e-3) => Math.abs(a - b) <= tol;
const nearPt = (p, x, y) => near(p.x, x) && near(p.y, y);
const errors = list => Array.from(list).filter(p => p.sev === 'err').map(p => p.msg);

function check(body) {
  const code = H.program(['TOOL CALL 1 Z S3000 F500', 'L Z+50 R0 FMAX M3'].concat(body).join('\n'));
  const res = H.parse(code);
  assert.deepStrictEqual(errors(H.validate(code)), [], 'validator accepts the program');
  assert.deepStrictEqual(errors(res.resultProblems), [], 'parser accepts the program');
  return res;
}

// Square pocket -30..30, RL = inside for this counter-clockwise contour.
const pocket = (...extra) => ['L X-40 Y-40 FMAX', 'L Z-5 F200', 'L X-30 Y-30 RL F200', 'L X+30 Y-30']
  .concat(extra, ['L X+30 Y+30', 'L X-30 Y+30', 'L X-30 Y-30', 'L X-40 Y-40 R0', 'L Z+50 FMAX']);

// PAR-5: the block after an M99 cycle call starts where the cycle ended (Q204).
{
  const res = check(['CYCL DEF 200 DRILLING', ' Q200=+2', ' Q201=-10', ' Q206=+150', ' Q202=+5',
    ' Q210=+0', ' Q203=+0', ' Q204=+50', ' Q211=+0', ' Q395=+0',
    'L X+20 Y+20 Z+5 FMAX M99', 'L X+40 Y+20 FMAX M99', 'L Z+50 FMAX']);
  for (let i = 1; i < res.sub.length; i++) {
    const a = res.sub[i - 1].to, b = res.sub[i].from;
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 1e-6, `segment ${i} is continuous`);
  }
  const toSecond = res.sub.find(s => nearPt(s.to, 40, 20) && !nearPt(s.from, 40, 20));
  assert.ok(toSecond && near(toSecond.from.z, 50) && near(toSecond.to.z, 50),
    'the move to the second hole stays at the 2nd set-up clearance');
}

// PAR-1: a Q value like 50*COS(90) = 3e-15 must not become X+3.06 mm.
{
  const res = check(['Q1 = 50 * COS(90)', 'L X+Q1 Y+30 FMAX', 'L Z-5 F200']);
  const s = res.sub.find(seg => near(seg.to.y, 30) && near(seg.to.z, 50));
  assert.ok(s && near(s.to.x, 0, 1e-6), 'X+Q1 resolves to X 0');
}

// PAR-2: an inside RND equal to the tool radius collapses to the corner point.
{
  const res = check(pocket('RND R5'));
  assert.ok(res.sub.some(s => nearPt(s.to, 25, -25)), 'tool center reaches the collapsed RND point');
  assert.ok(res.sub.some(s => nearPt(s.to, 25, 25)), 'the rest of the pocket is cut');
}

// PAR-4: a standalone M8 inside RL keeps compensation and the coolant event.
{
  const res = check(pocket('M8'));
  const m8 = res.sub.find(s => s.isMseg && s.coolantOn);
  assert.ok(m8 && nearPt(m8.to, 25, -25), 'M8 event sits at the compensated corner');
  const cuts = res.sub.filter(s => s.rc === 'RL' && !s.isMseg && !s.rcActivation);
  assert.ok(cuts.length >= 4, 'the whole contour stays compensated');
  for (const [x, y] of [[25, 25], [-25, 25]]) assert.ok(cuts.some(s => nearPt(s.to, x, y)), `offset corner ${x},${y}`);
  const after = res.sub.indexOf(m8);
  assert.ok(res.sub.slice(after + 1).some(s => s.rc === 'RL' && s.coolantOn), 'cutting after M8 has coolant on');
}

// PAR-13: RL activated at the current position still approaches the offset start.
{
  const res = check(['L X-30 Y-30 FMAX', 'L Z-5 F200', 'L X-30 Y-30 RL', 'L X+30 Y-30', 'L X+30 Y+30',
    'L X-40 Y-40 R0', 'L Z+50 FMAX']);
  assert.ok(res.sub.some(s => s.rcActivation && nearPt(s.from, -30, -30) && nearPt(s.to, -30, -25)),
    'approach goes from the activation point to the first offset point');
  assert.ok(res.sub.some(s => nearPt(s.to, 25, -25)), 'contour is cut');
}

// PAR-6: RND R+5 (explicit sign) is the same as RND R5.
{
  const code = ['L X-40 Y-40 FMAX', 'L Z-5 F200', 'L X+30 Y-40', 'RND R+5', 'L X+30 Y+30', 'L Z+50 FMAX'];
  const plus = check(code), plain = check(code.map(l => l === 'RND R+5' ? 'RND R5' : l));
  assert.deepStrictEqual(plus.sub.map(s => [s.to.x, s.to.y]), plain.sub.map(s => [s.to.x, s.to.y]));
}

// PAR-24: inline Q206=0.5 is a valid, non-zero feed.
check(['CYCL DEF 200 Q200=+2 Q201=-5 Q206=0.5 Q202=+5 Q210=+0 Q203=+0 Q204=+50 Q211=+0 Q395=+0',
  'L X+20 Y+20 FMAX M99']);

// SEC-1: program text, comments and tool names are escaped before innerHTML.
{
  const read = p => fs.readFileSync(path.join(root, p), 'utf8');
  assert.match(read('core/editor-core.js'), /<span>'\+toolEsc\(p\.msg\)\+'<\/span>/, 'Problems messages');
  assert.match(read('core/editor-core.js'), /toolEsc\(filename\)/, 'export fallback filename');
  assert.match(read('core/qparam-panel.js'), /toolEsc\(label\|\|qkey\)/, 'Q popup comment');
  assert.match(read('core/qparam-panel.js'), /value="'\+toolEsc\(qval\)/, 'Q popup value');
  assert.match(read('core/sim-controls.js'), /var tName = toolEsc\(/, 'sim info tool name');
  assert.match(read('core/view2d.js'), /var name = toolEsc\(/, 'tool legend name');
  assert.match(read('core/field-editing.js'), /var _curLabel = toolEsc\(/, 'tool picker label');
}

console.log('gemini-audit-2026-11: all assertions passed');
