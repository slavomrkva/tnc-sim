// Regression tests for the Heidenhain cycle & cutting-logic audit.
// Covers findings A1–A5 and R1 plus the Phase 1 (uniform zero/default) and
// Phase 3 (DL/DR, RL/RR/R0) contracts. Asserts the CORRECTED behavior, and is
// built to fail on the pre-fix tree (silent negate, 0.05 clamp, -10 default,
// pathological pass count, off-centre retract).
const assert = require('assert');
const H = require('./_cycle-harness.js');

const CYCLES = {
  200: {tool:'TOOL CALL 4 Z S2000 F150', extra:'\n Q202=+5'},
  201: {tool:'TOOL CALL 4 Z S2000 F150', extra:''},
  208: {tool:'TOOL CALL 1 Z S3000 F500', extra:'\n Q334=+2\n Q335=+20\n Q342=+0\n Q351=+1'},
  209: {tool:'TOOL CALL 7 Z S200 F250',  extra:'\n Q239=+1.25'}
};

function cyc(num, q201, q200, q203, q204, extraOverride){
  const c = CYCLES[num];
  const body = `${c.tool}\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF ${num}\n Q200=${q200}\n Q201=${q201}\n Q203=${q203}\n Q204=${q204}${extraOverride!==undefined?extraOverride:c.extra}\nCYCL CALL`;
  return H.program(body);
}
function seg(num, q201, q200, q203, q204, extra){
  const code = cyc(num, q201, q200, q203, q204, extra);
  const res = H.parse(code);
  return {res, segs: H.cycleSegments(res, code), code};
}
function cuts(segs, surfZ){ return segs.filter(s => !s.rapid && s.to.z < surfZ - 1e-6); }

// ───────────────────────── A1 — Q201 = 0 (zero depth) ─────────────────────────
for(const num of [200,201,208,209]){
  const {segs} = seg(num, '+0', '+2', '+0', '+30');
  assert.strictEqual(segs.length, 0,
    `A1: cycle ${num} with Q201=0 must not execute or emit cycle motion`);
  assert.strictEqual(cuts(segs, 0).length, 0,
    `A1: cycle ${num} with Q201=0 must not cut below the surface (no -10 default)`);
}

// ───────────────────────── A2 — positive Q201 rejected ────────────────────────
for(const num of [200,201,208,209]){
  // multi-line form
  const {res, segs, code} = seg(num, '+5', '+2', '+0', '+30');
  assert.strictEqual(cuts(segs, 0).length, 0,
    `A2: cycle ${num} with Q201=+5 must produce NO cutting path (never a silent sign flip)`);
  assert.ok((res.problems||[]).some(p => p.sev==='err' && String(p.msg).indexOf('Q201')>=0),
    `A2: cycle ${num} positive depth must raise a parse-time error`);
  assert.ok(H.validate(code).some(p => p.sev==='err' && /Q201/.test(p.msg)),
    `A2: cycle ${num} positive depth must be a static validation error for the editor`);
}
// single-line CYCL DEF form is rejected too
{
  const code = H.program(`TOOL CALL 4 Z S2000 F150\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 200 Q201=+3\n Q200=+2\n Q203=+0\n Q204=+30\n Q202=+5\nCYCL CALL`);
  assert.ok(H.validate(code).some(p => p.sev==='err' && /Q201/.test(p.msg)),
    'A2: single-line Q201=+3 must be a validation error');
}

// ───────────────────────── A3 — 2nd safety clearance / Q204 ───────────────────
{
  // Q200=5, Q204=2, surface 20 -> safeZ 25, safe2Z 22: NO final rapid back DOWN.
  const {segs} = seg(200, '-6', '+5', '+20', '+2');
  const lastZ = segs[segs.length-1].to.z;
  assert.ok(lastZ >= 25 - 1e-6, `A3: final Z must stay at the higher safeZ (25), got ${lastZ}`);
  const downToSafe2 = segs.some(s => s.rapid && Math.abs(s.to.z - 22) < 1e-6 && s.to.z < s.from.z - 1e-6);
  assert.ok(!downToSafe2, 'A3: must not perform a final downward rapid to a lower Q204');
}
{
  // Q204=0 explicit must not default to 50.
  const {segs} = seg(200, '-6', '+2', '+0', '+0');
  const maxZ = Math.max(...segs.map(s => s.to.z));
  assert.ok(Math.abs(maxZ - 2) < 1e-6, `A3: Q204=0 must retract to safeZ (2), not the 50 default; got ${maxZ}`);
}
{
  // Q204 > Q200 still rises to the 2nd clearance.
  const {segs} = seg(200, '-6', '+2', '+0', '+30');
  const maxZ = Math.max(...segs.map(s => s.to.z));
  assert.ok(Math.abs(maxZ - 30) < 1e-6, `A3: Q204=30 must retract to the 2nd clearance (30); got ${maxZ}`);
}
// Same conditional retract holds for 201 and 209.
for(const num of [201,209]){
  const {segs} = seg(num, '-6', '+2', '+0', '+0');
  const maxZ = Math.max(...segs.map(s => s.to.z));
  assert.ok(Math.abs(maxZ - 2) < 1e-6, `A3: cycle ${num} Q204=0 must not default to 50; got ${maxZ}`);
}

