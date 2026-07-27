// editor-core -- web implementation; Android port intentionally deferred until acceptance.

function highlightActiveLine(lineIdx){
  var divs = lineNums.querySelectorAll('.ln');
  for(var i=0;i<divs.length;i++){
    if(i===lineIdx) divs[i].classList.add('active');
    else divs[i].classList.remove('active');
  }
  if(lineIdx >= 0){
    var lh = parseFloat(getComputedStyle(codeEl).lineHeight) || 21.6;
    var scrollTo = lineIdx * lh - codeEl.clientHeight / 2 + lh / 2;
    scrollTo = Math.max(0, scrollTo);
    codeEl.scrollTop = scrollTo;
    lineNums.scrollTop = scrollTo;
  }
}

function hasErrors(){ for(var i=0;i<problemsData.length;i++){ if(problemsData[i].sev==='err') return true; } return false; }

function pFloat(val){ return parseFloat((val+'').replace(',', '.')); }

function pInt(val){ return parseInt((val+'').replace(',', '')); }

// Numeric editors keep the sign at the front. Minus is a toggle so a second
// tap turns a negative value back into a positive one; plus selects an explicit
// positive sign. BLK FORM, cycle and guided-field editors share this behaviour.
function applyNumericSign(value, sign){
  var text=String(value===null || value===undefined ? '' : value);
  var bare=text.replace(/^[+\-]/,'');
  if(sign==='-') return text.charAt(0)==='-' ? bare : '-'+bare;
  return '+'+bare;
}

// Some soft keyboards do not expose beforeinput. In that case their sign is
// already appended to the value, so normalize that trailing sign as a fallback.
function normalizeTrailingNumericSign(value){
  var text=String(value===null || value===undefined ? '' : value);
  var match=text.match(/([+\-])$/);
  return match ? applyNumericSign(text.slice(0,-1),match[1]) : text;
}

function signFmt(v){ 
  v=String(v).trim(); 
  // Normalize comma to dot
  v = v.replace(',', '.');
  if(v==='') return v; 
  if(v.charAt(0)==='+'||v.charAt(0)==='-') return v; 
  return '+'+v; 
}

function formatSignedNum(val){
  val = String(val).trim();
  if(val === '' || val === '0') return '+0';
  // Normalize comma to dot
  val = val.replace(',', '.');
  // Q parameter reference (Q5, +Q12, -Q3) — pass through with sign
  var qm = val.match(/^([+-]?)(Q\d+)$/i);
  if(qm) return (qm[1]==='-'?'-':'+') + qm[2].toUpperCase();
  // Extract sign and absolute value
  var sign = val.charAt(0) === '-' ? '-' : '+';
  var numStr = val.replace(/^[+-]/, '');
  var num = pFloat(numStr);
  // Return with proper sign
  return (num < 0 ? '-' : sign) + Math.abs(num).toString();
}

function changeSpeed(d){
  speedIdx = Math.max(0, Math.min(SPEEDS.length-1, speedIdx+d));
  speedValEl.textContent = SPEEDS[speedIdx].toFixed(SPEEDS[speedIdx]<1?2:1) + '\u00D7';
}

function loadDemo(idx){
  idx = parseInt(idx);
  if(isNaN(idx) || idx < 0 || idx >= DEMO_PROGRAMS.length) return;
  var demo = DEMO_PROGRAMS[idx];
  _undoPush();
  codeEl.value = demo.code;
  syncEditorSelection(0,0);
  _currentDemoIdx = idx;
  _setDocName(demo.name); // header shows the picked demo's friendly name
  dirty=true; updateLineNums(); runValidation();
  renderIdlePanel();
}

function _undoPush(){
  if(!codeEl) return;
  // dedupe — don't store the same state twice in a row
  if(_undoStack.length && _undoStack[_undoStack.length-1]===codeEl.value) return;
  _undoStack.push(codeEl.value);
  if(_undoStack.length > _undoMax) _undoStack.shift();
  _redoStack = []; // new action clears redo
  // refresh idle panel so the Undo button shows the current count immediately
  if(document.getElementById('_idleUndo')) renderIdlePanel();
}

function editorUndo(){
  if(!codeEl || _undoStack.length===0) return;
  _redoStack.push(codeEl.value);
  codeEl.value = _undoStack.pop();
  syncEditorSelection(Math.min(codeEl.selectionStart,codeEl.value.length));
  _undoLastVal = codeEl.value; // keep keystroke-snapshot baseline in sync
  dirty=true; updateLineNums(); runValidation();
  renderIdlePanel();
}

