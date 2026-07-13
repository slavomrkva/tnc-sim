// sim-controls -- verified byte-for-byte identical between web and android repos.

function prepare(){
  prog = parseProgram(codeEl.value);
  sub = prog.sub;
  dirty = false;
  calcEstTime(sub);


  if(THREE_OK) buildScene(prog);
  resetState();
  draw2dFull(false); // draw only frame, no path yet
}

function updateSimInfoPanel(){
  var el = document.getElementById('simInfoPanel');
  if(!el) return;
  if(mode==='idle' || !prog){ el.style.display='none'; return; }

  // Read state directly from current segment — single source of truth
  var sm = (mode==='done') ? (sub.length ? sub[sub.length-1] : null) : (subIndex < sub.length ? sub[subIndex] : null);


  // Tool number: from segment or fallback to currentToolNum
  var tNum = (sm && sm.toolNum) ? sm.toolNum : currentToolNum;
  var t = getToolByNum(tNum);
  var tName = t ? 'T'+t.T+(t.NAME?' '+t.NAME:'') : 'T'+tNum;

  // spindleOn / spindleS: walk backward from current position to find last state
  // During ATC: scan backward past all new-tool segments to find pre-change state
  var _scanEnd = (mode==='done') ? sub.length-1 : Math.min(subIndex, sub.length-1);
  if(atcAnim && subIndex > 0){
    // find last segment belonging to the OLD tool (before ATC)
    var _atcNewT = sub[subIndex] ? sub[subIndex].toolNum : currentToolNum;
    _scanEnd = subIndex - 1;
    while(_scanEnd > 0 && sub[_scanEnd] && sub[_scanEnd].toolNum === _atcNewT) _scanEnd--;
  }
  var spOn = false, spS = 0, coOn = false;
  var _foundSpOn = false, _foundCoOn = false;
  for(var _i = _scanEnd; _i >= 0; _i--){
    var _s = sub[_i];
    if(!_foundSpOn && typeof _s.spindleOn !== 'undefined'){
      spOn = !!_s.spindleOn;
      _foundSpOn = true;
    }
    if(spS === 0 && _s.spindleS && _s.spindleS > 0){ spS = _s.spindleS; }
    if(!_foundCoOn && typeof _s.coolantOn !== 'undefined'){
      coOn = !!_s.coolantOn;
      _foundCoOn = true;
    }
    if(_foundSpOn && spS > 0 && _foundCoOn) break;
  }

  // Feed: 0 if rapid/mseg or spindle off
  var feed = 0;
  if(sm && !sm.rapid && !sm.isMseg && spOn){ feed = sm.feed || 0; }

  // Programmed TOOL CALL deltas of the CURRENT segment (accurate per tool-call
  // span even when the same tool is re-called with different DL/DR later).
  var dl = (sm && sm.dlPgm !== undefined) ? (sm.dlPgm||0) : (t ? (t._dlOverride !== undefined ? t._dlOverride : (t.DL||0)) : 0);
  var dr = (sm && sm.drPgm !== undefined) ? (sm.drPgm||0) : (t ? (t._drOverride !== undefined ? t._drOverride : (t.DR||0)) : 0);

  var lines = [];
  lines.push('<span style="color:var(--text3);">'+tName+'</span>');
  lines.push('<span style="color:var(--text3);">DL '+(dl>=0?'+':'')+dl.toFixed(3)+'  DR '+(dr>=0?'+':'')+dr.toFixed(3)+'</span>');
  lines.push('<span style="color:var(--text3);">'+(feed > 0 ? 'F '+Math.round(feed) : (spOn && sm && sm.rapid ? 'FMAX' : 'F 0'))+'</span>');
  lines.push('<span style="color:'+(spOn?'var(--text2)':'var(--text3)')+';">S '+(spOn ? spS : 0)+'</span>');
  var spStr = spOn ? '<span style="color:#5dcaa5;">M3 ●</span>' : '<span style="color:var(--text3);">M5 ○</span>';
  var coStr = coOn ? '<span style="color:#4a9eff;">M8 ●</span>' : '<span style="color:var(--text3);">M9 ○</span>';
  lines.push(spStr+'  '+coStr);
  lines.push('<span style="color:var(--text3);">LBL '+(currentLBL !== null ? currentLBL : '—')+'</span>');
  el.innerHTML = lines.join('<br>');
  el.style.display = '';
}

