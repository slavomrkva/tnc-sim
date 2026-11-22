'use strict';
// The live cutter, collision check, live mesher and Refine worker were rewritten
// for speed (v1.013). Their output must stay bit-identical: GOLDEN was produced
// by running this file against the v1.012 sources (VOXEL_ROOT=<checkout> PRINT=1).
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=process.env.VOXEL_ROOT||path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const app=read('web/app.js');
const table=name=>app.match(new RegExp('var '+name+' = new Int32Array\\(\\[[\\s\\S]*?\\]\\);'))[0];
const bytes=a=>Buffer.from(a.buffer||a,a.byteOffset||0,a.byteLength);
const sha=list=>{const h=crypto.createHash('sha256');list.forEach(a=>h.update(bytes(a)));return h.digest('hex').slice(0,24);};
let seed=20261122;
const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const tools={
 1:{TYPE:'MILL',R:5,R2:0,T_ANGLE:0,LCUTS:30,DR:0,DR2:0},   2:{TYPE:'MILL',R:4,R2:4,T_ANGLE:0,LCUTS:4,DR:0,DR2:0},
 3:{TYPE:'DRILL',R:3,R2:0,T_ANGLE:142,LCUTS:8,DR:0,DR2:0}, 4:{TYPE:'DRILL',R:3.4,R2:0,T_ANGLE:118,LCUTS:40,DR:0,DR2:0},
 5:{TYPE:'COUNTERSINK',R:.001,R2:0,T_ANGLE:90,LCUTS:4,DR:0,DR2:0}, 6:{TYPE:'MILL',R:5,R2:1.5,T_ANGLE:0,LCUTS:6,DR:.2,DR2:.3},
 7:{TYPE:'MILL',R:4,R2:4,T_ANGLE:0,LCUTS:8,DR:0,DR2:.8},   8:{TYPE:'MILL',R:4,R2:4,T_ANGLE:0,LCUTS:8,DR:0,DR2:-.5},
 9:{TYPE:'DRILL',R:3,R2:0,T_ANGLE:0,LCUTS:5,DR:0,DR2:0}};
const shapes=[null,{type:'flat',lcuts:6},{type:'ball',r2:4,r2orig:4,lcuts:4},{type:'ball',r2:4.8,r2orig:4.8,lcuts:8},
 {type:'torus',r2:1.5,lcuts:6},{type:'cone',angle:118,mode:'drill',lcuts:8},{type:'cone',angle:90,mode:'countersink',lcuts:4}];

// ── Refine worker: vertices, normals and tool colors ──
const workerCode=JSON.parse(app.match(/var REFINE_WORKER_CODE = (".*");/)[1]);
function refine(data){
 let done;const self={postMessage:m=>{if(m.type==='done')done=m;}};
 new Function('self',workerCode)(self);self.onmessage({data});return done;
}
const workerParts=[];
for(let it=0;it<18;it++){
 const nx=61,ny=53,nz=37,min={x:0,y:0,z:-18},max={x:30,y:26,z:0},subArr=[];
 for(let i=0;i<10;i++){
  const p=()=>({x:rnd()*38-4,y:rnd()*34-4,z:-rnd()*20+1}),a=p(),b=p();
  if(rnd()<.4)b.z=a.z;if(rnd()<.2){b.x=a.x;b.y=a.y;}
  subArr.push({from:a,to:b,rapid:rnd()<.1,spindleOn:rnd()<.95,toolNum:it<9?it+1:1+Math.floor(rnd()*9),
   len:Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z),dlPgm:rnd()<.3?rnd()-.5:0});
 }
 const vxCut=new Uint8Array(11*9*7);vxCut.forEach((_,i)=>{if(rnd()<.1)vxCut[i]=1+Math.floor(rnd()*9);});
 const out=refine({type:'refine',min,max,nx,ny,nz,dx:30/60,dy:26/52,dz:18/36,subArr,vxCut:vxCut.buffer,vxNx:11,vxNy:9,vxNz:7,
  vxOx:0,vxOy:0,vxOz:-18,vxDx:3,vxDy:3.25,vxDz:3,blkCyl:it%4===3?{cx:15,cy:13,r:13}:null,tools});
 assert.ok(out.verts.byteLength>0&&out.verts.byteLength===out.norms.byteLength&&out.verts.byteLength===out.colors.byteLength*9);
 workerParts.push(out.verts,out.norms,out.colors);
}

// ── Live cutter, collision check and mesher ──
const c=vm.createContext({console,performance,currentToolNum:1,blockEdges:null,blockMesh:null,VX:null,
 TOOL_CUT_COLORS:[[.9,.2,.1],[.1,.7,.9],[.3,.4,.5]],_stockRGB:()=>[.61,.62,.65],
 THREE:{BufferAttribute:class{constructor(a,n){this.array=a;this.itemSize=n;}},BufferGeometry:class{constructor(){this.attributes={};}setAttribute(n,a){this.attributes[n]=a;}}}});
