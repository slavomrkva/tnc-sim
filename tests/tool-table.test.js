const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync(require.resolve('../core/tool-table.js'), 'utf8');

function makeContext() {
  const elements = {};
  const downloads = [];
  const context = {
    console,
    setTimeout(fn) { fn(); },
    TOOL_TYPES: ['MILL', 'DRILL', 'COUNTERSINK'],
    TOOL_TYPE_LABEL: { MILL: 'Mill', DRILL: 'Drill', COUNTERSINK: 'Countersink' },
    TOOL_TYPE_COLOR: { MILL: '#1', DRILL: '#2', COUNTERSINK: '#3' },
    TOOL_CUT_COLORS: [[1, 0, 0]],
    toolLibrary: [], editingTool: null, TOOL_NUM: 1, currentToolNum: 1,
    TOOL_R: 5, mode: 'idle', toolGroup: {}, curView: 'editor',
    pFloat(value) { return parseFloat(String(value).replace(',', '.')); },
    pInt(value) { return parseInt(String(value).replace(',', ''), 10); },
    _toast(message) { context.toasts.push(message); },
    toasts: [], resets: 0, validations: 0, meshes: 0,
    onReset() { context.resets += 1; },
    runValidation() { context.validations += 1; },
    buildToolMesh() { context.meshes += 1; },
    _editorConfirm(message, callback) { callback(); },
    _downloadTextFile(text, filename) { downloads.push({ text, filename }); },
    document: { getElementById(id) { return elements[id] || null; } },
    FileReader: function FileReader() {
      this.readAsText = file => this.onload({ target: { result: file.text } });
    }
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  context.elements = elements;
  context.downloads = downloads;
  return context;
}

function tool(overrides = {}) {
  return Object.assign({
    T: 1, TYPE: 'MILL', NAME: 'END_MILL', L: 80, R: 5, R2: 0,
    DL: 0, DR: 0, DR2: 0, CUT: 4, RCUTS: 4, LCUTS: 25, ANGLE: 0,
    T_ANGLE: 0, PITCH: 0, TL: false, RT: 0, TIME2: 0, CUR_TIME: 0, DOC: ''
  }, overrides);
}

function setFields(context, values) {
  Object.keys(values).forEach(key => {
    context.elements['tf_' + key] = key === 'TL'
      ? { checked: Boolean(values[key]) }
      : { value: String(values[key]) };
  });
}

function importText(context, text) {
  const target = { files: [{ text }], value: 'selected' };
  context.onToolImportFile({ target });
  assert.strictEqual(target.value, '', 'file input is reset after import');
}

{
  const context = makeContext();
  context.toolLibrary = [tool({ ANGLE: 0 })];
  const html = context.renderToolForm(1);
  assert.match(html, /id="tf_ANGLE"[^>]* value="0"/, 'ANGLE=0 survives opening the edit form');
  context.toolLibrary.push(tool({ T: 999, NAME: 'LAST' }));
  assert.strictEqual(context.nextFreeToolNumber(), 2, 'Add Tool fills the first free number instead of overflowing past T999');
}

{
  const context = makeContext();
  context.toolLibrary = [tool(), tool({ T: 2, NAME: 'SECOND', R: 4 })];
  setFields(context, tool({ T: 2, NAME: 'DUPLICATE' }));
  context.toolSave(1);
  assert.deepStrictEqual(Array.from(context.toolLibrary, item => item.T), [1, 2]);
  assert.match(context.toasts.join('\n'), /T2 already exists/);

  context.toasts = [];
  setFields(context, tool({ T: 2.5, NAME: 'FRACTION' }));
  context.toolSave(null);
  assert.strictEqual(context.toolLibrary.length, 2);
  assert.match(context.toasts.join('\n'), /whole number/);

  context.toasts = [];
  setFields(context, tool({ T: 3, NAME: 'BAD_RADIUS', DR: 'not-a-number' }));
  context.toolSave(null);
  assert.strictEqual(context.toolLibrary.length, 2);
  assert.match(context.toasts.join('\n'), /DR must be/);

  context.toasts = [];
  setFields(context, tool({ T: 3, NAME: 'BAD_PITCH', PITCH: -1 }));
  context.toolSave(null);
  assert.strictEqual(context.toolLibrary.length, 2);
  assert.match(context.toasts.join('\n'), /PITCH must be/);
}

{
  const context = makeContext();
  context.toolLibrary = [tool(), tool({ T: 2, NAME: 'BACKUP', RT: 1 })];
  setFields(context, tool({ T: 3 }));
  context.toolSave(1);
  assert.deepStrictEqual(Array.from(context.toolLibrary, item => item.T), [2, 3]);
  assert.strictEqual(context.toolLibrary[0].RT, 3, 'renumbering updates RT references');
  assert.ok(context.resets && context.validations && context.meshes, 'edit invalidates simulation state');
}

{
  const context = makeContext();
  const original = tool({ DR: 0.2, PITCH: 1.25, DOC: '<img src=x onerror=alert(1)>' });
  context.toolLibrary = [original];
  context.toolTableExport();
  assert.strictEqual(context.downloads[0].filename, 'tools.tnt');
  context.toolLibrary = [];
  importText(context, context.downloads[0].text);
  assert.strictEqual(context.toolLibrary.length, 1);
  assert.strictEqual(context.toolLibrary[0].PITCH, 1.25, 'PITCH survives Tool Table export/import');
  assert.strictEqual(context.TOOL_R, 5.2, 'import applies active MILL table DR');

  context.elements.viewTools = { innerHTML: '' };
  context.elements.code = { value: 'TOOL CALL 1' };
  context.renderToolsTab();
  assert.ok(!context.elements.viewTools.innerHTML.includes('<img src=x'));
  assert.ok(context.elements.viewTools.innerHTML.includes('&lt;img src=x'));
}

{
  const context = makeContext();
  context.toolLibrary = [tool()];
  const invalid = JSON.stringify([
    { T: -4, R: -2 },
    { T: 2.5, R: 3 },
    { T: 2.5, R: 4 }
  ]);
  importText(context, invalid);
  assert.strictEqual(context.toolLibrary.length, 1, 'invalid import is transactional');
  assert.strictEqual(context.toolLibrary[0].T, 1);
  assert.match(context.toasts.join('\n'), /Import failed/);
}

{
  const context = makeContext();
  context.toolLibrary = [tool({ TL: true, RT: 2 }), tool({ T: 2, NAME: 'BACKUP' })];
  const resolved = context.resolveToolCall(1);
  assert.strictEqual(resolved.toolNum, 2);
  assert.strictEqual(resolved.replacement, true);
  context.toolLibrary[1].TL = true;
  assert.strictEqual(context.resolveToolCall(1).replacement, false);
  assert.strictEqual(context.resolveToolCall(1).locked, true);
}

{
  const context = makeContext();
  context.toolLibrary = [tool({ TIME2: 0.01 })];
  context.calcToolTimes([{ len: 10, feed: 100, rapid: false, toolNum: 1 }]);
  assert.strictEqual(context.toolLibrary[0].CUR_TIME, 0.1);
  assert.strictEqual(context.toolLibrary[0].TL, true, 'TIME2 locks a worn tool');
}

{
  const context = makeContext();
  context.toolLibrary = [tool()];
  context.calcToolTimes([{ len: 0.001, rapid: true, dwellSeconds: 6, toolNum: 1 }]);
  assert.strictEqual(context.toolLibrary[0].CUR_TIME, 0.1, 'cycle dwell contributes to current tool time');
}

console.log('tool table CRUD, validation, import/export and tool-life regressions passed');
