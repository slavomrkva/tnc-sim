// field-editing -- verified byte-for-byte identical between web and android repos.

function _qpPanelOpen(){ return !!document.getElementById('qpFbarVal'); }

// The compact native select remains on touch layouts, where it keeps the F
// field on one row. Desktop uses a regular click-to-open menu instead: native
// selects can close as soon as the mouse button is released in this panel.
var _feedMenuOpen=false;

function closeFeedMenu(){
  var menu=document.getElementById('feedModeMenu');
  var button=document.getElementById('feedModeButton');
  if(menu) menu.classList.remove('open');
  if(button) button.setAttribute('aria-expanded','false');
  _feedMenuOpen=false;
}

function toggleFeedMenu(e){
  if(e) e.stopPropagation();
  var menu=document.getElementById('feedModeMenu');
  var button=document.getElementById('feedModeButton');
  if(!menu || !button) return;
  _feedMenuOpen=!_feedMenuOpen;
  menu.classList.toggle('open',_feedMenuOpen);
  button.setAttribute('aria-expanded',_feedMenuOpen?'true':'false');
}

function chooseFeedMode(v){
  closeFeedMenu();
  applyFeedMode(v);
}

document.addEventListener('click', function(e){
  if(!_feedMenuOpen) return;
  var wrap=e.target.closest ? e.target.closest('.fbar-feedmenu-wrap') : null;
  if(!wrap) closeFeedMenu();
});

function _qpFocusMobile(){
  if(!isMobile()) return;
  var mi=document.getElementById('mobileInput');
  if(mi){
    mi.setAttribute('inputmode','text'); mi.value='​'; lastMobileVal='​';
    _focusEditorControl(mi, function(){ return _qpPanelOpen(); });
  }
}

function kpIcon(n){
  var o='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">';
  var dot='fill="currentColor" stroke="none"';
  switch(n){
    case 'line': return o+'<line x1="4" y1="19" x2="20" y2="6"/><circle cx="20" cy="6" r="1.7" '+dot+'/><circle cx="4" cy="19" r="1.7" '+dot+'/></svg>';
    case 'arc':  return o+'<path d="M4 18 A 13 13 0 0 1 18 6"/><circle cx="4" cy="18" r="1.7" '+dot+'/><circle cx="18" cy="6" r="1.7" '+dot+'/></svg>';
    case 'cc':   return o+'<path d="M12 5V19M5 12H19"/><circle cx="12" cy="12" r="3"/></svg>';
    case 'cr':   return o+'<path d="M6 17 A 9 9 0 0 1 18 7"/><line x1="12" y1="12" x2="18" y2="7"/><circle cx="12" cy="12" r="1.5" '+dot+'/></svg>';
    case 'ct':   return o+'<path d="M3 17 H10"/><path d="M10 17 A 8 8 0 0 1 19 9"/></svg>';
    case 'rnd':  return o+'<path d="M5 19 V11 Q5 7 9 7 H19"/></svg>';
    case 'chf':  return o+'<path d="M5 19 V11 L9 7 H19"/></svg>';
    case 'polar':return o+'<circle cx="6" cy="18" r="1.7" '+dot+'/><line x1="6" y1="18" x2="18" y2="7"/><path d="M12 18 A 6 6 0 0 0 9 13"/></svg>';
    case 'incr': return o+'<path d="M12 5 L19 19 H5 Z"/></svg>';
  }
  return '';
}

