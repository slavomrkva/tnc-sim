// Shared physical profile: cutting and collision must agree at every Z slice.
function vxToolRadiusAtHeight(toolR, toolShape, dz2){
    var effR = toolR;
    if(toolShape && toolShape.type==='ball'){
      // Ball nose: _r2 is effective cutting radius (R2+DR), but sphere HEIGHT from tip = original R2
      var _r2 = toolShape.r2;           // effective cutting radius (R2+DR)
      var _r2h = toolShape.r2orig || _r2; // original R2 for sphere height
      if(dz2 < _r2h){
        // effR scales with effective radius but follows sphere geometry based on original R2
        var _frac = dz2 / _r2h; // 0 at tip, 1 at equator
        effR = _r2 * Math.sqrt(Math.max(0, 1 - (1-_frac)*(1-_frac)));
      }
      // above sphere: effR = toolR (cylinder body)
    } else if(toolShape && toolShape.type==='torus'){
      // Torus/bull-nose: corner radius R2, core radius = toolR-R2
      // below R2 zone: blended corner
      var _r2t = toolShape.r2;
      var _core = toolR - _r2t;
      if(dz2 < _r2t){
        // corner arc: effR = core + sqrt(R2^2 - (R2-dz)^2)
        effR = _core + Math.sqrt(Math.max(0, _r2t*_r2t - (_r2t-dz2)*(_r2t-dz2)));
      }
      // above corner zone: effR = toolR (full flat cylinder)
    } else if(toolShape && toolShape.type==='cone'){
      // Cone: tip at tz. Drill widens from 0; countersink widens from its own toolR.
      var _hr2 = (toolShape.angle/2)*Math.PI/180;
      if(toolShape.mode==='drill'){
        // Drill/reamer/center drill: point widens up to the tool's real radius
        // (toolR = R, DR not applied), then the shank cuts at constant R.
        effR = Math.min(toolR, dz2 * Math.tan(_hr2));
      } else {
        // Countersink/chamfer: toolR (R+DR) is the tool's OWN tip radius — ≈0 for
        // a sharp point, or a real value (e.g. 2mm) for a flat/truncated tip
        // (then the tip is a flat disc of that diameter, not a point). The cone
        // widens from toolR upward; physical max diameter still comes from the
        // cutting-edge height (lcuts) + angle, independent of R.
        var _coneCap = (toolShape.lcuts || 9999) * Math.tan(_hr2);
        effR = Math.min(_coneCap, toolR + dz2 * Math.tan(_hr2));
      }
    }
    return effR;
}

// voxel-cutting -- web test branch: incremental chunk meshing (not yet ported to Android).

var VX_CHUNK_CELLS = 32;
var VX_EDGE_A = new Uint8Array([0,1,2,3,4,5,6,7,0,1,2,3]);
var VX_EDGE_B = new Uint8Array([1,2,3,0,5,6,7,4,4,5,6,7]);
var _vxTriCount = null;
var _vxCells = new Uint32Array(4096), _vxCases = new Uint8Array(4096);

function vxTriangleCounts(){
  if(_vxTriCount) return _vxTriCount;
  _vxTriCount=new Uint8Array(256);
  for(var c=0;c<256;c++) for(var t=0;t<15;t+=3){ if(MC_TRI_TABLE[c*16+t]<0) break; _vxTriCount[c]++; }
  return _vxTriCount;
}

function mControlPauseCode(segment){
  var code=segment && (segment.stopCode || (segment.stop ? 'M0' : ''));
  return code==='M0'||code==='M6' ? code : '';
}

function vxDisposeObject(obj, disposeMaterials){
  if(!obj) return;
  var disposedMaterials=[];
  function disposeOne(child){
    if(child.geometry) child.geometry.dispose();
    if(!disposeMaterials || !child.material) return;
    var materials=Array.isArray(child.material)?child.material:[child.material];
    materials.forEach(function(mat){
      if(mat && disposedMaterials.indexOf(mat)<0){
        disposedMaterials.push(mat);
        if(mat.dispose) mat.dispose();
      }
    });
  }
  if(obj.traverse) obj.traverse(disposeOne);
  else disposeOne(obj);
}

