// block-form-panel -- verified byte-for-byte identical between web and android repos.

function getBlkClickedAxis(lineText, posInLine){
  var tokens=[], re=/\S+/g, m;
  while((m=re.exec(lineText))!==null){
    tokens.push({start:m.index, end:m.index+m[0].length, upper:m[0].toUpperCase()});
  }
  var valueToks = tokens.filter(function(t){ return /^[XYZ][+-]?\d/.test(t.upper); });
  if(!valueToks.length) return null;
  var clicked=null;
  for(var i=0;i<valueToks.length;i++){
    if(posInLine>=valueToks[i].start && posInLine<=valueToks[i].end){ clicked=valueToks[i]; break; }
  }
  if(!clicked){
    var bestDist=Infinity;
    valueToks.forEach(function(t){
      var d=Math.abs(posInLine-(t.start+t.end)/2);
      if(d<bestDist){ bestDist=d; clicked=t; }
    });
  }
  return clicked.upper.charAt(0);
}

function openBlkFormPanel(lineText, editLineIdx, clickedAxis, clickedRole){
  // editLineIdx set => editing that existing BLK block in place; undefined => new insert at active line
  // clickedAxis/clickedRole (optional) => jump straight to that field instead of the shape picker
  //   clickedRole is 'first' (the 0.1 / CYLINDER line) or 'second' (the 0.2 line)
  BLK.editLine = (editLineIdx!==undefined && editLineIdx!==null) ? editLineIdx : null;
  // Read existing BLK FORM from code
  var code = codeEl.value;
  var allLines = code.split('\n');
  // Figure out the "first" line of the pair (0.1 / CYLINDER) to detect the real shape,
  // even if the line that was clicked/edited is the second (0.2) one.
  var firstLineIdx = BLK.editLine;
  if(firstLineIdx!==null && /^\s*BLK FORM 0\.2/i.test(allLines[firstLineIdx]||'')){
    firstLineIdx = firstLineIdx - 1;
  }
  var firstLineText = (firstLineIdx!==null && allLines[firstLineIdx]!==undefined) ? allLines[firstLineIdx] : lineText;
  var isCyl = /^\s*BLK FORM CYLINDER/i.test(firstLineText);
  BLK.shape = isCyl ? 'CYL' : 'BOX';

  if(!isCyl){
    var m1 = code.match(/BLK FORM 0\.1[^\n]*X([+-]?\d+\.?\d*)[^\n]*Y([+-]?\d+\.?\d*)[^\n]*Z([+-]?\d+\.?\d*)/i);
    var m2 = code.match(/BLK FORM 0\.2[^\n]*X([+-]?\d+\.?\d*)[^\n]*Y([+-]?\d+\.?\d*)[^\n]*Z([+-]?\d+\.?\d*)/i);
    if(m1){ BLK.x0=parseFloat(m1[1]); BLK.y0=parseFloat(m1[2]); BLK.z0=parseFloat(m1[3]); }
    if(m2){ BLK.x1=parseFloat(m2[1]); BLK.y1=parseFloat(m2[2]); BLK.z1=parseFloat(m2[3]); }
  } else {
    var c1 = code.match(/BLK FORM CYLINDER[^\n]*X([+-]?\d+\.?\d*)[^\n]*Y([+-]?\d+\.?\d*)[^\n]*Z([+-]?\d+\.?\d*)/i);
    var c2 = code.match(/BLK FORM 0\.2[^\n]*X([+-]?\d+\.?\d*)[^\n]*Y([+-]?\d+\.?\d*)[^\n]*Z([+-]?\d+\.?\d*)/i);
    if(c1){ BLK.cx=parseFloat(c1[1]); BLK.cy=parseFloat(c1[2]); BLK.cz0=parseFloat(c1[3]); }
    if(c2){ BLK.cr=parseFloat(c2[1]); BLK.cz1=parseFloat(c2[3]); }
  }
  BLK.active = true;

  var targetKey = null;
  if(clickedAxis && clickedRole){
    if(!isCyl){
      targetKey = (clickedRole==='first')
        ? (clickedAxis==='X'?'x0':clickedAxis==='Y'?'y0':'z0')
        : (clickedAxis==='X'?'x1':clickedAxis==='Y'?'y1':'z1');
    } else {
      targetKey = (clickedRole==='first')
        ? (clickedAxis==='X'?'cx':clickedAxis==='Y'?'cy':'cz0')
        : ((clickedAxis==='X'||clickedAxis==='Y') ? 'cr' : 'cz1');
    }
  }
  if(targetKey){
    var fields = BLK.shape==='BOX' ? BLK_FIELDS_BOX : BLK_FIELDS_CYL;
    var idx=-1;
    for(var i=0;i<fields.length;i++){ if(fields[i].key===targetKey){ idx=i; break; } }
    BLK.step = idx>=0 ? idx+1 : 0;
  } else {
    BLK.step = 0;
  }
  renderBlkPanel();
}