function editorRedo(){
  if(!codeEl || _redoStack.length===0) return;
  _undoStack.push(codeEl.value);
  codeEl.value = _redoStack.pop();
  syncEditorSelection(Math.min(codeEl.selectionStart,codeEl.value.length));
  _undoLastVal = codeEl.value;
  dirty=true; updateLineNums(); runValidation();
  renderIdlePanel();
}

function _toast(msg, isError){
  // Mobile-safe notification — alert() can be silently blocked on file:// and in PWA mode.
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:9999999;'
    + 'max-width:86%;padding:12px 18px;border-radius:8px;font-family:var(--mono),monospace;font-size:13px;'
    + 'line-height:1.4;white-space:pre-wrap;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.4);'
    + 'background:'+(isError?'#3a1414':'#14241a')+';color:'+(isError?'#ff8a8a':'#9fe0b0')+';'
    + 'border:1px solid '+(isError?'#7a2020':'#2a5a3a')+';opacity:0;transition:opacity .2s;';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function(){ t.style.opacity = '1'; });
  setTimeout(function(){ t.style.opacity='0'; setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 250); }, isError?4200:2600);
}

function _applyEditorFs(){
  // Set the CSS variable used by #code and .line-nums, plus inline fallback.
  document.documentElement.style.setProperty('--editor-fs', _editorFs + 'px');
  var ta = document.getElementById('code');
  if(ta){
    // setProperty with priority 'important' beats any stylesheet rule, and
    // text-size-adjust stops mobile browsers auto-resizing textarea text.
    ta.style.setProperty('font-size', _editorFs + 'px', 'important');
    ta.style.setProperty('-webkit-text-size-adjust', 'none', 'important');
    ta.style.setProperty('text-size-adjust', 'none', 'important');
  }
  var ln = document.getElementById('lineNums');
  if(ln) ln.style.setProperty('font-size', _editorFs + 'px', 'important');
  var bzo = document.getElementById('_idleZoomOut');
  var bzi = document.getElementById('_idleZoomIn');
  if(bzo) bzo.disabled = (_editorFs <= _EDITOR_FS_MIN);
  if(bzi) bzi.disabled = (_editorFs >= _EDITOR_FS_MAX);
}

function editorFsBy(step){
  _editorFs = Math.max(_EDITOR_FS_MIN, Math.min(_EDITOR_FS_MAX, _editorFs + step));
  _applyEditorFs();
}

function _editorConfirm(msg, onYes){
  // custom confirm — avoids mobile file:// confirm() blocking
  var old = document.getElementById('_editorConfirmDlg');
  if(old) old.remove();
  var dlg = document.createElement('div');
  dlg.id = '_editorConfirmDlg';
  dlg.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:999999;display:flex;align-items:center;justify-content:center;';
  dlg.innerHTML = '<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:20px 24px;font-family:var(--mono);font-size:13px;color:var(--text);max-width:280px;text-align:center;">'
    +'<div style="margin-bottom:16px;">'+msg+'</div>'
    +'<div style="display:flex;gap:8px;justify-content:center;">'
    +'<button id="_ecYes" style="font-family:var(--mono);font-size:12px;padding:6px 18px;background:var(--accent);color:#fff;border:none;border-radius:5px;cursor:pointer;">OK</button>'
    +'<button id="_ecNo" style="font-family:var(--mono);font-size:12px;padding:6px 18px;background:none;color:var(--text2);border:1px solid var(--border);border-radius:5px;cursor:pointer;">Cancel</button>'
    +'</div></div>';
  document.body.appendChild(dlg);
  document.getElementById('_ecYes').addEventListener('click', function(){ dlg.remove(); onYes(); });
  document.getElementById('_ecNo').addEventListener('click',  function(){ dlg.remove(); });
}

function editorReset(){
  if(!codeEl) return;
  _editorConfirm('Reset to default program?', function(){
    _undoPush();
    codeEl.value = DEFAULT_CODE;
    syncEditorSelection(0,0);
    _currentDemoIdx = 0; // DEFAULT_CODE is the "Complete Part" demo's code
    _setDocName((typeof DEMO_PROGRAMS!=='undefined' && DEMO_PROGRAMS[0]) ? DEMO_PROGRAMS[0].name : 'program.H');
    dirty=true; updateLineNums(); runValidation();
    renderIdlePanel();
  });
}