function clearSimInfoPanel(){
  currentFeed=0; currentSpindle=0; currentLBL=null;
  currentSpindleOn=false; currentCoolantOn=false;
  var el=document.getElementById('simInfoPanel'); if(el) el.style.display='none';
  var _sw=document.getElementById('staleSimWarning'); if(_sw) _sw.style.display='none';
  var _leg=document.getElementById('toolLegend'); if(_leg) _leg.style.display='none';
}

function loop(){
  requestAnimationFrame(loop);
  if(!THREE_OK || !renderer) return;
  if(glContextLost) return;           // skip rendering while the GPU context is gone
  if(renderer.getContext && renderer.getContext().isContextLost && renderer.getContext().isContextLost()) return;
  // Keep the buffer/camera aspect matched to the container every frame so the
  // model never stretches when the pane resizes without a window 'resize' event
  // (live window-drag frames, editor/3D splitter drag, tab/orientation change).
  var resized = (typeof resizeToDisplay==='function') && resizeToDisplay();
  var dt = clock.getDelta();
  if(dt > 0.1) dt = 0.1;
  var isActive = (mode==='running' || mode==='stepping' || atcAnim || (VX && VX.dirty));
  // Throttle idle rendering to ~20fps to save GPU (but always paint a resync frame)
  if(!isActive && !resized && controls && !controls._changed){
    _idleFrames = (_idleFrames||0)+1;
    if(_idleFrames % 3 !== 0) return;
  } else {
    _idleFrames = 0;
  }
  if(mode==='running' || mode==='stepping'){ advance(dt); }
  updateATC(dt);
  if(VX && VX.dirty){ vxRebuildMesh(); }
  if(pendingToolNum && THREE_OK && prog && !atcAnim){
    if(!pendingToolGroup) showPendingTool(pendingToolNum);
    else if(!pendingToolGroup.visible) pendingToolGroup.visible = true;
  }
  if(controls) controls.update();
  renderer.render(scene, camera);
}

function ensurePrepared(){ if(dirty || !prog){ prepare(); } }

function onRun(){
  if(typeof _isMTab==='function' && _isMTab()) mtabSwitch('view');
  if(mode==='paused'){
    // resume after M0 stop — don't reset
    mode='running';
    updateStatus('Running…', true);
    return;
  }
  runValidation();
  if(hasErrors()){ updateStatus('Fix '+errorCount()+' error(s) before running', false); problemsOpen=true; renderProblems(); return; }
  ensurePrepared();
  if(mode==='done' || subIndex>=sub.length){ resetState(); }
  mode='running';
  updateStatus('Running…', true);
}

function onStep(){
  runValidation();
  if(hasErrors()){ updateStatus('Fix '+errorCount()+' error(s) before running', false); problemsOpen=true; renderProblems(); return; }
  ensurePrepared();
  if(mode==='done' || subIndex>=sub.length){ resetState(); }
  if(subIndex < sub.length){
    stepTargetBlock = sub[subIndex].blockIndex;
    mode='stepping';
  }
}

function setQuality(q){
  VX_QUALITY = Math.min(q, VX_RES_LEVELS.length-1);
  VX_RES = VX_RES_LEVELS[VX_QUALITY];
  var btns = document.getElementById('qualityGroup').querySelectorAll('.btn-tog');
  btns.forEach(function(b,i){ b.classList.toggle('active', i===VX_QUALITY); });
  if(prog){ buildScene(prog); resetState(); }
}

function onStop(){
  if(mode==='running'||mode==='stepping'){
    mode='idle';
    updateStatus('Stopped', false);
    // Force mesh rebuild if pending
    if(VX && VX.dirty) vxRebuildMesh();
    // Show refine button if there are cuts
    if(VX && (VX.hasCut || (VX.mesh && VX.mesh.visible !== false))){
      var rb=document.getElementById('refineBtnCanvas');
      if(rb){ rb.style.display=''; rb.disabled=false; rb.textContent='◆ Refine'; }
    }
  }
}

function onReset(){
  ensurePrepared();
  resetState();
  vxReset();
  draw2dFull(false);
}