// ───────────────────────── A4 — 208 countersink R=0.001 DR+2 ──────────────────
{
  const code = H.program(`TOOL CALL 5 Z S1000 F100 DL-2 DR+2\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 208\n Q200=+2\n Q201=-1\n Q206=+100\n Q334=+1\n Q203=+20\n Q204=+50\n Q335=+8\n Q342=+0\n Q351=+1\nCYCL CALL`);
  const res = H.parse(code);
  const segs = H.cycleSegments(res, code);
  const helix = segs.filter(s => !s.rapid && s.to.z < s.from.z - 1e-9);
  assert.ok(helix.length/32 <= 4, `A4: effective-radius stepover must keep the pass count tiny; got ${helix.length/32} revolutions`);
  assert.ok(segs.length < 500, `A4: total cycle segments must be bounded; got ${segs.length}`);
  assert.ok(!(res.probs||[]).some(p => /capped|aborted/.test(p.msg)), 'A4: correct geometry must not hit the pass-count guard');
}

// ───────────────────────── A5 — 208 centres before the vertical retract ───────
{
  const {segs} = seg(208, '-8', '+2', '+0', '+30');
  const idx = segs.findIndex(s => s.rapid && s.to.z > s.from.z + 1e-6); // first vertical retract
  assert.ok(idx > 0, 'A5: cycle 208 must have a vertical retract');
  const retract = segs[idx];
  assert.ok(Math.hypot(retract.from.x, retract.from.y) < 1e-6,
    `A5: the vertical retract must start at the bore centre, got (${retract.from.x},${retract.from.y})`);
  const before = segs[idx-1];
  assert.ok(Math.hypot(before.to.x, before.to.y) < 1e-6 && Math.abs(before.to.z - retract.from.z) < 1e-6,
    'A5: the move before the retract must return XY to centre at working depth');
}
// The existing solid-helix contract still holds (constant radius, entered off-centre).
{
  const code = H.program(`TOOL CALL 1 Z S3000 F500\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 208\n Q200=+2\n Q201=-20\n Q206=+150\n Q334=+2\n Q203=+20\n Q204=+50\n Q335=+20\n Q342=+0\n Q351=+1\nCYCL CALL`);
  const res = H.parse(code);
  const helix = H.cycleSegments(res, code).filter(s => !s.rapid && s.to.z < s.from.z - 1e-9);
  assert.strictEqual(helix.length/32, 11, 'A5/regression: solid Ø20 helix keeps 11 revolutions');
  helix.forEach(s => assert.ok(Math.abs(Math.hypot(s.to.x, s.to.y) - 5) < 1e-6, 'helix radius stays constant at 5'));
}

// ───────────────────────── R1 — radius comp offset = effective radius ─────────
function rlOffset(toolCall){
  const code = H.program(`${toolCall}\nM3\nL X-30 Y+0 R0\nL X-20 Y+0 RL\nL X+20 Y+0\nL X+30 Y+0 R0\nCYCL DEF 200\n Q200=+2\n Q201=-1\n Q203=+0\n Q204=+30\nCYCL CALL`);
  const res = H.parse(code);
  const run = res.sub.filter(s => !s.rapid && s.to.x > s.from.x + 1 && Math.abs(s.from.x + 20) < 5);
  return {offset: run.length ? run[0].from.y : NaN, probs: res.probs, run};
}
for(const [tcall, effR] of [
  ['TOOL CALL 20 Z S3000 F500', 0.001],
  ['TOOL CALL 21 Z S3000 F500', 0.049],
  ['TOOL CALL 22 Z S3000 F500', 0.05],
  ['TOOL CALL 23 Z S3000 F500', 2]
]){
  const {offset} = rlOffset(tcall);
  assert.ok(Math.abs(offset - effR) < 1e-6, `R1: RL offset must equal the effective radius ${effR}, got ${offset}`);
}
// DR from TOOL CALL adds to the offset (Phase 3): R2 + DR0.5 -> 2.5.
{
  const {offset} = rlOffset('TOOL CALL 23 Z S3000 F500 DR+0.5');
  assert.ok(Math.abs(offset - 2.5) < 1e-6, `Phase 3: TOOL CALL DR must add to the offset (2.5), got ${offset}`);
}
// Non-positive effective radius -> explicit error and no compensated cutting run.
{
  const {run, probs} = rlOffset('TOOL CALL 24 Z S3000 F500 DR-1'); // R1 + DR-1 = 0
  assert.strictEqual(run.length, 0, 'R1: zero effective radius must reject the compensated cutting run');
  assert.ok((probs||[]).some(p => p.sev==='err' && /effective/.test(p.msg)), 'R1: zero effective radius must raise an error');
}
{
  const {run, probs} = rlOffset('TOOL CALL 24 Z S3000 F500 DR-2'); // R1 + DR-2 = -1
  assert.strictEqual(run.length, 0, 'R1: negative effective radius must reject the compensated cutting run');
  assert.ok((probs||[]).some(p => p.sev==='err' && /effective/.test(p.msg)), 'R1: negative effective radius must raise an error');
}