function buildKeypad(){
  ALL_KEYS=[];
  var html='';

  html+='<div class="kp-sec-title">Path functions</div><div class="kp-row">';
  PATH_KEYS.forEach(function(k){ var idx=ALL_KEYS.push({code:k.code,key:k.l,bld:k.bld})-1; var cls=k.dis?'dis':'off'; html+='<button class="key '+cls+'"'+(k.dis?' disabled':'')+' data-idx="'+idx+'" title="'+k.l+'">'+kpIcon(k.icon)+'<span class="kl">'+k.l+'</span></button>'; });
  PI_KEYS.forEach(function(k){
    var idx=ALL_KEYS.push({code:k.code,key:k.l,mPicker:k.mPicker,qParam:k.qParam})-1;
    var isPiColor = !k.mPicker && !k.qParam;
    var cls=(k.dis?'dis':(isPiColor?'pi-key':'off'))+' pi-key-slot';
    html+='<button class="key '+cls+'"'+(k.dis?' disabled':'')+' data-idx="'+idx+'" title="'+k.sub+'"><span class="kl">'+k.l+'</span></button>';
  });
  html+='</div><div class="kp-sec-title">Program &amp; tools</div><div class="kp-grid prog">';
  PROG_KEYS.forEach(function(k){
    var idx=ALL_KEYS.push({code:k.code,key:k.l,bld:k.bld,cyclPicker:k.cyclPicker,blkForm:k.blkForm,mPicker:k.mPicker,qParam:k.qParam,toolDef:k.toolDef})-1;
    var cls='off prog'+(k.dis?' dis':'');
    html+='<button class="key '+cls+'"'+(k.dis?' disabled':'')+' data-idx="'+idx+'"><span class="kl">'+k.l+'</span></button>';
  });
  html+='</div>';
  var body=document.getElementById('keypad');
  body.innerHTML=html;
  body.addEventListener('mousedown', function(e){
    // ulož selekciu pred tým ako klik zoberie focus z editora
    saveLastSel();
  });
  body.addEventListener('click', function(e){
    var b=e.target.closest ? e.target.closest('.key') : null;
    if(!b) return;
    var i=parseInt(b.getAttribute('data-idx'),10);
    if(isNaN(i)) return;
    var obj=ALL_KEYS[i];
    if(kpHelpMode){
      var helpKey = obj.key || obj.code || '';
      if(obj.cyclPicker) helpKey='CYCL DEF';
      if(obj.blkForm) helpKey='BLK FORM';
      if(obj.mPicker) helpKey='M';
      if(obj.qParam) helpKey='Q';
      showKpHelp(helpKey, b);
      return;
    }
    if(obj.key==='I'){
      toggleIncrementalToken();
    } else if(obj.key==='CC'){
      exitFieldMode();
      enterFieldMode('CC');
    } else if(obj.key==='L'){
      exitFieldMode();
      enterFieldMode('L');
    } else if(FM.active && obj.key==='P'){
      var target = FM.builderKey==='P' ? 'L' : 'P';
      switchFieldMode(target);
    } else if(obj.cyclPicker){
      openCyclePicker();
    } else if(obj.mPicker){
      _mEditLine = -1;
      openMPanel();
    } else if(obj.qParam){
      if(typeof FM!=='undefined'&&FM.active) exitFieldMode(true); // Q inserts a NEW line — leave line editing first
      openQParamPanel();
    } else if(obj.blkForm){
      openBlkFormPanel();
    } else if(obj.bld && BUILDERS[obj.bld]){
      enterFieldMode(obj.bld);
    } else if(BUILDERS[obj.key]){
      enterFieldMode(obj.key);
    } else {
      if(obj.toolDef){ insertToolDef(); }
      else { insertKey(obj.code); }
    }
  });
}

function fieldAllowsIncremental(builderKey, field){
  if(!field || field.type!=='coord') return false;
  var p=String(field.p||'').toUpperCase();
  if(builderKey==='L') return /^[XYZABC]$/.test(p);
  if(builderKey==='CC') return /^[XY]$/.test(p);
  if(builderKey==='P') return p==='PA';
  if(builderKey==='CP') return p==='PA'||p==='Z';
  return false;
}