function vxInit(prog){
  if(VX && VX.mesh){ scene.remove(VX.mesh); vxDisposeObject(VX.mesh,true); }
  var min=prog.blkMin, max=prog.blkMax;
  var w=max.x-min.x, d=max.y-min.y, h=max.z-min.z;
  // The shared planner preserves isotropic cells and owns the browser budget.
  var vxPlan=planLiveVoxelGrid(w,d,h,VX_QUALITY);
  if(!vxPlan){ VX=null; return; }
  var nx=vxPlan.nx, ny=vxPlan.ny, nz=vxPlan.nz;
  var dx=w/(nx-1), dy=d/(ny-1), dz=h/(nz-1);
  // grid: 1=material, 0=empty  (Uint8Array for memory efficiency)
  var grid=new Uint8Array(nx*ny*nz);
  // set border voxels to 0 so MC generates outer surface; for cylinder mask to circle
  var cylVx = prog.blkCyl || null;
  for(var iz=0;iz<nz;iz++) for(var iy=0;iy<ny;iy++) for(var ix=0;ix<nx;ix++){
    var border=(ix===0||ix===nx-1||iy===0||iy===ny-1||iz===0||iz===nz-1);
    var inShape=true;
    if(!border && cylVx){
      var wx=min.x+ix*dx, wy=min.y+iy*dy;
      var ddx=wx-cylVx.cx, ddy=wy-cylVx.cy;
      inShape=(ddx*ddx+ddy*ddy) <= (cylVx.r-dx)*(cylVx.r-dx);
    }
    grid[iz*ny*nx+iy*nx+ix]=(border||!inShape)?0:1;
  }
  var cut=new Uint8Array(nx*ny*nz); // tool number that cut this voxel (0=uncut)
  VX={grid:grid,cut:cut,nx:nx,ny:ny,nz:nz,ox:min.x,oy:min.y,oz:min.z,dx:dx,dy:dy,dz:dz,minZ:min.z,maxZ:max.z,w:w,d:d,h:h,mesh:null,chunks:null,material:null,chunked:false,dirty:false,hasCut:false,blkCyl:cylVx,gridPlan:vxPlan};
  VX.mesh=vxBuildMesh();
  scene.add(VX.mesh);
}

function vxReset(){
  if(!VX||!prog) return;
  VX.top=null; // full stock again: column tops restart from the top layer
  var cylVxR = VX.blkCyl || null;
  var min=prog.blkMin;
  for(var iz=0;iz<VX.nz;iz++) for(var iy=0;iy<VX.ny;iy++) for(var ix=0;ix<VX.nx;ix++){
    var border=(ix===0||ix===VX.nx-1||iy===0||iy===VX.ny-1||iz===0||iz===VX.nz-1);
    var inShape=true;
    if(!border && cylVxR){
      var wx=VX.ox+ix*VX.dx, wy=VX.oy+iy*VX.dy;
      var ddx=wx-cylVxR.cx, ddy=wy-cylVxR.cy;
      inShape=(ddx*ddx+ddy*ddy) <= (cylVxR.r-VX.dx)*(cylVxR.r-VX.dx);
    }
    VX.grid[iz*VX.ny*VX.nx+iy*VX.nx+ix]=(border||!inShape)?0:1;
    VX.cut[iz*VX.ny*VX.nx+iy*VX.nx+ix]=0;
  }
  VX.hasCut=false; VX.dirty=false;
  if(VX.mesh){scene.remove(VX.mesh);vxDisposeObject(VX.mesh,true);VX.mesh=null;}
  VX.chunks=null; VX.material=null; VX.chunked=false;
  if(blockMesh) blockMesh.visible=true;
  if(blockEdges) blockEdges.visible=true;
  if(typeof applyStockVisibility==='function') applyStockVisibility();
}

// Highest possibly-solid layer per XY column. Cutting only ever clears voxels,
// so layers above it are known air and need no further visits; the result is
// identical to scanning every layer up to the top of the stock.
function vxColumnTops(){
  if(!VX.top) VX.top=new Int32Array(VX.nx*VX.ny).fill(VX.nz-1);
  return VX.top;
}

// Per-layer scratch buffers shared by every cut step.
var _vxLayerR2=new Float64Array(0), _vxLayerColor=new Uint8Array(0);