// ───────────────────────── Phase 3 — R0 cancels compensation ──────────────────
{
  const code = H.program(`TOOL CALL 23 Z S3000 F500\nM3\nL X-30 Y+0 R0\nL X+30 Y+0 R0`);
  const res = H.parse(code);
  // the R0 cut runs from (-30,0) to (30,0); with no compensation it stays on Y0.
  const run = res.sub.filter(s => !s.rapid && Math.abs(s.from.x + 30) < 2 && s.to.x > s.from.x + 1);
  assert.ok(run.length, 'Phase 3: expected the R0 cut segment');
  run.forEach(s => assert.ok(Math.abs(s.from.y) < 1e-6 && Math.abs(s.to.y) < 1e-6, 'Phase 3: R0 must not offset the path'));
}
// RR offsets to the opposite side of RL.
{
  const code = H.program(`TOOL CALL 23 Z S3000 F500\nM3\nL X-30 Y+0 R0\nL X-20 Y+0 RR\nL X+20 Y+0\nL X+30 Y+0 R0\nCYCL DEF 200\n Q200=+2\n Q201=-1\n Q203=+0\n Q204=+30\nCYCL CALL`);
  const res = H.parse(code);
  const run = res.sub.filter(s => !s.rapid && s.to.x > s.from.x + 1 && Math.abs(s.from.x + 20) < 5);
  assert.ok(run.length && Math.abs(run[0].from.y + 2) < 1e-6, `Phase 3: RR must offset to -2, got ${run.length?run[0].from.y:'n/a'}`);
}

// ───────────────────── Cycle 200 details ─────────────────────
{
  const code = H.program(`TOOL CALL 4 Z S2000 F150\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 200\n Q200=+2\n Q201=-10\n Q206=+120\n Q202=+4\n Q210=+1.5\n Q203=+0\n Q204=+30\n Q211=+0.5\nCYCL CALL`);
  const res = H.parse(code), ss = H.cycleSegments(res, code);
  const dwell = ss.filter(s => s.cycleEvent==='dwell');
  assert.strictEqual(dwell.filter(s => s.dwellSeconds===0.5&&s.cyclePhase==='depth').length, 3, 'Cycle 200: Q211 applies after every infeed');
  assert.strictEqual(dwell.filter(s => s.dwellSeconds===1.5&&s.cyclePhase==='top').length, 2, 'Cycle 200: Q210 applies after intermediate top retracts');
  const feedsDown = ss.filter(s => !s.rapid && !s.cycleEvent && s.to.z < s.from.z-1e-6);
  assert.ok(feedsDown.length===3 && feedsDown.every(s => s.feed===120), 'Cycle 200: all drilling infeed moves use Q206');
  const reentries = ss.filter(s => s.rapid && s.to.z < s.from.z-1e-6);
  assert.ok(reentries.some(s => Math.abs(s.to.z+2)<1e-6), 'Cycle 200: advanced return stops Q200 above the previous -4 depth');
  assert.ok(reentries.some(s => Math.abs(s.to.z+6)<1e-6), 'Cycle 200: second advanced return stops Q200 above the previous -8 depth');
}
{
  const base = `TOOL CALL 4 Z S2000 F150\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 200\n Q200=+2\n Q201=-10\n Q206=+120\n Q202=+20\n Q203=+0\n Q204=+30`;
  const c0=H.program(base+'\n Q395=+0\nCYCL CALL');
  const c1=H.program(base+'\n Q395=+1\nCYCL CALL');
  const z0=Math.min(...H.cycleSegments(H.parse(c0),c0).map(s=>s.to.z));
  const z1=Math.min(...H.cycleSegments(H.parse(c1),c1).map(s=>s.to.z));
  const expected=3.4/Math.tan(118*Math.PI/360);
  assert.ok(Math.abs((z0-z1)-expected)<1e-6, 'Cycle 200: Q395=1 adds the drill-point length from T-ANGLE');
}