function editorClear(){
  if(!codeEl) return;
  _undoPush();
  // Keep BEGIN PGM and END PGM so validator stays happy
  var m = codeEl.value.match(/^(BEGIN PGM[^\n]*)/m);
  var m2 = codeEl.value.match(/(END PGM[^\n]*)$/m);
  var begin = m ? m[1] : 'BEGIN PGM PROGRAM MM';
  var end   = m2 ? m2[1] : 'END PGM PROGRAM MM';
  codeEl.value = begin + '\n' + end;
  syncEditorSelection(0,0);
  _currentDemoIdx = -1;
  _setDocName('program.H'); // new unsaved program uses the default name
  dirty=true; updateLineNums(); runValidation();
  renderIdlePanel();
}

function _caretLineIdx(){
  try{ return codeEl.value.slice(0, codeEl.selectionStart).split('\n').length - 1; }
  catch(e){ return -1; }
}

function _liveEditClear(){
  if(_liveEditLine !== -1){ _liveEditLine = -1; renderProblems(); }
}

function analyzeProgramRows(lines){
  var rows=[], blocks=[];
  var prevEndsWithTilde=false;
  var qLineRe=/^Q\d+\s*(?:=|\s+(?:FAUTO|FMAX))/i;

  for(var i=0;i<lines.length;i++){
    if(i===lines.length-1 && lines[i]===''){
      rows.push({kind:'trailing-artifact',blockIndex:null,blockNo:null,anchor:i,end:i,type:'trailing-artifact'});
      continue;
    }

    var trimmed=lines[i].replace(/^\s+/,'');
    var previous=blocks.length ? blocks[blocks.length-1] : null;
    var continuesCycle=!!(previous && previous.type==='cycle' && qLineRe.test(trimmed));
    var isContinuation=!!previous && (prevEndsWithTilde || continuesCycle);

    if(isContinuation){
      previous.end=i;
      rows.push({kind:'continuation',blockIndex:blocks.length-1,blockNo:previous.blockNo,anchor:previous.anchor,end:i,type:previous.type});
    } else {
      var upper=trimmed.toUpperCase();
      var type=/^BEGIN PGM\b/.test(upper)?'begin':
        (/^END PGM\b/.test(upper)?'end':
        (/^CYCL\s+DEF\b/.test(upper)?'cycle':
        (trimmed===''?'placeholder':
        (/^;/.test(trimmed)?'comment':'block'))));
      var block={blockNo:blocks.length,anchor:i,end:i,type:type};
      blocks.push(block);
      rows.push({kind:type==='placeholder'?'placeholder':'anchor',blockIndex:blocks.length-1,blockNo:block.blockNo,anchor:i,end:i,type:type});
    }
    prevEndsWithTilde=/~\s*$/.test(lines[i]);
  }

  for(var r=0;r<rows.length;r++){
    if(rows[r].blockIndex!==null) rows[r].end=blocks[rows[r].blockIndex].end;
  }
  return {rows:rows,blocks:blocks};
}

function computeBlockNumbers(lines){
  return analyzeProgramRows(lines).rows.map(function(row){
    return row.kind==='continuation'||row.kind==='trailing-artifact' ? null : row.blockNo;
  });
}

function _programLineIndexAt(value,pos){
  pos=Math.max(0,Math.min(value.length,Number(pos)||0));
  return value.slice(0,pos).split('\n').length-1;
}

function _programLineOffset(lines,index){
  var pos=0;
  for(var i=0;i<index;i++) pos+=lines[i].length+1;
  return pos;
}

function syncEditorSelection(start,end){
  if(!codeEl) return;
  var max=codeEl.value.length;
  start=Math.max(0,Math.min(max,Number(start)||0));
  end=end===undefined?start:Math.max(start,Math.min(max,Number(end)||0));
  try{ codeEl.setSelectionRange(start,end); }catch(e){}
  lastSel={start:start,end:end};
  _selectedLine=_programLineIndexAt(codeEl.value,start);
}