function toggleIncrementalToken(){
  // Guided editing owns the current parsed field. This is also required on
  // mobile, where the textarea selection is intentionally stale while the
  // custom keyboard is open.
  if(typeof FM!=='undefined' && FM.active){
    var currentField=FM.fields&&FM.fields[FM.idx];
    if(!fieldAllowsIncremental(FM.builderKey,currentField)) return;
    currentField.incr=!currentField.incr;
    selectField(FM.idx);
    return;
  }

  _undoPush();
  var val = codeEl.value;
  var selStart = lastSel.start;
  var selEnd   = lastSel.end;

  // Nájdi začiatok a koniec riadku kde je kurzor/selekcia
  var lineStart = val.lastIndexOf('\n', selStart - 1) + 1;
  var lineEnd   = val.indexOf('\n', selStart);
  if(lineEnd === -1) lineEnd = val.length;
  var line = val.slice(lineStart, lineEnd);

  var trimmed=line.trim();
  var coordRe=null;
  if(/^L\b/i.test(trimmed)) coordRe=/\bI?[XYZABC][+\-]?\d+(?:\.\d+)?/gi;
  else if(/^CC\b/i.test(trimmed)) coordRe=/\bI?[XY][+\-]?\d+(?:\.\d+)?/gi;
  else if(/^LP\b/i.test(trimmed)) coordRe=/\bI?PA[+\-]?\d+(?:\.\d+)?/gi;
  else if(/^CP\b/i.test(trimmed)) coordRe=/\b(?:I?PA|I?Z)[+\-]?\d+(?:\.\d+)?/gi;
  else return;

  // Nájdi coord token ktorý je označený alebo najbližší ku kurzoru
  // Token je napr. X+20, IY-5, Z+0 ...
  var re = coordRe;
  var match, best = null, bestDist = Infinity;
  var localSel = selEnd - lineStart; // koniec selekcie v rámci riadku

  while((match = re.exec(line)) !== null){
    var ms = match.index, me = ms + match[0].length;
    // prioritne ak selekcia prekrýva token
    if(selStart - lineStart <= me && localSel >= ms){
      best = match; bestDist = -1; break;
    }
    var dist = Math.min(Math.abs((selStart - lineStart) - ms), Math.abs((selStart - lineStart) - me));
    if(dist < bestDist){ bestDist = dist; best = match; }
  }

  if(!best) return;

  var tok = best[0];
  var newTok;
  if(/^I/i.test(tok)){
    // IY+60 → Y+60
    newTok = tok.slice(1);
  } else {
    // Y+60 → IY+60
    newTok = 'I' + tok;
  }

  var tokStart = lineStart + best.index;
  var tokEnd   = tokStart + tok.length;
  codeEl.value = val.slice(0, tokStart) + newTok + val.slice(tokEnd);

  // obnov selekciu na nový token
  try{ codeEl.setSelectionRange(tokStart, tokStart + newTok.length); }catch(e){}
  dirty = true; updateLineNums(); runValidation();

  // neruš field mode — len obnov polia z nového obsahu riadku
  if(FM.active){
    // getCaretLine číta z codeEl.selectionStart — nastav ho na tokStart
    codeEl.focus();
    try{ codeEl.setSelectionRange(tokStart+1, tokStart+1); }catch(e){}
    var info=getCaretLine();
    if(info){
      var fields=parseExistingLine(info.lineText, info.builderKey);
      FM.fields=fields;
      FM.lineLen=info.lineLen;
      // nájdi idx aktuálneho poľa podľa bare názvu
      var bareNew = newTok.replace(/^I/i,'').replace(/[+\-].*$/,'');
      var newIdx=0;
      for(var fi=0;fi<fields.length;fi++){
        if(fields[fi].p.toUpperCase()===bareNew){ newIdx=fi; break; }
      }
      selectField(newIdx);
    }
  }
}

function insertKey(code){
  // Block only when field mode or BLK wizard is active (not M/cycle picker panels)
  if(typeof BLK!=='undefined'&&BLK.active) return; // BLK wizard — block
  if(typeof FM!=='undefined'&&FM.active) exitFieldMode(true); // fbar — exit first, then insert
  var pos=lastSel&&lastSel.start!=null?lastSel.start:codeEl.selectionStart;
  var en=lastSel&&lastSel.end!=null?lastSel.end:pos;
  // vlož za koniec aktuálneho riadku
  insertProgramBlock(code,pos,en,{mode:'command'});
}

var _mobileFocusToken = 0;

function _cancelMobileFocus(blur){
  _mobileFocusToken++;
  if(!blur) return;
  var mi=document.getElementById('mobileInput');
  if(mi && document.activeElement===mi){ try{ mi.blur(); }catch(e){} }
}

function _focusEditorControl(el, stillValid){
  if(!el || (stillValid && !stillValid())) return;
  var token=++_mobileFocusToken;
  var panel=document.querySelector('body[data-mtab="editor"] .editor-panel');
  var keep=panel ? panel.scrollTop : 0;
  try{ el.focus({preventScroll:true}); }catch(e){ try{ el.focus(); }catch(e2){} }
  // Fallback for older mobile browsers without preventScroll support. Restore
  // once, after focus, instead of fighting the browser/keyboard animation with
  // a chain of delayed scrollTop writes.
  requestAnimationFrame(function(){
    if(token!==_mobileFocusToken || (stillValid && !stillValid())) return;
    if(panel && Math.abs(panel.scrollTop-keep)>1) panel.scrollTop=keep;
  });
}

function focusMobileInput(){
  if(!isMobile() || !FM.active) return;
  var mi=document.getElementById('mobileInput');
  if(mi){
    // Pick the right on-screen keyboard for the field being edited:
    // coordinates / radii / feeds / M numbers are numeric -> decimal keypad
    // (digits, minus, comma/dot); anything else keeps the full text keyboard.
    var f = FM.fields && FM.fields[FM.idx];
    var numeric = f && (f.type==='coord'||f.type==='num'||f.type==='feed'||f.type==='mval');
    mi.setAttribute('inputmode', numeric ? 'decimal' : 'text');
    mi.value='​'; lastMobileVal='​';
    _focusEditorControl(mi, function(){ return !!FM.active; });
  }
}

