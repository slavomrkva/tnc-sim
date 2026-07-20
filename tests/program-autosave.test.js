const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const autosaveSource = fs.readFileSync(path.join(root, 'core', 'program-autosave.js'), 'utf8');

function makeStorage(seed, failWrites){
  const values = new Map(Object.entries(seed || {}));
  return {
    getItem(key){ return values.has(key) ? values.get(key) : null; },
    setItem(key, value){
      if(failWrites) throw new Error('storage disabled');
      values.set(key, String(value));
    },
    removeItem(key){ values.delete(key); },
    value(key){ return values.get(key); }
  };
}

function boot(options = {}){
  const codeListeners = {};
  const documentListeners = {};
  const windowListeners = {};
  const timers = [];
  const status = {
    textContent:'', hidden:true, state:'',
    setAttribute(name, value){ if(name === 'data-state') this.state = value; }
  };
  const codeEl = {
    value:options.code || 'BEGIN PGM DEFAULT MM\nEND PGM DEFAULT MM',
    addEventListener(name, fn){ codeListeners[name] = fn; }
  };
  const localStorage = makeStorage(options.local, options.failWrites);
  const sessionStorage = makeStorage(options.session);
  const context = vm.createContext({
    console,
    codeEl,
    _docName:options.docName || 'program.H',
    LEARN:{open:false},
    localStorage,
    sessionStorage,
    Date,
    JSON,
    setTimeout(fn, delay){ fn.delay = delay; timers.push(fn); return timers.length; },
    clearTimeout(){},
    document:{
      visibilityState:'visible',
      getElementById(id){ return id === 'programAutosaveStatus' ? status : null; },
      addEventListener(name, fn){ documentListeners[name] = fn; }
    },
    window:{addEventListener(name, fn){ windowListeners[name] = fn; }}
  });
  vm.runInContext('function _setDocName(name){ _docName = name || "program.H"; }', context);
  vm.runInContext(autosaveSource, context, {filename:'program-autosave.js'});
  vm.runInContext('initProgramAutosave()', context);
  return {context, codeEl, status, localStorage, sessionStorage, codeListeners, documentListeners, windowListeners, timers};
}

// Direct typing is saved within 30 seconds of the first change. Further input
// updates the pending payload without postponing that scheduled write.
const typed = boot({docName:'part.H'});
typed.codeEl.value = 'BEGIN PGM PART MM\nL X+10\nEND PGM PART MM';
typed.codeListeners.input();
assert.strictEqual(typed.status.state, 'pending');
assert.strictEqual(typed.localStorage.value('tncsim.programDraft.v1'), undefined);
assert.strictEqual(typed.timers[0].delay, 30000);
typed.codeEl.value = 'BEGIN PGM PART MM\nL X+20\nEND PGM PART MM';
typed.codeListeners.input();
assert.strictEqual(typed.timers.length, 1, 'continuous typing must not postpone the scheduled save');
typed.timers.shift()();
const saved = JSON.parse(typed.localStorage.value('tncsim.programDraft.v1'));
assert.strictEqual(saved.code, typed.codeEl.value);
assert.strictEqual(saved.docName, 'part.H');
assert.strictEqual(saved.version, 1);
assert.strictEqual(typeof saved.savedAt, 'number');
assert.strictEqual(typed.status.state, 'saved');

// A stored main program wins over markup/browser form restoration at boot.
const storedPayload = JSON.stringify({
  version:1,
  code:'BEGIN PGM STORED MM\nEND PGM STORED MM',
  docName:'stored.H',
  savedAt:123456789
});
const restored = boot({code:'BROWSER-RESTORED-VALUE', local:{'tncsim.programDraft.v1':storedPayload}});
assert.strictEqual(restored.codeEl.value, 'BEGIN PGM STORED MM\nEND PGM STORED MM');
assert.strictEqual(restored.context._docName, 'stored.H');
assert.strictEqual(restored.status.state, 'restored');