function planProgramBlockInsertion(value,start,end,text,mode){
  value=String(value||'');
  start=Math.max(0,Math.min(value.length,Number(start)||0));
  end=end===undefined?start:Math.max(start,Math.min(value.length,Number(end)||0));
  var lines=value.split('\n');
  var model=analyzeProgramRows(lines);
  var startRow=model.rows[_programLineIndexAt(value,start)];
  var endRow=model.rows[_programLineIndexAt(value,end)];
  var blockIndex=startRow&&startRow.blockIndex;
  if(blockIndex===null||blockIndex===undefined) blockIndex=model.blocks.length-1;
  var block=model.blocks[blockIndex];
  if(!block){
    if(mode==='enter') return {changed:false,value:value,caret:start,reason:'no-block'};
    var firstText=String(text);
    return {
      changed:firstText!==value,
      value:firstText,
      caret:firstText.length,
      insertStart:0,
      insertEnd:firstText.length,
      firstLineEnd:(firstText.split('\n')[0]||'').length,
      insertLine:0,
      replacedBlock:null
    };
  }

  if(mode==='enter' && endRow && endRow.blockIndex!==null && endRow.blockIndex!==blockIndex){
    return {changed:false,value:value,caret:start,reason:'cross-block-selection'};
  }
  if(mode==='enter' && block.type==='end'){
    return {changed:false,value:value,caret:start,reason:'end-pgm'};
  }

  var insertIndex,deleteCount=0,targetBlock=block;
  var next=model.blocks[blockIndex+1];
  var previous=model.blocks[blockIndex-1];

  if(mode==='enter'){
    if(block.type==='placeholder'){
      return {changed:false,value:value,caret:_programLineOffset(lines,block.anchor),reason:'reuse-placeholder'};
    }
    if(next && next.type==='placeholder' && next.anchor===block.end+1){
      return {changed:false,value:value,caret:_programLineOffset(lines,next.anchor),reason:'reuse-placeholder'};
    }
    insertIndex=block.end+1;
    text='';
  } else if(block.type==='placeholder'){
    insertIndex=block.anchor;
    deleteCount=block.end-block.anchor+1;
  } else if(block.type==='end'){
    if(previous && previous.type==='placeholder' && previous.end+1===block.anchor){
      targetBlock=previous;
      insertIndex=previous.anchor;
      deleteCount=previous.end-previous.anchor+1;
    } else {
      insertIndex=block.anchor;
    }
  } else if(next && next.type==='placeholder' && next.anchor===block.end+1){
    targetBlock=next;
    insertIndex=next.anchor;
    deleteCount=next.end-next.anchor+1;
  } else {
    insertIndex=block.end+1;
  }

  var inserted=String(text).split('\n');
  lines.splice.apply(lines,[insertIndex,deleteCount].concat(inserted));
  var newValue=lines.join('\n');
  var insertStart=_programLineOffset(lines,insertIndex);
  return {
    changed:newValue!==value,
    value:newValue,
    caret:insertStart+String(text).length,
    insertStart:insertStart,
    insertEnd:insertStart+String(text).length,
    firstLineEnd:insertStart+inserted[0].length,
    insertLine:insertIndex,
    replacedBlock:targetBlock
  };
}

function insertProgramBlock(text,position,selectionEnd,options){
  options=options||{};
  var plan=planProgramBlockInsertion(codeEl.value,position,selectionEnd,text,options.mode||'command');
  if(plan.changed){
    _undoPush();
    codeEl.value=plan.value;
    var selStart=options.selectFirstLine?plan.insertStart:plan.caret;
    var selEnd=options.selectFirstLine?plan.firstLineEnd:selStart;
    syncEditorSelection(selStart,selEnd);
    dirty=true;
    updateLineNums();
    runValidation();
  } else {
    syncEditorSelection(plan.caret,plan.caret);
    updateLineNums();
  }
  return plan;
}

function editorInsertBlankAfterActiveBlock(){
  if(!codeEl) return false;
  var plan=insertProgramBlock('',codeEl.selectionStart,codeEl.selectionEnd,{mode:'enter'});
  return !!plan.changed;
}

function problemBlockNumber(lineIndex){
  var model=analyzeProgramRows(codeEl.value.split('\n'));
  var row=model.rows[Math.max(0,Math.min(model.rows.length-1,lineIndex))];
  if(row && row.blockNo!==null) return row.blockNo;
  return model.blocks.length ? model.blocks[model.blocks.length-1].blockNo : 0;
}

function formatBlockNum(n){
  var s = String(n);
  while(s.length < 2) s += ' ';
  return s + ' ';
}

function _progFileName(code){
  var m = code.match(/^\s*\d*\s*BEGIN PGM (\S+)/im);
  return m ? m[1] + '.H' : 'program.H';
}

// Header document name. Deliberately decoupled from the program body's
// BEGIN PGM name so it follows the FILE identity, not the code: it is set when
// a demo is picked (its friendly name), a file is imported (its filename) or
// exported (the saved filename). Clear/new resets it to the default. This is
// why importing "mypart.H" shows mypart.H even though the body still reads
// BEGIN PGM PROGRAM. app.js seeds it with the starter demo's name at startup.
var _docName = 'program.H';
function _setDocName(name){
  _docName = name || 'program.H';
  var el = document.getElementById('progTitleName');
  if(el) el.textContent = _docName;
  if(typeof programAutosaveChanged === 'function') programAutosaveChanged();
}