function selectField(i){
  FM.idx=i;
  FM.typing=false;
  var savedScroll=codeEl.scrollTop;
  writeLine();
  codeEl.scrollTop=savedScroll;
  lineNums.scrollTop=savedScroll;
  var r=FM.ranges[i];
  if(!isMobile()){
    codeEl.focus();
    if(r && r.s>=0){ try{ codeEl.setSelectionRange(FM.lineStart+r.s, FM.lineStart+r.e); }catch(e){} }
    codeEl.scrollTop=savedScroll;
    lineNums.scrollTop=savedScroll;
  }
  renderFbar();
  focusMobileInput();
}

function renderFbar(){
  var f=FM.fields[FM.idx];
  var bar=document.getElementById('ctxPanel');
  var html='';
  // Row 1: crumb buttons only
  html+='<div class="ctx-row1">';
  FM.fields.forEach(function(g,gi){
    var lbl2=g.type==='rc'?'R':(g.lbl||g.p||'val');
    html+='<button class="fbar-crumb-btn'+(gi===FM.idx?' active':'')+'" onclick="selectField('+gi+')" title="'+g.prompt+'">'+lbl2+'</button>';
  });
  html+='<button style="font-family:var(--mono);font-size:11px;background:none;border:none;color:var(--text3);cursor:pointer;padding:2px 6px;margin-left:auto;" onclick="exitFieldMode()">✕</button>';
  html+='</div>';
  // Row 2: nav + mode + value + Done
  html+='<div class="ctx-row2">';
  html+='<button class="fbar-nav" onclick="fieldPrev()">&#9664;</button>';
  var isFieldIncr=f.type==='coord'&&!!f.incr;
  var polarField=FM.builderKey==='P'||FM.builderKey==='CP';
  var modeLbl=polarField?(isFieldIncr?'POLAR INCR':'POLAR ABS'):(isFieldIncr?'INCR':'ABS');
  html+='<span class="fbar-mode '+(isFieldIncr?'incr':'abs')+'">'+modeLbl+'</span>';
  if(f.type==='tool'){
    var _curT = String(f.val||1);
    var _curTool = getToolByNum(parseInt(_curT));
    var _curLabel = _curTool ? 'T'+_curTool.T+' — '+_curTool.NAME : 'T'+_curT;
    html+='<button onclick="openToolPicker()" style="font-family:var(--mono);font-size:13px;flex:1;padding:8px 12px;background:var(--bg);border:1px solid var(--accent3);border-radius:6px;color:var(--text);cursor:pointer;text-align:left;">'+_curLabel+' ▾</button>';
  } else if(f.type==='dr'){
    html+='<div class="fbar-dr"><button class="fbar-drbtn'+(f.val==='+'?' sel':'')+'" onclick="setFieldVal(\'+\')">DR+</button><button class="fbar-drbtn'+(f.val==='-'?' sel':'')+'" onclick="setFieldVal(\'-\')">DR-</button></div>';
  } else if(f.type==='rc'){
    var rcSkipCls='fbar-drbtn'+(f.val===''?' sel':'');
    html+='<div class="fbar-dr">'+rcBtn('RL',f.val)+rcBtn('R0',f.val)+rcBtn('RR',f.val)+'<button class="'+rcSkipCls+'" onclick="setFieldVal(\'\')">—</button></div>';
  } else {
    html+='<span class="fbar-pfx">'+(f.lbl||f.p||'')+'</span><span class="fbar-val" id="fbarVal" onclick="focusMobileInput()" style="'+(f.val===null?'color:var(--text3)':'')+'">'+(f.val===null?'\u2014':f.val)+'</span>';
    if(f.type==='feed'){
      // Feed has 4 extra actions (Q ref, FMAX, FAUTO, skip) — as separate
      // buttons they wrapped this row on mobile and grew the panel height
      // every time an F field was edited (coord/num fields only have up to 2
      // and don’t wrap). Collapse them into one native dropdown instead.
      var qSel = /Q/i.test(String(f.val||''));
      var curSel = f.val===null?'SKIP':(f.val==='MAX'?'MAX':(f.val==='AUTO'?'AUTO':(qSel?'Q':'')));
      if(isMobile()){
        html+='<select class="fbar-feedmode" onchange="applyFeedMode(this.value)" title="Feed options">';
        html+='<option value=""'+(curSel===''?' selected':'')+'>⋯</option>';
        html+='<option value="MAX"'+(curSel==='MAX'?' selected':'')+'>FMAX</option>';
        html+='<option value="AUTO"'+(curSel==='AUTO'?' selected':'')+'>FAUTO</option>';
        html+='<option value="Q"'+(curSel==='Q'?' selected':'')+'>'+(qSel?'Remove Q':'Insert Q')+'</option>';
        if(f.opt) html+='<option value="SKIP"'+(curSel==='SKIP'?' selected':'')+'>Skip (—)</option>';
        html+='</select>';
      } else {
        var feedLabel=curSel==='MAX'?'FMAX':(curSel==='AUTO'?'FAUTO':(curSel==='Q'?'Q':(curSel==='SKIP'?'—':'⋯')));
        html+='<div class="fbar-feedmenu-wrap">';
        html+='<button type="button" class="fbar-feedmode fbar-feedmode-btn" id="feedModeButton" onclick="toggleFeedMenu(event)" aria-haspopup="menu" aria-expanded="false" title="Feed options">'+feedLabel+' ▾</button>';
        html+='<div class="fbar-feedmenu" id="feedModeMenu" role="menu">';
        html+='<button type="button" role="menuitem" onclick="chooseFeedMode(\'MAX\')">FMAX</button>';
        html+='<button type="button" role="menuitem" onclick="chooseFeedMode(\'AUTO\')">FAUTO</button>';
        html+='<button type="button" role="menuitem" onclick="chooseFeedMode(\'Q\')">'+(qSel?'Remove Q':'Insert Q')+'</button>';
        if(f.opt) html+='<button type="button" role="menuitem" onclick="chooseFeedMode(\'SKIP\')">Skip (—)</button>';
        html+='</div></div>';
      }
    } else {
      // Q parameter reference button (coord/num fields)
      if(f.type==='coord'||f.type==='num'){
        var qSel2 = /Q/i.test(String(f.val||''));
        html+='<button class="fbar-fmax'+(qSel2?' sel':'')+'" onclick="toggleQField()" title="Insert Q parameter reference">Q</button>';
      }
      // Skip button for optional fields (coord/num/mval/etc.)
      if(f.opt){
        var skipBtnCls='fbar-drbtn'+(f.val===null?' sel':'');
        html+='<button class="'+skipBtnCls+'" onclick="setFieldVal(null)" title="Skip this field">—</button>';
      }
    }
  }
  html+='<button class="fbar-nav" onclick="fieldNext()">&#9654;</button>';
  html+='<button class="fbar-done" onclick="exitFieldMode()">Done</button>';
  html+='</div>'; // ctx-row2
  bar.innerHTML=html;
  if(typeof window._growCode==='function') requestAnimationFrame(window._growCode);
}