// Entering Learn force-saves the main program and excludes all lesson edits.
const learn = boot({code:'MAIN PROGRAM', docName:'main.H'});
vm.runInContext('programAutosaveSuspendForLearn()', learn.context);
const mainDraft = learn.localStorage.value('tncsim.programDraft.v1');
assert.strictEqual(JSON.parse(mainDraft).code, 'MAIN PROGRAM');
assert.strictEqual(learn.status.state, 'lesson');
learn.context.LEARN.open = true;
learn.codeEl.value = 'LESSON EXERCISE';
vm.runInContext('programAutosaveChanged()', learn.context);
assert.strictEqual(learn.localStorage.value('tncsim.programDraft.v1'), mainDraft);
learn.context.LEARN.open = false;
vm.runInContext('programAutosaveResumeAfterLearn()', learn.context);
assert.strictEqual(learn.codeEl.value, 'MAIN PROGRAM');

// A reload/process restart during Learn restores main and marks transient code unsafe.
const interrupted = boot({
  code:'LESSON RESTORED BY WEBVIEW',
  local:{'tncsim.programDraft.v1':mainDraft},
  session:{'tncsim.programDraft.learnActive.v1':'1'}
});
assert.strictEqual(interrupted.codeEl.value, 'MAIN PROGRAM');
assert.strictEqual(vm.runInContext('programAutosaveWasInterruptedInLearn()', interrupted.context), true);
assert.strictEqual(interrupted.sessionStorage.value('tncsim.programDraft.learnActive.v1'), undefined);

// Hiding the page/app flushes a pending edit without waiting for the debounce.
const hidden = boot();
hidden.codeEl.value = 'PENDING EDIT';
hidden.codeListeners.input();
hidden.context.document.visibilityState = 'hidden';
hidden.documentListeners.visibilitychange();
assert.strictEqual(JSON.parse(hidden.localStorage.value('tncsim.programDraft.v1')).code, 'PENDING EDIT');

// Storage failures remain visible instead of claiming that the program is safe.
const failed = boot({failWrites:true});
failed.codeEl.value = 'CANNOT SAVE';
failed.codeListeners.input();
failed.timers.shift()();
assert.strictEqual(failed.status.state, 'error');
assert.match(failed.status.textContent, /could not be saved/i);

// The Learn integration must retain the main stash through Finish lesson.
const learnSource = fs.readFileSync(path.join(root, 'core', 'learn-tutorial.js'), 'utf8');
const finishBody = learnSource.slice(learnSource.indexOf('function learnFinishLesson'), learnSource.indexOf('function learnExit'));
assert.ok(!/LEARN\.savedCode\s*=\s*null/.test(finishBody));
assert.match(learnSource, /programAutosaveSuspendForLearn/);
assert.match(learnSource, /programAutosaveResumeAfterLearn/);
const openBody = learnSource.slice(learnSource.indexOf('function openLearn'), learnSource.indexOf('function closeLearn'));
assert.ok(openBody.indexOf('programAutosaveSuspendForLearn()') < openBody.indexOf('LEARN.open = true'));
const exitBody = learnSource.slice(learnSource.indexOf('function learnExit'), learnSource.indexOf('function _learnEndEditorInput'));
assert.match(exitBody, /!LEARN\.open[^\n]+programAutosaveResumeAfterLearn/);
assert.match(learnSource, /onclick="closeLearn\(\)" title="Exit practice/,
  'the practice close button must fully close Learn so autosave resumes immediately');
assert.doesNotMatch(learnSource, /onclick="learnExit\(\)" title="Exit practice/,
  'the practice close button must not leave Learn open with autosave suspended');

const tabsSource = fs.readFileSync(path.join(root, 'core', 'mobile-tabs.js'), 'utf8');
assert.match(tabsSource, /LEARN\.open = false;\s*\n\s*learnExit\(\)/);

const editorSource = fs.readFileSync(path.join(root, 'core', 'editor-core.js'), 'utf8');
assert.match(editorSource, /function runValidation[\s\S]*?programAutosaveChanged\(\)/);

const appSource = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
assert.ok(appSource.indexOf('initProgramAutosave()') < appSource.indexOf('updateLineNums();', appSource.indexOf('// ---------- boot ----------')));

const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(indexSource, /id="programAutosaveStatus"/);
assert.match(indexSource, /core\/program-autosave\.js/);
const stylesSource = fs.readFileSync(path.join(root, 'web', 'styles.css'), 'utf8');
assert.match(stylesSource, /data-state="pending"[^}]*color:var\(--text3\)/);
assert.match(stylesSource, /data-state="error"[^}]*color:var\(--accent-warm\)/);

console.log('program-autosave.test.js: durable main draft and Learn isolation verified');