function updateHighlightOverlay(){
  var hl = document.getElementById('hlLayer');
  if(!hl) return;
  var lines = codeEl.value.split('\n');
  var cycleState = {v:false};
  var answer = typeof learnAnswerLineRange === 'function' ? learnAnswerLineRange() : null;
  var html = '';
  for(var i=0;i<lines.length;i++){
    var lineHtml = _synHighlightLine(lines[i], cycleState);
    if(answer && i >= answer.start && i <= answer.end){
      var edge = (i === answer.start ? ' learn-answer-first' : '')
        + (i === answer.end ? ' learn-answer-last' : '');
      lineHtml = '<span class="learn-answer-line' + edge + '">'
        + (lineHtml || '&#8203;') + '</span>';
    }
    html += lineHtml + '\n';
  }
  hl.innerHTML = html;
  hl.scrollTop = codeEl.scrollTop;
  hl.scrollLeft = codeEl.scrollLeft;
}

function errorCount(){ return problemsData.filter(function(p){ return p.sev==='err'; }).length; }

function _isLiveRadiusCompEdit(){
  var guided=typeof FM!=='undefined' && FM.active && FM.builderKey==='L';
  var direct=typeof _liveEditLine!=='undefined' && _liveEditLine>=0;
  return !!((guided||direct) && codeEl && /\bR[LR]\b/.test(codeEl.value));
}

function _isRadiusCompDiagnostic(problem){
  return /radius comp\.|compensation radius|compensated cutting run|tool radius too large/i.test(String(problem&&problem.msg||''));
}

function _problemsForDisplay(allProblems){
  var liveRadiusComp=_isLiveRadiusCompEdit();
  var hiddenRadiusComp=false;
  var visible=[];
  for(var i=0;i<allProblems.length;i++){
    var problem=allProblems[i];
    if(problem.line===_liveEditLine) continue;
    if(liveRadiusComp && _isRadiusCompDiagnostic(problem)){
      hiddenRadiusComp=true;
      continue;
    }
    visible.push(problem);
  }
  if(hiddenRadiusComp){
    visible.push({line:typeof _liveEditLine==='number'&&_liveEditLine>=0?_liveEditLine:0,
      sev:'warn',msg:'Radius compensation will be checked when editing is complete or simulation starts'});
  }
  return visible;
}

function renderProblems(){
  var panel=document.getElementById('problems');
  var list=document.getElementById('problemsList');
  var countEl=document.getElementById('problemsCount');
  var visible = _problemsForDisplay(problemsData);
  if(visible.length===0){ panel.style.display='none'; updateLineNums(); return; }
  var errs=visible.filter(function(p){ return p.sev==='err'; }).length, warns=visible.length-errs;
  panel.style.display='flex';
  var label='';
  if(errs) label+='<span class="pc-err">\u25CF '+errs+(errs>1?' errors':' error')+'</span>';
  if(warns) label+=(errs?' \u00B7 ':'')+'<span style="color:#e8a23a">\u25CF '+warns+(warns>1?' warnings':' warning')+'</span>';
  countEl.innerHTML=label;
  var html='';
  for(var j=0;j<visible.length;j++){
    var p=visible[j];
    var problemIndex=problemsData.indexOf(p);
    var isFixed = problemIndex>=0 && fixedProblems[problemIndex+':'+p.msg];
    var rowCls = isFixed ? 'problem fixed' : ('problem '+p.sev);
    var fixBtn = (!isFixed && p.fix && problemIndex>=0) ? '<button class="problem-fix" onclick="event.stopPropagation();applyFix('+problemIndex+')">Fix</button>' : '';
    var explainBtn = ''; // Explain disabled (AI removed)
    html+='<div class="'+rowCls+'" onclick="gotoLine('+p.line+')"><span class="pl">B'+problemBlockNumber(p.line)+'</span><span class="pi">'+(isFixed?'\u2714':(p.sev==='err'?'\u2716':'\u26A0'))+'</span><span>'+p.msg+'</span>'+fixBtn+explainBtn+'</div>';
  }
  list.style.display = problemsOpen?'block':'none';
  list.innerHTML=html;
  updateLineNums();
}

function toggleProblems(){
  problemsOpen = !problemsOpen;
  var list = document.getElementById('problemsList');
  if(list) list.style.display = problemsOpen ? 'block' : 'none';
}

