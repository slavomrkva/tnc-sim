// qparam-panel -- verified byte-for-byte identical between web and android repos.

function openQPopup(lineIdx){
  var lines = codeEl.value.split('\n');
  var line = lines[lineIdx];
  if(!line) return;
  var m = line.match(/^\s*(Q\d+)\s*(?:=\s*([+-]?(?:Q\d+|[\d.]+)|FAUTO|FMAX|AUTO)|\s+(FAUTO|FMAX))/i);
  if(!m) return;
  // exit L field mode if active
  if(FM.active) exitFieldMode(true);
  _qPopupLine = lineIdx;
  var qkey = m[1].toUpperCase();
  var qval = (m[2]||m[3]||'0').toUpperCase();
  var ci = line.indexOf(';');
  var label = ci>=0 ? line.slice(ci+1).trim() : '';
  var isFauto = Q_FAUTO_PARAMS.indexOf(qkey) >= 0;

  // render into ctx-panel
  var panel = document.getElementById('ctxPanel');
  var fmaxBtn = isFauto ? '<button class="fbar-fmax" onclick="qPanelSetVal(\'FAUTO\')">FAUTO</button>' : '';
  var qRefBtn = '<button class="fbar-fmax" onclick="qPanelInsertQ()" title="Insert Q parameter reference">Q</button>';
  panel.innerHTML = '<div class="ctx-row1"><span style="font-family:var(--mono);font-size:11px;color:var(--text3);">'+(label||qkey)+'</span><button style="margin-left:auto;font-family:var(--mono);font-size:11px;background:none;border:none;color:var(--text3);cursor:pointer;padding:2px 8px;" onclick="closeQPopup()">✕</button></div>'
    + '<div class="ctx-row2">'
    + '<input id="qPanelInput" type="text" inputmode="decimal" autocomplete="off" autocapitalize="characters" value="'+qval+'"'
    + ' style="font-family:var(--mono);font-size:14px;font-weight:600;background:var(--surface2);border:1px solid var(--accent);border-radius:5px;color:var(--text);padding:3px 10px;width:90px;outline:none;text-align:right;">'
    + qRefBtn
    + fmaxBtn
    + '<button class="fbar-done" onclick="qPanelConfirm()">Done</button>'
    + '</div>';

  var inp = document.getElementById('qPanelInput');
  if(inp){
    inp.addEventListener('keydown', function(e){
      if(e.key==='Enter'){ e.preventDefault(); qPanelConfirm(); return; }
      if(e.key==='Escape'){ closeQPopup(); return; }
      if(e.key==='-' || e.key==='+'){
        // The input opens with its whole value selected — without this, the browser's
        // default behavior would replace that selection with just "+"/"-", wiping the
        // digits. Strip any existing sign and prepend the new one instead.
        e.preventDefault();
        inp.value = applyNumericSign(inp.value,e.key);
        try{ inp.setSelectionRange(inp.value.length, inp.value.length); }catch(err){}
        return;
      }
    });
    inp.addEventListener('beforeinput', function(e){
      if(!e || (e.data!=='-' && e.data!=='+')) return;
      e.preventDefault();
      inp.value=applyNumericSign(inp.value,e.data);
      try{ inp.setSelectionRange(inp.value.length,inp.value.length); }catch(err){}
    });
    inp.addEventListener('input', function(){
      var normalized=normalizeTrailingNumericSign(inp.value);
      if(inp.value!==normalized) inp.value=normalized;
    });
    _focusEditorControl(inp, function(){ return _qPopupLine>=0; });
    try{ inp.select(); }catch(e){}
  }
}

function closeQPopup(){
  var panel = document.getElementById('ctxPanel');
  if(panel){ panel.innerHTML = ''; renderIdlePanel(); }
  _qPopupLine = -1;
}

function qPanelSetVal(v){
  document.getElementById('qPanelInput').value = v;
  qPanelConfirm();
}

function qPanelInsertQ(){
  var inp = document.getElementById('qPanelInput');
  if(!inp) return;
  var v = inp.value.trim();
  // Toggle: if already a Q reference, strip it back to empty; else replace value with sign+Q
  if(/Q/i.test(v)){
    inp.value = v.replace(/Q\d*/ig,'');
  } else {
    var sign = (v.charAt(0)==='+'||v.charAt(0)==='-') ? v.charAt(0) : '';
    inp.value = sign + 'Q';
  }
  inp.focus();
  // place cursor at end so the user types the Q number
  var len = inp.value.length;
  try{ inp.setSelectionRange(len, len); }catch(e){}
}