function vxCut(tx,ty,tz,toolR,toolShape){
  // toolShape: null=cylinder, {type:'ball',r2:R2} or {type:'cone',angle:deg,mode:'drill'|'countersink',lcuts:..}
  if(!VX) return;
  if(tz>VX.maxZ) return;
  var maxR = toolR;
  // For cone tools, max radius can be larger than toolR at top
  if(toolShape && toolShape.type==='cone'){
    if(toolShape.mode==='drill'){
      // Drill/reamer: physical max radius IS toolR (the real, fixed drill radius) — no wider scan needed
      maxR = toolR;
    } else {
      // Countersink/chamfer: toolR (R+DR) is the tool's own tip radius (≈0 for a
      // sharp point, or real for a flat/truncated tip) — the cone widens from
      // there, so the physical max radius is whichever is larger: toolR itself,
      // or the LCUTS/angle-derived design diameter.
      var _hr = (toolShape.angle/2)*Math.PI/180;
      var _coneMaxScan = (toolShape.lcuts || 9999) * Math.tan(_hr);
      maxR = Math.max(toolR, _coneMaxScan);
    }
  }
  var ixMin=Math.max(0,Math.floor((tx-maxR-VX.ox)/VX.dx)-1);
  var ixMax=Math.min(VX.nx-1,Math.ceil((tx+maxR-VX.ox)/VX.dx)+1);
  var iyMin=Math.max(0,Math.floor((ty-maxR-VX.oy)/VX.dy)-1);
  var iyMax=Math.min(VX.ny-1,Math.ceil((ty+maxR-VX.oy)/VX.dy)+1);
  var izMin=Math.max(0,Math.floor((tz-VX.oz)/VX.dz)-1);
  var izMax=VX.nz-1;
  var _lcutsZ = toolShape ? (toolShape.lcuts||toolR*999) : toolR*999;
  var changed=false;
  var changedIxMin=VX.nx, changedIxMax=-1, changedIyMin=VX.ny, changedIyMax=-1;
  var grid=VX.grid, cut=VX.cut, nx=VX.nx, nxy=VX.nx*VX.ny, tops=vxColumnTops();
  if(_vxLayerR2.length<VX.nz){ _vxLayerR2=new Float64Array(VX.nz); _vxLayerColor=new Uint8Array(VX.nz); }
  var layerR2=_vxLayerR2, layerColor=_vxLayerColor, toolColor=currentToolNum||1;
  for(var lz=izMin;lz<=izMax;lz++){
    var pz=VX.oz+lz*VX.dz;
    if(pz < tz - VX.dz*0.5){ layerR2[lz]=-1; continue; }
    var dz2 = pz - tz;
    var effR = vxToolRadiusAtHeight(toolR, toolShape, dz2);
    layerR2[lz]=effR*effR;
    layerColor[lz]=(dz2<=_lcutsZ)?toolColor:255;
  }
  for(var iy=iyMin;iy<=iyMax;iy++){
    var ddy=VX.oy+iy*VX.dy-ty, ddy2=ddy*ddy;
    for(var ix=ixMin;ix<=ixMax;ix++){
      var col=iy*nx+ix, top=tops[col];
      if(top<izMin) continue;
      var ddx=VX.ox+ix*VX.dx-tx, dist2=ddx*ddx+ddy2, hit=false;
      for(var iz=izMin, gi=izMin*nxy+col;iz<=top;iz++, gi+=nxy){
        if(dist2<=layerR2[iz] && grid[gi]){
          grid[gi]=0;
          cut[gi]=layerColor[iz];
          hit=true;
        }
      }
      if(!hit) continue;
      while(top>=0 && !grid[top*nxy+col]) top--;
      tops[col]=top;
      changed=true;
      if(ix<changedIxMin) changedIxMin=ix;
      if(ix>changedIxMax) changedIxMax=ix;
      if(iy<changedIyMin) changedIyMin=iy;
      if(iy>changedIyMax) changedIyMax=iy;
    }
  }
  if(changed){
    vxMarkDirtyBounds(changedIxMin,changedIxMax,changedIyMin,changedIyMax);
    VX.dirty=true;
    VX.hasCut=true;
    if(blockEdges&&blockEdges.visible) blockEdges.visible=false;
  }
}

function vxMarkDirtyBounds(ixMin,ixMax,iyMin,iyMax){
  if(!VX || !VX.chunks) return;
  // Each Marching Cubes cell uses eight grid vertices, so include the cells
  // immediately before every changed vertex as a one-cell dependency halo.
  var cellXMin=Math.max(0,ixMin-1), cellXMax=Math.min(VX.nx-2,ixMax);
  var cellYMin=Math.max(0,iyMin-1), cellYMax=Math.min(VX.ny-2,iyMax);
  for(var i=0;i<VX.chunks.length;i++){
    var chunk=VX.chunks[i];
    if(chunk.x0<=cellXMax && chunk.x1>cellXMin && chunk.y0<=cellYMax && chunk.y1>cellYMin){
      chunk.dirty=true;
    }
  }
}

