// render3d -- verified byte-for-byte identical between web and android repos.

function _scene3dBgColor(){
  return document.documentElement.getAttribute('data-theme')==='light' ? 0xc7cdd8 : 0x100f0d;
}

function _stockRGB(){ return document.documentElement.getAttribute('data-theme')==='light' ? [0.44,0.46,0.50] : [0.61,0.62,0.65]; }

function _stockHex(){ return document.documentElement.getAttribute('data-theme')==='light' ? 0x70747d : 0x9a9da6; }

function show3DError(msg){
  try{
    if(!view3dEl) return;
    // clear any partial canvas
    var c = view3dEl.querySelector('canvas'); if(c) c.remove();
    var box = document.getElementById('view3dError');
    if(!box){
      box = document.createElement('div');
      box.id = 'view3dError';
      box.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;'
        + 'justify-content:center;text-align:center;padding:24px;box-sizing:border-box;'
        + 'font-family:var(--mono);font-size:13px;line-height:1.6;color:var(--text2);'
        + 'background:var(--bg);z-index:2;';
      view3dEl.appendChild(box);
    }
    box.innerHTML = '<div><div style="font-size:22px;margin-bottom:10px;">\u26A0\uFE0F</div>'
      + '<div>' + (msg||'3D view is not available on this device.') + '</div></div>';
    box.style.display = 'flex';
  }catch(e){}
}

function hide3DError(){
  var box = document.getElementById('view3dError');
  if(box) box.style.display = 'none';
}

function init3D(){
  if(!THREE_OK){
    show3DError('Could not load the 3D engine. Check your internet connection once, then reload \u2014 the 3D files are cached for offline use afterwards. The editor and lessons work regardless.');
    return;
  }
  scene = new THREE.Scene();
  scene.background = new THREE.Color(_scene3dBgColor());

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
  camera.up.set(0,0,1);

  // Create the WebGL renderer defensively. Some mobile GPUs/drivers reject a
  // 'high-performance' context (returns null) even though a default WebGL
  // context works fine. Worse, some devices (notably Xiaomi/HyperOS) create the
  // context and then kill it moments later due to aggressive GPU/memory
  // management — the "3D flashes then disappears" symptom. To reduce that we do
  // NOT request 'high-performance' on touch devices (it makes such systems more
  // aggressive), keep the pixel ratio modest, and handle context loss/restore.
  var _touch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
  renderer = null;
  var _rOpts = _touch
    ? [ {antialias:true}, {antialias:false}, {antialias:false, failIfMajorPerformanceCaveat:false} ]
    : [ {antialias:true, powerPreference:'high-performance'}, {antialias:true}, {antialias:false} ];
  for(var _oi=0; _oi<_rOpts.length && !renderer; _oi++){
    try{
      var _r = new THREE.WebGLRenderer(_rOpts[_oi]);
      if(_r && _r.getContext && _r.getContext()) renderer = _r;
    }catch(_e){ renderer = null; }
  }
  if(!renderer){
    show3DError('3D view could not start on this device. Try updating the app or your device, or enable hardware acceleration / WebGL. The editor and lessons still work.');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, _touch ? 1.5 : 2));
  // Prevent the browser from hijacking orbit/pinch gestures as page scroll/zoom on mobile.
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.webkitTapHighlightColor = 'transparent';
  view3dEl.appendChild(renderer.domElement);

  // Context loss handling. On some devices the GPU context drops briefly and the
  // browser can restore it. Rather than immediately showing a scary error, pause
  // rendering and wait: if it comes back within a couple of seconds, rebuild the
  // scene and carry on; only if it stays lost do we tell the user.
  glContextLost = false;
  var _lostTimer = null;
  renderer.domElement.addEventListener('webglcontextlost', function(ev){
    ev.preventDefault();               // required so the browser will try to restore
    glContextLost = true;
    if(_lostTimer) clearTimeout(_lostTimer);
    _lostTimer = setTimeout(function(){
      if(glContextLost) show3DError('3D rendering was interrupted on this device. Reload to try again \u2014 the editor and lessons keep working.');
    }, 2500);
  }, false);
  renderer.domElement.addEventListener('webglcontextrestored', function(){
    glContextLost = false;
    if(_lostTimer){ clearTimeout(_lostTimer); _lostTimer = null; }
    hide3DError();
    try{
      // Re-upload GPU resources and repaint. Rebuilding the current program's
      // scene is the safest way to get valid buffers back after a restore.
      if(prog && typeof buildScene==='function') buildScene(prog);
      if(scene && camera) renderer.render(scene, camera);
    }catch(e){}
  }, false);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.addEventListener('change', function(){ controls._changed = true; setTimeout(function(){ controls._changed = false; }, 200); });

  // Hemisphere light — cheap, gives good ambient gradient
  var hemi = new THREE.HemisphereLight(0xd0e0ff, 0x302010, 0.7);
  scene.add(hemi);
  // Single strong key light
  var dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(1.2, -0.8, 2.0);
  scene.add(dir);

  // tool — built from tool library params
  toolGroup = new THREE.Group();
  buildToolMesh();
  scene.add(toolGroup);

  // ATC — second tool group for swap animation
  atcArm = new THREE.Group(); // pivot group that rotates
  atcArm.visible = false;
  scene.add(atcArm);

  feedBuf = makeBuf(8000, 0xe8530a, 1.0);
  rapidBuf = makeBuf(4000, 0x4a9eff, 0.5);
  scene.add(feedBuf.seg);
  scene.add(rapidBuf.seg);

  window.addEventListener('resize', function(){ onResize(); syncScrollToLineNums(); });
}

