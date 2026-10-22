// Web-only Practice prototype. Main program and exercise drafts stay separate.
var PRACTICE = {open:false, saved:null};
var PRACTICE_KEY = 'tncsim.practice.blk01.v1';
var PRACTICE_STARTER = 'BEGIN PGM BLANK01 MM\n\nEND PGM BLANK01 MM';
function practiceSave(){
  if(!PRACTICE.open) return;
  document.getElementById('practiceFeedback').hidden = true;
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
  _setDocName('BLANK01.H');
  _undoStack = []; _redoStack = [];
  syncEditorSelection(0,0);
  document.getElementById('practicePanel').hidden = false;
  document.body.classList.add('practice-desktop');
  document.getElementById('practiceBtn').setAttribute('aria-pressed','true');
  practiceRefresh();
  document.getElementById('practiceFeedback').hidden = true;
  document.getElementById('practiceHint').hidden = true;
  if(_isMTab()) mtabSwitch('editor');
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
// Check numeric corner values, not a single expected answer string. The strict
// exercise grammar prevents the parser's permissive defaults from grading omissions.
function practiceGrade(code){
  var rows = code.split(/\r\n?|\n/).map(function(row){
    return row.replace(/;.*$/, '').trim().replace(/\s+/g, ' ').toUpperCase();
  }).filter(Boolean);
  if(rows.length !== 4 || !/^BEGIN PGM \S+ MM$/.test(rows[0]) ||
     rows[3] !== rows[0].replace(/^BEGIN/, 'END'))
    return {ok:false, message:'Keep matching BEGIN / END PGM blocks in MM and add exactly two BLK FORM blocks between them.'};
  var corners = [];
  for(var i=1;i<=2;i++){
    var prefix = i===1 ? /^BLK FORM 0\.1 Z / : /^BLK FORM 0\.2 /;
    if(!prefix.test(rows[i])) return {ok:false,message:'Use BLK FORM 0.1 Z for MIN, followed by BLK FORM 0.2 for MAX.'};
    var tokens = rows[i].replace(prefix,'').split(' '), point = {};
    for(var j=0;j<tokens.length;j++){
      var m = tokens[j].match(/^([XYZ])([+-]?\d+(?:\.\d*)?)$/);
      if(!m || Object.prototype.hasOwnProperty.call(point,m[1]))
        return {ok:false,message:'Enter one numeric X, Y and Z coordinate in each BLK FORM block.'};
      point[m[1]] = Number(m[2]);
    }
    if(tokens.length!==3) return {ok:false,message:'Both corners need all three coordinates: X, Y and Z.'};
    corners.push(point);
  }
  var lo=corners[0], hi=corners[1];
  if(lo.X!==0 || lo.Y!==0 || lo.Z!==-20)
    return {ok:false,message:'Check MIN: the blank starts at X0 Y0 and extends 20 mm below the top-face datum.'};
  if(hi.X!==100 || hi.Y!==80 || hi.Z!==0)
    return {ok:false,message:'Check MAX: use the X and Y dimensions from the task; the top face is Z0.'};
  return {ok:true,message:'Correct — 100 × 80 × 20 mm, with the top face at Z0. Use Show blank to inspect it.'};
}
function practiceCheck(){
  if(!PRACTICE.open) return;
  var result=practiceGrade(codeEl.value), el=document.getElementById('practiceFeedback');
  el.textContent=result.message; el.dataset.result=result.ok?'pass':'fail'; el.hidden=false;
}
function practiceHint(){
  var el=document.getElementById('practiceHint'); el.hidden=!el.hidden;
}
function practicePreview(){
  if(!PRACTICE.open) return;
  // Reuse Run's validation and stock preparation; this exercise has no motion.
  onStop(); dirty=true; onRun();
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
