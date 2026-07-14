// voxel-cutting -- web test branch: incremental chunk meshing (not yet ported to Android).

var VX_CHUNK_CELLS = 32;
var VX_EDGE_CORNERS = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

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
  // Isotropic cells: cell size derived from the longest axis / VX_RES, so dx~=dy~=dz.
  var maxDim = Math.max(w, d, h);
  var cell = maxDim / (VX_RES - 1);
  // Large blanks must not lose detail: cap the cell size so resolution stays usable.
  // The cap scales with quality (low/med/high) but never lets a cell exceed it.
  var CELL_CAP = [1.0, 0.7, 0.5][VX_QUALITY!==undefined?VX_QUALITY:1] || 0.7; // mm
  if(cell > CELL_CAP) cell = CELL_CAP;
  var nx=Math.max(4, Math.round(w/cell)+1);
  var ny=Math.max(4, Math.round(d/cell)+1);
  var nz=Math.max(4, Math.round(h/cell)+1);
  // Memory guard: clamp total voxel count so the browser can't be killed by a huge blank.
  // If over budget, grow the cell uniformly (keeps cells cubic — just coarser).
  var VOXEL_BUDGET = 24000000; // ~24 MB grid + ~24 MB cut = ~48 MB, safe in-browser
  if(nx*ny*nz > VOXEL_BUDGET){
    var scale = Math.cbrt((nx*ny*nz) / VOXEL_BUDGET);
    cell = cell * scale;
    nx=Math.max(4, Math.round(w/cell)+1);
    ny=Math.max(4, Math.round(d/cell)+1);
    nz=Math.max(4, Math.round(h/cell)+1);
  }
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
  VX={grid:grid,cut:cut,nx:nx,ny:ny,nz:nz,ox:min.x,oy:min.y,oz:min.z,dx:dx,dy:dy,dz:dz,minZ:min.z,maxZ:max.z,w:w,d:d,h:h,mesh:null,chunks:null,material:null,chunked:false,dirty:false,hasCut:false,blkCyl:cylVx};
  VX.mesh=vxBuildMesh();
  scene.add(VX.mesh);
}

