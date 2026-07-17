const assert = require('assert');
const H = require('./_cycle-harness.js');

function near(actual, expected, eps, message){
  assert.ok(Math.abs(actual-expected) <= eps, `${message}: expected ${expected}, got ${actual}`);
}
function noRadiusError(result, message){
  assert.ok(!(result.probs||[]).some(p => /tool radius too large|Cannot calculate tool radius compensation/.test(p.msg)), message);
}

// Exact PROGRAM.H contour: effective tool radius 5, C radius 7.5 and four
// inside RND radii 5.5. Compensation is calculated on analytic primitives;
// tessellation is only the final rendering representation.
{
  const code=H.program(`TOOL CALL 1 Z S2000 F5000
L X+0 Y+30 Z+0 R0 FMAX
L X+0 Y+29.5 RL
CC X+0 Y+37
C X+0 Y+44.5 DR+
L X-84.5
RND R5.5
L Y-44.5
RND R5.5
L X+84.5
RND R5.5
L Y+44.5
RND R5.5
L X-5
CC X-5 Y+37
C X-5 Y+29.5 DR+
L Z+20 R0 FMAX`);
  const result=H.parse(code);
  noRadiusError(result, 'PROGRAM.H contour must be accepted with effective radius 5');
  const activation=result.sub.find(s => s.rcActivation);
  near(activation.to.x, 0, 1e-9, 'activation endpoint X');
  near(activation.to.y, 34.5, 1e-9, 'activation endpoint Y');
  assert.ok(!result.sub.some(s => s.rcEntry), 'activation must not invent a second hidden entry movement');
  const entryC=result.sub.filter(s => s.rcGeom&&s.rcGeom.kind==='C'&&s.srcLine===7);
  assert.ok(entryC.length>20, 'entry C must remain an arc after compensation');
  entryC.forEach(s => near(Math.hypot(s.to.x,s.to.y-37),2.5,1e-8,'entry C tool-center radius'));
  const rnd=result.sub.filter(s => s.rcGeom&&s.rcGeom.kind==='RND');
  assert.ok(rnd.length>=32, 'all four RND arcs must be emitted');
  rnd.forEach(s => near(s.rcGeom.r,0.5,1e-10,'RND tool-center radius'));
  const retract=result.sub.find(s => s.rc==='R0'&&Math.abs(s.to.z-20)<1e-9);
  near(retract.from.x,retract.to.x,1e-9,'pure-Z R0 X continuity');
  near(retract.from.y,retract.to.y,1e-9,'pure-Z R0 Y continuity');
}

// CR is offset as its exact concentric circle, not as individual display chords.
{
  const result=H.parse(H.program(`TOOL CALL 23 Z S3000 F500
L X-10 Y+0 R0
L X+0 Y+0 RL
CR X+10 Y+10 R+10 DR+
L X+10 Y+20
L X+20 Y+20 R0`));
  noRadiusError(result,'valid CR contour must be accepted');
  const activation=result.sub.find(s=>s.rcActivation);
  near(activation.to.x,0,1e-9,'CR activation X');
  near(activation.to.y,2,1e-9,'CR activation Y');
  const arc=result.sub.filter(s=>s.rcGeom&&s.rcGeom.kind==='CR');
  assert.ok(arc.length>8,'CR compensated arc must be emitted');
  arc.forEach(s=>near(Math.hypot(s.to.x,s.to.y-10),8,1e-8,'CR tool-center radius'));
}

// Left/right is relative to travel direction: verify both compensation sides
// for clockwise and counterclockwise circular movement.
for(const probe of [
  {startY:-10,preY:-15,endY:0,dr:'DR+',side:'RL',radius:8},
  {startY:-10,preY:-15,endY:0,dr:'DR+',side:'RR',radius:12},
  {startY:10, preY:15, endY:0,dr:'DR-',side:'RL',radius:12},
  {startY:10, preY:15, endY:0,dr:'DR-',side:'RR',radius:8}
]){
  const result=H.parse(H.program(`TOOL CALL 23 Z S3000 F500
L X+0 Y${probe.preY>=0?'+':''}${probe.preY} R0
L X+0 Y${probe.startY>=0?'+':''}${probe.startY} ${probe.side}
CC X+0 Y+0
C X+10 Y${probe.endY>=0?'+':''}${probe.endY} ${probe.dr}
L X+20 Y+0 R0`));
  noRadiusError(result,`${probe.dr} ${probe.side} circle must be accepted`);
  const arc=result.sub.find(s=>s.rcGeom&&s.rcGeom.kind==='C');
  near(arc.rcGeom.r,probe.radius,1e-10,`${probe.dr} ${probe.side} compensated radius`);
}

// If the supplied tool value were truly R10 (not diameter 10 / R5), the same
// inside C radius 7.5 is smaller and the official TNC error is correct.
{
  const result=H.parse(H.program(`TOOL CALL 28 Z S2000 F5000
L X+0 Y+30 R0
L X+0 Y+29.5 RL
CC X+0 Y+37
C X+0 Y+44.5 DR+
L X-10 Y+44.5 R0`));
  assert.ok(result.probs.some(p=>/inside contour radius is smaller/.test(p.msg)),'R10 must be rejected for an inside C radius 7.5');
  assert.strictEqual(result.sub.filter(s=>s.rc==='RL').length,0,'undersized inside C must emit no compensated cut');
}

