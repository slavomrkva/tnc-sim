// Web-only Practice prototype. Main program and exercise drafts stay separate.
var PRACTICE = {open:false, saved:null};
var PRACTICE_KEY = 'tncsim.practice.contour01.v1';
var PRACTICE_STARTER = 'BEGIN PGM CONTOUR01 MM\n\nEND PGM CONTOUR01 MM';
function practiceSave(){
  if(!PRACTICE.open) return;
  try { localStorage.setItem(PRACTICE_KEY, codeEl.value); }
  catch(e){ document.getElementById('practiceSaveStatus').textContent = 'Draft could not be saved. Export your program.'; }
}
function practiceRefresh(){
  dirty = true;
  updateLineNums(); runValidation(); updateHighlightOverlay(); renderIdlePanel();
}
function openPractice(){
  if(PRACTICE.open) return;
  if(LEARN.open) closeLearn();
  _learnEndEditorInput();
  onStop();
  PRACTICE.saved = {code:codeEl.value, name:_docName, undo:_undoStack.slice(), redo:_redoStack.slice()};
  programAutosaveSuspendForLearn();
  PRACTICE.open = true;
  var draft = null;
  try { draft = localStorage.getItem(PRACTICE_KEY); } catch(e){}
  codeEl.value = draft === null ? PRACTICE_STARTER : draft;
  _setDocName('CONTOUR01.H');
  _undoStack = []; _redoStack = [];
  syncEditorSelection(0,0);
  document.getElementById('practicePanel').hidden = false;
  document.body.classList.add('practice-desktop');
  document.getElementById('practiceBtn').setAttribute('aria-pressed','true');
  practiceRefresh();
  _programAutosaveStatus('lesson', 'Practice draft');
}
function closePractice(){
  if(!PRACTICE.open) return;
  _learnEndEditorInput(); onStop(); practiceSave();
  var saved = PRACTICE.saved;
  PRACTICE.open = false;
  document.getElementById('practicePanel').hidden = true;
  document.body.classList.remove('practice-desktop');
  document.getElementById('practiceBtn').setAttribute('aria-pressed','false');
  programAutosaveResumeAfterLearn();
  // In-memory snapshot also protects against unavailable browser storage.
  codeEl.value = saved.code; _setDocName(saved.name);
  _undoStack = saved.undo; _redoStack = saved.redo;
  syncEditorSelection(0,0); practiceRefresh();
  PRACTICE.saved = null;
}
(function(){
  var originalLearn = window.openLearn;
  window.openLearn = function(){ closePractice(); return originalLearn.apply(this,arguments); };
  var originalChanged = window.programAutosaveChanged;
  window.programAutosaveChanged = function(){
    if(PRACTICE.open){ practiceSave(); return; }
    return originalChanged.apply(this,arguments);
  };
  window.addEventListener('pagehide',practiceSave);
  document.addEventListener('visibilitychange',function(){ if(document.hidden) practiceSave(); });
  document.getElementById('code').addEventListener('input',practiceSave);
  document.addEventListener('click',function(event){
    var menu = document.getElementById('programFileMenu');
    if(menu && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown',function(event){
    if(event.key === 'Escape') document.getElementById('programFileMenu').open = false;
  });
})();