function refreshSelection(){
  var savedScroll=codeEl.scrollTop;
  writeLine();
  codeEl.scrollTop=savedScroll;
  lineNums.scrollTop=savedScroll;
  var r=FM.ranges[FM.idx];
  if(!isMobile()){
    codeEl.focus();
    try{ codeEl.setSelectionRange(FM.lineStart+r.s, FM.lineStart+r.e); }catch(e){}
    codeEl.scrollTop=savedScroll;
    lineNums.scrollTop=savedScroll;
  }
  var el=document.getElementById('fbarVal');
  if(el){ var fv=FM.fields[FM.idx]; el.textContent=fv.val===null?'—':fv.val; el.style.color=fv.val===null?'var(--text3)':''; }
}

function setFieldVal(v){ FM.fields[FM.idx].val=v; FM.typing=true; selectField(FM.idx); }

function toggleQField(){
  var f=FM.fields[FM.idx];
  var v=(f.val===null||f.val===undefined)?'':String(f.val);
  if(/Q/i.test(v)){
    // Strip Q reference — keep sign if any
    var sign0=(v.charAt(0)==='+'||v.charAt(0)==='-')?v.charAt(0):'';
    f.val=sign0;
  } else {
    // Replace numeric value with sign+Q; user then types the Q number
    var sign=(v.charAt(0)==='+'||v.charAt(0)==='-')?v.charAt(0):'';
    f.val=sign+'Q';
  }
  selectField(FM.idx);
  // IMPORTANT: set typing AFTER selectField — selectField resets FM.typing to false,
  // which would make the next typed digit wipe the 'Q' instead of appending to it.
  FM.typing=true;
}

function applySug(v){
  var f=FM.fields[FM.idx];
  if(f.type==='coord' && (v==='+'||v==='-')){
    var num=f.val.replace(/^[+\-]/,''); if(num==='')num='0'; f.val=v+num;
  } else { f.val=v; }
  FM.typing=true;
  selectField(FM.idx);
}

// Dispatcher for the feed field's collapsed dropdown (renderFbar) — routes to
// the same setters the old FMAX/FAUTO/Q/skip buttons used, so state stays
// identical either way.
function applyFeedMode(v){
  if(v==='') return; // placeholder option, no-op
  if(v==='Q'){ toggleQField(); return; }
  if(v==='SKIP'){ setFieldVal(null); return; }
  applySug(v); // 'MAX' or 'AUTO'
}

