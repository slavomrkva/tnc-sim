// editor-core -- verified byte-for-byte identical between web and android repos.

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
  _currentDemoIdx = idx;
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
  _undoLastVal = codeEl.value; // keep keystroke-snapshot baseline in sync
  dirty=true; updateLineNums(); runValidation();
  renderIdlePanel();
}

function editorRedo(){
  if(!codeEl || _redoStack.length===0) return;
  _undoStack.push(codeEl.value);
  codeEl.value = _redoStack.pop();
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
    _currentDemoIdx = 0; // DEFAULT_CODE is the "Complete Part" demo's code
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
  _currentDemoIdx = -1;
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

function computeBlockNumbers(lines){
  var nums = [];
  var blockNum = -1;
  var prevEndsWithTilde = false;
  var inCycleQRun = false;
  // Matches "Q123=..." AND the no-'=' feed keyword form "Q206 FAUTO"/"Q206 FMAX"
  // (see Q_FAUTO_PARAMS / openQPopup) — both are valid Klartext cycle params.
  var qLineRe = /^Q\d+\s*(?:=|\s+(?:FAUTO|FMAX))/i;
  for(var i=0;i<lines.length;i++){
    if(i===lines.length-1 && lines[i]===''){ nums.push(null); continue; }
    var trimmed = lines[i].replace(/^\s+/, '');
    var isQLine = qLineRe.test(trimmed);
    var isContinuation = prevEndsWithTilde || (inCycleQRun && isQLine);
    if(!isContinuation){ blockNum++; nums.push(blockNum); }
    else nums.push(null);
    prevEndsWithTilde = /~\s*$/.test(lines[i]);
    if(/^CYCL\s+DEF\b/i.test(trimmed)) inCycleQRun = true;
    else if(!(inCycleQRun && isQLine)) inCycleQRun = false;
  }
  return nums;
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

function updateHighlightOverlay(){
  var hl = document.getElementById('hlLayer');
  if(!hl) return;
  var lines = codeEl.value.split('\n');
  var cycleState = {v:false};
  var html = '';
  for(var i=0;i<lines.length;i++){ html += _synHighlightLine(lines[i], cycleState) + '\n'; }
  hl.innerHTML = html;
  hl.scrollTop = codeEl.scrollTop;
  hl.scrollLeft = codeEl.scrollLeft;
}

function errorCount(){ return problemsData.filter(function(p){ return p.sev==='err'; }).length; }

function renderProblems(){
  var panel=document.getElementById('problems');
  var list=document.getElementById('problemsList');
  var countEl=document.getElementById('problemsCount');
  var visible = problemsData.filter(function(p){ return p.line!==_liveEditLine; });
  if(visible.length===0){ panel.style.display='none'; updateLineNums(); return; }
  var errs=visible.filter(function(p){ return p.sev==='err'; }).length, warns=visible.length-errs;
  panel.style.display='flex';
  var label='';
  if(errs) label+='<span class="pc-err">\u25CF '+errs+(errs>1?' errors':' error')+'</span>';
  if(warns) label+=(errs?' \u00B7 ':'')+'<span style="color:#e8a23a">\u25CF '+warns+(warns>1?' warnings':' warning')+'</span>';
  countEl.innerHTML=label;
  var html='';
  for(var j=0;j<problemsData.length;j++){
    var p=problemsData[j];
    if(p.line===_liveEditLine) continue;
    var isFixed = fixedProblems[j+':'+p.msg];
    var rowCls = isFixed ? 'problem fixed' : ('problem '+p.sev);
    var fixBtn = (!isFixed && p.fix) ? '<button class="problem-fix" onclick="event.stopPropagation();applyFix('+j+')">Fix</button>' : '';
    var explainBtn = ''; // Explain disabled (AI removed)
    html+='<div class="'+rowCls+'" onclick="gotoLine('+p.line+')"><span class="pl">L'+(p.line+1)+'</span><span class="pi">'+(isFixed?'\u2714':(p.sev==='err'?'\u2716':'\u26A0'))+'</span><span>'+p.msg+'</span>'+fixBtn+explainBtn+'</div>';
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

function runValidation(){
  problemsData = validateProgram(codeEl.value);
  // Learn mode: validator is fully OFF — the lesson's own Check (with hints)
  // is the feedback channel; error nags would just intimidate a beginner.
  if(typeof LEARN!=='undefined' && LEARN.open){ problemsData = []; }
  renderProblems();
  if(typeof learnUpdateBlank==='function') learnUpdateBlank();
  // update estimated time on every edit
  var tmpProg = parseProgram(codeEl.value);
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
  var text=FM.cmd, ranges=[];
  for(var i=0;i<FM.fields.length;i++){
    var tok=tokenFor(FM.fields[i]);
    if(tok===''){ ranges.push({s:-1,e:-1}); continue; } // optional empty field (e.g. rc not set)
    text+=' ';
    var s=text.length; text+=tok; ranges.push({s:s,e:text.length});
  }
  var schemaLP=BUILDERS[FM.builderKey];
  if(schemaLP && schemaLP.postprocess) text=schemaLP.postprocess(text);
  return {text:text, ranges:ranges};
}

function writeLine(){
  var lp=lineParts();
  var v=codeEl.value;
  var scrollTop=codeEl.scrollTop;
  codeEl.value = v.slice(0,FM.lineStart) + lp.text + v.slice(FM.lineStart+FM.lineLen);
  codeEl.scrollTop=scrollTop;
  lineNums.scrollTop=scrollTop;
  FM.lineLen = lp.text.length;
  FM.ranges = lp.ranges;
  dirty=true; updateLineNums(); runValidation();
}

function isMobile(){ return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent); }

function rcBtn(val,cur){ return '<button class="fbar-drbtn'+(cur===val?' sel':'')+'" onclick="setFieldVal(\''+val+'\')">'+val+'</button>'; }

function updateSelectedLine(){
  var pos = codeEl.selectionStart;
  var lineIdx = codeEl.value.slice(0, pos).split('\n').length - 1;
  if(lineIdx === _selectedLine) return;
  _selectedLine = lineIdx;
  var divs = lineNums.querySelectorAll('.ln');
  for(var i=0;i<divs.length;i++){
    if(i===lineIdx) divs[i].classList.add('selected');
    else divs[i].classList.remove('selected');
  }
}

function syncScrollToLineNums(){
  lineNums.scrollTop = codeEl.scrollTop;
  updateHighlightOverlay();
}

function deleteLineN(n){
  _undoPush(); // Save state before deletion
  var lines=codeEl.value.split('\n');
  if(n<0||n>=lines.length) return;

  // detect if line belongs to a cycle block (CYCL DEF or Q param line)
  var isCycleLine = function(l){ return /^\s*CYCL DEF/i.test(l) || /^\s*Q\d+/i.test(l); };
  var deleteFrom = n, deleteTo = n;

  if(isCycleLine(lines[n])){
    // find start of cycle block (go up to CYCL DEF line)
    var start = n;
    while(start > 0 && /^\s*Q\d+/i.test(lines[start])) start--;
    if(/^\s*CYCL DEF/i.test(lines[start])){
      deleteFrom = start;
      // find end of cycle block (all following Q lines)
      var end = start + 1;
      while(end < lines.length && /^\s*Q\d+/i.test(lines[end])) end++;
      deleteTo = end - 1;
    }
  }

  lines.splice(deleteFrom, deleteTo - deleteFrom + 1);
  codeEl.value=lines.join('\n');
  var newPos=lines.slice(0,deleteFrom).join('\n').length;
  if(deleteFrom > 0) newPos++; // account for newline
  try{ codeEl.setSelectionRange(newPos,newPos); }catch(e){}
  lastSel={start:newPos,end:newPos};
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
  var name = _progFileName(code);
  // Write block numbers back into the text on export, the way the control
  // does — continuation lines (computeBlockNumbers -> null) stay unnumbered.
  var lines = code.split('\n');
  var blockNums = computeBlockNumbers(lines);
  var numbered = lines.map(function(line, i){
    return blockNums[i]===null ? line : formatBlockNum(blockNums[i]) + line;
  }).join('\n');
  _downloadTextFile(numbered, name);
}

function deleteCurrentLine(){
  _undoPush();
  var val=codeEl.value;
  var pos=lastSel.start;
  var lineStart=val.lastIndexOf('\n',pos-1)+1;
  var lineEnd=val.indexOf('\n',pos);
  if(lineEnd===-1) lineEnd=val.length;
  // remove line including newline
  var newVal;
  if(lineStart===0 && lineEnd===val.length){
    newVal='';
  } else if(lineEnd<val.length){
    newVal=val.slice(0,lineStart)+val.slice(lineEnd+1);
  } else {
    newVal=val.slice(0,Math.max(0,lineStart-1));
  }
  codeEl.value=newVal;
  try{ codeEl.setSelectionRange(lineStart,lineStart); }catch(e){}
  lastSel={start:lineStart,end:lineStart};
  dirty=true; updateLineNums(); runValidation();
  if(FM.active) exitFieldMode();
}

function onGoto(lineNum){
  lineNum = parseInt(lineNum);
  if(isNaN(lineNum) || lineNum < 1) return;
  ensurePrepared();
  // Do NOT reset voxels — keep simulation visible
  // Only reset animation state
  subIndex = 0; subProgress = 0; mode='idle';
  activeSrcLine=-1; highlightActiveLine(-1);
  
  // Find toolCallList entry with this lineNum
  var toolCall = null;
  for(var i=0; i<toolCallList.length; i++){
    if(toolCallList[i].lineNum === lineNum){
      toolCall = toolCallList[i];
      break;
    }
  }
  
  if(toolCall && toolCall.subIdx !== undefined){
    subIndex = toolCall.subIdx;
    mode = 'running';
    updateStatus('Running from TOOL '+toolCall.toolNum+' (line '+lineNum+')', true);
  } else {
    _toast('TOOL CALL at line '+lineNum+' not found', true);
  }
}