function gotoLine(n){
  var lines=codeEl.value.split('\n');
  var pos=0; for(var i=0;i<n && i<lines.length;i++){ pos+=lines[i].length+1; }
  codeEl.focus();
  codeEl.setSelectionRange(pos, pos+(lines[n]?lines[n].length:0));
  syncEditorSelection(pos,pos+(lines[n]?lines[n].length:0));
  var lh=parseFloat(getComputedStyle(codeEl).lineHeight)||20;
  codeEl.scrollTop = Math.max(0, n*lh - codeEl.clientHeight/2);
  lineNums.scrollTop = codeEl.scrollTop;
}

function applyFix(idx){
  _undoPush();
  if(!problemsData[idx] || !problemsData[idx].fix) return;
  var lines = codeEl.value.split('\n');
  var fixedLine = problemsData[idx].fix(lines);
  codeEl.value = lines.join('\n');
  syncEditorSelection(_programLineOffset(lines,Math.max(0,fixedLine)));
  fixedProblems[idx+':'+problemsData[idx].msg] = true;
  dirty = true;
  updateLineNums();
  // flash the fixed line
  setTimeout(function(){
    var divs = lineNums ? lineNums.querySelectorAll('.ln') : [];
    if(divs[fixedLine]) { divs[fixedLine].classList.add('flash'); setTimeout(function(){ divs[fixedLine].classList.remove('flash'); },1200); }
  },50);
  runValidation();
}

function runValidation(liveEdit){
  if(typeof programAutosaveChanged === 'function') programAutosaveChanged();
  // liveEdit defaults to true: nearly every caller runs while the user edits.
  // Run/Step (sim-controls) pass false so radius-compensation checks — the
  // completeness checks in validateProgram and the rc-tagged run diagnostics
  // below — surface only at simulation start, not while a contour is still
  // being typed.
  if(liveEdit===undefined) liveEdit=true;
  problemsData = validateProgram(codeEl.value, liveEdit);
  // Some errors can only be known after constructing the actual compensated
  // toolpath (for example an inner corner that the effective tool radius cannot
  // enter). Surface those parser diagnostics in the same Problems panel so Run
  // is blocked explicitly instead of silently omitting the affected blocks.
  var tmpProg = parseProgram(codeEl.value);
  // Learn mode: validator is fully OFF — the lesson's own Check (with hints)
  // is the feedback channel; error nags would just intimidate a beginner.
  if(typeof LEARN!=='undefined' && LEARN.open){ problemsData = []; }
  else if(tmpProg && tmpProg.problems && tmpProg.problems.length){
    var seenProblems={};
    problemsData.forEach(function(p){ seenProblems[p.line+'|'+p.sev+'|'+p.msg]=true; });
    tmpProg.problems.forEach(function(p){
      // Defer only "contour not finished yet" comp diagnostics while editing;
      // genuine geometry errors (tool radius too large, etc.) still show live.
      // The deferred ones return at Run/Step (liveEdit=false).
      if(liveEdit && p.rcDefer) return;
      var key=p.line+'|'+p.sev+'|'+p.msg;
      if(!seenProblems[key]){ problemsData.push(p); seenProblems[key]=true; }
    });
  }
  renderProblems();
  if(typeof learnUpdateBlank==='function') learnUpdateBlank();
  // update estimated time on every edit
  calcEstTime(tmpProg.sub);
}

function defVal(type, opt){ if(type==='feed') return opt ? null : '500'; if(type==='dr')return '+'; if(type==='rc')return ''; if(type==='coord' && opt) return null; if(type==='mval' && opt) return null; if(type==='num' && opt) return null; if(type==='tool') return '1'; return '0'; }

function tokenFor(f){
  if(f.type==='dr') return 'DR'+f.val;
  if(f.type==='tool') return String(f.val||1);
  if(f.type==='feed'){ if(f.val===null || f.val==='') return ''; var fv=f.val.toUpperCase(); return (fv==='MAX'||fv==='FMAX'||fv==='9999')?'FMAX':'F'+f.val; }
  if(f.p==='REP'){ if(f.val===null || f.val==='') return ''; return 'REP '+f.val; }
  if(f.type==='mval'){ if(f.val===null || f.val==='') return ''; return 'M'+f.val; }
  if(f.type==='rc') return f.val; // 'RL','RR','R0' or '' (omit)
  if(f.type==='coord'){ if(f.val===null || f.val==='') return ''; var _cv=(f.val==='+'||f.val==='-')?f.val+'0':f.val; return (f.incr?'I':'')+f.p+signFmt(_cv); }
  if(f.type==='num'){ if(f.val===null || f.val==='') return ''; return f.p+f.val; }
  if(/^Q\d+$/.test(f.p)) return f.p+'='+formatSignedNum(f.val);
  return f.p+f.val;
}