// ───────────────────── Cycle 201 details ─────────────────────
{
  const code=H.program(`TOOL CALL 4 Z S2000 F150\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 201\n Q200=+2\n Q201=-8\n Q206=+80\n Q211=+1.25\n Q208=+40\n Q203=+0\n Q204=+30\nCYCL CALL`);
  const ss=H.cycleSegments(H.parse(code),code);
  const moves=ss.filter(s=>!s.cycleEvent);
  const down=moves.find(s=>!s.rapid&&s.to.z<s.from.z-1e-6);
  const up=moves.find(s=>!s.rapid&&s.to.z>s.from.z+1e-6);
  assert.ok(down&&down.feed===80, 'Cycle 201: reaming move uses Q206');
  assert.ok(up&&up.feed===40, 'Cycle 201: retraction uses Q208 and is not FMAX');
  assert.ok(ss.some(s=>s.cycleEvent==='dwell'&&s.dwellSeconds===1.25), 'Cycle 201: Q211 dwell is represented at full depth');
}

// ───────────────────── Cycle 208 validation/direction ─────────────────────
{
  const code=H.program(`TOOL CALL 1 Z S3000 F500\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 208\n Q200=+2\n Q201=-5\n Q206=+100\n Q334=+2\n Q203=+0\n Q204=+20\n Q335=+8\n Q342=+0\n Q351=+1\nCYCL CALL`);
  const res=H.parse(code);
  assert.strictEqual(H.cycleSegments(res,code).length,0, 'Cycle 208: tool diameter larger than Q335 produces no cycle path');
  assert.ok(res.probs.some(p=>p.sev==='err'&&/exceeds Q335/.test(p.msg)), 'Cycle 208: oversized tool reports a clear error');
}
{
  function direct(tool){
    const code=H.program(`TOOL CALL ${tool} Z S3000 F500\nM3\nCYCL DEF 208\n Q200=+2\n Q201=-5\n Q206=+100\n Q334=+2\n Q203=+0\n Q204=+20\n Q335=+10\n Q342=+0\n Q351=+1\nCYCL CALL`);
    const res=H.parse(code); return {res, ss:H.cycleSegments(res,code)};
  }
  assert.ok(direct(1).ss.some(s=>!s.rapid&&s.to.z<0), 'Cycle 208: equal diameter allows direct boring with RCUTS > 0');
  const blocked=direct(27);
  assert.strictEqual(blocked.ss.filter(s=>!s.rapid).length,0, 'Cycle 208: a non-center-cutting tool cannot direct-bore');
  assert.ok(blocked.res.probs.some(p=>p.sev==='err'&&/RCUTS/.test(p.msg)), 'Cycle 208: RCUTS rejection is diagnosed');
}
{
  const code=H.program(`TOOL CALL 1 Z S3000 F500\nM3\nCYCL DEF 208\n Q200=+2\n Q201=-5\n Q206=+100\n Q334=+2\n Q203=+0\n Q204=+20\n Q335=+20\n Q342=+0\n Q351=+0\nCYCL CALL`);
  const res=H.parse(code);
  assert.ok(H.cycleSegments(res,code).some(s=>!s.rapid), 'Cycle 208: documented Q351=0 executes as climb milling');
  assert.ok(!H.validate(code).some(p=>p.sev==='err'&&/CYCL 208/.test(p.msg)), 'Cycle 208: documented Q351=0 is not a validation error');
}
{
  function bore(pre){
    const code=H.program(`TOOL CALL 1 Z S3000 F500\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 208\n Q200=+2\n Q201=-4\n Q206=+100\n Q334=+2\n Q203=+0\n Q204=+20\n Q335=+30\n Q342=${pre}\n Q351=+1\nCYCL CALL`);
    return H.cycleSegments(H.parse(code),code);
  }
  const solid=bore('+0'), predrilled=bore('+30');
  assert.ok(predrilled.length<solid.length, 'Cycle 208: Q342 at nominal diameter makes one wall path instead of resetting to solid machining');
  assert.ok(predrilled.filter(s=>!s.rapid&&s.to.z<s.from.z-1e-9).length>0, 'Cycle 208: nominal Q342 still executes the finishing wall helix');
}
{
  function firstEntry(m){
    const code=H.program(`TOOL CALL 1 Z S3000 F500\n${m}\nL X+0 Y+0 Z+30 R0\nCYCL DEF 208\n Q200=+2\n Q201=-4\n Q206=+100\n Q334=+2\n Q203=+0\n Q204=+20\n Q335=+20\n Q342=+10\n Q351=+1\nCYCL CALL`);
    return H.cycleSegments(H.parse(code),code).find(s=>!s.rapid);
  }
  const m3=firstEntry('M3'), m4=firstEntry('M4');
  assert.ok(m3&&m4&&Math.sign(m3.to.y)===-Math.sign(m4.to.y), 'Cycle 208: M4 reverses the Q351 helix direction relative to M3');
}
{
  const code=H.program(`TOOL CALL 25 Z S3000 F500\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 208\n Q200=+2\n Q201=-10\n Q206=+100\n Q334=+20\n Q203=+0\n Q204=+20\n Q335=+12\n Q342=+4\n Q351=+1\nCYCL CALL`);
  const desc=H.cycleSegments(H.parse(code),code).filter(s=>!s.rapid&&s.to.z<s.from.z-1e-9);
  assert.ok(desc.length/32>=5, 'Cycle 208: tool-table ANGLE caps the helical descent even when Q334 requests a steeper plunge');
}
{
  function withTool(t){
    const code=H.program(`TOOL CALL ${t} Z S3000 F500\nM3\nCYCL DEF 208\n Q200=+2\n Q201=-2\n Q206=+100\n Q334=+2\n Q203=+0\n Q204=+20\n Q335=+30\n Q342=+0\n Q351=+1\nCYCL CALL`);
    return H.cycleSegments(H.parse(code),code);
  }
  assert.ok(withTool(26).length>withTool(1).length*2, 'Cycle 208: effective R2+DR2 reduces radial stepover and increases the overlap pass count');
}

