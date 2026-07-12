// measure-tool -- verified byte-for-byte identical between web and android repos.

function makeBuf(maxSeg, color, opacity){
  var cap = maxSeg*6;
  var arr = new Float32Array(cap);
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  geo.setDrawRange(0,0);
  var mat = new THREE.LineBasicMaterial({color:color, transparent:opacity<1, opacity:opacity});
  var seg = new THREE.LineSegments(geo, mat);
  seg.frustumCulled = false;
  return {arr:arr, geo:geo, seg:seg, count:0, cap:cap};
}

function bufAppend(buf, a, b){
  if(buf.count+6 > buf.cap) return;
  var i = buf.count;
  buf.arr[i]=a.x; buf.arr[i+1]=a.y; buf.arr[i+2]=a.z;
  buf.arr[i+3]=b.x; buf.arr[i+4]=b.y; buf.arr[i+5]=b.z;
  buf.count += 6;
}

function bufRefresh(buf, partialA, partialB){
  var draw = buf.count;
  if(partialA){
    if(buf.count+6 <= buf.cap){
      var i = buf.count;
      buf.arr[i]=partialA.x; buf.arr[i+1]=partialA.y; buf.arr[i+2]=partialA.z;
      buf.arr[i+3]=partialB.x; buf.arr[i+4]=partialB.y; buf.arr[i+5]=partialB.z;
      draw = buf.count+6;
    }
  }
  buf.geo.attributes.position.needsUpdate = true;
  buf.geo.setDrawRange(0, draw/3);
}

function bufClear(buf){ buf.count=0; buf.geo.setDrawRange(0,0); buf.geo.attributes.position.needsUpdate=true; }

function toggleMeasure(){
  measureMode = !measureMode;
  var btn = document.getElementById('measureBtn');
  if(btn){
    btn.style.borderColor = measureMode ? 'var(--accent)' : 'var(--border)';
    btn.style.color       = measureMode ? 'var(--accent)' : 'var(--text3)';
  }
  if(measureMode){
    renderMeasureOverlay();
    // show existing markers
    measureItems.forEach(function(it){ it.markers.forEach(function(m){ scene.add(m); }); });
  } else {
    measurePending = null;
    // hide markers but keep data
    measureItems.forEach(function(it){ it.markers.forEach(function(m){ scene.remove(m); }); });
    document.getElementById('measureOverlay').style.display = 'none';
    updateViewHint();
  }
}

function setMeasureMode(m){
  measureSubMode = m;
  measurePending = null;
  renderMeasureOverlay();
  updateViewHint();
}

function updateViewHint(){
  var el = document.getElementById('viewHint');
  if(!el) return;
  if(!measureMode){
    el.innerHTML = '<span style="color:var(--text2)">&#x2B2F; drag</span> orbit &nbsp; <span style="color:var(--text2)">&#x25CE; scroll</span> zoom &nbsp; <span style="color:var(--text2)">&#x2B2F; right</span> pan';
  } else if(measureSubMode==='point'){
    el.innerHTML = 'click surface to place point';
  } else {
    el.innerHTML = measurePending ? 'click 2nd point' : 'click 1st point';
  }
}

function snapPt(pt){
  if(!prog) return pt;
  var tol=0.05, mn=prog.blkMin, mx=prog.blkMax;
  if(Math.abs(pt.x-mn.x)<tol) pt.x=mn.x; else if(Math.abs(pt.x-mx.x)<tol) pt.x=mx.x;
  if(Math.abs(pt.y-mn.y)<tol) pt.y=mn.y; else if(Math.abs(pt.y-mx.y)<tol) pt.y=mx.y;
  if(Math.abs(pt.z-mn.z)<tol) pt.z=mn.z; else if(Math.abs(pt.z-mx.z)<tol) pt.z=mx.z;
  return pt;
}

function makeSphere(pt, color){
  var geo = new THREE.SphereGeometry(0.6,8,8);
  var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:color||0xe8530a}));
  m.position.set(pt.x,pt.y,pt.z); scene.add(m); return m;
}

