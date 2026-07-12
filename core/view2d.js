// view2d -- verified byte-for-byte identical between web and android repos.

function onResize(){
  if(!THREE_OK || !renderer) return;
  var w = view3dEl.clientWidth || 600;
  var h = view3dEl.clientHeight || 400;
  renderer.setSize(w, h, false);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  resize2d();
}

function resize2d(){
  var r = canvas2d.parentElement.getBoundingClientRect();
  canvas2d.width = r.width || 400;
  canvas2d.height = r.height || 300;
}

function tf2d(){
  var min=prog.blkMin, max=prog.blkMax, pad=36;
  var rx=(max.x-min.x)||100, ry=(max.y-min.y)||80;
  var s = Math.min((canvas2d.width-pad*2)/rx, (canvas2d.height-pad*2)/ry);
  var ox = pad + (canvas2d.width-pad*2 - rx*s)/2 - min.x*s;
  var oy = pad + (canvas2d.height-pad*2 - ry*s)/2 - min.y*s;
  return {s:s, ox:ox, oy:oy};
}

function sc2d(x,y,t){ return {x:x*t.s+t.ox, y:canvas2d.height-(y*t.s+t.oy)}; }

function draw2dFull(withPath){
  if(!prog) return;
  resize2d();
  var t = tf2d();
  ctx2d.clearRect(0,0,canvas2d.width,canvas2d.height);
  // workpiece footprint
  var p1=sc2d(prog.blkMin.x,prog.blkMin.y,t), p2=sc2d(prog.blkMax.x,prog.blkMax.y,t);
  ctx2d.fillStyle='rgba(154,157,166,0.06)';
  ctx2d.fillRect(Math.min(p1.x,p2.x),Math.min(p1.y,p2.y),Math.abs(p2.x-p1.x),Math.abs(p2.y-p1.y));
  ctx2d.strokeStyle='rgba(74,158,255,0.25)';ctx2d.lineWidth=1;ctx2d.setLineDash([4,4]);
  ctx2d.strokeRect(Math.min(p1.x,p2.x),Math.min(p1.y,p2.y),Math.abs(p2.x-p1.x),Math.abs(p2.y-p1.y));
  ctx2d.setLineDash([]);
  ctx2d.font='10px JetBrains Mono, monospace';ctx2d.fillStyle='rgba(255,255,255,0.25)';
  if(withPath){
    for(var i=0;i<sub.length;i++){
      var sm=sub[i];
      var a=sc2d(sm.from.x,sm.from.y,t), b=sc2d(sm.to.x,sm.to.y,t);
      ctx2d.beginPath();ctx2d.moveTo(a.x,a.y);ctx2d.lineTo(b.x,b.y);
      if(sm.rapid){ctx2d.strokeStyle='rgba(74,158,255,0.45)';ctx2d.lineWidth=1;ctx2d.setLineDash([4,3]);}
      else{ctx2d.strokeStyle='#4a9eff';ctx2d.lineWidth=1.6;ctx2d.setLineDash([]);}
      ctx2d.stroke();ctx2d.setLineDash([]);
    }
    var endp=sc2d(toolPos.x,toolPos.y,t);
    ctx2d.beginPath();ctx2d.arc(endp.x,endp.y,5,0,Math.PI*2);ctx2d.fillStyle='#4a9eff';ctx2d.fill();
  }
}

function togglePaths(){
  pathsVisible = !pathsVisible;
  var btn = document.getElementById('pathToggle');
  if(btn) btn.textContent = pathsVisible ? '⛶ Path' : '⛶ Path off';
  if(btn) btn.style.opacity = pathsVisible ? '1' : '0.5';
  // Toggle feed and rapid path visibility
  if(feedBuf && feedBuf.seg) feedBuf.seg.visible = pathsVisible;
  if(rapidBuf && rapidBuf.seg) rapidBuf.seg.visible = pathsVisible;
}

function updateStatus(msg, running){
  if(window._collisionActive && msg!=='Ready — press Run') return;
  statusMsg.textContent = msg;
  statusDot.className = 'status-dot' + (running?' run':'');
}

function updatePos(){
  posDisplay.textContent = 'X: '+toolPos.x.toFixed(3)+'  Y: '+toolPos.y.toFixed(3)+'  Z: '+toolPos.z.toFixed(3);
}

function updateToolLegend(){
  var el = document.getElementById('toolLegend');
  if(!el || !sub || !sub.length) return;

  // Collect tools used (in order of first appearance)
  var used = [], seen = {};
  for(var i=0; i<sub.length; i++){
    var tn = sub[i].toolNum;
    if(tn && !seen[tn]){
      seen[tn] = true;
      used.push(tn);
    }
  }
  if(!used.length){ el.style.display='none'; return; }

  var html = '<div style="font-size:9px;color:var(--text3);margin-bottom:5px;letter-spacing:.05em;">TOOLS USED</div>';
  used.forEach(function(tn){
    var t = getToolByNum(tn);
    var hex = '#'+('000000'+getToolColor3(tn).toString(16)).slice(-6);
    var name = t ? t.NAME : 'T'+tn;
    html += '<div style="display:flex;align-items:center;gap:7px;margin:3px 0;">'
      +'<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+hex+';flex-shrink:0;"></span>'
      +'<span style="color:var(--text3);">T'+tn+'</span>'
      +'<span style="color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;">'+name+'</span>'
      +'</div>';
  });
  el.innerHTML = html;
  el.style.display = 'block';
}

function switchView(v){
  curView=v;
  document.getElementById('tab3d').classList.toggle('active', v==='3d');
  document.getElementById('tab2d').classList.toggle('active', v==='2d');
  document.getElementById('tabTools').classList.toggle('active', v==='tools');
  view3dEl.style.display = v==='3d'?'block':'none';
  view2dEl.style.display = v==='2d'?'block':'none';
  document.getElementById('viewTools').style.display = v==='tools'?'block':'none';
  document.getElementById('viewHint').style.display = v==='3d'?'block':'none';
  var _measureBtn = document.getElementById('measureBtn');
  var _refineBtn  = document.getElementById('refineBtnCanvas');
  if(_measureBtn) _measureBtn.style.visibility = v==='3d'?'visible':'hidden';
  var _pathBtn = document.getElementById('pathToggle');
  if(_pathBtn) _pathBtn.style.visibility = v==='tools'?'hidden':'visible';
  if(_refineBtn)  _refineBtn.style.visibility  = v==='tools'?'hidden':'visible';
  var _tb2 = document.getElementById('activeToolBadge');
  if(_tb2) _tb2.style.visibility = v==='tools'?'hidden':'visible';
  var _ip = document.getElementById('simInfoPanel');
  if(_ip) _ip.style.visibility = v==='tools'?'hidden':'visible';
  var _leg = document.getElementById('toolLegend');
  if(_leg) _leg.style.display = v==='3d'?'block':'none';
  if(v==='3d'){ onResize(); }
  else if(v==='2d'){ draw2dFull(true); }
  else if(v==='tools'){ renderToolsTab(); }
}
