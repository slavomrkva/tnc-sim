// panels -- web-specific (diverged from or absent in the other repo).

function renderIdlePanel(){ var panel = document.getElementById('ctxPanel');
  if(!panel) return;
  panel.style.height = '';
  var undoCount = _undoStack ? _undoStack.length : 0;
  var redoCount = _redoStack ? _redoStack.length : 0;
  panel.innerHTML =
    '<div class="ctx-row2">'
    +'<button class="btn" id="_idleUndo" data-help="undo" style="font-size:10px;padding:3px 8px;"'+(undoCount===0?' disabled':'')+'>Undo'+(undoCount>0?' ('+undoCount+')':'')+'</button>'
    +'<button class="btn" id="_idleRedo" data-help="redo" style="font-size:10px;padding:3px 8px;"'+(redoCount===0?' disabled':'')+'>Redo'+(redoCount>0?' ('+redoCount+')':'')+'</button>'
    +'<button class="btn" id="_idleReset" data-help="editor-reset" style="font-size:10px;padding:3px 8px;">Reset</button>'
    +'<button class="btn" id="_idleClear" data-help="editor-clear" style="font-size:10px;padding:3px 8px;">Clear</button>'
    +'<button class="btn" id="_idleZoomOut" data-help="editor-zoom" title="Smaller text" onclick="editorFsBy(-1)" style="font-size:10px;padding:3px 7px;"'+(_editorFs<=_EDITOR_FS_MIN?' disabled':'')+'>A&#8722;</button>'
    +'<button class="btn" id="_idleZoomIn" data-help="editor-zoom" title="Larger text" onclick="editorFsBy(1)" style="font-size:10px;padding:3px 7px;"'+(_editorFs>=_EDITOR_FS_MAX?' disabled':'')+'>A+</button>'
    +'<span style="font-size:9px;font-family:var(--mono);color:var(--text3);align-self:center;">Demo programs:</span>'
    +'<select id="_idleDemo" title="Load a demo program" style="font-size:10px;font-family:var(--mono);background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:5px;padding:3px 4px;cursor:pointer;" onchange="loadDemo(this.value)">'
    +'<option value="" disabled'+(_currentDemoIdx<0?' selected':'')+'>Load\u2026</option>'
    + DEMO_PROGRAMS.map(function(d,i){ return '<option value="'+i+'"'+(i===_currentDemoIdx?' selected':'')+'>'+d.name+'</option>'; }).join('')
    +'</select>'
    +'</div>';
  var bu=document.getElementById('_idleUndo');
  var br=document.getElementById('_idleRedo');
  var bs=document.getElementById('_idleReset');
  var bc=document.getElementById('_idleClear');
  var bzo=document.getElementById('_idleZoomOut');
  var bzi=document.getElementById('_idleZoomIn');
  if(bu) bu.addEventListener('click', function(e){ e.stopPropagation(); editorUndo(); });
  if(br) br.addEventListener('click', function(e){ e.stopPropagation(); editorRedo(); });
  if(bs) bs.addEventListener('click', function(e){ e.stopPropagation(); editorReset(); });
  if(bc) bc.addEventListener('click', function(e){ e.stopPropagation(); editorClear(); });
  if(bzo) bzo.addEventListener('click', function(e){ e.stopPropagation(); editorFsBy(-1); });
  if(bzi) bzi.addEventListener('click', function(e){ e.stopPropagation(); editorFsBy(1); });
  if(typeof window._growCode==='function') requestAnimationFrame(window._growCode);
}

function updateLineNums(){
  if(typeof window._growCode==='function') window._growCode();
  var lines = codeEl.value.split('\n');
  var blockNums = computeBlockNumbers(lines);
  var marks = {};
  for(var k=0;k<problemsData.length;k++){
    var pr=problemsData[k];
    if(pr.line===_liveEditLine) continue; // line is being edited right now
    var isFixed=fixedProblems[k+':'+pr.msg];
    if(isFixed){ if(!marks[pr.line]) marks[pr.line]='fixed'; }
    else if(marks[pr.line]!=='err') marks[pr.line]=pr.sev;
  }
  var html='';
  for(var i=0;i<lines.length;i++){
    var cls='ln'; if(marks[i]==='err')cls+=' err'; else if(marks[i]==='warn')cls+=' warn'; else if(marks[i]==='fixed')cls+=' fixed';
    var numLabel = blockNums[i]===null ? '' : blockNums[i];
    html += '<div class="'+cls+'"><button class="ln-del" onclick="deleteLineN('+i+')" tabindex="-1">&#10005;</button>'+numLabel+'</div>';
  }
  lineNums.innerHTML = '<div style="padding:10px 0 200px;">' + html + '</div>';
  blockCountEl.textContent = lines.length + ' ' + t('editor.blocks', 'blocks');
  var _progTitleEl = document.getElementById('progTitleName');
  // Header follows the document name (demo/import/export/clear), not the body's
  // BEGIN PGM name. Fall back to the parsed name only if _docName is unset.
  if(_progTitleEl) _progTitleEl.textContent = (typeof _docName!=='undefined' && _docName) ? _docName : _progFileName(codeEl.value);
  // restore highlights
  if(_selectedLine >= 0){
    var _divs = lineNums.querySelectorAll('.ln');
    if(_divs[_selectedLine]) _divs[_selectedLine].classList.add('selected');
  }
  // sync scroll position
  lineNums.scrollTop = codeEl.scrollTop;
  updateHighlightOverlay();
}
