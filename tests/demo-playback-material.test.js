'use strict';
// Full shipped demo playback with real stock/collisions, followed by the real
// Refine worker at identical resolution. Renderer/ATC animation is not tested.
const assert=require('assert'),vm=require('vm');
const {context,read,app}=require('./_simulation-harness');
const catalogue=context('');
vm.runInContext(read('core/demo-programs.js'),catalogue);
catalogue.DEFAULT_CODE=read('index.html').match(/<textarea id="code"[^>]*>([\s\S]*?)<\/textarea>/)[1];
const declaration=app.match(/var DEMO_PROGRAMS = \[[\s\S]*?\]\.concat[^\n]*;/);
assert.ok(declaration,'load the actual shipped demo catalogue');
vm.runInContext(declaration[0],catalogue);
assert.ok(catalogue.DEMO_PROGRAMS.length>=7,'demo catalogue must not silently become empty');
const worker=JSON.parse(app.match(/var REFINE_WORKER_CODE = (".*");/)[1]);
const marker='    // ── Phase 3:';
assert.ok(worker.includes(marker),'worker grid observation point must exist');
// Observe the output after actual cutting and before expensive meshing. No
// cutting calculation is replaced; this checks material, not the final image.
const observed=worker.replace(marker,'    self.capture(grid); return;\n'+marker);
for(const demo of catalogue.DEMO_PROGRAMS){
 const c=context(demo.code),label=demo.name;
 assert.deepStrictEqual(Array.from(c.validateProgram(demo.code)).filter(p=>p.sev==='err'),[],label+' validation');
 c.prog=c.parseProgram(demo.code);c.sub=c.prog.sub;
 assert.deepStrictEqual(Array.from(c.prog.problems||[]).filter(p=>p.sev==='err'),[],label+' parser');
 assert.ok(c.sub.length>0,label+' has motion');c.vxInit(c.prog);
 const initial=c.VX.grid.reduce((a,b)=>a+b,0);
 c.sub.forEach((s,i)=>{
  assert.ok([s.len,...Object.values(s.from),...Object.values(s.to)].every(Number.isFinite),label+' finite segment '+i);
  if(i){const a=c.sub[i-1].to,b=s.from;assert.ok(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<1e-7,label+' continuous segment '+i);}
 });
 let ticks=0;
 while(c.mode!=='done'&&ticks++<10000){c.advance(1000);if(c.mode==='paused')c.mode='running';}
 assert.strictEqual(c.mode,'done',label+' completes within playback budget');
 assert.strictEqual(c.subIndex,c.sub.length,label+' executes every segment');
 assert.deepStrictEqual(c.hits,[],label+' collisions: '+JSON.stringify(c.hits));
 assert.ok(c.VX.grid.reduce((a,b)=>a+b,0)<initial,label+' removes material');
 const v=c.VX;let refined;
 const w={console,self:{postMessage(){},capture(grid){refined=Buffer.from(grid);}}};
 vm.createContext(w);vm.runInContext(observed,w);
 w.self.onmessage({data:{type:'refine',min:c.prog.blkMin,max:c.prog.blkMax,
  nx:v.nx,ny:v.ny,nz:v.nz,dx:v.dx,dy:v.dy,dz:v.dz,subArr:c.sub,
  vxCut:v.cut.buffer.slice(0),vxNx:v.nx,vxNy:v.ny,vxNz:v.nz,
  vxOx:v.ox,vxOy:v.oy,vxOz:v.oz,vxDx:v.dx,vxDy:v.dy,vxDz:v.dz,
  blkCyl:c.prog.blkCyl||null,tools:Object.fromEntries(c.toolLibrary.map(t=>[t.T,t]))}});
 assert.ok(refined,label+' worker produces material');
 assert.ok(refined.equals(Buffer.from(v.grid)),label+' live/Refine occupancy matches byte-for-byte');
 console.log(label+': complete, no collisions, live/Refine material matches');
}