function fieldNext(){ if(FM.idx<FM.fields.length-1) selectField(FM.idx+1); else exitFieldMode(); }

function fieldPrev(){ if(FM.idx>0) selectField(FM.idx-1); }

function switchFieldMode(label){
  var schema=BUILDERS[label]; if(!schema) return;
  var newFields=[];
  schema.fields.forEach(function(sf){
    if(sf.type==='mfunc'||sf.type==='_skip') return;
    newFields.push({p:sf.p, type:sf.type, prompt:sf.prompt, opt:sf.opt, val:defVal(sf.type, sf.opt)});
  });
  // preniesť hodnoty zo starých polí do nových podľa typu súradnice
  // napr. L→I: X→IX, Y→IY, Z→IZ a naopak
  FM.fields.forEach(function(old){
    if(old.type!=='coord' || old.val===null) return;
    var bare = old.p.replace(/^I/,''); // IX→X, X→X
    for(var j=0;j<newFields.length;j++){
      var nf=newFields[j];
      if(nf.type!=='coord') continue;
      var nbare = nf.p.replace(/^I/,'');
      if(nbare===bare){ nf.val=old.val; break; }
    }
  });
  // preniesť feed
  var oldFeed=null;
  for(var k=0;k<FM.fields.length;k++){ if(FM.fields[k].type==='feed'){ oldFeed=FM.fields[k].val; break; } }
  if(oldFeed!==null){
    for(var j=0;j<newFields.length;j++){ if(newFields[j].type==='feed'){ newFields[j].val=oldFeed; break; } }
  }
  FM.cmd = schema.cmd||label;
  FM.builderKey = label;
  FM.fields = newFields;
  FM.idx = Math.min(FM.idx, newFields.length-1);
  FM.typing = false;
  selectField(FM.idx);
}

function enterFieldMode(label){
  closeQPopup();
  var schema=BUILDERS[label]; if(!schema) return;
  // Snapshot for undo — one snapshot per field-editing session
  var fields=[];
  schema.fields.forEach(function(sf){ if(sf.type==='mfunc'||sf.type==='_skip') return; fields.push({p:sf.p, type:sf.type, prompt:sf.prompt, opt:sf.opt, val:defVal(sf.type, sf.opt)}); });
  FM={active:true, cmd:(schema.cmd||label), builderKey:label, fields:fields, idx:0, lineStart:0, lineLen:0, ranges:[]};
  var pos=lastSel&&lastSel.start!=null?lastSel.start:codeEl.selectionStart;
  var en=lastSel&&lastSel.end!=null?lastSel.end:pos;
  // vlož za koniec aktuálneho riadku
  var lp=lineParts();
  // After inserting a fresh TOOL CALL, auto-add M3 + M8 on the next two lines —
  // spindle and coolant on is the standard next step and saves a manual insert.
  // Only on insertion (here), never on editing an existing TOOL CALL line.
  var _afterLines = (label==='TOOL CALL') ? '\nM3\nM8' : '';
  var plan=insertProgramBlock(lp.text+_afterLines,pos,en,{mode:'command',selectFirstLine:true});
  FM.lineStart=plan.insertStart;
  FM.lineLen=lp.text.length;
  // fbar always visible
  // position cursor in new line
  selectField(0);
}

function getCaretLine(){
  var pos=codeEl.selectionStart, text=codeEl.value;
  var ls=text.lastIndexOf('\n',pos-1)+1;
  var le=text.indexOf('\n',pos); if(le===-1) le=text.length;
  var lineText=text.slice(ls,le);
  // strip comment for editing but preserve in file
  var ci=lineText.indexOf(';');
  var lineNoComment=ci>=0?lineText.slice(0,ci).trimEnd():lineText;
  var toks=lineNoComment.trim().toUpperCase().split(/\s+/);
  var rawCmd=toks[0]||'';
  var bk=rawCmd;
  if(rawCmd==='LP') bk='P';
  else if(rawCmd==='CP') bk='CP';
  else if(rawCmd==='L'){ bk='L'; }
  else if(rawCmd==='TOOL' && toks[1]==='CALL'){ bk='TOOL CALL'; }
  else if(rawCmd==='CALL' && toks[1]==='LBL'){ bk='LBL CALL'; }
  // Q lines: no field mode, edit directly
  if(!BUILDERS[bk]) return null;
  return {lineStart:ls, lineLen:lineNoComment.length, lineText:lineNoComment, cmd:rawCmd, builderKey:bk};
}

