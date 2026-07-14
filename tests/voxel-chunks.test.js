'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { performance } = require('perf_hooks');

const root = path.resolve(__dirname, '..');
const appSource = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
const voxelSource = fs.readFileSync(path.join(root, 'core', 'voxel-cutting.js'), 'utf8');

function tableDeclaration(name){
  const match = appSource.match(new RegExp('var ' + name + ' = new Int32Array\\(\\[[\\s\\S]*?\\]\\);'));
  if(!match) throw new Error('Unable to find ' + name + ' in web/app.js');
  return match[0];
}

class BufferAttribute {
  constructor(array, itemSize){ this.array=array; this.itemSize=itemSize; }
}

class BufferGeometry {
  constructor(){ this.attributes={}; this.disposed=false; }
  setAttribute(name, attribute){ this.attributes[name]=attribute; return this; }
  dispose(){ this.disposed=true; }
}

class Material {
  constructor(options){ this.options=options; this.disposed=false; }
  dispose(){ this.disposed=true; }
}

class Mesh {
  constructor(geometry, material){ this.geometry=geometry; this.material=material; this.frustumCulled=true; }
  traverse(fn){ fn(this); }
}

class Group {
  constructor(){ this.children=[]; }
  add(child){ this.children.push(child); }
  traverse(fn){ fn(this); this.children.forEach(child => child.traverse(fn)); }
}

const scene = {
  objects: [],
  add(obj){ if(!this.objects.includes(obj)) this.objects.push(obj); },
  remove(obj){ this.objects=this.objects.filter(item => item!==obj); }
};

const context = vm.createContext({
  console,
  performance,
  THREE: { BufferAttribute, BufferGeometry, MeshLambertMaterial:Material, Mesh, Group, DoubleSide:2 },
  TOOL_CUT_COLORS: [[0.9,0.2,0.1],[0.1,0.7,0.9]],
  _stockRGB: () => [0.55,0.58,0.62],
  scene,
  blockMesh:null,
  blockEdges:null,
  applyStockVisibility:null,
  VX:null
});

vm.runInContext(tableDeclaration('MC_EDGE_TABLE'), context);
vm.runInContext(tableDeclaration('MC_TRI_TABLE'), context);
vm.runInContext(voxelSource, context);

function makeVoxel(nx, ny, nz){
  const grid=new Uint8Array(nx*ny*nz);
  const cut=new Uint8Array(nx*ny*nz);
  for(let z=0;z<nz;z++) for(let y=0;y<ny;y++) for(let x=0;x<nx;x++){
    const border=x===0||x===nx-1||y===0||y===ny-1||z===0||z===nz-1;
    grid[z*ny*nx+y*nx+x]=border?0:1;
  }
  // Cross both X and Y chunk boundaries and use two tool colors.
  for(let z=3;z<nz-1;z++) for(let y=28;y<=36;y++) for(let x=28;x<=36;x++){
    if((x-32)*(x-32)+(y-32)*(y-32)<=16){
      const i=z*ny*nx+y*nx+x;
      grid[i]=0;
      cut[i]=z%2?1:2;
    }
  }
  return {
    grid,cut,nx,ny,nz,ox:-10,oy:-20,oz:-5,dx:0.6,dy:0.6,dz:0.6,
    mesh:null,chunks:null,material:null,chunked:false,dirty:false,hasCut:true
  };
}

function triangleSignatures(geometry){
  const p=geometry.attributes.position.array;
  const n=geometry.attributes.normal.array;
  const c=geometry.attributes.color.array;
  const result=[];
  for(let i=0;i<p.length;i+=9){
    const values=[];
    for(let j=0;j<9;j++) values.push(p[i+j],n[i+j],c[i+j]);
    result.push(values.map(value => Number(value).toFixed(6)).join(','));
  }
  return result;
}

context.VX=makeVoxel(70,68,7);
const full=context.vxBuildGeometryRange(0,context.VX.nx-1,0,context.VX.ny-1);
const group=context.vxBuildMesh();
context.VX.mesh=group;
const chunkTriangles=Array.from(context.VX.chunks).flatMap(chunk => triangleSignatures(chunk.mesh.geometry)).sort();
const fullTriangles=triangleSignatures(full).sort();
assert.deepStrictEqual(chunkTriangles,fullTriangles,'chunk union must exactly match full geometry, normals and colors');

context.VX.chunks.forEach(chunk => { chunk.dirty=false; });
context.vxMarkDirtyBounds(32,32,10,10);
const boundaryDirty=Array.from(context.VX.chunks).filter(chunk => chunk.dirty);
assert.strictEqual(boundaryDirty.length,2,'a vertex on X=32 must invalidate both adjacent chunks');
assert.deepStrictEqual(boundaryDirty.map(chunk => chunk.x0).sort((a,b)=>a-b),[0,32]);

const before=Array.from(context.VX.chunks).map(chunk => chunk.mesh.geometry);
context.VX.dirty=true;
context.vxRebuildMesh();
const replaced=Array.from(context.VX.chunks).filter((chunk,index) => chunk.mesh.geometry!==before[index]);
assert.strictEqual(replaced.length,2,'only dirty chunk geometries should be replaced');
before.forEach((geometry,index) => {
  assert.strictEqual(geometry.disposed,replaced.some(chunk => context.VX.chunks[index]===chunk));
});

// Informational microbenchmark: one local default-quality tile versus a full scan.
context.VX=makeVoxel(101,101,21);
const rounds=4;
let t0=performance.now();
for(let i=0;i<rounds;i++) context.vxBuildGeometryRange(0,100,0,100);
const fullMs=performance.now()-t0;
t0=performance.now();
for(let i=0;i<rounds;i++) context.vxBuildGeometryRange(32,64,32,64);
const chunkMs=performance.now()-t0;

console.log('voxel chunk regression: OK');
console.log('triangles:', fullTriangles.length, 'chunks:', context.VX_CHUNK_CELLS);
console.log('scan benchmark:', fullMs.toFixed(1)+'ms full / '+chunkMs.toFixed(1)+'ms local ('+(fullMs/chunkMs).toFixed(1)+'x)');