function makeLine(p1, p2, color){
  var geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p1.x,p1.y,p1.z),new THREE.Vector3(p2.x,p2.y,p2.z)]);
  var l = new THREE.Line(geo, new THREE.LineBasicMaterial({color:color||0xe8530a}));
  scene.add(l); return l;
}

function addItem(item){
  if(measureItems.length >= 10){
    var old2 = measureItems.shift();
    old2.markers.forEach(function(m){ scene.remove(m); if(m.geometry) m.geometry.dispose(); });
  }
  measureItems.push(item);
  renderMeasureOverlay();
}

function handleMeasureClick(pt){
  pt = snapPt(pt);
  if(measureSubMode==='point'){
    var m = makeSphere(pt);
    addItem({type:'point', data:{x:+pt.x.toFixed(3),y:+pt.y.toFixed(3),z:+pt.z.toFixed(3)}, markers:[m]});
  } else {
    if(!measurePending){
      measurePending = {x:+pt.x.toFixed(3),y:+pt.y.toFixed(3),z:+pt.z.toFixed(3)};
      var m1 = makeSphere(pt, 0x4a9eff);
      measurePending._marker = m1;
      updateViewHint();
    } else {
      var p1 = measurePending, p2 = {x:+pt.x.toFixed(3),y:+pt.y.toFixed(3),z:+pt.z.toFixed(3)};
      var m1b = measurePending._marker;
      var m2 = makeSphere(pt, 0x4a9eff);
      // 3 orthogonal lines
      var mid1 = {x:p2.x,y:p1.y,z:p1.z};
      var mid2 = {x:p2.x,y:p2.y,z:p1.z};
      var lx = makeLine(p1, mid1, 0xff5d5d);
      var ly = makeLine(mid1, mid2, 0x1da06a);
      var lz = makeLine(mid2, p2, 0x4a9eff);
      var ms = [m1b, m2, lx, ly, lz];
      addItem({type:'dist', data:{p1:p1,p2:p2,dx:Math.abs(p2.x-p1.x),dy:Math.abs(p2.y-p1.y),dz:Math.abs(p2.z-p1.z),d3:Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2)+Math.pow(p2.z-p1.z,2))}, markers:ms});
      measurePending = null;
      updateViewHint();
    }
  }
}

function deleteMeasureItem(i){
  if(i<0||i>=measureItems.length) return;
  measureItems[i].markers.forEach(function(m){ scene.remove(m); if(m.geometry) m.geometry.dispose(); });
  measureItems.splice(i,1);
  renderMeasureOverlay();
}

function clearMeasure(){
  measureItems.forEach(function(it){ it.markers.forEach(function(m){ scene.remove(m); if(m.geometry) m.geometry.dispose(); }); });
  measureItems = [];
  measurePending = null;
  renderMeasureOverlay();
}