// ───────────────────── Cycle 209 synchronization ─────────────────────
{
  const code=H.program(`TOOL CALL 4 Z S2000 F150\nTOOL CALL 7 Z F250\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 209\n Q200=+2\n Q201=-5\n Q239=+1.25\n Q203=+0\n Q204=+20\nCYCL CALL`);
  const res=H.parse(code);
  assert.strictEqual(H.cycleSegments(res,code).length,0, 'Cycle 209: a new TOOL CALL without S must not reuse the preceding tool speed');
  assert.ok(res.probs.some(p=>p.sev==='err'&&/no positive spindle speed/.test(p.msg)), 'Cycle 209: missing current S is an error');
  assert.ok(H.validate(code).some(p=>p.sev==='err'&&/positive S/.test(p.msg)), 'Cycle 209: missing current S is also a static editor error');
}
{
  const code=H.program(`TOOL CALL 7 Z S200 F250\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 209\n Q200=+2\n Q201=-6\n Q239=+1.25\n Q203=+0\n Q204=+20\n Q257=+3\n Q256=+0.5\n Q336=+90\n Q403=+2\nCYCL CALL`);
  const ss=H.cycleSegments(H.parse(code),code);
  const down=ss.filter(s=>!s.rapid&&!s.cycleEvent&&s.to.z<s.from.z-1e-6);
  const up=ss.filter(s=>!s.rapid&&!s.cycleEvent&&s.to.z>s.from.z+1e-6);
  assert.ok(down.length&&down.every(s=>s.feed===250&&s.spindleDir===1&&s.threadHand===1), 'Cycle 209: right-hand infeed uses pitch×S and forward spindle direction');
  assert.ok(up.length&&up.every(s=>s.feed===500&&s.spindleS===400&&s.spindleDir===-1&&s.threadHand===1), 'Cycle 209: Q403 scales synchronized spindle speed/feed and reverses spindle direction');
  assert.ok(ss.some(s=>s.cycleEvent==='spindle-orientation'&&s.eventValue===90), 'Cycle 209: Q336 orientation is represented explicitly');
  assert.ok(!ss.some(s=>s.rapid&&s.to.z<2-1e-6), 'Cycle 209: no FMAX motion occurs inside the thread');
}
{
  const code=H.program(`TOOL CALL 7 Z S200 F250\nM4\nL X+0 Y+0 Z+30 R0\nCYCL DEF 209\n Q200=+2\n Q201=-3\n Q239=-1.25\n Q203=+0\n Q204=+20\n Q257=+3\n Q256=+0\n Q403=+1\nCYCL CALL`);
  const ss=H.cycleSegments(H.parse(code),code);
  const down=ss.find(s=>!s.rapid&&s.to.z<s.from.z-1e-6);
  const up=ss.find(s=>!s.rapid&&s.to.z>s.from.z+1e-6);
  assert.ok(down&&down.spindleDir===-1&&down.threadHand===-1, 'Cycle 209: negative Q239 is modeled as a left-hand thread');
  assert.ok(up&&up.spindleDir===1, 'Cycle 209: left-hand retract reverses the synchronized spindle direction');
}
{
  const code=H.program(`TOOL CALL 7 Z S200 F250\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 209\n Q200=+2\n Q201=-3\n Q239=+1.5\n Q203=+0\n Q204=+20\nCYCL CALL`);
  const res=H.parse(code);
  assert.strictEqual(H.cycleSegments(res,code).length,0, 'Cycle 209: tool-table PITCH mismatch rejects the tapping path');
  assert.ok(res.probs.some(p=>p.sev==='err'&&/tool-table PITCH/.test(p.msg)), 'Cycle 209: PITCH mismatch is diagnosed');
}
{
  const code=H.program(`TOOL CALL 7 Z S200 F250\nM3\nCYCL DEF 209\n Q200=+2\n Q201=-3\n Q239=+1.25\n Q203=+0\n Q204=+20\n Q403=+0\nCYCL CALL`);
  const res=H.parse(code);
  assert.strictEqual(H.cycleSegments(res,code).length,0, 'Cycle 209: Q403=0 rejects the tapping path');
  assert.ok(H.validate(code).some(p=>p.sev==='err'&&/CYCL 209/.test(p.msg)), 'Cycle 209: Q403=0 is also a static editor error');
}