// CT keeps the exact tangent inherited from the preceding analytic line.
{
  const result=H.parse(H.program(`TOOL CALL 23 Z S3000 F500
L X-10 Y+0 R0
L X+0 Y+0 RL
L X+10 Y+0
CT X+20 Y+10
L X+20 Y+20
L X+30 Y+20 R0`));
  noRadiusError(result,'valid CT contour must be accepted');
  const arc=result.sub.filter(s=>s.rcGeom&&s.rcGeom.kind==='CT');
  assert.ok(arc.length>8,'CT compensated arc must be emitted');
  arc.forEach(s=>near(Math.hypot(s.to.x-10,s.to.y-10),8,1e-8,'CT tool-center radius'));
}

// CP follows the same analytic circle rule.
{
  const result=H.parse(H.program(`TOOL CALL 23 Z S3000 F500
CC X+0 Y+0
L X+15 Y+0 R0
L X+10 Y+0 RL
CP PA+90 DR+
L X+0 Y+20
L X+10 Y+20 R0`));
  noRadiusError(result,'valid CP contour must be accepted');
  const arc=result.sub.filter(s=>s.rcGeom&&s.rcGeom.kind==='CP');
  assert.ok(arc.length>8,'CP compensated arc must be emitted');
  arc.forEach(s=>near(Math.hypot(s.to.x,s.to.y),8,1e-8,'CP tool-center radius'));
}

// A feasible inside L/L corner is trimmed to the exact intersection of the
// two finite offset lines: (8,2) for a radius-2 RL path.
{
  const result=H.parse(H.program(`TOOL CALL 23 Z S3000 F500
L X-10 Y+0 R0
L X+0 Y+0 RL
L X+10 Y+0
L X+10 Y+10
L X+20 Y+10 R0`));
  noRadiusError(result,'valid finite inside corner must be accepted');
  assert.ok(result.sub.some(s=>s.rc==='RL'&&nearBool(s.to.x,8)&&nearBool(s.to.y,2)),'inside line must end at exact offset intersection');
  assert.ok(result.sub.some(s=>s.rc==='RL'&&nearBool(s.from.x,8)&&nearBool(s.from.y,2)),'following line must start at exact offset intersection');
}

// TNC 640 outside corners use a transitional arc of the effective tool radius.
{
  const result=H.parse(H.program(`TOOL CALL 23 Z S3000 F500
L X-10 Y+0 R0
L X+0 Y+0 RL
L X+10 Y+0
L X+10 Y-10
L X+20 Y-10 R0`));
  noRadiusError(result,'valid outside corner must be accepted');
  const transition=result.sub.filter(s=>s.rcGeom&&s.rcGeom.kind==='RC-TRANSITION');
  assert.ok(transition.length>=8,'outside corner must contain a TNC 640 transitional arc');
  transition.forEach(s=>near(s.rcGeom.r,2,1e-10,'outside transition radius'));
}

// The official error definition says "inside radius smaller than tool radius".
// Equality is the geometric limit: the compensated RND collapses to one point
// and must not be mislabeled as a smaller-radius error.
{
  const result=H.parse(H.program(`TOOL CALL 23 Z S3000 F500
L X-10 Y+0 R0
L X+0 Y+0 RL
L X+10 Y+0
RND R2
L X+10 Y+10
L X+20 Y+10 R0`));
  noRadiusError(result,'RND equal to the effective radius must not be rejected as smaller');
  assert.ok(result.sub.some(s=>s.rc==='RL'&&nearBool(s.to.x,8)&&nearBool(s.to.y,2)),'equal-radius RND must collapse at the exact tool-center point');
}

// HEIDENHAIN defines RND as tangent to both neighbors. For a 30-degree turn,
// the tangent distance is R*tan(15 degrees), not R/tan(15 degrees).
{
  const result=H.parse(H.program(`TOOL CALL 23 Z S3000 F500
L X+0 Y+0 R0
L X+100 Y+0
RND R10
L X+186.602540378 Y+50`));
  const rnd=result.sub.find(s=>s.rcGeom&&s.rcGeom.kind==='RND');
  assert.ok(rnd,'shallow RND must be emitted');
  const expected=100-10*Math.tan(Math.PI/12);
  near(rnd.rcGeom.from.x,expected,1e-8,'shallow RND first tangency X');
  near(rnd.rcGeom.from.y,0,1e-9,'shallow RND first tangency Y');
  near(rnd.rcGeom.r,10,1e-12,'shallow RND programmed radius');
}

// RL/RR cannot first be switched on in a C/CR/CT/CP block; TNC 640 requires L.
{
  const result=H.parse(H.program(`TOOL CALL 23 Z S3000 F500
L X+0 Y-10 R0
CC X+0 Y+0
C X+10 Y+0 DR+ RL
L X+20 Y+0 R0`));
  assert.ok(result.probs.some(p=>/must be activated in an L block/.test(p.msg)),'non-L compensation activation must be rejected');
  assert.strictEqual(result.sub.filter(s=>s.rc==='RL').length,0,'invalid non-L activation must emit no compensated cut');
}

function nearBool(value, expected){ return Math.abs(value-expected)<1e-8; }

console.log('analytic TNC 640 radius-compensation regressions passed');