function sanitizeVal(v,type){
  v = String(v).replace(/q/g,'Q'); // normalize q → Q
  if(type==='coord'){ v = v.replace(/[^0-9.,+\-Q]/g,''); return v.replace(/,/g, '.'); }
  if(type==='num'){ v = v.replace(/[^0-9.,Q+\-]/g,''); return v.replace(/,/g, '.'); }
  if(type==='feed') return v.toUpperCase().replace(/[^0-9.MAXQ]/g,'');
  return v;
}

function lineParts(){
  var text=FM.cmd, tokens=[];
  for(var i=0;i<FM.fields.length;i++){
    var tok=tokenFor(FM.fields[i]);
    tokens.push(tok);
    if(tok==='') continue; // optional empty field (e.g. rc not set)
    text+=' '+tok;
  }
  var schemaLP=BUILDERS[FM.builderKey];
  if(schemaLP && schemaLP.postprocess) text=schemaLP.postprocess(text);
  // Calculate ranges from the FINAL line. TOOL CALL's postprocess inserts the
  // fixed spindle-axis token "Z" after the tool number; ranges calculated
  // before that transform pointed two characters early (S3000 -> "Z S30").
  var ranges=[], searchFrom=FM.cmd.length;
  for(var j=0;j<tokens.length;j++){
    var token=tokens[j];
    if(token===''){ ranges.push({s:-1,e:-1}); continue; }
    var at=text.indexOf(token,searchFrom);
    ranges.push(at<0 ? {s:-1,e:-1} : {s:at,e:at+token.length});
    if(at>=0) searchFrom=at+token.length;
  }
  return {text:text, ranges:ranges};
}

function writeLine(){
  var lp=lineParts();
  var v=codeEl.value;
  if(typeof _liveEditLine!=='undefined') _liveEditLine=v.slice(0,FM.lineStart).split('\n').length-1;
  var scrollTop=codeEl.scrollTop;
  codeEl.value = v.slice(0,FM.lineStart) + lp.text + v.slice(FM.lineStart+FM.lineLen);
  codeEl.scrollTop=scrollTop;
  lineNums.scrollTop=scrollTop;
  FM.lineLen = lp.text.length;
  FM.ranges = lp.ranges;
  dirty=true; updateLineNums(); runValidation();
}

function isMobile(){
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || /(?:^|[?&])mobileDebug=1(?:&|$)/.test(location.search);
}

function rcBtn(val,cur){ return '<button class="fbar-drbtn'+(cur===val?' sel':'')+'" onclick="setFieldVal(\''+val+'\')">'+val+'</button>'; }

function updateSelectedLine(){
  var pos = codeEl.selectionStart;
  var lineIdx = codeEl.value.slice(0, pos).split('\n').length - 1;
  _selectedLine = lineIdx;
  lastSel={start:codeEl.selectionStart,end:codeEl.selectionEnd};
  var model=analyzeProgramRows(codeEl.value.split('\n'));
  var selectedRow=model.rows[lineIdx];
  var selectedBlock=selectedRow?selectedRow.blockIndex:null;
  var divs = lineNums.querySelectorAll('.ln');
  for(var i=0;i<divs.length;i++){
    if(selectedBlock!==null && model.rows[i] && model.rows[i].blockIndex===selectedBlock) divs[i].classList.add('selected');
    else divs[i].classList.remove('selected');
  }
}

function syncScrollToLineNums(){
  lineNums.scrollTop = codeEl.scrollTop;
  updateHighlightOverlay();
}

function deleteLineN(n,confirmed){
  var lines=codeEl.value.split('\n');
  if(n<0||n>=lines.length) return;
  var model=analyzeProgramRows(lines);
  var row=model.rows[n];
  if(!row||row.blockIndex===null) return;
  var block=model.blocks[row.blockIndex];
  if(block.type==='begin'||block.type==='end') return;
  if(block.type==='cycle'&&!confirmed){
    _editorConfirm('Delete the entire cycle?',function(){ deleteLineN(n,true); });
    return;
  }
  _undoPush();
  var deleteFrom=block.anchor,deleteTo=block.end;
  lines.splice(deleteFrom, deleteTo - deleteFrom + 1);
  codeEl.value=lines.join('\n');
  var newPos=lines.slice(0,deleteFrom).join('\n').length;
  if(deleteFrom > 0) newPos++;
  syncEditorSelection(newPos,newPos);
  dirty=true; updateLineNums(); runValidation();
  if(FM.active) exitFieldMode();
}

function importProgram(){
  var inp = document.getElementById('importFileInput');
  if(inp){ inp.value=''; inp.click(); }
}

