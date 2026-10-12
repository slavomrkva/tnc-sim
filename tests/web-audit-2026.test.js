'use strict';
const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const H=require('./_cycle-harness');
const root=path.resolve(__dirname,'..');
const source=file=>fs.readFileSync(path.join(root,file),'utf8');
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);
const ctx=H.makeContext();

// A02/A08/A09: independent degree-based expectations, both public paths.
for(const [expr,value] of [
 ['SIN((30+30)+30)',1],['SIN(COS(60)*90)',Math.SQRT1_2],
 ['ASIN(0.5)',30],['ACOS(0.5)',60],['ATAN(1)',45],
 ['10-Q2',12],['Q1-Q2',12],['FRAC(-2.75)',-0.75],
 ['SQRT(ABS(-9))+INT(2.8)',5],['2*-3+8/2',-2],['SIN(ASIN(0.5))',0.5]
]){
 const q={1:10,2:-2}; const r=ctx.inspectQExpr(expr,q);
 assert.ok(r.ok,expr+': '+r.msg); near(r.value,value); near(ctx.evalQExpr(expr,q),value);
 const code=H.program(`TOOL CALL 1 Z S1000 F100\nM3\nQ1=10\nQ2=-2\nQ3=${expr}\nL X+Q3 Y+0 Z+30 R0 F100`);
 assert.ok(!H.validate(code).some(p=>p.sev==='err'),expr);
 near(H.parse(code).sub.at(-1).to.x,value);
}
for(const expr of ['SIN((30)','1/0','SQRT(-1)','ASIN(2)','Q999+1','1;globalThis.x=1','1**2','SIN('+ '('.repeat(70)+'0'+')'.repeat(71)]){
 assert.ok(!ctx.inspectQExpr(expr,{}).ok,expr);
 assert.ok(Number.isNaN(ctx.evalQExpr(expr,{})),'invalid must never become zero');
}
{
 const code=H.program('TOOL CALL 1 Z S1000 F100\nM3\nQ1=10\nQ2=-2\nQ3=Q1-Q2\nQ4=10/Q3\nL X+Q4 Y+0 Z+30 F100');
 assert.ok(!H.validate(code).some(p=>p.sev==='err')); near(H.parse(code).sub.at(-1).to.x,10/12);
}

// A01: absolute/incremental arcs agree for both directions, across wrap-around.
function arc(command,start=0){
 const x=10*Math.cos(start*Math.PI/180),y=10*Math.sin(start*Math.PI/180);
 const code=H.program(`TOOL CALL 1 Z S1000 F100\nM3\nL X${x>=0?'+':''}${x.toFixed(10)} Y${y>=0?'+':''}${y.toFixed(10)} Z+30 R0 FMAX\nCC X+0 Y+0\n${command} F100`);
 const r=H.parse(code); assert.ok(!r.problems.some(p=>p.sev==='err'));
 return r.sub.filter(s=>s.rcGeom&&['C','CP','CR'].includes(s.rcGeom.kind));
}
for(const sign of [1,-1]){
 const dr=sign>0?'+':'-',angle=sign*0.001;
 const abs=arc(`CP PA${angle>0?'+':''}${angle} DR${dr}`);
 const inc=arc(`CP IPA${angle>0?'+':''}${angle} DR${dr}`);
 near(abs.reduce((n,s)=>n+s.len,0),10*0.001*Math.PI/180,1e-10);
 near(abs.reduce((n,s)=>n+s.len,0),inc.reduce((n,s)=>n+s.len,0),1e-12);
 const cart=arc(`C X+10 Y${sign>0?'+':''}${sign*0.0005} DR${dr}`);
 assert.ok(cart.reduce((n,s)=>n+s.len,0)<0.001);
 near(arc(`CP PA+0 DR${dr}`)[0].rcGeom.sweep,sign*2*Math.PI);
 near(arc(`CP DR${dr}`)[0].rcGeom.sweep,sign*2*Math.PI);
 near(arc(`CP IPA${sign>0?'+':''}${sign*720} DR${dr}`)[0].rcGeom.sweep,sign*4*Math.PI);
}
assert.ok(arc('CP PA-179.999 DR+',179.999).reduce((n,s)=>n+s.len,0)<0.001);

// A07: every synchronized tapping segment obeys thread hand × spindle direction.
for(const hand of [1,-1]) for(const factor of [0,0.0001,0.01,0.2,10]){
 const code=H.program(`TOOL CALL 7 Z S200 F250\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 209\n Q239=${hand*1.25}\n Q257=5\n Q256=${factor}\n Q201=-10\n Q200=2\n Q203=0\n Q204=30\n Q336=0\nCYCL CALL`);
 const r=H.parse(code); assert.ok(!r.problems.some(p=>p.sev==='err'));
 const segs=H.cycleSegments(r,code).filter(s=>!s.rapid&&!s.cycleEvent);
 for(const s of segs){
  assert.ok((s.to.z-s.from.z)*s.spindleDir*hand<0,`factor ${factor}, hand ${hand}: ${s.from.z}->${s.to.z}`);
  near(s.feed,1.25*s.spindleS);
 }
 near(Math.min(...segs.map(s=>s.to.z)),-10);
 assert.ok(Math.max(...segs.map(s=>s.to.z))<=2);
}