function vxBuildGeometryRange(cellX0,cellX1,cellY0,cellY1){
  var nx=VX.nx,ny=VX.ny,nz=VX.nz,nxy=nx*ny;
  var grid=VX.grid,cut=VX.cut,triCount=vxTriangleCounts();
  var cells=_vxCells,cases=_vxCases,nCells=0,nTri=0,n,e,ti;

  // Step 1: find the surface cells and the exact number of triangles.
  for(var iz=0;iz<nz-1;iz++){
    for(var iy=cellY0;iy<cellY1;iy++){
      var o=iz*nxy+iy*nx+cellX0;
      // Bits of the shared face carry over from one cell to the next along X.
      var left=grid[o]|(grid[o+nx]<<3)|(grid[o+nxy]<<4)|(grid[o+nxy+nx]<<7);
      for(var ix=cellX0;ix<cellX1;ix++,o++){
        var right=(grid[o+1]<<1)|(grid[o+1+nx]<<2)|(grid[o+1+nxy]<<5)|(grid[o+1+nxy+nx]<<6);
        var ci=left|right;
        left=((right&0x22)>>1)|((right&0x44)<<1);
        if(ci===0||ci===255) continue;
        if(nCells===cells.length){
          _vxCells=new Uint32Array(nCells*2); _vxCells.set(cells); cells=_vxCells;
          _vxCases=new Uint8Array(nCells*2); _vxCases.set(cases); cases=_vxCases;
        }
        cells[nCells]=o; cases[nCells++]=ci;
        nTri+=triCount[ci];
      }
    }
  }

  // Step 2: emit the triangles into exactly sized arrays.
  var verts=new Float32Array(nTri*9),normals=new Float32Array(nTri*9),colors=new Float32Array(nTri*9);
  var iso=0.5,v=0;
  var cornerX=new Float64Array(8),cornerY=new Float64Array(8),cornerZ=new Float64Array(8);
  var epX=new Float64Array(12),epY=new Float64Array(12),epZ=new Float64Array(12);
  var stockColor=_stockRGB();
  for(n=0;n<nCells;n++){
    var cell=cells[n],ci2=cases[n];
    var cz=Math.floor(cell/nxy),rest=cell-cz*nxy,cy=Math.floor(rest/nx),cx=rest-cy*nx;
    var x0=VX.ox+cx*VX.dx,y0=VX.oy+cy*VX.dy,z0=VX.oz+cz*VX.dz;
    var x1=x0+VX.dx,y1=y0+VX.dy,z1=z0+VX.dz;
    cornerX[0]=x0;cornerX[1]=x1;cornerX[2]=x1;cornerX[3]=x0;cornerX[4]=x0;cornerX[5]=x1;cornerX[6]=x1;cornerX[7]=x0;
    cornerY[0]=y0;cornerY[1]=y0;cornerY[2]=y1;cornerY[3]=y1;cornerY[4]=y0;cornerY[5]=y0;cornerY[6]=y1;cornerY[7]=y1;
    cornerZ[0]=z0;cornerZ[1]=z0;cornerZ[2]=z0;cornerZ[3]=z0;cornerZ[4]=z1;cornerZ[5]=z1;cornerZ[6]=z1;cornerZ[7]=z1;
    var et=MC_EDGE_TABLE[ci2];
    for(e=0;e<12;e++){
      if(et&(1<<e)){
        // A crossed edge joins a 0 and a 1 corner, so the crossing is at iso.
        var ea=VX_EDGE_A[e],eb=VX_EDGE_B[e];
        epX[e]=cornerX[ea]+iso*(cornerX[eb]-cornerX[ea]);
        epY[e]=cornerY[ea]+iso*(cornerY[eb]-cornerY[ea]);
        epZ[e]=cornerZ[ea]+iso*(cornerZ[eb]-cornerZ[ea]);
      }
    }
    var triBase=ci2*16,tEnd=triBase+triCount[ci2]*3;
    for(ti=triBase;ti<tEnd;ti+=3){
      var ta=MC_TRI_TABLE[ti],tb=MC_TRI_TABLE[ti+1],tc=MC_TRI_TABLE[ti+2];
      var pax=epX[ta],pay=epY[ta],paz=epZ[ta],pbx=epX[tb],pby=epY[tb],pbz=epZ[tb],pcx=epX[tc],pcy=epY[tc],pcz=epZ[tc];
      // compute normal
      var ax=pbx-pax,ay=pby-pay,az=pbz-paz;
      var bx=pcx-pax,by=pcy-pay,bz=pcz-paz;
      var nx2=ay*bz-az*by,ny2=az*bx-ax*bz,nz2=ax*by-ay*bx;
      var nl=Math.sqrt(nx2*nx2+ny2*ny2+nz2*nz2)||1;
      nx2/=nl;ny2/=nl;nz2/=nl;
      var cutX=Math.round(((pax+pbx+pcx)/3-VX.ox)/VX.dx);
      var cutY=Math.round(((pay+pby+pcy)/3-VX.oy)/VX.dy);
      var cutZ=Math.round(((paz+pbz+pcz)/3-VX.oz)/VX.dz);
      var isCut=0;
      if(cutX>=0&&cutX<nx&&cutY>=0&&cutY<ny&&cutZ>=0&&cutZ<nz) isCut=cut[cutZ*nxy+cutY*nx+cutX];
      var rgb=(isCut>0&&isCut<255)?TOOL_CUT_COLORS[(isCut-1)%TOOL_CUT_COLORS.length]:stockColor;
      verts[v]=pax;verts[v+1]=pay;verts[v+2]=paz;
      verts[v+3]=pbx;verts[v+4]=pby;verts[v+5]=pbz;
      verts[v+6]=pcx;verts[v+7]=pcy;verts[v+8]=pcz;
      normals[v]=normals[v+3]=normals[v+6]=nx2;
      normals[v+1]=normals[v+4]=normals[v+7]=ny2;
      normals[v+2]=normals[v+5]=normals[v+8]=nz2;
      colors[v]=colors[v+3]=colors[v+6]=rgb[0];
      colors[v+1]=colors[v+4]=colors[v+7]=rgb[1];
      colors[v+2]=colors[v+5]=colors[v+8]=rgb[2];
      v+=9;
    }
  }

  var geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(verts,3));
  geo.setAttribute('normal',new THREE.BufferAttribute(normals,3));
  geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  return geo;
}