function _showRefineIndicator(text){
  var el = document.getElementById('refineIndicator');
  var txt = document.getElementById('refineIndicatorText');
  if(el) el.style.display='flex';
  if(txt && text) txt.textContent = text;
}

function _hideRefineIndicator(){
  var el = document.getElementById('refineIndicator');
  if(el) el.style.display='none';
}

function _runRefineMainThread(d){
  // Execute REFINE_WORKER_CODE logic directly on main thread (chunked via setTimeout)
  updateStatus('\u2699\ufe0f Refining (main thread)\u2026', false);
  // Inject a fake self.postMessage so we can reuse worker code
  var _results = null;
  var _fakeProgress = function(pct){ updateStatus('\u2699\ufe0f Refining\u2026 '+pct+'%', false); _showRefineIndicator('Refining mesh\u2026 '+pct+'%'); };
  try {
    var _fakeself = {
      onmessage: null,
      postMessage: function(msg){
        if(msg.type==='progress') _fakeProgress(msg.pct);
        else if(msg.type==='done') _results = msg;
      }
    };
    // Execute worker code with fake self
    var _workerFn = new Function('self', REFINE_WORKER_CODE + '\nself.onmessage({data:'+JSON.stringify(null)+'});');
    // Can't JSON.stringify ArrayBuffer — run differently
    // Build a direct execution context
    var _ctx = {};
    var _code = REFINE_WORKER_CODE.replace(/\bself\.postMessage\b/g,'_fakeself.postMessage').replace(/\bself\.onmessage\s*=/,'_fakeself.onmessage=');
    eval(_code);
    if(_fakeself.onmessage) _fakeself.onmessage({data: d});
    if(_results){
      _applyRefinedMesh(Array.from(new Float32Array(_results.verts)), Array.from(new Float32Array(_results.norms)), Array.from(new Int32Array(_results.colors)));
      var btn2=document.getElementById('refineBtnCanvas');
      if(btn2){ btn2.disabled=false; btn2.textContent='\u2713 Refined'; }
      _hideRefineIndicator();
      updateStatus('Precise mesh ready \u2014 '+prog.totalBlocks+' blocks', false);
    }
  } catch(err){
    console.error('Main thread refine failed:', err);
    updateStatus('Refine failed: '+err.message, false);
    _hideRefineIndicator();
    var btn2=document.getElementById('refineBtnCanvas');
    if(btn2){ btn2.disabled=false; btn2.textContent='\u25C6 Refine'; }
  }
}