function parseExistingLine(lineText, bk){
  var schema=BUILDERS[bk];
  // Special case: TOOL CALL has format "TOOL CALL <n> Z S<rpm> F<feed>"
  if(bk==='TOOL CALL'){
    var tm=lineText.match(/TOOL CALL\s+(\d+)/i);
    var sm=lineText.match(/\bS(\d+)/i);
    var fm=lineText.match(/\bF(\d+)/i);
    var tdl=lineText.match(/\bDL([+-]?[\d.,]+)/i);
    var tdr=lineText.match(/\bDR([+-]?[\d.,]+)/i);
    return [
      {p:'', type:'tool', prompt:'Tool number', opt:false, val:tm?tm[1]:'1', incr:false, lbl:'T'},
      {p:'S', type:'num', prompt:'Spindle speed (rpm)', opt:false, val:sm?sm[1]:'3000', incr:false},
      {p:'F', type:'num', prompt:'Feed rate (mm/min)', opt:true, val:fm?fm[1]:null, incr:false},
      {p:'DL', type:'coord', prompt:'DL offset (mm)', opt:true, val:tdl?tdl[1]:null, incr:false},
      {p:'DR', type:'coord', prompt:'DR offset (mm)', opt:true, val:tdr?tdr[1]:null, incr:false},
    ];
  }
  // Special case: CALL LBL has format "CALL LBL <n> [REP <count>]" — REP is a
  // separate space-delimited token (not concatenated like F600/S3000), so the
  // generic p+value matching below can't find it.
  if(bk==='LBL CALL'){
    var lm=lineText.match(/CALL LBL\s+(\d+)/i);
    var rm=lineText.match(/\bREP\s+(\d+)/i);
    return [
      {p:'', type:'num', prompt:'Label number', opt:false, val:lm?lm[1]:'1', incr:false, lbl:null},
      {p:'REP', type:'num', prompt:'Repeat count (omit = run once)', opt:true, val:rm?rm[1]:null, incr:false, lbl:null},
    ];
  }
  // For QPARAM: extract value from Q208+5.5 or Q208 +5.5

  var toks=lineText.trim().toUpperCase().split(/\s+/).slice(1);
  var fields=[];
  schema.fields.forEach(function(sf){
    if(sf.type==='mfunc'||sf.type==='_skip') return;
    var val=defVal(sf.type, sf.opt), p=sf.p.toUpperCase(), incr=false;
    for(var k=0;k<toks.length;k++){
      var t=toks[k];
      if(sf.type==='dr' && (t==='DR+'||t==='DR-')){ val=t.charAt(2); break; }
      else if(sf.type==='rc' && (t==='RL'||t==='RR'||t==='R0')){ val=t; break; }
      else if(sf.type==='feed' && t==='FMAX'){ val='MAX'; break; }
      else if(sf.type==='feed' && t==='FAUTO'){ val='AUTO'; break; }
      else if(sf.type==='feed' && p && t.charAt(0)==='F' && /^F(\d|\+?Q\d)/.test(t)){ val=t.slice(1); break; }
      else if(sf.type==='coord' && p && t.indexOf('I'+p)===0 && t.length>p.length+1){ val=t.slice(p.length+1); incr=true; break; }
      else if(sf.type==='coord' && p && t.indexOf(p)===0 && t.length>p.length){ val=t.slice(p.length); break; }
      else if(sf.type==='num' && p && t.indexOf(p)===0 && t.length>p.length){ val=t.slice(p.length); break; }
      else if(sf.type==='num' && p==='' && /^\d/.test(t)){ val=t; break; }
      else if(sf.type==='mval' && t.charAt(0)==='M' && /^M\d+$/.test(t)){ val=t.slice(1); break; }
    }
    fields.push({p:sf.p, type:sf.type, prompt:sf.prompt, opt:sf.opt, val:val, incr:incr, lbl:sf.lbl||null});
  });
  return fields;
}