vm.runInContext(table('MC_EDGE_TABLE')+table('MC_TRI_TABLE'),c);vm.runInContext(read('core/voxel-cutting.js'),c);
const cutParts=[],meshParts=[],collisions=[];
shapes.forEach(shape=>{
 const nx=50,ny=44,nz=30,grid=new Uint8Array(nx*ny*nz),cut=new Uint8Array(nx*ny*nz);
 for(let z=1;z<nz-1;z++)for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++)grid[(z*ny+y)*nx+x]=1;
 c.VX={grid,cut,nx,ny,nz,ox:-10,oy:-20,oz:-17.4,dx:.6,dy:.6,dz:.6,minZ:-17.4,maxZ:0,chunks:null};
 for(let i=0;i<60;i++){
  c.currentToolNum=1+i%4;
  const x=-12+rnd()*34,y=-22+rnd()*30,z=-rnd()*19+1,R=.5+rnd()*5;
  c.vxCut(x,y,z,R,shape);
  for(let k=0;k<8;k++) collisions.push(c.vxCollides(-12+rnd()*34,-22+rnd()*30,-rnd()*19+1,.3+rnd()*3,shape)?1:0);
 }
 cutParts.push(grid,cut);
 const g=c.vxBuildGeometryRange(0,nx-1,0,ny-1),part=c.vxBuildGeometryRange(32,nx-1,0,32);
 [g,part].forEach(q=>['position','normal','color'].forEach(n=>meshParts.push(q.attributes[n].array)));
});
assert.ok(collisions.includes(0)&&collisions.includes(1),'collision sample covers both outcomes');
const actual={worker:sha(workerParts),cut:sha(cutParts),mesh:sha(meshParts),collisions:sha([Uint8Array.from(collisions)])};
if(process.env.PRINT){ console.log(JSON.stringify(actual)); process.exit(0); }
const GOLDEN={worker:'39b2df809217a0fac633eb6e',cut:'f0759ae1c150640ecd512e34',mesh:'6d02894df28ecf249811a1ca',collisions:'23fed81c77a990f950731b23'};
assert.deepStrictEqual(actual,GOLDEN);

// A reset must forget the column tops, or the next run would skip full stock.
assert.match(read('core/voxel-cutting.js'),/function vxReset\(\)\{[\s\S]{0,80}VX\.top=null/);

// ── Path buffers upload only what changed and never lose a pending range ──
const m=vm.createContext({THREE:{}});vm.runInContext(read('core/measure-tool.js'),m);
const attr={updateRange:{offset:0,count:-1},needsUpdate:false};
const buf={arr:new Float32Array(60),cap:60,count:0,clean:0,geo:{attributes:{position:attr},setDrawRange(s,n){this.draw=n;}}};
const P=(x)=>({x,y:0,z:0}),upload=()=>{attr.updateRange.count=-1;attr.needsUpdate=false;};
m.bufRefresh(buf,null,null);assert.strictEqual(attr.needsUpdate,false,'nothing to upload');
m.bufRefresh(buf,P(0),P(1));assert.deepStrictEqual({...attr.updateRange},{offset:0,count:6});
m.bufAppend(buf,P(0),P(2));m.bufRefresh(buf,P(2),P(3));
assert.deepStrictEqual({...attr.updateRange},{offset:0,count:12},'pending range is extended');
upload();m.bufRefresh(buf,P(2),P(4));assert.deepStrictEqual({...attr.updateRange},{offset:6,count:6});
upload();m.bufRefresh(buf,null,null);assert.strictEqual(attr.needsUpdate,false);assert.strictEqual(buf.geo.draw,2);
m.bufClear(buf);m.bufAppend(buf,P(5),P(6));m.bufRefresh(buf,null,null);
assert.deepStrictEqual({...attr.updateRange},{offset:0,count:6},'restart uploads from the beginning');

// ── Cached rows follow the text ──
const p=vm.createContext({console,codeEl:{value:'L X+0\nLBL 1\nL X+1\nLBL 0\nCALL LBL 1 REP 2\nL X+2'}});
vm.runInContext(read('core/parser-engine.js'),p);
assert.deepStrictEqual([0,1,2,3,4,5,99,-1].map(i=>p.getLblAtLine(i)),[null,'1','1',null,'1',null,null,null]);
assert.deepStrictEqual([null,undefined,''].map(i=>p.getLblAtLine(i)),[null,null,null]);
p.codeEl.value='LBL 7\nL X+1';assert.strictEqual(p.getLblAtLine(1),'7');
console.log('voxel-fast-path: worker, cut, mesh and collision output unchanged; partial uploads and row cache verified');