function _applyRefinedMesh(vertsArr, normsArr, triColors){
  if(!THREE_OK || !scene) return;
  if(VX && VX.mesh){ scene.remove(VX.mesh); vxDisposeObject(VX.mesh,true); }
  var geo = new THREE.BufferGeometry();
  var vf = new Float32Array(vertsArr);
  geo.setAttribute('position', new THREE.BufferAttribute(vf, 3));
  geo.setAttribute('normal',   new THREE.BufferAttribute(new Float32Array(normsArr), 3));
  // color each triangle from triColors (toolNum per triangle, 0=uncut)
  var colors = [];
  for(var ti=0; ti<(triColors?triColors.length:0); ti++){
    var toolNum = triColors[ti];
    var _s0=_stockRGB(); var r=_s0[0], g=_s0[1], b=_s0[2];
    if(toolNum>0 && toolNum<255){
      var tc = TOOL_CUT_COLORS[(toolNum-1)%TOOL_CUT_COLORS.length];
      r=tc[0]; g=tc[1]; b=tc[2];
    }
    colors.push(r,g,b, r,g,b, r,g,b);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
  geo.computeVertexNormals();
  var mat = new THREE.MeshLambertMaterial({vertexColors:true, side:THREE.DoubleSide});
  var mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  if(VX){ VX.mesh=mesh; VX.chunks=null; VX.material=null; VX.chunked=false; }
  scene.add(mesh);
  if(blockMesh) blockMesh.visible = false;
  if(blockEdges) blockEdges.visible = false;
  if(typeof applyStockVisibility==='function') applyStockVisibility();
}

function buildScene(prog){
  if(!THREE_OK) return;
  var min = prog.viewMin || prog.blkMin, max = prog.viewMax || prog.blkMax;
  var w = max.x-min.x, d = max.y-min.y, h = max.z-min.z;

  if(blockMesh){ scene.remove(blockMesh); if(blockMesh.geometry) blockMesh.geometry.dispose(); }
  if(blockEdges){
    scene.remove(blockEdges);
    if(blockEdges.geometry) blockEdges.geometry.dispose();
    else if(blockEdges.traverse) blockEdges.traverse(function(obj){ if(obj.geometry) obj.geometry.dispose(); });
  }
  blockMesh=null; blockEdges=null;

  // solid block visible before first cut
  if(prog.hasStock!==false && prog.blkCyl){
    var cyl = prog.blkCyl;
    var cylH = cyl.zMax - cyl.zMin;
    var bg = new THREE.CylinderGeometry(cyl.r, cyl.r, cylH, 64);
    bg.rotateX(Math.PI/2); // Y-up → Z-up
    bg.translate(cyl.cx, cyl.cy, cyl.zMin + cylH/2);
    blockMesh = new THREE.Mesh(bg, new THREE.MeshLambertMaterial({color:_stockHex()}));
    scene.add(blockMesh);
    // edge circle outlines (top + bottom)
    var edgeMat = new THREE.LineBasicMaterial({color:0x3a3e48});
    var pts = [];
    for(var ei=0;ei<=64;ei++) pts.push(new THREE.Vector3(cyl.cx+cyl.r*Math.cos(ei/64*Math.PI*2), cyl.cy+cyl.r*Math.sin(ei/64*Math.PI*2), cyl.zMin));
    var edgeGeoB = new THREE.BufferGeometry().setFromPoints(pts);
    var ptsT = pts.map(function(p){ return new THREE.Vector3(p.x,p.y,cyl.zMax); });
    var edgeGeoT = new THREE.BufferGeometry().setFromPoints(ptsT);
    blockEdges = new THREE.Group();
    blockEdges.add(new THREE.Line(edgeGeoB, edgeMat));
    blockEdges.add(new THREE.Line(edgeGeoT, edgeMat));
    scene.add(blockEdges);
  } else if(prog.hasStock!==false) {
    var stockMin=prog.blkMin, stockMax=prog.blkMax;
    var stockW=stockMax.x-stockMin.x, stockD=stockMax.y-stockMin.y, stockH=stockMax.z-stockMin.z;
    var bg = new THREE.BoxGeometry(stockW, stockD, stockH);
    bg.translate(stockMin.x+stockW/2, stockMin.y+stockD/2, stockMin.z+stockH/2);
    blockMesh = new THREE.Mesh(bg, new THREE.MeshLambertMaterial({color:_stockHex()}));
    scene.add(blockMesh);
    blockEdges = new THREE.LineSegments(new THREE.EdgesGeometry(bg), new THREE.LineBasicMaterial({color:0x3a3e48}));
    scene.add(blockEdges);
  }
  // voxel init — MC mesh will replace blockMesh immediately
  if(prog.hasStock!==false) vxInit(prog);
  else {
    if(VX&&VX.mesh){ scene.remove(VX.mesh); vxDisposeObject(VX.mesh,true); }
    VX=null;
    var refineBtn=document.getElementById('refineBtnCanvas');
    if(refineBtn) refineBtn.style.display='none';
  }
  if(blockMesh) blockMesh.visible=false; // always hide — voxel mesh takes over
  if(typeof applyStockVisibility==='function') applyStockVisibility();


  // table grid at Z=min.z
  if(scene.userData.grid){ scene.remove(scene.userData.grid); }
  var gridSize = Math.max(w,d)*2;
  var grid = new THREE.GridHelper(gridSize, Math.round(gridSize/10), 0x2a2f3a, 0x1c2026);
  grid.rotation.x = Math.PI/2;
  grid.position.set(min.x+w/2, min.y+d/2, min.z);
  scene.add(grid);
  scene.userData.grid = grid;

  // Axes at grid corner with X Y Z labels
  if(scene.userData.axisGroup){
    scene.userData.axisGroup.children.slice().forEach(function(c){ scene.userData.axisGroup.remove(c); });
    scene.remove(scene.userData.axisGroup);
  }
  var axLen = Math.max(w,d)*0.3 + 20;
  var gridHalf = gridSize/2;
  var axOrigin = {x: min.x+w/2 - gridHalf, y: min.y+d/2 - gridHalf, z: min.z};
  // snap to nearest grid line for clean look
  var axLen_z = Math.min(axLen*0.5, (max.z-min.z)*0.4 + 10);
  var axGroup = new THREE.Group();
  axGroup.position.set(axOrigin.x, axOrigin.y, axOrigin.z);

  // axis lines (only positive direction)
  var mkLine = function(x2,y2,z2,col){
    var geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(x2,y2,z2)]);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({color:col}));
  };
  axGroup.add(mkLine(axLen,0,0,0xff3333));
  axGroup.add(mkLine(0,axLen,0,0x33cc33));
  axGroup.add(mkLine(0,0,axLen_z,0x3388ff));


  // labels as canvas sprites
  var mkLabel = function(text, color, x, y, z){
    var canvas = document.createElement('canvas');
    canvas.width=64; canvas.height=64;
    var ctx2 = canvas.getContext('2d');
    ctx2.fillStyle = color;
    ctx2.font = 'bold 44px sans-serif';
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.fillText(text, 32, 32);
    var tex = new THREE.CanvasTexture(canvas);
    var mat = new THREE.SpriteMaterial({map:tex, depthTest:false});
    var sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.set(axLen*0.18, axLen*0.18, 1);
    return sprite;
  };
  axGroup.add(mkLabel('X','#ff4444', axLen*1.12, 0, 0));
  axGroup.add(mkLabel('Y','#44dd44', 0, axLen*1.12, 0));
  axGroup.add(mkLabel('Z','#4499ff', 0, 0, axLen_z*1.2));


  scene.add(axGroup);
  scene.userData.axisGroup = axGroup;

  // camera framing
  var cx=min.x+w/2, cy=min.y+d/2, cz=min.z+h/2;
  controls.target.set(cx, cy, cz);
  var dist = Math.max(w,d,h)*1.9 + 60;
  camera.position.set(cx+dist*0.8, cy-dist, cz+dist*0.7);
  controls.update();

  bufClear(feedBuf); bufClear(rapidBuf);
  onResize();
}