function qPanelConfirm(){
  if(_qPopupLine < 0){ closeQPopup(); return; }
  var inp = document.getElementById('qPanelInput');
  var newVal = inp.value.trim().toUpperCase();
  if(!newVal || newVal==='Q' || newVal==='+Q' || newVal==='-Q'){ inp.style.borderColor='#ff5d5d'; inp.focus(); return; }
  if(codeEl && (_undoStack.length===0 || _undoStack[_undoStack.length-1]!==codeEl.value)) _undoPush();
  var lines = codeEl.value.split('\n');
  var line = lines[_qPopupLine];
  line = line.replace(/^(\s*Q\d+)\s*(?:=\s*[+-]?(?:Q\d+|[\d.]+)|\s+FAUTO|\s*=\s*FAUTO|\s*=\s*FMAX|\s*=\s*AUTO)/i, function(match, p1){
    var prefix = p1.trimEnd();
    if(newVal==='FMAX') return prefix + '=+9999';
    if(newVal==='FAUTO') return prefix + ' FAUTO';
    return prefix + '=' + formatSignedNum(newVal);
  });
  lines[_qPopupLine] = line;
  codeEl.value = lines.join('\n');
  dirty=true; updateLineNums(); runValidation();
  closeQPopup();
}

function openQParamPanel(){
  QP.num='1'; QP.op='='; QP.val=''; QP.fn=''; QP.step=0; QP._typing=false;
  renderQParamPanel();
}

function renderQParamPanel(){
  var panel = document.getElementById('ctxPanel');
  panel.style.height = '';
  QP._typing = false; // fresh step: first typed char replaces the predefined value

  if(QP.step===0){
    // Step 0: Q number
    panel.innerHTML =
      '<div class="ctx-row1">'
      +'<span style="font-family:var(--mono);font-size:11px;color:var(--text2);">Q parameter</span>'
      +'<button class="fbar-done" onclick="QP.step=1;renderQParamPanel()">Next ›</button>'
      +'</div>'
      +'<div class="ctx-row2">'
      +'<span class="fbar-pfx">Q</span>'
      +'<span class="fbar-val" id="qpFbarVal">'+QP.num+'</span>'
      +'<span style="font-family:var(--mono);font-size:10px;color:var(--text3);margin-left:8px;">parameter number</span>'
      +'</div>';
  } else if(QP.step===1){
    // Step 1: operator
    var opBtns = QP_OPS.map(function(o){
      return '<button class="fbar-drbtn'+(QP.op===o.op?' sel':'')+'" onclick="QP.op=\''+o.op+'\';renderQParamPanel();" title="'+o.desc+'">'+o.label+'</button>';
    }).join('');
    panel.innerHTML =
      '<div class="ctx-row1">'
      +'<button class="fbar-crumb-btn" onclick="QP.step=0;renderQParamPanel()">Q'+QP.num+'</button>'
      +'<button class="fbar-done" onclick="QP.step=2;renderQParamPanel()">Next ›</button>'
      +'</div>'
      +'<div class="ctx-row2">'
      +'<span class="fbar-label">Operation</span>'
      +'<div class="fbar-dr">'+opBtns+'</div>'
      +'</div>';
  } else if(QP.step===2){
    // Step 2: function (optional) + value
    var fnBtns = '<button class="fbar-drbtn'+(QP.fn===''?' sel':'')+'" onclick="QP.fn=\'\';renderQParamPanel()">none</button>'
      + QP_FNS.map(function(f){
        return '<button class="fbar-drbtn'+(QP.fn===f.fn?' sel':'')+'" onclick="QP.fn=\''+f.fn+'\';renderQParamPanel()">'+f.label+'</button>';
      }).join('');
    panel.innerHTML =
      '<div class="ctx-row1">'
      +'<button class="fbar-crumb-btn" onclick="QP.step=0;renderQParamPanel()">Q'+QP.num+'</button>'
      +'<button class="fbar-crumb-btn active">'+QP.op+'</button>'
      +'<button class="fbar-done" onclick="qpInsert()">Insert</button>'
      +'</div>'
      +'<div class="ctx-row2" style="flex-wrap:wrap;gap:4px;">'
      +'<div style="display:flex;align-items:center;gap:4px;width:100%;">'
      +(QP.fn?'<span class="fbar-pfx">'+QP.fn+'</span>':'')
      +'<span class="fbar-val" id="qpFbarVal">'+(QP.val||'0')+'</span>'
      +'</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:3px;">'+fnBtns+'</div>'
      +'</div>';
  }

  // keyboard focus — on mobile, focus the hidden input so the soft keyboard types into the panel
  _qpFocusMobile();
}

function qpInsert(){
  var fn = QP.fn ? QP.fn+'(' : '';
  var fnClose = QP.fn ? ')' : '';
  var val = QP.val || '0';
  var line;
  if(QP.op==='='){
    line = 'Q'+QP.num+' = '+fn+val+fnClose;
  } else {
    // compound: Q1 =+ Q2*3 → Q1 = Q1 + Q2*3
    var opChar = QP.op.slice(1); // '+', '-', '*', '/'
    line = 'Q'+QP.num+' = Q'+QP.num+' '+opChar+' '+fn+val+fnClose;
  }
  closeCtxPanel();
  insertKey(line);
}