// ───────────────────── Compensation safety and state capture ─────────────────────
{
  const code=H.program(`TOOL CALL 23 Z S3000 F500\nM3\nL X+0 Y+0 R0\nL X+10 Y+0 RL\nL X+10 Y+10\nL X+8 Y+10\nL X+8 Y+8\nL X+6 Y+8 R0`);
  const res=H.parse(code);
  assert.ok(res.probs.some(p=>p.sev==='err'&&/tool radius too large/.test(p.msg)), 'RL/RR: an unfit bounded inner corner is an error');
  assert.ok(res.resultProblems.some(p=>p.sev==='err'&&/tool radius too large/.test(p.msg)), 'RL/RR: the toolpath error is returned to the browser UI');
  assert.strictEqual(res.sub.filter(s=>s.rc==='RL').length,0, 'RL/RR: an unfit inner corner leaves no compensated cutting run');
}
{
  const code=H.program(`TOOL CALL 23 Z S3000 F500\nM3\nL X+0 Y+0 R0\nL X+10 Y+0 RL\nRND R1\nL X+10 Y+10\nL X+20 Y+10 R0`);
  const res=H.parse(code);
  assert.ok(res.probs.some(p=>p.sev==='err'&&/tool radius too large/.test(p.msg)), 'RL/RR: an inner RND smaller than the effective tool radius is an error');
  assert.strictEqual(res.sub.filter(s=>s.rc==='RL').length,0, 'RL/RR: an unfit tessellated inner RND leaves no compensated cutting run');
}
{
  // PROGRAM.H regression: TNC activates RL at the END of the L block where it
  // is programmed. The approach therefore ends directly at the analytically
  // compensated start of the following C (tool Ø10 / effective R=5).
  const code=H.program(`TOOL CALL 1 Z S2000 F5000\nL X+0 Y+30 Z+0 R0\nL X+0 Y+29.5 RL\nCC X+0 Y+37\nC X+0 Y+44.5 DR+\nL X-5 Y+44.5 R0`);
  const res=H.parse(code);
  assert.ok(!res.probs.some(p=>p.sev==='err'&&/tool radius too large/.test(p.msg)), 'RL/RR: short activation lead-in before a valid C arc must not be rejected');
  const activation=res.sub.find(s=>s.rcActivation);
  assert.ok(activation&&activation.rc==='RL', 'RL/RR: activation L is the single approach move into the compensated contour');
  assert.ok(Math.abs(activation.to.x)<1e-9&&Math.abs(activation.to.y-34.5)<1e-9, 'RL/RR: activation ends at the exact perpendicular C-offset point (0,34.5)');
  assert.ok(!res.sub.some(s=>s.rcEntry), 'RL/RR: no invented hidden entry segment is inserted after the activation L');
  const cSegs=res.sub.filter(s=>s.rcGeom&&s.rcGeom.kind==='C'&&s.rc==='RL');
  assert.ok(cSegs.length>8, 'RL/RR: valid C entry contour remains available for simulation');
  assert.ok(cSegs.every(s=>Math.abs(Math.hypot(s.to.x,s.to.y-37)-2.5)<1e-8), 'RL/RR: C is compensated analytically to radius 2.5 before tessellation');
}
{
  const code=H.program(`TOOL CALL 23 Z S3000 F500\nM3\nL X+0 Y+0 R0\nL X+20 Y+0 RL\nL X+40 Y+5\nL X+50 Y+5\nL X+60 Y+5 R0`);
  const res=H.parse(code);
  const around=res.sub.filter(s=>s.rc==='RL'&&Math.hypot(s.to.x-40,s.to.y-5)>1.99&&Math.hypot(s.to.x-40,s.to.y-5)<2.01);
  assert.ok(around.length>=4, 'RL/RR: a shallow convex outside corner uses a transitional radius arc, not a mitre');
}
{
  const code=H.program(`TOOL CALL 23 Z S3000 F500 DR+1\nM3\nL X-30 Y+0 R0\nL X-20 Y+0 RL\nL X+20 Y+0\nL X+30 Y+0 R0\nTOOL CALL 23 Z S3000 F500 DR+2\nM3\nL X-30 Y+10 R0\nL X-20 Y+10 RL\nL X+20 Y+10\nL X+30 Y+10 R0`);
  const res=H.parse(code);
  const runs=res.sub.filter(s=>s.rc==='RL'&&!s.rapid&&s.to.x>s.from.x+1);
  assert.ok(runs.some(s=>Math.abs(s.from.y-3)<1e-6&&s.drPgm===1), 'DL/DR: first run retains its own DR+1 state');
  assert.ok(runs.some(s=>Math.abs(s.from.y-14)<1e-6&&s.drPgm===2), 'DL/DR: repeated TOOL CALL captures DR+2 only for the second run');
}
{
  const code=H.program(`TOOL CALL 23 Z S3000 F500\nM3\nL X+0 Y+0 R0\nL X+20 Y+0 RL\nTOOL CALL 22 Z S3000 F500\nL X+40 Y+0\nL X+50 Y+0 R0`);
  const res=H.parse(code);
  assert.ok(res.probs.some(p=>p.sev==='err'&&/TOOL CALL is not permitted/.test(p.msg)), 'TOOL CALL under RL/RR is a parse-time error');
  assert.ok(!res.sub.some(s=>s.toolNum===22&&s.rc==='RL'), 'TOOL CALL under RL/RR suppresses subsequent compensated motion until R0');
}
{
  const code=H.program(`TOOL CALL 23 Z S3000 F500\nM3\nL X+0 Y+0 Z+0 R0\nL X+20 Y+0 RL\nL X+30 Y+0\nL Z+10 R0\nL X+40 Y+0`);
  const res=H.parse(code);
  const zCancel=res.sub.find(s=>s.rc==='R0'&&Math.abs(s.to.z-10)<1e-6&&Math.abs(s.to.x-s.from.x)<1e-6);
  assert.ok(zCancel&&Math.abs(zCancel.from.y-2)<1e-6&&Math.abs(zCancel.to.y-2)<1e-6, 'R0: a pure-Z cancellation carries the actual compensated XY position cleanly');
}
{
  const code=H.program(`TOOL CALL 23 Z S3000 F500\nM3\nL X+0 Y+0 R0\nL X+20 Y+0 RL\nL X+30 Y+0\nL X+40 Y+0 R0`);
  const res=H.parse(code);
  const leadOut=res.sub.find(s=>s.rc==='R0'&&Math.abs(s.to.x-40)<1e-6);
  assert.ok(leadOut&&Math.abs(leadOut.from.x-30)<1e-6&&Math.abs(leadOut.from.y-2)<1e-6&&Math.abs(leadOut.to.y)<1e-6,
    'R0: a lateral cancellation leads out from the compensated endpoint to the nominal target');
}

