// program-autosave -- shared web/Android persistence for the main NC program.
// Learn content is deliberately excluded: entering Learn saves the main
// program first, then suspends autosave until the main editor is restored.

var PROGRAM_DRAFT_STORAGE_KEY = 'tncsim.programDraft.v1';
var PROGRAM_AUTOSAVE_LEARN_SESSION_KEY = 'tncsim.programDraft.learnActive.v1';
var PROGRAM_AUTOSAVE_DELAY = 30000;

var _programAutosaveReady = false;
var _programAutosaveSuspended = false;
var _programAutosaveTimer = null;
var _programAutosaveDirty = false;
var _programAutosaveObservedSignature = null;
var _programAutosaveSavedSignature = null;
var _programAutosaveSavedAt = null;
var _programAutosaveStorageFailed = false;
var _programAutosaveInterruptedLearn = false;

function _programAutosaveT(key, fallback){
  if(typeof I18N !== 'undefined' && I18N && typeof I18N.t === 'function'){
    return I18N.t(key, fallback);
  }
  return fallback;
}

function _programAutosaveStatus(state, text){
  var el = document.getElementById('programAutosaveStatus');
  if(!el) return;
  el.textContent = text || '';
  el.hidden = !text;
  el.setAttribute('data-state', state || '');
}