// A10: chord midpoint error measured independently at R=50, all finishing segments.
{
 const code=H.program('TOOL CALL 1 Z S3000 F500\nM3\nL X+0 Y+0 Z+30 R0\nCYCL DEF 208\n Q200=2\n Q201=-2\n Q203=0\n Q204=30\n Q334=2\n Q335=110\n Q342=100\nCYCL CALL');
 const finish=H.cycleSegments(H.parse(code),code).filter(s=>!s.rapid&&s.from.z===-2&&s.to.z===-2&&Math.hypot(s.to.x,s.to.y)>49);
 assert.ok(finish.length>32);
 for(const s of finish) assert.ok(50-Math.hypot((s.from.x+s.to.x)/2,(s.from.y+s.to.y)/2)<=0.010000001);
}

// A11: reject pathological loops before constructing a partial path; budget is cumulative.
for(const n of [200,209]){
 const code=H.program(`TOOL CALL ${n===209?7:4} Z S200 F250\nM3\nL X+0 Y+0 Z+30\nCYCL DEF ${n}\n Q201=-10000\n Q${n===209?257:202}=0.001\n Q239=1.25\nCYCL CALL`);
 const c=H.makeContext(); c.code=code;
 const result=vm.runInContext('parseProgram(code)',c,{timeout:1000});
 assert.strictEqual(result.sub.length,0); assert.ok(result.problems.some(p=>/budget/.test(p.msg)));
}
{
 const c=H.makeContext();c.PROGRAM_SEGMENT_LIMIT=100;
 c.code=H.program('TOOL CALL 4 Z S200 F100\nM3\nL X+0 Y+0 Z+30\nCYCL DEF 200\n Q201=-10\n Q202=1\n'+Array(8).fill('CYCL CALL').join('\n'));
 const r=vm.runInContext('parseProgram(code)',c,{timeout:1000});
 assert.strictEqual(r.sub.length,0); assert.ok(r.problems.some(p=>/budget/.test(p.msg)));
}

// Compensation may increase the number of tessellated segments; it shares
// the same ceiling rather than allocating a larger post-parse path.
{
 const c=H.makeContext();c.PROGRAM_SEGMENT_LIMIT=20;
 assert.throws(()=>c._rcEmitPrimitive([],{type:'arc',cx:0,cy:0,r:10,a0:0,sweep:2*Math.PI,z0:0,z1:0},{srcLine:7},'RL'),e=>e.programBudget&&e.srcLine===7);
}

// A04/A05: execute real commitSeg with an occupied stock probe.
{
 const c=H.makeContext();let collisions=0,cuts=0;
 Object.assign(c,{THREE_OK:false,VX:{dx:1,dy:1,dz:1},currentToolNum:1,pendingToolNum:0,
  vxCollides:()=>true,rapidCollision:()=>collisions++,vxCut:()=>cuts++,startATC(){}});
 const seg={from:{x:-20,y:0,z:-2},to:{x:20,y:0,z:-2},len:40,toolNum:1,rapid:true,spindleOn:true};
 c.commitSeg(seg);assert.strictEqual(collisions,1);assert.strictEqual(cuts,0);
 c.commitSeg({...seg,to:{x:20,y:0,z:2}});assert.strictEqual(collisions,2);
 c.commitSeg({...seg,safeRetract:true});assert.strictEqual(collisions,3);
 c.commitSeg({...seg,rapid:false,spindleOn:false});assert.strictEqual(collisions,4);assert.strictEqual(cuts,0);
 c.commitSeg({...seg,rapid:false,spindleOn:true});assert.ok(cuts>0);
 const previous=cuts;c.commitSeg({...seg,rapid:false,spindleOn:false,isMseg:true});assert.strictEqual(cuts,previous);
}

// A03: dirty pause validates and prepares; clean pause resumes unchanged.
{
 const calls={validate:0,prepare:0};
 const c={mode:'paused',dirty:true,subIndex:2,sub:[{},{},{}],prog:{},
  runValidation:()=>calls.validate++,hasErrors:()=>true,errorCount:()=>1,renderProblems(){},updateStatus(){}};
 vm.createContext(c);vm.runInContext(source('core/sim-controls.js'),c);
 c.prepare=()=>{calls.prepare++;c.dirty=false;c.subIndex=0;};
 c.onRun();assert.strictEqual(c.mode,'paused');assert.strictEqual(calls.validate,1);assert.strictEqual(calls.prepare,0);
 c.hasErrors=()=>false;c.onRun();assert.strictEqual(c.mode,'running');assert.strictEqual(calls.prepare,1);assert.strictEqual(c.subIndex,0);
 c.mode='paused';c.subIndex=1;c.onRun();assert.strictEqual(c.subIndex,1);assert.strictEqual(calls.validate,2);assert.strictEqual(calls.prepare,1);
}

// A12: real status function renders reverse/forward/stopped states.
for(const [on,dir,text] of [[true,-1,'M4 ●'],[true,1,'M3 ●'],[false,0,'M5 ○']]){
 const el={style:{}};
 const c={document:{getElementById:()=>el},mode:'running',prog:{},subIndex:0,
  sub:[{toolNum:1,spindleOn:on,spindleDir:dir,spindleS:200,coolantOn:false,feed:100}],
  currentToolNum:1,getToolByNum:()=>({T:1}),atcAnim:null,currentLBL:null};
 vm.createContext(c);vm.runInContext(source('core/sim-controls.js'),c);c.updateSimInfoPanel();assert.ok(el.innerHTML.includes(text));
}
console.log('web-audit-2026: numerical, budget, collision, pause and status regressions passed');