// Validator/parser contract: no implemented-looking block may disappear
// silently. Supported syntax is accepted; malformed or unsupported syntax is
// a blocking error before Run/Step can execute the partial toolpath.
function valErrors(body){ return H.validate(H.program(body)).filter(p=>p.sev==='err'); }
function mustError(body, re, label){
  const errors=valErrors(body);
  assert.ok(errors.some(p=>re.test(p.msg)), `${label}: ${JSON.stringify(errors)}`);
}
mustError('PLANE RESET', /not supported/, 'validator rejects unsupported PLANE blocks');
mustError('M6', /Standalone M6 is not supported/, 'validator rejects unsupported standalone M functions');
mustError('M99', /Standalone M99 is not supported/, 'validator rejects standalone M99 instead of ignoring it');
mustError('L X+10 Y+0 A+45 F500', /Rotary axes/, 'validator rejects ignored rotary axes');
mustError('L X+ Y+5 F500', /Malformed/, 'validator rejects incomplete coordinates');
mustError('L X+10 F0', /Feed must/, 'validator rejects zero feed');
mustError('L X+10 F500 M3', /not supported inside an L block/, 'validator rejects ignored embedded M functions');
mustError('L X+0 Y+0\nCR X+10 Y+0 R+2 DR+', /geometry is impossible/, 'validator rejects an impossible CR arc');
mustError('L X+5 Y+0\nCC X+0 Y+0\nC X+10 Y+0 DR+', /not on the circle/, 'validator rejects an off-circle C endpoint');
mustError('LP PR+10 PA+45', /Polar origin undefined/, 'validator requires CC before LP');
mustError('CP PA+180 DR+', /Polar origin undefined/, 'validator requires CC before CP');
mustError('RND R5', /between two supported contour moves/, 'validator rejects orphan RND');
mustError('CHF 5', /between two supported contour moves/, 'validator rejects orphan CHF');
mustError('L X+0 Y+0\nRND R5', /between two supported contour moves/, 'validator rejects trailing RND');
mustError('Q1 = SQRT(\nL X+Q1', /Malformed Q expression/, 'validator rejects malformed Q expressions');
mustError('Q1 = Q99+1\nL X+Q1', /Q99 has no value assigned/, 'validator rejects undefined Q references');
{
  const validQ=H.program('Q1=+10\nQ2=Q1+0.5774\nL X+Q2 Y+0 F500');
  assert.ok(!H.validate(validQ).some(p=>p.sev==='err'), 'validator accepts supported Q references and arithmetic expressions');
}
mustError('CYCL DEF 200\nQ200=Q99\nCYCL CALL', /Q99 has no value assigned/, 'validator checks Q expressions inside cycle definitions');
mustError('CYCL DEF 200\nQ206=FMAX\nCYCL CALL', /FMAX is not supported as a cycle Q value/, 'validator rejects unsupported cycle FMAX');
mustError('CYCL DEF 7\nCYCL CALL', /CYCL DEF 7 is not supported/, 'validator rejects unsupported cycles');
mustError('BLK FORM ROTATION X+0 Y+0 Z+0', /BLK FORM variant is not supported/, 'validator rejects ignored BLK FORM variants');
{
  const inch='BEGIN PGM INCHTEST INCH\nEND PGM INCHTEST INCH';
  assert.ok(H.validate(inch).some(p=>p.sev==='err'&&/INCH programs are not supported/.test(p.msg)), 'validator must not simulate inch coordinates as millimetres');
}
{
  const missing='BEGIN PGM LBLTEST MM\nCALL LBL 9\nEND PGM LBLTEST MM';
  assert.ok(H.validate(missing).some(p=>p.sev==='err'&&/LBL 9 missing/.test(p.msg)), 'validator reports calls to missing labels before expansion');
  const duplicate='BEGIN PGM LBLTEST MM\nLBL 1\nL X+1\nLBL 0\nLBL 1\nL X+2\nLBL 0\nEND PGM LBLTEST MM';
  assert.ok(H.validate(duplicate).some(p=>p.sev==='err'&&/allocated twice/.test(p.msg)), 'validator reports duplicate labels before expansion');
}
{
  const declaredOnly='BEGIN PGM LBLTEST MM\nLBL 1\nL X+10 Y+0\nLBL 0\nL X+2 Y+0\nEND PGM LBLTEST MM';
  const noCall=H.parse(declaredOnly);
  assert.ok(noCall.sub.some(s=>Math.abs(s.to.x-2)<1e-6), 'ordinary motion outside a label still executes');
  assert.ok(noCall.sub.some(s=>Math.abs(s.to.x-10)<1e-6), 'implemented LBL fall-through behavior remains unchanged');
  const called=declaredOnly.replace('END PGM','CALL LBL 1\nEND PGM');
  const callLine=called.split('\n').findIndex(l=>/^CALL LBL/.test(l));
  assert.ok(H.parse(called).sub.some(s=>s.srcLine===callLine&&Math.abs(s.to.x-10)<1e-6), 'CALL LBL also executes the body at the call site');
}
{
  const validLargeR=H.program('TOOL CALL 1 Z S3000 F500\nM3\nL X+0 Y+0 R0\nL X+40 Y+0 RL\nRND R20\nL X+40 Y+40\nL X+50 Y+40 R0');
  assert.ok(!H.validate(validLargeR).some(p=>p.sev==='err'&&/tool radius|cannot be machined/i.test(p.msg)), 'validator does not reject a valid R20 merely because compensation is active');
}
{
  const code=H.program('L X+5 Y+0\nCC X+0 Y+0\nC X+10 Y+0 DR+');
  const res=H.parse(code), arcLine=code.split('\n').findIndex(l=>/^C /.test(l));
  assert.ok(res.resultProblems.some(p=>p.sev==='err'&&/not on the circle/.test(p.msg)), 'parser reports off-circle C geometry too');
  assert.strictEqual(res.sub.filter(s=>s.srcLine===arcLine).length,0, 'off-circle C emits no invented arc/corrective line');
}
{
  const code=H.program('L X+0 Y+0\nCR X+10 Y+0 R+2 DR+');
  const res=H.parse(code), arcLine=code.split('\n').findIndex(l=>/^CR /.test(l));
  assert.ok(res.resultProblems.some(p=>p.sev==='err'&&/CR geometry is impossible/.test(p.msg)), 'parser reports impossible CR geometry too');
  assert.strictEqual(res.sub.filter(s=>s.srcLine===arcLine).length,0, 'impossible CR emits no cutting path');
}
{
  const code=H.program('CT X+10 Y+10');
  const res=H.parse(code), arcLine=code.split('\n').findIndex(l=>/^CT /.test(l));
  assert.ok(res.resultProblems.some(p=>p.sev==='err'&&/preceding XY contour move/.test(p.msg)), 'parser rejects CT without a real tangent');
  assert.strictEqual(res.sub.filter(s=>s.srcLine===arcLine).length,0, 'CT without a tangent emits no invented arc');
}
{
  const code=H.program('L X+0 Y+0\nL X+5 Y+0\nRND R10\nL X+5 Y+5');
  const res=H.parse(code);
  assert.ok(res.resultProblems.some(p=>p.sev==='err'&&/RND does not fit/.test(p.msg)), 'parser reports an RND that cannot fit on adjacent moves');
}

console.log('heidenhain cycle/cutting-logic regressions passed');