function _programAutosaveTime(savedAt){
  try{
    return new Date(savedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  }catch(e){
    return '';
  }
}

function _programAutosaveSavedStatus(state){
  var label = state === 'restored'
    ? _programAutosaveT('autosave.restored', 'Restored')
    : _programAutosaveT('autosave.saved', 'Saved');
  var time = _programAutosaveSavedAt ? _programAutosaveTime(_programAutosaveSavedAt) : '';
  _programAutosaveStatus(state, label + (time ? ' ' + time : ''));
}

function _programAutosaveSignature(){
  if(typeof codeEl === 'undefined' || !codeEl) return null;
  var name = (typeof _docName === 'string' && _docName) ? _docName : 'program.H';
  return name + '\n\u0000\n' + codeEl.value;
}

function _programAutosaveRead(){
  try{
    var raw = localStorage.getItem(PROGRAM_DRAFT_STORAGE_KEY);
    if(!raw) return null;
    var draft = JSON.parse(raw);
    if(!draft || draft.version !== 1 || typeof draft.code !== 'string') return null;
    return {
      version:1,
      code:draft.code,
      docName:typeof draft.docName === 'string' && draft.docName ? draft.docName : 'program.H',
      savedAt:typeof draft.savedAt === 'number' ? draft.savedAt : null
    };
  }catch(e){
    _programAutosaveStorageFailed = true;
    _programAutosaveStatus('error', _programAutosaveT('autosave.error', 'Save failed'));
    return null;
  }
}

function _programAutosaveRestore(draft){
  if(!draft || typeof codeEl === 'undefined' || !codeEl) return false;
  codeEl.value = draft.code;
  if(typeof _setDocName === 'function') _setDocName(draft.docName);
  _programAutosaveSavedAt = draft.savedAt;
  _programAutosaveObservedSignature = _programAutosaveSignature();
  _programAutosaveSavedSignature = _programAutosaveObservedSignature;
  _programAutosaveDirty = false;
  return true;
}

function saveProgramDraftNow(force){
  if(!_programAutosaveReady || _programAutosaveSuspended) return false;
  if(typeof LEARN !== 'undefined' && LEARN && LEARN.open) return false;
  var signature = _programAutosaveSignature();
  if(signature === null) return false;
  if(!force && !_programAutosaveDirty && signature === _programAutosaveSavedSignature) return true;
  if(_programAutosaveTimer){ clearTimeout(_programAutosaveTimer); _programAutosaveTimer = null; }
  _programAutosaveStatus('saving', _programAutosaveT('autosave.saving', 'Saving\u2026'));
  try{
    var savedAt = Date.now();
    localStorage.setItem(PROGRAM_DRAFT_STORAGE_KEY, JSON.stringify({
      version:1,
      code:codeEl.value,
      docName:(typeof _docName === 'string' && _docName) ? _docName : 'program.H',
      savedAt:savedAt
    }));
    _programAutosaveSavedAt = savedAt;
    _programAutosaveObservedSignature = signature;
    _programAutosaveSavedSignature = signature;
    _programAutosaveDirty = false;
    _programAutosaveStorageFailed = false;
    _programAutosaveSavedStatus('saved');
    return true;
  }catch(e){
    _programAutosaveStorageFailed = true;
    _programAutosaveStatus('error', _programAutosaveT('autosave.error', 'Save failed'));
    return false;
  }
}

function programAutosaveChanged(){
  if(!_programAutosaveReady || _programAutosaveSuspended) return;
  if(typeof LEARN !== 'undefined' && LEARN && LEARN.open) return;
  var signature = _programAutosaveSignature();
  if(signature === null || signature === _programAutosaveObservedSignature) return;
  _programAutosaveObservedSignature = signature;
  if(signature === _programAutosaveSavedSignature){
    _programAutosaveDirty = false;
    if(_programAutosaveTimer){ clearTimeout(_programAutosaveTimer); _programAutosaveTimer = null; }
    if(_programAutosaveStorageFailed){
      _programAutosaveStatus('error', _programAutosaveT('autosave.error', 'Save failed'));
    }else if(_programAutosaveSavedAt){
      _programAutosaveSavedStatus('saved');
    }
    return;
  }
  _programAutosaveDirty = true;
  if(!_programAutosaveStorageFailed){
    _programAutosaveStatus('pending', _programAutosaveT('autosave.pending', 'Changes pending'));
  }
  // Throttle rather than debounce: continuous typing still reaches durable
  // storage within 30 seconds of the first change instead of postponing the
  // write after every keystroke.
  if(!_programAutosaveTimer){
    _programAutosaveTimer = setTimeout(function(){
      _programAutosaveTimer = null;
      saveProgramDraftNow(false);
    }, PROGRAM_AUTOSAVE_DELAY);
  }
}

function programAutosaveSuspendForLearn(){
  if(!_programAutosaveReady) return;
  // Always create a durable main-program draft before Learn replaces the editor.
  saveProgramDraftNow(true);
  _programAutosaveSuspended = true;
  if(_programAutosaveTimer){ clearTimeout(_programAutosaveTimer); _programAutosaveTimer = null; }
  try{ sessionStorage.setItem(PROGRAM_AUTOSAVE_LEARN_SESSION_KEY, '1'); }catch(e){}
  if(_programAutosaveStorageFailed){
    _programAutosaveStatus('error', _programAutosaveT('autosave.error', 'Save failed'));
  }else{
    _programAutosaveStatus(
      'lesson',
      _programAutosaveT('autosave.lesson', 'Lesson \u2013 changes are not saved')
    );
  }
}

function programAutosaveResumeAfterLearn(){
  if(!_programAutosaveReady) return;
  // Keep suspension active while restoring, so lesson content cannot be
  // observed as a main-program change by _setDocName/runValidation.
  var draft = _programAutosaveRead();
  if(draft && _programAutosaveRestore(draft)){
    if(typeof updateLineNums === 'function') updateLineNums();
    if(typeof runValidation === 'function') runValidation();
    if(typeof renderIdlePanel === 'function') renderIdlePanel();
    if(typeof updateHighlightOverlay === 'function') updateHighlightOverlay();
  }
  try{ sessionStorage.removeItem(PROGRAM_AUTOSAVE_LEARN_SESSION_KEY); }catch(e){}
  _programAutosaveSuspended = false;
  _programAutosaveObservedSignature = _programAutosaveSignature();
  if(_programAutosaveStorageFailed){
    _programAutosaveStatus('error', _programAutosaveT('autosave.error', 'Save failed'));
  }else if(_programAutosaveSavedAt){
    _programAutosaveSavedStatus('saved');
  }else{
    _programAutosaveStatus('', '');
  }
}

function programAutosaveWasInterruptedInLearn(){
  return _programAutosaveInterruptedLearn;
}

function initProgramAutosave(){
  if(_programAutosaveReady) return;
  try{
    _programAutosaveInterruptedLearn = sessionStorage.getItem(PROGRAM_AUTOSAVE_LEARN_SESSION_KEY) === '1';
    sessionStorage.removeItem(PROGRAM_AUTOSAVE_LEARN_SESSION_KEY);
  }catch(e){}

  var draft = _programAutosaveRead();
  var restored = _programAutosaveRestore(draft);
  _programAutosaveReady = true;
  _programAutosaveObservedSignature = _programAutosaveSignature();
  if(restored) _programAutosaveSavedStatus('restored');

  if(codeEl && typeof codeEl.addEventListener === 'function'){
    codeEl.addEventListener('input', programAutosaveChanged);
  }
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'hidden' && _programAutosaveDirty) saveProgramDraftNow(false);
  });
  window.addEventListener('pagehide', function(){
    if(_programAutosaveDirty) saveProgramDraftNow(false);
  });
}