function vxBuildMesh(){
  VX.material=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  VX.chunks=[];
  var group=new THREE.Group();
  for(var y0=0;y0<VX.ny-1;y0+=VX_CHUNK_CELLS){
    for(var x0=0;x0<VX.nx-1;x0+=VX_CHUNK_CELLS){
      var x1=Math.min(x0+VX_CHUNK_CELLS,VX.nx-1);
      var y1=Math.min(y0+VX_CHUNK_CELLS,VX.ny-1);
      var geometry=vxBuildGeometryRange(x0,x1,y0,y1);
      var mesh=new THREE.Mesh(geometry,VX.material);
      mesh.frustumCulled=false;
      group.add(mesh);
      VX.chunks.push({x0:x0,x1:x1,y0:y0,y1:y1,mesh:mesh,dirty:false});
    }
  }
  VX.chunked=true;
  return group;
}

function vxRebuildMesh(){
  if(!VX) return;
  if(!VX.chunked || !VX.mesh || !VX.chunks){
    if(VX.mesh){scene.remove(VX.mesh);vxDisposeObject(VX.mesh,true);}
    VX.mesh=vxBuildMesh();
    scene.add(VX.mesh);
  } else {
    for(var i=0;i<VX.chunks.length;i++){
      var chunk=VX.chunks[i];
      if(!chunk.dirty) continue;
      var nextGeometry=vxBuildGeometryRange(chunk.x0,chunk.x1,chunk.y0,chunk.y1);
      chunk.mesh.geometry.dispose();
      chunk.mesh.geometry=nextGeometry;
      chunk.dirty=false;
    }
  }
  VX.dirty=false;
  if(blockMesh) blockMesh.visible=false;
  if(blockEdges) blockEdges.visible=false;
  if(typeof applyStockVisibility==='function') applyStockVisibility();
}

function easeInOut(t){ return t<0.5 ? 2*t*t : -1+(4-2*t)*t; }

function placeTool(){
  if(THREE_OK && toolGroup && !atcAnim){ toolGroup.position.set(toolPos.x, toolPos.y, toolPos.z); }
}