function vxReset(){
  if(!VX||!prog) return;
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
  for(var iz=izMin;iz<=izMax;iz++){
    var pz=VX.oz+iz*VX.dz;
    if(pz < tz - VX.dz*0.5) continue;
    // compute effective radius at this Z level
    var effR = toolR;
    var dz2 = pz - tz; // how far above tool tip
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
    var r2=effR*effR;
    for(var iy=iyMin;iy<=iyMax;iy++){
      var py=VX.oy+iy*VX.dy;
      for(var ix=ixMin;ix<=ixMax;ix++){
        var px=VX.ox+ix*VX.dx;
        var ddx=px-tx,ddy=py-ty;
        if(ddx*ddx+ddy*ddy<=r2){
          var gi=iz*VX.ny*VX.nx+iy*VX.nx+ix;
          if(VX.grid[gi]){
            VX.grid[gi]=0;
            VX.cut[gi]=(dz2<=_lcutsZ)?currentToolNum||1:255;
            changed=true;
            if(ix<changedIxMin) changedIxMin=ix;
            if(ix>changedIxMax) changedIxMax=ix;
            if(iy<changedIyMin) changedIyMin=iy;
            if(iy>changedIyMax) changedIyMax=iy;
          }
        }
      }
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
  var nx=VX.nx,ny=VX.ny,nz=VX.nz;
  var verts=[],normals=[],colors=[];

  function vInterp(iso,p1x,p1y,p1z,v1,p2x,p2y,p2z,v2,out){
    if(Math.abs(v1-v2)<1e-6){out[0]=p1x;out[1]=p1y;out[2]=p1z;return;}
    var t=(iso-v1)/(v2-v1);
    out[0]=p1x+t*(p2x-p1x);
    out[1]=p1y+t*(p2y-p1y);
    out[2]=p1z+t*(p2z-p1z);
  }

  var iso=0.5;
  var ep=new Array(12);
  for(var ei2=0;ei2<12;ei2++) ep[ei2]=[0,0,0];
  var values=new Uint8Array(8);
  var cornerX=new Float64Array(8), cornerY=new Float64Array(8), cornerZ=new Float64Array(8);
  var stockColor=_stockRGB();

  function val(ix,iy,iz){
    if(ix<0||ix>=nx||iy<0||iy>=ny||iz<0||iz>=nz) return 0;
    return VX.grid[iz*ny*nx+iy*nx+ix];
  }

  for(var iz=0;iz<nz-1;iz++){
    for(var iy=cellY0;iy<cellY1;iy++){
      for(var ix=cellX0;ix<cellX1;ix++){
        var x0=VX.ox+ix*VX.dx, y0=VX.oy+iy*VX.dy, z0=VX.oz+iz*VX.dz;
        var x1=x0+VX.dx, y1=y0+VX.dy, z1=z0+VX.dz;
        values[0]=val(ix,iy,iz); values[1]=val(ix+1,iy,iz);
        values[2]=val(ix+1,iy+1,iz); values[3]=val(ix,iy+1,iz);
        values[4]=val(ix,iy,iz+1); values[5]=val(ix+1,iy,iz+1);
        values[6]=val(ix+1,iy+1,iz+1); values[7]=val(ix,iy+1,iz+1);
        var ci=0;
        if(values[0]>iso)ci|=1; if(values[1]>iso)ci|=2; if(values[2]>iso)ci|=4; if(values[3]>iso)ci|=8;
        if(values[4]>iso)ci|=16;if(values[5]>iso)ci|=32;if(values[6]>iso)ci|=64;if(values[7]>iso)ci|=128;
        if(ci===0||ci===255) continue;
        var et=MC_EDGE_TABLE[ci];
        cornerX[0]=x0;cornerY[0]=y0;cornerZ[0]=z0;
        cornerX[1]=x1;cornerY[1]=y0;cornerZ[1]=z0;
        cornerX[2]=x1;cornerY[2]=y1;cornerZ[2]=z0;
        cornerX[3]=x0;cornerY[3]=y1;cornerZ[3]=z0;
        cornerX[4]=x0;cornerY[4]=y0;cornerZ[4]=z1;
        cornerX[5]=x1;cornerY[5]=y0;cornerZ[5]=z1;
        cornerX[6]=x1;cornerY[6]=y1;cornerZ[6]=z1;
        cornerX[7]=x0;cornerY[7]=y1;cornerZ[7]=z1;
        for(var e=0;e<12;e++){
          if(et&(1<<e)){
            var ea=VX_EDGE_CORNERS[e][0],eb=VX_EDGE_CORNERS[e][1];
            vInterp(iso,cornerX[ea],cornerY[ea],cornerZ[ea],values[ea],cornerX[eb],cornerY[eb],cornerZ[eb],values[eb],ep[e]);
          }
        }
        var triBase=ci*16;
        for(var ti=0;ti<15;ti+=3){
          if(MC_TRI_TABLE[triBase+ti]<0) break;
          var pa=ep[MC_TRI_TABLE[triBase+ti]],pb=ep[MC_TRI_TABLE[triBase+ti+1]],pc=ep[MC_TRI_TABLE[triBase+ti+2]];
          // compute normal
          var ax=pb[0]-pa[0],ay=pb[1]-pa[1],az=pb[2]-pa[2];
          var bx=pc[0]-pa[0],by=pc[1]-pa[1],bz=pc[2]-pa[2];
          var nx2=ay*bz-az*by,ny2=az*bx-ax*bz,nz2=ax*by-ay*bx;
          var nl=Math.sqrt(nx2*nx2+ny2*ny2+nz2*nz2)||1;
          nx2/=nl;ny2/=nl;nz2/=nl;
          verts.push(pa[0],pa[1],pa[2],pb[0],pb[1],pb[2],pc[0],pc[1],pc[2]);
          normals.push(nx2,ny2,nz2,nx2,ny2,nz2,nx2,ny2,nz2);
          var centerX=(pa[0]+pb[0]+pc[0])/3;
          var centerY=(pa[1]+pb[1]+pc[1])/3;
          var centerZ=(pa[2]+pb[2]+pc[2])/3;
          var cutX=Math.round((centerX-VX.ox)/VX.dx);
          var cutY=Math.round((centerY-VX.oy)/VX.dy);
          var cutZ=Math.round((centerZ-VX.oz)/VX.dz);
          var isCut=0;
          if(cutX>=0&&cutX<VX.nx&&cutY>=0&&cutY<VX.ny&&cutZ>=0&&cutZ<VX.nz){
            isCut=VX.cut[cutZ*VX.ny*VX.nx+cutY*VX.nx+cutX];
          }
          var r=stockColor[0],g=stockColor[1],b=stockColor[2];
          if(isCut>0 && isCut<255){
            var tc=TOOL_CUT_COLORS[(isCut-1)%TOOL_CUT_COLORS.length];
            r=tc[0];g=tc[1];b=tc[2];
          }
          colors.push(r,g,b,r,g,b,r,g,b);
        }
      }
    }
  }

  var geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(verts),3));
  geo.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(normals),3));
  geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(colors),3));
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

