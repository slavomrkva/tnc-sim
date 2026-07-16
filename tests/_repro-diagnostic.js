// Diagnostic reproduction of audit findings A1–A5 and R1.
// Run against the CURRENT parser to record "before" values, and again after
// the fix to confirm the corrected behavior. This script only MEASURES and
// prints; it never asserts, so it works on both the buggy and fixed trees.
const H = require('./_cycle-harness.js');

function below(segs, surfZ){ return segs.filter(s => s.to.z < surfZ - 1e-6 && !s.rapid); }
function errText(res){ return (Array.isArray(res)?res:(res.probs||[])).map(p => p.sev+':'+p.msg).join(' | '); }

console.log('==================== A1 — Q201 = 0 (zero depth) ====================');
for(const [num, tcall, extra] of [
  [200,'TOOL CALL 4 Z S2000 F150','\n Q202=+5'],
  [201,'TOOL CALL 4 Z S2000 F150',''],
  [208,'TOOL CALL 1 Z S3000 F500','\n Q334=+2\n Q335=+20\n Q342=+0\n Q351=+1'],
  [209,'TOOL CALL 7 Z S200 F250','\n Q239=+1.25']
]){
  const code = H.program(`${tcall}\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF ${num}\n Q200=+2\n Q201=+0\n Q203=+0\n Q204=+30${extra}\nCYCL CALL`);
  const res = H.parse(code);
  const segs = H.cycleSegments(res, code);
  console.log(`  Cycle ${num}: cycle segments=${segs.length}; cutting segments below surface(z<0) = ${below(segs,0).length}` +
    (below(segs,0).length ? `  minZ=${Math.min(...below(segs,0).map(s=>s.to.z)).toFixed(3)}` : ''));
}

console.log('\n==================== A2 — positive Q201 (+5) ====================');
for(const [num, tcall, extra] of [
  [200,'TOOL CALL 4 Z S2000 F150','\n Q202=+5'],
  [201,'TOOL CALL 4 Z S2000 F150',''],
  [208,'TOOL CALL 1 Z S3000 F500','\n Q334=+2\n Q335=+20\n Q342=+0\n Q351=+1'],
  [209,'TOOL CALL 7 Z S200 F250','\n Q239=+1.25']
]){
  const code = H.program(`${tcall}\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF ${num}\n Q200=+2\n Q201=+5\n Q203=+0\n Q204=+30${extra}\nCYCL CALL`);
  const res = H.parse(code); const segs = H.cycleSegments(res, code);
  const b = below(segs,0);
  console.log(`  Cycle ${num}: below-surface cut segs=${b.length}` + (b.length?` minZ=${Math.min(...b.map(s=>s.to.z)).toFixed(3)}`:'') + `  validation="${errText(H.validate(code))||'(none)'}"`);
}

console.log('\n==================== A3 — 2nd safety clearance / Q204 ====================');
{
  // handoff example: Q200=5, Q204=2, Q203=20 -> safeZ25, safe2Z22 (return DOWN bug)
  const code = H.program(`TOOL CALL 4 Z S2000 F150\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 200\n Q200=+5\n Q201=-6\n Q206=+150\n Q202=+0\n Q203=+20\n Q204=+2\nCYCL CALL`);
  const res = H.parse(code); const segs = H.cycleSegments(res, code);
  const zpath = segs.map(s=>`${s.rapid?'FMAX':'F'} z${s.from.z.toFixed(1)}->${s.to.z.toFixed(1)}`);
  const downRetracts = segs.slice(1).filter(s=>s.rapid && s.to.z < s.from.z - 1e-6 && s.to.z > 20);
  console.log('  Q200=5 Q204=2 Q203=20 tail:', zpath.slice(-4).join('  '));
  console.log('  downward rapids above surface after reaching safe height:', downRetracts.length);
}
{
  // Q204 = 0 explicit -> must not default to 50
  const code = H.program(`TOOL CALL 4 Z S2000 F150\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 200\n Q200=+2\n Q201=-6\n Q206=+150\n Q202=+0\n Q203=+0\n Q204=+0\nCYCL CALL`);
  const res = H.parse(code); const segs = H.cycleSegments(res, code);
  const maxZ = Math.max(...segs.map(s=>s.to.z));
  console.log(`  Q204=0 explicit -> max retract Z = ${maxZ.toFixed(2)} (default 50 => BUG, expect ~2)`);
}

