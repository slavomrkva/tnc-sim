'use strict';
const assert=require('assert'),vm=require('vm');
const {context,read}=require('./_simulation-harness');
const code=['BEGIN PGM AUDIT MM','BLK FORM 0.1 Z X-20 Y-20 Z-10','BLK FORM 0.2 X+20 Y+20 Z+0','TOOL CALL 1 Z S1000 F100','M3','L X-15 Y-15 Z+10 FMAX R0','L Z-2 F100','L X-10 Y-10 RL','L X+10 Y-10','L X+10 Y+10','L X-10 Y+10','L X-15 Y+15 R0','L Z+10 FMAX','END PGM AUDIT MM'].join('\n');
function integrated(){
 const c=context(code);
 vm.runInContext(read('core/editor-core.js'),c);vm.runInContext(read('core/sim-controls.js'),c);
 Object.assign(c,{dirty:true,prog:null,problemsData:[],problemsOpen:false,LEARN:{open:false},atcArm:null,pendingToolGroup:null,feedBuf:{},rapidBuf:{},THREE_OK:true,
  calcEstTime(){},renderProblems(){},learnUpdateBlank(){},draw2dFull(){},updateSimInfoPanel(){},highlightActiveLine(){},bufClear(){},bufAppend(){},bufRefresh(){},renderToolsTab(){},
  buildScene(p){c.vxInit(p);}});
 c.prepare();return c;
}
// Real tool invalidation -> reset -> preparation -> Run, with an analytic RL offset.
for(const change of [{R:3},{R:5,DR:-2},{R:3,R2:1,DR2:1}]){
 const c=integrated(),old=c.prog;
 Object.assign(c.toolLibrary[0],change);c.invalidateToolTableState();c.onRun();
 assert.notStrictEqual(c.prog,old);
 assert.strictEqual(c.sub.find(s=>s.rc==='RL').to.y,-7);
 c.subIndex=3;c.mode='paused';const snapshot=c.prog;c.onRun();
 assert.strictEqual(c.subIndex,3);assert.strictEqual(c.prog,snapshot,'clean pause resumes');
}
function refineContext(){
 const c=integrated(),workers=[];
 vm.runInContext(read('vendor/three.min.js'),c);vm.runInContext(read('core/render3d.js'),c);
 // Restore triggerRefine; harness suppresses automatic Refine during replay.
 vm.runInContext(read('core/parser-engine.js'),c);
 c.buildScene=p=>c.vxInit(p);
 c.vxBuildMesh=()=>new c.THREE.Group();
 c.scene=new c.THREE.Scene();c.TOOL_CUT_COLORS=[[.5,.6,.7]];
 Object.assign(c,{REFINE_WORKER_CODE:'',_refineWorker:null,Blob:class{},URL:{createObjectURL:()=>'',revokeObjectURL(){}}});
 c.Worker=class{constructor(){workers.push(this);}postMessage(d){this.data=d;}terminate(){this.terminated=true;}};
 c.subIndex=7;c.mode='idle';c.triggerRefine();return {c,workers};
}
const done={data:{type:'done',verts:new Float32Array([1,2,3,2,2,3,1,3,3]).buffer,norms:new Float32Array(9).buffer,colors:new Int32Array([1,1,1]).buffer}};
for(const action of ['reset','prepare','run','step','replace-refine']){
 const {c,workers}=refineContext(),old=workers[0];
 if(action==='reset')c.onReset();
 if(action==='prepare'){c.codeEl.value=code.replace('X+20 Y+20','X+25 Y+20');c.prepare();}
 if(action==='run')c.onRun();
 if(action==='step')c.onStep();
 if(action==='replace-refine')c.triggerRefine();
 const mesh=c.VX.mesh,current=c._refineWorker;let status=0;c.updateStatus=()=>status++;
 old.onmessage({data:{type:'progress',pct:95}});old.onmessage(done);old.onerror(new Error('late'));
 assert.ok(old.terminated,action);assert.strictEqual(c.VX.mesh,mesh,action+' rejects stale mesh');
 assert.strictEqual(c._refineWorker,current);assert.strictEqual(status,0,'stale callbacks cannot change UI');
}
{
 const {c,workers}=refineContext(),before=c.VX.mesh;
 workers[0].onmessage(done);assert.notStrictEqual(c.VX.mesh,before,'valid result installs real Three mesh');
 const applied=c.VX.mesh;workers[0].onmessage(done);assert.strictEqual(c.VX.mesh,applied,'done applies once');
}
// Main-thread fallback also rejects invalid jobs; a valid fallback still completes.
{
 const {c}=refineContext(),job=c._refineJob,data=c._refineWorker.data;
 c.onReset();const before=c.VX.mesh;c._runRefineMainThread(data,job);assert.strictEqual(c.VX.mesh,before);
 c.REFINE_WORKER_CODE='self.onmessage=function(){self.postMessage({type:"done",verts:new Float32Array([0,0,0,1,0,0,0,1,0]).buffer,norms:new Float32Array(9).buffer,colors:new Int32Array(3).buffer});};';
 c.Worker=class{constructor(){throw Error('blocked');}};c.triggerRefine();
 assert.notStrictEqual(c.VX.mesh,before,'valid main-thread fallback applies');
}
// Actual vendored Three geometry, with independent analytic corner samples.
for(const [R,R2,DR,DR2] of [[5,2,0,0],[5,2,0,1],[5,2,1,-.5],[4,4,0,0],[4,4,1,1]]){
 const c=context(code);vm.runInContext(read('vendor/three.min.js'),c);
 c.toolGroup=new c.THREE.Group();c.getToolColor3=()=>0xffffff;
 Object.assign(c.toolLibrary[0],{R,R2,DR,DR2,LCUTS:20});c.buildToolMesh();
 const radius=R+DR,corner=R2+DR2,core=R2===R?0:radius-corner;
 const vertices=c.toolGroup.children.flatMap(m=>{const p=m.geometry.attributes.position;return Array.from({length:p.count},(_,i)=>({r:Math.hypot(p.getX(i),p.getY(i)),z:p.getZ(i)}));});
 const bottom=vertices.filter(p=>Math.abs(p.z)<1e-5);
 assert.ok(Math.abs(Math.max(...bottom.map(p=>p.r))-core)<1e-4,'flat bottom radius');
 for(const angle of [Math.PI/4,Math.PI/2]){
  const z=corner*(1-Math.cos(angle)),r=core+corner*Math.sin(angle);
  assert.ok(vertices.some(p=>Math.abs(p.z-z)<1e-4&&Math.abs(p.r-r)<1e-4),'rounded profile sample');
 }
}
console.log('Audit state and physical tool geometry regressions passed');