function findClickedFieldIdx(lineText, bk, posInLine){
  // CALL LBL: "CALL LBL <n> [REP <count>]" — anything at/after REP belongs to
  // the REP field; otherwise it's the label number. (The generic digit-token
  // rule below would wrongly grab the REP count as the label number field.)
  if(bk==='LBL CALL'){
    var repIdx=lineText.toUpperCase().indexOf('REP');
    return (repIdx>=0 && posInLine>=repIdx) ? 1 : 0;
  }
  var schema=BUILDERS[bk];
  var schemaFields=[];
  schema.fields.forEach(function(sf){ if(sf.type!=='mfunc') schemaFields.push(sf); });
  var tokens=[], re=/\S+/g, match, first=true;
  while((match=re.exec(lineText))!==null){
    if(first){ first=false; continue; }
    tokens.push({start:match.index, end:match.index+match[0].length, upper:match[0].toUpperCase()});
  }
  var clickedTok=null, bestDist=Infinity;
  for(var k=0;k<tokens.length;k++){
    if(posInLine>=tokens[k].start && posInLine<=tokens[k].end){ clickedTok=tokens[k]; break; }
    var d=Math.abs(posInLine-(tokens[k].start+tokens[k].end)/2);
    if(d<bestDist){ bestDist=d; clickedTok=tokens[k]; }
  }
  if(!clickedTok) return 0;
  var t=clickedTok.upper;
  for(var fi=0;fi<schemaFields.length;fi++){
    var sf=schemaFields[fi], p=sf.p.toUpperCase();
    if(sf.type==='dr' && (t==='DR+'||t==='DR-')) return fi;
    if(sf.type==='rc' && (t==='RL'||t==='RR'||t==='R0')) return fi;
    if(sf.type==='feed' && (t==='FMAX'||t==='FAUTO'||/^F[\dQ+]/.test(t))) return fi;
    if(sf.type==='coord' && p && (t.indexOf(p)===0 || t.indexOf('I'+p)===0) && t.length>p.length) return fi;
    if(sf.type==='num' && p && t.indexOf(p)===0 && t.length>p.length) return fi;
    if(sf.type==='num' && p==='' && /^\d/.test(t)) return fi;
  }
  return 0;
}

function enterFieldModeOnLine(info){
  closeQPopup();
  // Snapshot for undo — one snapshot per field-editing session
  if(codeEl && (_undoStack.length===0 || _undoStack[_undoStack.length-1]!==codeEl.value)) _undoPush();
  // BLK FORM lines: open BLK wizard instead of fbar (pass line index for in-place edit),
  // jumping straight to the field that was clicked (same as clicking an X/Y/Z on any other line).
  if(/^BLK FORM/i.test(info.lineText.trim())){
    var _blkLineIdx = codeEl.value.slice(0, info.lineStart).split('\n').length - 1;
    var _blkLineTrim = info.lineText.trim();
    var _blkRole = /^BLK FORM 0\.2/i.test(_blkLineTrim) ? 'second' : 'first';
    var _blkPosInLine = codeEl.selectionStart - info.lineStart;
    var _blkAxis = getBlkClickedAxis(info.lineText, _blkPosInLine);
    openBlkFormPanel(_blkLineTrim, _blkLineIdx, _blkAxis, _blkRole);
    return;
  }
  var schema=BUILDERS[info.builderKey];
  var fields=parseExistingLine(info.lineText, info.builderKey);
  var posInLine=codeEl.selectionStart - info.lineStart;
  var startIdx=findClickedFieldIdx(info.lineText, info.builderKey, posInLine);
  var fmCmd = schema.cmd||info.cmd;
  FM={active:true, cmd:fmCmd, builderKey:info.builderKey, fields:fields,
      idx:startIdx, lineStart:info.lineStart, lineLen:info.lineLen, ranges:[]};
  // fbar always visible
  selectField(startIdx);
}

function exitFieldMode(keepCaret){
  if(!FM.active) return;
  var caret=FM.lineStart+FM.lineLen;
  FM.active=false;
  if(typeof _liveEditClear==='function') _liveEditClear();
  _cancelMobileFocus(true);
  if(!keepCaret){ try{ codeEl.setSelectionRange(caret,caret); }catch(e){} }
  var cp=document.getElementById('ctxPanel'); if(cp){ cp.innerHTML=''; }
  renderIdlePanel();
  if(typeof runValidation==='function') runValidation();
}

function saveLastSel(){ lastSel={start:codeEl.selectionStart, end:codeEl.selectionEnd}; }

function _getHelpElAndKey(target){
  // 1. element with data-help attribute
  var el = target.closest ? target.closest('[data-help]') : null;
  if(el) return {el:el, key:el.getAttribute('data-help')};
  // 2. keypad key with data-idx
  var _cp2=document.getElementById('ctxPanel');
  var _idleShowing = !!document.getElementById('_idleUndo');
  if(_cp2 && _cp2.innerHTML.trim()!=='' && !_idleShowing) return; // a real panel (field editor, Q popup, BLK wizard...) is active — ignore keypad
  var keyEl = target.closest ? target.closest('.key[data-idx]') : null;
  if(keyEl){
    var idx = parseInt(keyEl.getAttribute('data-idx'), 10);
    var obj = ALL_KEYS[idx];
    if(obj){
      var k = obj.key || obj.code || '';
      if(obj.cyclPicker) k='CYCL DEF';
      if(obj.blkForm)    k='BLK FORM';
      if(obj.mPicker)    k='M';
      if(obj.qParam)     k='Q';
      if(obj.toolDef)    k='TOOL DEF';
      return {el:keyEl, key:k};
    }
  }
  return null;
}