function onImportFile(e){
  var file = e.target.files && e.target.files[0];
  if(!file){ return; }
  var reader = new FileReader();
  reader.onload = function(ev){
    try{
      _undoPush();
      // Real Heidenhain .H exports prefix every block with its block number
      // (e.g. "12 TOOL CALL 5 ..."). Our gutter regenerates that numbering
      // itself (computeBlockNumbers) and the validator/3D engine expect
      // commands to start the line, so strip the embedded numbers on import.
      // Continuation lines of a multi-line block (no leading number in the
      // source either) are left untouched.
      codeEl.value = String(ev.target.result).split('\n')
        .map(function(l){ return l.replace(/^[ \t]*\d+[ \t]+/, ''); })
        .join('\n');
      syncEditorSelection(0,0);
      _currentDemoIdx = -1;            // imported file is not a demo
      _setDocName(file.name);          // header shows the imported filename
      dirty = true; updateLineNums(); runValidation();
      renderIdlePanel();
    }catch(err){ _toast('Import failed: '+err.message, true); }
    e.target.value = ''; // reset AFTER load so the same file can be picked again
  };
  reader.onerror = function(){ _toast('Could not read file: '+(reader.error&&reader.error.message||'unknown error'), true); e.target.value=''; };
  reader.readAsText(file);
}

function _downloadTextFile(text, filename){
  var blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  // Detect whether the <a download> mechanism actually works (iOS Safari does not).
  var a = document.createElement('a');
  var supportsDownload = ('download' in a);
  if(supportsDownload){
    var url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);   // must be in DOM for some mobile browsers
    a.click();
    // delay revoke + removal so the download actually starts on mobile
    setTimeout(function(){
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
    return;
  }
  // Fallback (iOS Safari / no download support): open the file content for manual save/share.
  try{
    var reader = new FileReader();
    reader.onload = function(ev){
      var w = window.open(ev.target.result, '_blank');
      if(!w) _showExportFallback(text, filename);
    };
    reader.readAsDataURL(blob);
  }catch(err){
    _showExportFallback(text, filename);
  }
}

function _showExportFallback(text, filename){
  // Last-resort: show a textarea the user can select-all & copy, plus Web Share if available.
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.85);display:flex;flex-direction:column;padding:16px;gap:10px;';
  ov.innerHTML =
    '<div style="color:#fff;font-family:var(--mono),monospace;font-size:13px;">'+filename+' — select all and copy, or use Share</div>'
    + '<textarea readonly style="flex:1;width:100%;font-family:monospace;font-size:12px;background:#111;color:#eee;border:1px solid #444;border-radius:6px;padding:8px;"></textarea>'
    + '<div style="display:flex;gap:8px;">'
    + '<button id="_expShare" style="flex:1;padding:10px;border:0;border-radius:6px;background:#4a9eff;color:#fff;font-size:14px;">Share</button>'
    + '<button id="_expClose" style="flex:1;padding:10px;border:0;border-radius:6px;background:#555;color:#fff;font-size:14px;">Close</button>'
    + '</div>';
  document.body.appendChild(ov);
  var ta = ov.querySelector('textarea'); ta.value = text; ta.focus(); ta.select();
  ov.querySelector('#_expClose').onclick = function(){ document.body.removeChild(ov); };
  var shareBtn = ov.querySelector('#_expShare');
  if(navigator.share){
    shareBtn.onclick = function(){
      navigator.share({title:filename, text:text}).catch(function(){});
    };
  } else {
    shareBtn.style.display = 'none';
  }
}

function exportProgram(){
  var code = codeEl.value;
  // Round-trip an imported/exported filename (…​.H); otherwise fall back to the
  // BEGIN PGM-derived name. Then reflect the saved filename in the header.
  var name = (_docName && /\.H$/i.test(_docName)) ? _docName : _progFileName(code);
  _setDocName(name);
  // Write block numbers back into the text on export, the way the control
  // does — continuation lines (computeBlockNumbers -> null) stay unnumbered.
  var lines = code.split('\n');
  if(lines.length>1 && lines[lines.length-1]==='') lines.pop();
  var blockNums = computeBlockNumbers(lines);
  var numbered = lines.map(function(line, i){
    return blockNums[i]===null ? line : formatBlockNum(blockNums[i]) + line;
  }).join('\n');
  _downloadTextFile(numbered, name);
}

function deleteCurrentLine(){
  var pos=lastSel&&lastSel.start!=null?lastSel.start:codeEl.selectionStart;
  deleteLineN(_programLineIndexAt(codeEl.value,pos));
}
