'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const source=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const app=source('web/app.js');

// A06: execute the actual renderer initialization + application boot branch
// with a loaded THREE library whose WebGL constructor fails on every attempt.
{
 const calls={renderer:0,prepare:0,draw:0,advance:0};
 const elements={};
 const el=id=>elements[id]||(elements[id]={style:{},setAttribute(){},classList:{toggle(){}}});
 const c={THREE_OK:true,renderer:null,controls:null,scene:null,camera:null,
  THREE:{Scene:function(){},Color:function(){},PerspectiveCamera:function(){this.up={set(){}};},
   WebGLRenderer:function(){calls.renderer++;throw Error('No WebGL');}},
  navigator:{maxTouchPoints:0},window:{},document:{documentElement:{getAttribute:()=>null},getElementById:el},
  view3dEl:el('view3d'),view2dEl:el('view2d'),
  performance:{now:()=>1000},requestAnimationFrame:fn=>{c.frame=fn;},
  prepare(){assert.strictEqual(c.THREE_OK,false);calls.prepare++;},
  initMeasureRaycaster(){throw Error('measurement must not initialize without WebGL');},
  loop(){throw Error('3D loop must not start');},
  draw2dFull(){calls.draw++;},updateStatus(){},advance(){calls.advance++;},
  mode:'idle',curView:'3d',renderToolsTab(){},console};
 vm.createContext(c);vm.runInContext(source('core/render3d.js'),c);
 c.show3DError=()=>{};
 vm.runInContext(source('core/view2d.js'),c);
 c.draw2dFull=()=>calls.draw++;c.updateStatus=()=>{};
 const boot=app.slice(app.indexOf('if(THREE_OK) init3D();'),app.indexOf('/* ===MAIN_END=== */'));
 vm.runInContext(boot,c);
 assert.strictEqual(calls.renderer,3);assert.strictEqual(c.THREE_OK,false);
 assert.strictEqual(c.curView,'2d');assert.strictEqual(calls.prepare,1);
 assert.strictEqual(el('tab3d').style.display,'none');
 c.mode='running';c.frame();assert.strictEqual(calls.advance,1);
 // Learn state is reached after the boot rather than an exception aborting app.js.
 vm.runInContext(app.match(/var LEARN = [^\n]+/)[0],c);assert.strictEqual(c.LEARN.open,false);
 c.switchView('3d');assert.strictEqual(c.curView,'2d');
 c.switchView('tools');assert.strictEqual(c.curView,'tools');
}

// A13: native buttons supply Tab/Enter/Space behavior; real switchView updates
// the accessible pressed state. Browser visual acceptance is documented separately.
{
 const html=source('index.html');
 for(const id of ['tab3d','tab2d','tabTools']) assert.match(html,new RegExp('<button[^>]+id="'+id+'"'));
 const elements={};
 const el=id=>elements[id]||(elements[id]={style:{},attrs:{},setAttribute(k,v){this.attrs[k]=v;},classList:{toggle(){}}});
 const c={THREE_OK:true,document:{getElementById:el},view3dEl:el('view3d'),view2dEl:el('view2d'),draw2dFull(){},renderToolsTab(){},onResize(){}};
 vm.createContext(c);vm.runInContext(source('core/view2d.js'),c);c.draw2dFull=()=>{};c.onResize=()=>{};
 for(const [view,id] of [['3d','tab3d'],['2d','tab2d'],['tools','tabTools']]){
  c.switchView(view);assert.strictEqual(el(id).attrs['aria-pressed'],'true');
  for(const other of ['tab3d','tab2d','tabTools'].filter(x=>x!==id)) assert.strictEqual(el(other).attrs['aria-pressed'],'false');
 }
}

// A05: run the real Refine worker over a small 3D stock. A stopped spindle's
// final mesh must equal untouched stock, while a running tool must change it.
{
 const worker=JSON.parse(app.match(/var REFINE_WORKER_CODE = (".*");/)[1]);
 function mesh(segments){
  let done;
  const c={self:{postMessage:m=>{if(m.type==='done')done=m;}},console};
  vm.createContext(c);vm.runInContext(worker,c);
  c.self.onmessage({data:{type:'refine',min:{x:0,y:0,z:0},max:{x:10,y:10,z:10},
   nx:11,ny:11,nz:11,dx:1,dy:1,dz:1,subArr:segments,vxCut:new Uint8Array(1331).buffer,
   vxNx:11,vxNy:11,vxNz:11,vxOx:0,vxOy:0,vxOz:0,vxDx:1,vxDy:1,vxDz:1,
   tools:{1:{TYPE:'MILL',R:2,LCUTS:20}}}});
  assert.ok(done);return Buffer.from(done.verts);
 }
 const segment={from:{x:2,y:5,z:3},to:{x:8,y:5,z:3},len:6,toolNum:1,rapid:false};
 const untouched=mesh([]);
 assert.deepStrictEqual(mesh([{...segment,spindleOn:false}]),untouched);
 assert.notDeepStrictEqual(mesh([{...segment,spindleOn:true}]),untouched);
 assert.deepStrictEqual(mesh([{...segment,spindleOn:true,cycleEvent:true}]),untouched);
}
console.log('web-audit-runtime: failed-WebGL boot, accessible controls and real Refine mesh regressions passed');