function openGotoPanel(){
  ensurePrepared(); // Parse program fresh, update toolCallList
  if(toolCallList.length === 0){
    _toast('No TOOL CALL found in program', true);
    return;
  }
  var panel = document.getElementById('ctxPanel');
  var html = '<div class="ctx-row1"><span style="font-family:var(--mono);font-size:11px;color:var(--text2);">GOTO Tool</span>'
    +'<button style="font-family:var(--mono);font-size:11px;background:none;border:none;color:var(--text3);cursor:pointer;padding:2px 6px;margin-left:auto;" onclick="closeCtxPanel()">✕</button></div>'
    +'<div class="ctx-row2"><select id="gotoSelect" style="font-family:var(--mono);font-size:12px;color:var(--text);padding:6px 8px;background:var(--bg);border:1px solid var(--accent3);border-radius:6px;width:100%;" onchange="if(this.value) {onGoto(this.value); closeCtxPanel();}">'
    +'<option value="">— Select tool call —</option>';
  toolCallList.forEach(function(tc){
    html += '<option value="'+tc.lineNum+'">Line '+tc.lineNum+': TOOL '+tc.toolNum+'</option>';
  });
  html += '</select></div>';
  panel.innerHTML = html;
  setTimeout(function(){ var el=document.getElementById('gotoSelect'); if(el) el.focus(); },50);
}

function renderBlkPanel(){
  var panel = document.getElementById('ctxPanel');
  panel.style.height = '';
  var fields = BLK.shape==='BOX' ? BLK_FIELDS_BOX : BLK_FIELDS_CYL;

  if(BLK.step === 0){
    panel.innerHTML =
      '<div class="ctx-row1">'
      +'<span style="font-family:var(--mono);font-size:11px;color:var(--text2);">BLK FORM</span>'
      +'<button class="fbar-crumb-btn'+(BLK.shape==='BOX'?' active':'')+'" onclick="blkSetShape(\'BOX\')">BOX</button>'
      +'<button class="fbar-crumb-btn'+(BLK.shape==='CYL'?' active':'')+'" onclick="blkSetShape(\'CYL\')">CYL</button>'
      +'<button class="fbar-done" onclick="blkNextStep()">Next ›</button>'
      +'<button style="font-family:var(--mono);font-size:11px;background:none;border:none;color:var(--text3);cursor:pointer;padding:2px 6px;" onclick="closeCtxPanel()">✕</button>'
      +'</div>'
      +'<div class="ctx-row2">'
      +'<span class="fbar-label" style="color:var(--text3);font-size:11px;">'+(BLK.shape==='BOX'?'Rectangular block — define min and max corners':'Cylindrical blank — define center, height and radius')+'</span>'
      +'</div>';
  } else {
    var fi = BLK.step - 1;
    var f = fields[fi];
    var val = BLK[f.key];
    var crumbs = '<button class="fbar-crumb-btn" onclick="BLK.step=0;renderBlkPanel()">'+BLK.shape+'</button>';
    fields.forEach(function(ff, i){
      crumbs += '<button class="fbar-crumb-btn'+(i===fi?' active':'')+'" onclick="BLK.step='+(i+1)+';renderBlkPanel()">'+ff.lbl+'</button>';
    });
    var isLast = fi === fields.length - 1;
    var isEditingExisting = (BLK.editLine !== null);
    var doneAction = isEditingExisting ? 'insertBlkForm()' : (isLast ? 'insertBlkForm()' : 'blkNextStep()');
    var doneLabel  = isEditingExisting ? 'Done' : (isLast ? 'Insert' : 'Done');
    panel.innerHTML =
      '<div class="ctx-row1">' + crumbs
      +'<button style="font-family:var(--mono);font-size:11px;background:none;border:none;color:var(--text3);cursor:pointer;padding:2px 6px;margin-left:auto;" onclick="closeCtxPanel()">✕</button>'
      +'</div>'
      +'<div class="ctx-row2">'
      +'<button class="fbar-nav" onclick="blkStepRel(-1)">&#9664;</button>'
      +'<span class="fbar-pfx">'+f.lbl+'</span>'
      +'<input id="blkFbarVal" type="text" inputmode="decimal" autocomplete="off" autocorrect="off" autocapitalize="off"'
      +' value="'+val+'"'
      +' style="font-family:var(--mono);font-size:14px;color:var(--text);flex:1;min-width:40px;padding:6px 8px;background:var(--bg);border:1px solid var(--accent3);border-radius:6px;outline:none;"'
      +' oninput="blkUpdateVal(this.value)"'
      +' onkeydown="blkKeyDown(event)"'
      +'>'
      +'<button class="fbar-nav" onclick="blkStepRel(1)">&#9654;</button>'
      +'<button class="fbar-done" onclick="'+doneAction+'">'+doneLabel+'</button>'
      +'</div>';
  }
  // Focus once without scrolling the editor container. The input already
  // exists after innerHTML assignment; no delayed focus is needed.
  var _blkInput=document.getElementById('blkFbarVal');
  if(_blkInput&&_blkInput.tagName==='INPUT'){
    _focusEditorControl(_blkInput, function(){ return !!BLK.active; });
    try{ _blkInput.select(); }catch(e){}
  }
  if(typeof window._growCode==='function') requestAnimationFrame(window._growCode);
}