// One time scale for everything that plays back: feed and rapid motion, dwell
// and the tool change. The speed buttons then keep every part of the program
// in the same ratio to machine time.
function simTimeScale(){ return VISUAL_GAIN * SPEEDS[speedIdx]; }

function segSpeed(sm){
  var base = sm.rapid ? RAPID_MMS : Math.max(sm.feed,1)/60;
  return base * simTimeScale();
}

// Playback time that one frame could not use because a short cycle retract was
// held at its midpoint carries into the next frame, so holding never slows the
// program down. The carry is real time: Stop and a speed change clear it.
var ADVANCE_CARRY_MAX = 0.25;      // s of real time, bounds catch-up after a stall
var ADVANCE_FRAME_BUDGET_MS = 12;  // segment work per frame before yielding
var _advanceCarry = 0;
function _advanceNow(){ return (typeof performance!=='undefined' && performance.now) ? performance.now() : Date.now(); }

function shouldHoldVisibleSegment(sm, progress, remaining, segTime){
  return !!(sm && sm.ensureVisible && progress===0 && segTime>0 && remaining>=segTime);
}

function rapidCollision(sm, cx, cy, cz){
  // Report a rapid-into-material collision as a warning WITHOUT stopping the
  // run: real machine programs (e.g. a rapid onto a pre-drilled floor) can be
  // fine in practice, so the simulation must play through to the end. Report
  // only the first hit and latch _collisionActive so the warning stays pinned
  // (updateStatus keeps it until reset) instead of being overwritten by the
  // per-block running status. mode is deliberately left untouched.
  if(window._collisionActive) return;
  var msg='⚠ COLLISION — '+(sm.rapid?'rapid move':'stopped spindle moving')+' into material at X'+cx.toFixed(1)+' Y'+cy.toFixed(1)+' Z'+cz.toFixed(1);
  updateStatus(msg, false);
  var statusEl=document.getElementById('statusMsg');
  if(statusEl){ statusEl.style.color='#ff5d5d'; statusEl.style.fontWeight='bold'; }
  // keep collision message until reset
  window._collisionActive=true;
}

function vxCollides(tx, ty, tz, toolR, toolShape){
  if(!VX) return false;
  var maxR=toolR;
  if(toolShape && toolShape.type==='cone' && toolShape.mode!=='drill'){
    maxR=Math.max(toolR,(toolShape.lcuts||9999)*Math.tan(toolShape.angle*Math.PI/360));
  }
  var ixMin=Math.max(0,Math.floor((tx-maxR-VX.ox)/VX.dx));
  var ixMax=Math.min(VX.nx-1,Math.ceil((tx+maxR-VX.ox)/VX.dx));
  var iyMin=Math.max(0,Math.floor((ty-maxR-VX.oy)/VX.dy));
  var iyMax=Math.min(VX.ny-1,Math.ceil((ty+maxR-VX.oy)/VX.dy));
  var izMin=Math.max(0,Math.floor((tz-VX.oz)/VX.dz));
  var izMax=VX.nz-1;
  var tops=vxColumnTops(), nxy=VX.nx*VX.ny;
  for(var iy=iyMin;iy<=iyMax;iy++){
    var ddy=VX.oy+iy*VX.dy-ty;
    for(var ix=ixMin;ix<=ixMax;ix++){
      var col=iy*VX.nx+ix, top=tops[col];
      if(top<izMin) continue; // only air left above the tool tip in this column
      var ddx=VX.ox+ix*VX.dx-tx, dist2=ddx*ddx+ddy*ddy;
      for(var iz=izMin;iz<=top;iz++){
        if(!VX.grid[iz*nxy+col]) continue;
        var pz=VX.oz+iz*VX.dz;
        if(pz<tz) continue;
        var radius=vxToolRadiusAtHeight(toolR,toolShape,pz-tz);
        if(dist2<=radius*radius) return true;
      }
    }
  }
  return false;
}

