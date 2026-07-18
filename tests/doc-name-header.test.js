// Header document name follows the FILE identity, not the program body:
//   - picking a demo shows the demo's friendly name
//   - Clear (new unsaved) resets to the default 'program.H'
//   - importing a file shows that file's name (even though the body still
//     reads BEGIN PGM PROGRAM)
//   - exporting round-trips an imported .H filename; a demo (no .H doc name)
//     exports under the BEGIN PGM-derived name and the header reflects it
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const core = path.join(__dirname, '..', 'core');
const titleEl = { textContent: '(init)' };
const codeEl = { value: 'BEGIN PGM PROGRAM MM\nEND PGM PROGRAM MM', selectionStart: 0 };
const ctx = {
  console,
  document: { getElementById: id => id === 'progTitleName' ? titleEl
    : (id === 'importFileInput' ? { value: '', click() {} }
    : { style: {}, value: '', classList: { add() {}, remove() {}, toggle() {} }, querySelectorAll: () => [] }) },
  codeEl,
  DEMO_PROGRAMS: [
    { name: 'Complete Part', code: 'BEGIN PGM PROGRAM MM\n; complete\nEND PGM PROGRAM MM' },
    { name: 'Chamfering',    code: 'BEGIN PGM PROGRAM MM\n; chamfer\nEND PGM PROGRAM MM' },
  ],
  DEFAULT_CODE: 'BEGIN PGM PROGRAM MM\n; complete\nEND PGM PROGRAM MM',
  _currentDemoIdx: 0,
  _undoStack: [], _redoStack: [], _undoMax: 50, _undoLastVal: null, _selectedLine: -1,
  lineNums: { querySelectorAll: () => [], scrollTop: 0 },
  computeBlockNumbers: lines => lines.map(() => null),
  formatBlockNum: n => n + ' ',
  getComputedStyle() { return { lineHeight: '20' }; },
  window: {},
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(core, 'editor-core.js'), 'utf8'), ctx);
// Neutralize DOM-heavy collaborators the header logic does not need. Override
// _downloadTextFile too: the web repo defines a Blob-based one in editor-core.
vm.runInContext('runValidation=function(){}; renderIdlePanel=function(){}; updateLineNums=function(){}; _editorConfirm=function(m,cb){cb();}; _undoPush=function(){}; _downloadTextFile=function(t,n){ __dl=n; };', ctx);
// Seed the way app.js does.
vm.runInContext('_setDocName(DEMO_PROGRAMS[0].name);', ctx);
assert.strictEqual(ctx._docName, 'Complete Part', 'startup seeds the starter demo name');

vm.runInContext('loadDemo(1);', ctx);
assert.strictEqual(ctx._docName, 'Chamfering', 'picking a demo shows its friendly name');
assert.strictEqual(titleEl.textContent, 'Chamfering', 'header element updated on demo pick');

vm.runInContext('editorClear();', ctx);
assert.strictEqual(ctx._docName, 'program.H', 'Clear resets to the default name');

vm.runInContext('editorReset();', ctx);
assert.strictEqual(ctx._docName, 'Complete Part', 'Reset restores the starter demo name');

// Import a file named mypart.H whose body still says BEGIN PGM PROGRAM.
ctx.FileReader = function () {
  this.readAsText = function () { this.onload({ target: { result: 'BEGIN PGM PROGRAM MM\n12 L X+0\nEND PGM PROGRAM MM' } }); };
};
ctx.__ev = { target: { files: [{ name: 'mypart.H' }], value: '' } };
vm.runInContext('onImportFile(__ev);', ctx);
assert.strictEqual(ctx._docName, 'mypart.H', 'import shows the imported filename, not BEGIN PGM');
assert.strictEqual(ctx._currentDemoIdx, -1, 'an imported file is not a demo');

vm.runInContext('exportProgram();', ctx);
assert.strictEqual(ctx.__dl, 'mypart.H', 'export round-trips the imported .H filename');
assert.strictEqual(ctx._docName, 'mypart.H', 'header keeps the exported filename');

vm.runInContext('loadDemo(1); exportProgram();', ctx);
assert.strictEqual(ctx.__dl, 'PROGRAM.H', 'a demo exports under its BEGIN PGM-derived name');
assert.strictEqual(ctx._docName, 'PROGRAM.H', 'header reflects the exported filename');

console.log('doc-name-header.test.js: header document-name behavior verified');