function renderMeasureOverlay(){
  var el = document.getElementById('measureOverlay');
  if(!el) return;
  if(!measureMode){ el.style.display='none'; return; }
  el.style.display='block';
  var sub = '<div style="display:flex;gap:4px;margin-bottom:8px;">'
    +'<button onclick="setMeasureMode(&quot;point&quot;)" style="flex:1;font-family:var(--mono);font-size:10px;padding:3px 0;border:1px solid '+(measureSubMode==="point"?"var(--accent)":"var(--border)")+';border-radius:4px;background:'+(measureSubMode==="point"?"var(--accent)":"none")+';color:'+(measureSubMode==="point"?"#fff":"var(--text3)")+';cursor:pointer;">Point</button>'
    +'<button onclick="setMeasureMode(&quot;dist&quot;)" style="flex:1;font-family:var(--mono);font-size:10px;padding:3px 0;border:1px solid '+(measureSubMode==="dist"?"var(--accent3)":"var(--border)")+';border-radius:4px;background:'+(measureSubMode==="dist"?"var(--accent3)":"none")+';color:'+(measureSubMode==="dist"?"#fff":"var(--text3)")+';cursor:pointer;">Distance</button>'
    +'</div>';
    var items = '';
  if(measureItems.length===0){
    items = '<div style="color:var(--text3);font-size:10px;">no measurements yet</div>';
  } else {
    measureItems.forEach(function(it,i){
      if(it.type==='point'){
        var p=it.data;
        items += '<div style="padding:4px 0;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">'
          +'<span><span style="color:var(--accent);">P</span> X<b>'+p.x.toFixed(2)+'</b> Y<b>'+p.y.toFixed(2)+'</b> Z<b>'+p.z.toFixed(2)+'</b></span>'
          +'<span style="cursor:pointer;color:var(--text3);padding-left:6px;" onclick="deleteMeasureItem('+i+')">✕</span></div>';
      } else {
        var d=it.data;
        items += '<div style="padding:4px 0;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:start;">'
          +'<span><span style="color:var(--accent3);">D</span> '
          +'<span style="color:#ff5d5d;">X'+d.dx.toFixed(2)+'</span> '
          +'<span style="color:#5dcaa5;">Y'+d.dy.toFixed(2)+'</span> '
          +'<span style="color:#4a9eff;">Z'+d.dz.toFixed(2)+'</span>'
          +'<br><span style="color:var(--text3);font-size:9px;">3D: '+d.d3.toFixed(2)+' mm</span></span>'
          +'<span style="cursor:pointer;color:var(--text3);padding-left:6px;" onclick="deleteMeasureItem('+i+')">✕</span></div>';
      }
    });
  }
  var clearBtn = measureItems.length>0 ? '<div style="margin-top:6px;cursor:pointer;color:var(--text3);font-size:10px;text-align:right;" onclick="clearMeasure()">clear all</div>' : '';
  el.innerHTML = sub + items + clearBtn;
}

function initMeasureRaycaster(){
  if(!THREE_OK) return;
  measureRaycaster = new THREE.Raycaster();

  function doMeasureHit(clientX, clientY){
    if(!measureMode||!measureRaycaster) return;
    var rect=renderer.domElement.getBoundingClientRect();
    var mouse=new THREE.Vector2(((clientX-rect.left)/rect.width)*2-1,-((clientY-rect.top)/rect.height)*2+1);
    measureRaycaster.setFromCamera(mouse,camera);
    var targets=[];
    if(VX&&VX.mesh) targets.push(VX.mesh);
    if(blockMesh&&blockMesh.visible) targets.push(blockMesh);
    var hits=measureRaycaster.intersectObjects(targets);
    if(hits.length>0) handleMeasureClick(hits[0].point.clone());
  }

  // Mouse
  renderer.domElement.addEventListener('mousedown', function(e){ measureMouseDown={x:e.clientX,y:e.clientY}; });
  renderer.domElement.addEventListener('click', function(e){
    if(!measureMode||!measureRaycaster) return;
    if(measureMouseDown){ var dx=e.clientX-measureMouseDown.x,dy=e.clientY-measureMouseDown.y; if(dx*dx+dy*dy>16) return; }
    doMeasureHit(e.clientX, e.clientY);
  });

  // Touch
  var _touchStart = null;
  renderer.domElement.addEventListener('touchstart', function(e){
    if(!measureMode) return;
    if(e.touches.length===1) _touchStart={x:e.touches[0].clientX, y:e.touches[0].clientY};
  }, {passive:true});
  renderer.domElement.addEventListener('touchend', function(e){
    if(!measureMode||!_touchStart) return;
    var t = e.changedTouches[0];
    var dx=t.clientX-_touchStart.x, dy=t.clientY-_touchStart.y;
    if(dx*dx+dy*dy < 100){ // tap threshold 10px
      e.preventDefault();
      doMeasureHit(_touchStart.x, _touchStart.y);
    }
    _touchStart = null;
  }, {passive:false});
}