function segSpeed(sm){
  var base = sm.rapid ? RAPID_MMS : Math.max(sm.feed,1)/60;
  return base * VISUAL_GAIN * SPEEDS[speedIdx];
}

function shouldHoldVisibleSegment(sm, progress, remaining, segTime){
  return !!(sm && sm.ensureVisible && progress===0 && segTime>0 && remaining>=segTime);
}

function rapidCollision(sm, cx, cy, cz){
  if(mode==='idle') return;
  mode='idle';
  var msg='⚠ COLLISION — rapid move into material at X'+cx.toFixed(1)+' Y'+cy.toFixed(1)+' Z'+cz.toFixed(1);
  updateStatus(msg, false);
  var statusEl=document.getElementById('statusMsg');
  if(statusEl){ statusEl.style.color='#ff5d5d'; statusEl.style.fontWeight='bold'; }
  // keep collision message until reset
  window._collisionActive=true;
}

function vxCollides(tx, ty, tz, toolR){
  if(!VX) return false;
  var ixMin=Math.max(0,Math.floor((tx-toolR-VX.ox)/VX.dx));
  var ixMax=Math.min(VX.nx-1,Math.ceil((tx+toolR-VX.ox)/VX.dx));
  var iyMin=Math.max(0,Math.floor((ty-toolR-VX.oy)/VX.dy));
  var iyMax=Math.min(VX.ny-1,Math.ceil((ty+toolR-VX.oy)/VX.dy));
  var izMin=Math.max(0,Math.floor((tz-VX.oz)/VX.dz));
  var izMax=Math.min(VX.nz-1,Math.ceil((tz+VX.dz-VX.oz)/VX.dz));
  var r2=toolR*toolR;
  for(var iz=izMin;iz<=izMax;iz++){
    var pz=VX.oz+iz*VX.dz;
    if(pz<tz) continue;
    for(var iy=iyMin;iy<=iyMax;iy++){
      var py=VX.oy+iy*VX.dy;
      for(var ix=ixMin;ix<=ixMax;ix++){
        var px=VX.ox+ix*VX.dx;
        var ddx=px-tx, ddy=py-ty;
        if(ddx*ddx+ddy*ddy<=r2){
          if(VX.grid[iz*VX.ny*VX.nx+iy*VX.nx+ix]) return true;
        }
      }
    }
  }
  return false;
}

function advance(dt){
  if(atcAnim) return; // wait for ATC animation to finish
  var remaining = dt;
  var guard = 0;
  while(remaining > 0 && subIndex < sub.length && guard < 500){
    guard++;
    var sm = sub[subIndex];
    var spd = segSpeed(sm);
    var segTime = sm.len / spd;
    var tLeft = (1 - subProgress) * segTime;
    // A short cycle retract can otherwise start and finish between two render
    // frames and look like a teleport. Show its midpoint once, while retaining
    // the real FMAX/feed metadata and leaving ordinary short arc segments fast.
    if(shouldHoldVisibleSegment(sm, subProgress, remaining, segTime)){
      subProgress = 0.5;
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
      if(sm.stop && mode==='running'){
        mode='paused';
        updateStatus('M0 — program stopped. Press Run to continue.', false);
        break;
      }
      if(mode==='stepping'){
        if(subIndex >= sub.length || sub[subIndex].blockIndex !== stepTargetBlock){
          mode = 'paused';
          break;
        }
      }
      // After any visible segment, yield to renderer
      if(!sm.isMseg && sm.len > 0.5){ break; }
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
      updateStatus('Done — '+prog.totalBlocks+' blocks executed', false);
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
    var src = codeEl.value.split('\n')[_sm.srcLine] || '';
    var bi = _sm.blockIndex;
    updateStatus('Block '+bi+'/'+prog.totalBlocks+':  '+src.trim(), mode==='running'||mode==='stepping');
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