console.log('\n==================== A4 — Cycle 208 countersink R=0.001 DR+2 ====================');
{
  const code = H.program(`TOOL CALL 5 Z S1000 F100 DL-2 DR+2\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 208\n Q200=+2\n Q201=-1\n Q206=+100\n Q334=+1\n Q203=+20\n Q204=+50\n Q335=+8\n Q342=+0\n Q351=+1\nCYCL CALL`);
  const res = H.parse(code); const segs = H.cycleSegments(res, code);
  const feedDown = segs.filter(s=>!s.rapid && s.to.z < s.from.z - 1e-9);
  const revs = feedDown.length/32;
  const verticalUpRapids = segs.filter(s=>s.rapid && s.to.z > s.from.z + 1e-6);
  console.log(`  total cycle segments = ${segs.length}`);
  console.log(`  descending helix segments = ${feedDown.length}  (~${revs.toFixed(1)} revolutions / radial passes)`);
  console.log(`  vertical up rapids (approx. radial passes) = ${verticalUpRapids.length}`);
  console.log(`  warnings: ${errText({probs:res.probs})||'(none)'}`);
}

console.log('\n==================== A5 — Cycle 208 centering before retract ====================');
{
  const code = H.program(`TOOL CALL 1 Z S3000 F500\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 208\n Q200=+2\n Q201=-8\n Q206=+150\n Q334=+2\n Q203=+0\n Q204=+30\n Q335=+30\n Q342=+0\n Q351=+1\nCYCL CALL`);
  const res = H.parse(code); const segs = H.cycleSegments(res, code);
  // find first upward vertical retract after reaching depth
  const idx = segs.findIndex(s=>s.rapid && s.to.z > s.from.z + 1e-6);
  const around = segs.slice(Math.max(0,idx-1), idx+2).map(s=>
    `${s.rapid?'FMAX':'F'} (${s.from.x.toFixed(1)},${s.from.y.toFixed(1)},${s.from.z.toFixed(1)})->(${s.to.x.toFixed(1)},${s.to.y.toFixed(1)},${s.to.z.toFixed(1)})`);
  const retract = segs[idx];
  console.log('  segment before/at first vertical retract:');
  around.forEach(a=>console.log('    '+a));
  console.log(`  vertical retract starts at XY=(${retract.from.x.toFixed(2)},${retract.from.y.toFixed(2)}) -> centered? ${Math.hypot(retract.from.x,retract.from.y)<1e-6}`);
}

console.log('\n==================== R1 — radius compensation < 0.05 ====================');
for(const [t, effR] of [[20,0.001],[21,0.049],[22,0.05],[23,2]]){
  const code = H.program(`TOOL CALL ${t} Z S3000 F500\nM3\nL X-20 Y+0 R0\nL X-20 Y+0 RL\nL X+20 Y+0\nL X+20 Y+20 R0\nCYCL DEF 200\n Q200=+2\n Q201=-1\n Q203=+0\n Q204=+30\nCYCL CALL`);
  const res = H.parse(code);
  // the RL run is the straight move X-20->X+20 at Y0; measure its offset in Y
  const run = res.sub.filter(s => Math.abs(s.from.y) < 5 && Math.abs(s.to.y) < 5 && s.to.x > s.from.x && !s.rapid);
  const offset = run.length ? run[0].from.y : NaN;
  console.log(`  T${t} effR=${effR}: RL offset(Y) = ${Number.isNaN(offset)?'n/a':offset.toFixed(4)}  (expect ${effR})`);
}