function blkSetShape(s){ BLK.shape=s; renderBlkPanel(); }

function blkCommitVal(){
  var fields = BLK.shape==='BOX' ? BLK_FIELDS_BOX : BLK_FIELDS_CYL;
  var f = fields[BLK.step-1];
  if(f){
    var el=document.getElementById('blkFbarVal');
    var v = (el&&el.tagName==='INPUT') ? el.value : BLK[f.key];
    BLK[f.key] = parseFloat(String(v).replace(',','.'))||0;
  }
}

function blkNextStep(){
  blkCommitVal();
  var fields = BLK.shape==='BOX' ? BLK_FIELDS_BOX : BLK_FIELDS_CYL;
  if(BLK.step === 0){ BLK.step=1; BLK.typing=false; BLK._str=''; renderBlkPanel(); return; }
  if(BLK.step < fields.length){ BLK.step++; BLK.typing=false; BLK._str=''; renderBlkPanel(); }
  else { insertBlkForm(); }
}

function blkStepRel(d){
  blkCommitVal();
  var fields = BLK.shape==='BOX' ? BLK_FIELDS_BOX : BLK_FIELDS_CYL;
  var next = BLK.step + d;
  if(next < 1) next = 1;
  if(next > fields.length) next = fields.length;
  BLK.step = next; BLK.typing=false; BLK._str='';
  renderBlkPanel();
}

function blkRefresh(){
  var el = document.getElementById('blkFbarVal');
  if(!el) return;
  var fields = BLK.shape==='BOX' ? BLK_FIELDS_BOX : BLK_FIELDS_CYL;
  var f = fields[BLK.step-1];
  if(f){ if(el.tagName==="INPUT") el.value=BLK[f.key]; else el.textContent=BLK[f.key]; }
}

function blkConfirmStep(){
  // Editing an existing BLK FORM in place: Enter/Done always commits & closes,
  // no matter which field you're on. Only the brand-new insert wizard steps through fields.
  if(BLK.editLine !== null){ insertBlkForm(); } else { blkNextStep(); }
}

function blkKeyDown(e){
  if(e.key==='Enter'||e.key==='Tab'){ e.preventDefault(); e.shiftKey?blkStepRel(-1):blkConfirmStep(); return; }
  if(e.key==='Escape'){ e.preventDefault(); closeCtxPanel(); return; }
  if(e.key==='-'||e.key==='+'){
    e.preventDefault();
    var el=document.getElementById('blkFbarVal');
    if(!el) return;
    var cur=String(el.value||'0').replace(/^[+\-]/,'');
    var newVal=(e.key==='-'?'-':'+')+cur;
    el.value=newVal;
    blkUpdateVal(newVal);
    return;
  }
}