function advance(dt){
  if(atcAnim){ _advanceCarry = 0; return; } // wait for ATC animation to finish
  var remaining = dt + _advanceCarry;
  _advanceCarry = 0;
  var frameStart = _advanceNow();
  var guard = 0;
  while(remaining > 0 && subIndex < sub.length && guard < 200000){
    guard++;
    var sm = sub[subIndex];
    var spd = segSpeed(sm);
    var segTime = sm.dwellSeconds>0 ? sm.dwellSeconds / simTimeScale() : sm.len / spd;
    var tLeft = (1 - subProgress) * segTime;
    // A short cycle retract can otherwise start and finish between two render
    // frames and look like a teleport. Show its midpoint once, while retaining
    // the real FMAX/feed metadata and leaving ordinary short arc segments fast.
    // The rest of the frame's time is carried, not lost.
    if(shouldHoldVisibleSegment(sm, subProgress, remaining, segTime)){
      subProgress = 0.5;
      _advanceCarry = Math.min(ADVANCE_CARRY_MAX, remaining - 0.5*segTime);
      remaining = 0;
      break;
    }
    if(remaining < tLeft){
      subProgress += remaining/segTime;
      remaining = 0;
    } else {
      remaining -= tLeft;
      subProgress = 1;
      commitSeg(sm);
      subIndex++;
      subProgress = 0;
      // Break loop if ATC animation was triggered
      if(atcAnim){ remaining = 0; break; }
      var _pauseCode=mControlPauseCode(sm);
      if(_pauseCode && mode==='running'){
        mode='paused';
        updateStatus(_pauseCode==='M6'
          ? 'M6 — tool change. Press Run to continue.'
          : 'M0 — program stopped. Press Run to continue.', false);
        break;
      }
      if(mode==='stepping'){
        if(subIndex >= sub.length || sub[subIndex].blockIndex !== stepTargetBlock){
          mode = 'paused';
          break;
        }
      }
      // Yield to the renderer only when this frame's work budget is spent.
      // The device cannot keep up then, so the unused time is dropped: playback
      // slows evenly instead of catching up later in one jump (at 100x a
      // carried 0.25 s would be 25 s of program in a single frame).
      if(_advanceNow() - frameStart > ADVANCE_FRAME_BUDGET_MS){
        break;
      }
    }
  }
  // compute tool position
  if(subIndex < sub.length){
    var c = sub[subIndex];
    toolPos = {
      x: c.from.x + (c.to.x-c.from.x)*subProgress,
      y: c.from.y + (c.to.y-c.from.y)*subProgress,
      z: c.from.z + (c.to.z-c.from.z)*subProgress
    };
  } else {
    var last = sub.length? sub[sub.length-1].to : prog.start;
    toolPos = {x:last.x, y:last.y, z:last.z};
    if(mode==='running' || mode==='stepping'){
      mode='done';
      updateStatus('Done — '+prog.totalBlocks+' simulation steps executed', false);
      calcToolTimes(sub);
      var rb=document.getElementById('refineBtnCanvas'); if(rb){ rb.style.display=prog.hasStock===false?'none':''; rb.disabled=false; rb.textContent='◆ Refine'; }
      updateSimInfoPanel();
      updateToolLegend();
      triggerRefine();
    }
  }
  placeTool();

  // path refresh (with partial of current segment)
  if(THREE_OK){
    var pa=null, pb=null;
    if(subIndex < sub.length && subProgress>0){
      var s = sub[subIndex];
      pa = s.from; pb = toolPos;
      if(s.rapid){ bufRefresh(feedBuf,null,null); bufRefresh(rapidBuf,pa,pb); }
      else { bufRefresh(rapidBuf,null,null); bufRefresh(feedBuf,pa,pb); }
    } else {
      bufRefresh(feedBuf,null,null); bufRefresh(rapidBuf,null,null);
    }
  }

  updatePos();
  if(subIndex < sub.length){
    var _sm = sub[subIndex];
    var src = _programRows().rows[_sm.srcLine] || '';
    var bi = _sm.blockIndex;
    updateStatus('Step '+bi+'/'+prog.totalBlocks+':  '+src.trim(), mode==='running'||mode==='stepping');
    currentFeed = (_sm.rapid || _sm.isMseg) ? 0 : (_sm.feed || 0);
    if(_sm.spindleS && _sm.spindleS > 0) currentSpindle = _sm.spindleS;
    if(typeof _sm.spindleOn !== 'undefined') currentSpindleOn = !!_sm.spindleOn;
    if(typeof _sm.coolantOn !== 'undefined') currentCoolantOn = !!_sm.coolantOn;
    currentLBL = getLblAtLine(_sm.srcLine);
    updateSimInfoPanel();
    var newSrcLine = _sm.srcLine;
    if(newSrcLine !== activeSrcLine){
      activeSrcLine = newSrcLine;
      highlightActiveLine(activeSrcLine);
    }
  }
}
