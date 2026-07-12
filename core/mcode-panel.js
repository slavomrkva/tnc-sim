// mcode-panel -- verified byte-for-byte identical between web and android repos.

function openMCodesList(){
  var old = document.getElementById('_mCodesOverlay');
  if(old){ old.remove(); return; }

  var overlay = document.createElement('div');
  overlay.id = '_mCodesOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);z-index:99998;display:flex;align-items:center;justify-content:center;';

  var rows = M_DEFS.map(function(d){
    return '<div style="display:flex;gap:14px;padding:8px 20px;border-bottom:1px solid rgba(255,255,255,.06);">'
      +'<span style="font-family:var(--mono);font-size:12px;color:var(--accent3);width:46px;flex-shrink:0;">'+d.m+'</span>'
      +'<span style="font-family:var(--mono);font-size:12px;color:var(--text2);">'+d.desc+'</span>'
      +'</div>';
  }).join('');

  overlay.innerHTML = '<div style="background:var(--surface2);border-radius:14px;width:90%;max-width:460px;max-height:75vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.5);">'
    +'<div style="position:sticky;top:0;background:var(--surface2);padding:14px 20px;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:12px;color:var(--text3);display:flex;justify-content:space-between;align-items:center;">'
    +'<span>All defined M functions ('+M_DEFS.length+')</span>'
    +'<button onclick="document.getElementById(\'_mCodesOverlay\').remove()" style="background:none;border:none;color:var(--text3);font-size:20px;cursor:pointer;padding:0 4px;">\u2715</button>'
    +'</div>'
    +rows
    +'</div>';

  overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function openMPanelEdit(lineIdx){
  _mEditLine = lineIdx;
  openMPanel();
}

function _mDescFor(code){
  var up = String(code).toUpperCase();
  for(var i=0;i<M_DEFS.length;i++){ if(M_DEFS[i].m===up) return M_DEFS[i].desc; }
  return null;
}

function openMPanel(){
  var panel = document.getElementById('ctxPanel');
  panel.style.height = '';
  var panelDefs = M_PANEL_CODES.map(function(c){
    return M_DEFS.filter(function(d){ return d.m===c; })[0];
  }).filter(Boolean);

  // Editing an existing line: preselect it in the dropdown if it's one of the curated
  // codes, otherwise drop it into the manual field (it's a non-standard M).
  var curCode = null;
  if(_mEditLine >= 0){
    var lines = codeEl.value.split('\n');
    var cm = (lines[_mEditLine]||'').match(/^\s*(M\d+)/i);
    curCode = cm ? cm[1].toUpperCase() : null;
  }
  var curInPanel = curCode && M_PANEL_CODES.indexOf(curCode) >= 0;
  var curNum = (curCode && !curInPanel) ? curCode.replace(/^M/i,'') : '';

  var opts = '<option value="">— Select M function —</option>' + panelDefs.map(function(d){
    return '<option value="'+d.m+'"'+(curInPanel && d.m===curCode?' selected':'')+'>'+d.m+' — '+d.desc+'</option>';
  }).join('');

  panel.innerHTML =
    '<div class="ctx-row1">'
    +'<span style="font-family:var(--mono);font-size:11px;color:var(--text2);">M function</span>'
    +'<button style="margin-left:auto;font-family:var(--mono);font-size:11px;background:none;border:none;color:var(--text3);cursor:pointer;padding:2px 6px;" onclick="closeCtxPanel()">&#10005;</button>'
    +'</div>'
    +'<div class="ctx-row2" style="flex-direction:column;align-items:stretch;gap:6px;">'
    +'<select id="mPicker" style="width:100%;font-family:var(--mono);font-size:12px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:5px 8px;cursor:pointer;" onchange="if(this.value){document.getElementById(\'mCustomInput\').value=this.value.replace(/^M/i,\'\');} _mManualDescUpdate();">'
    +opts
    +'</select>'
    +'<div style="display:flex;align-items:center;gap:4px;">'
    +'<span style="font-family:var(--mono);font-size:11px;color:var(--text3);">M</span>'
    +'<input id="mCustomInput" type="text" inputmode="numeric" placeholder="…" value="'+curNum+'" style="width:60px;font-family:var(--mono);font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:4px 8px;outline:none;" oninput="_mManualDescUpdate()" onkeydown="if(event.key===\'Enter\'){event.preventDefault();_mPanelConfirm();}">'
    +'<button class="fbar-done" onclick="_mPanelConfirm()">'+(_mEditLine>=0?'Done':'Insert')+'</button>'
    +'</div>'
    +'<span id="mManualDesc" style="font-family:var(--mono);font-size:11px;color:var(--text3);min-height:14px;"></span>'
    +'</div>';
  setTimeout(function(){ var i=document.getElementById('mCustomInput'); if(i){ i.focus(); } _mManualDescUpdate(); }, 30);
}

function _mManualDescUpdate(){
  var input = document.getElementById('mCustomInput');
  var descEl = document.getElementById('mManualDesc');
  if(!input || !descEl) return;
  var v = input.value.trim();
  if(!v){ descEl.textContent = ''; return; }
  var desc = _mDescFor('M'+v.replace(/^M/i,''));
  descEl.textContent = desc ? desc : 'Unknown M function';
}

function _mPanelConfirm(){
  var picker = document.getElementById('mPicker');
  var input  = document.getElementById('mCustomInput');
  var v = (input && input.value.trim()) ? input.value.trim().replace(/^M/i,'') : (picker && picker.value ? picker.value.replace(/^M/i,'') : '');
  if(!v) return;
  closeCtxPanel();
  _mCommit('M'+v);
}

function _mCommit(code){
  if(_mEditLine >= 0){ _replaceMOnLine(code); }
  else {
    exitFieldMode(true);
    var desc = _mDescFor(code);
    insertKey(desc ? code+' ; '+desc : code);
  }
}

function _replaceMOnLine(code){
  if(_mEditLine < 0) return;
  _undoPush();
  var lines = codeEl.value.split('\n');
  var orig = lines[_mEditLine] || '';
  var ci = orig.indexOf(';');
  var comment = ci>=0 ? orig.slice(ci) : '';
  var newDesc = _mDescFor(code);
  if(newDesc){ comment = '; ' + newDesc; }
  lines[_mEditLine] = code + (comment ? ' '+comment : '');
  codeEl.value = lines.join('\n');
  _mEditLine = -1;
  dirty=true; updateLineNums(); runValidation();
}