function blkUpdateVal(v){
  var fields = BLK.shape==='BOX' ? BLK_FIELDS_BOX : BLK_FIELDS_CYL;
  var f = fields[BLK.step-1];
  if(f) BLK[f.key] = parseFloat(String(v).replace(',','.'))||0;
}

function insertBlkForm(){
  _undoPush();
  blkCommitVal();
  function fmt(v){ var n=parseFloat(v)||0; return (n>=0?'+':'')+n; }
  var line1, line2;
  if(BLK.shape==='BOX'){
    line1 = 'BLK FORM 0.1 Z X'+fmt(BLK.x0)+' Y'+fmt(BLK.y0)+' Z'+fmt(BLK.z0);
    line2 = 'BLK FORM 0.2 X'+fmt(BLK.x1)+' Y'+fmt(BLK.y1)+' Z'+fmt(BLK.z1);
  } else {
    // CYL: Heidenhain syntax — 0.1 has center + Z min, 0.2 has radius + Z max
    line1 = 'BLK FORM CYLINDER Z X'+fmt(BLK.cx)+' Y'+fmt(BLK.cy)+' Z'+fmt(BLK.cz0);
    line2 = 'BLK FORM 0.2 X'+fmt(BLK.cr)+' Y'+fmt(BLK.cr)+' Z'+fmt(BLK.cz1);
  }

  var editingLine = BLK.editLine;   // set when the wizard was opened by clicking an existing BLK FORM line
  closeCtxPanel();

  var val = codeEl.value;
  var lines = val.split('\n');

  // The line that was actually clicked/edited may be the SECOND line of the pair (0.2,
  // e.g. clicking X1/Y1/Z1/cr/cz1) — normalize back to the first line (0.1/CYLINDER)
  // so the in-place-edit check below still recognizes it.
  if(editingLine !== undefined && editingLine !== null && editingLine > 0
     && editingLine < lines.length && /^\s*BLK FORM 0\.2/i.test(lines[editingLine])
     && /^\s*BLK FORM (0\.1|CYLINDER)/i.test(lines[editingLine-1])){
    editingLine = editingLine - 1;
  }

  // CASE 1 — editing an existing BLK FORM block in place (opened from that line).
  // Replace the 0.1/CYLINDER line and its following 0.2 line, keeping position.
  if(editingLine !== undefined && editingLine !== null && editingLine >= 0 && editingLine < lines.length
     && /^\s*BLK FORM (0\.1|CYLINDER)/i.test(lines[editingLine])){
    lines[editingLine] = line1;
    if(editingLine+1 < lines.length && /^\s*BLK FORM 0\.2/i.test(lines[editingLine+1])){
      lines[editingLine+1] = line2;
    } else {
      lines.splice(editingLine+1, 0, line2);
    }
    codeEl.value = lines.join('\n');
    var caretPos = lines.slice(0, editingLine+2).join('\n').length;
    try{ codeEl.setSelectionRange(caretPos, caretPos); }catch(e){}
    lastSel = {start:caretPos, end:caretPos};
    dirty=true; updateLineNums(); runValidation(); return;
  }

  // CASE 2 — insert a NEW BLK FORM after the currently active line (like insertKey).
  // Allows placing it anywhere, and stacking two blocks in sequence.
  var pos = (lastSel && lastSel.start!=null) ? lastSel.start : val.length;
  var lineEnd = val.indexOf('\n', pos);
  if(lineEnd === -1) lineEnd = val.length;
  // If there's no BLK FORM yet and the active line is BEGIN PGM (or program start), drop it right after BEGIN.
  var hasAnyBlk = /^\s*BLK FORM/im.test(val);
  if(!hasAnyBlk){
    var beginEnd = val.indexOf('\n', val.indexOf('BEGIN PGM'));
    if(beginEnd !== -1) lineEnd = beginEnd;
  }
  var before = val.slice(0, lineEnd);
  var ins = '\n' + line1 + '\n' + line2;
  codeEl.value = before + ins + val.slice(lineEnd);
  var caret = (before + ins).length;
  try{ codeEl.setSelectionRange(caret, caret); }catch(e){}
  lastSel = {start:caret, end:caret};
  dirty=true; updateLineNums(); runValidation();
}
