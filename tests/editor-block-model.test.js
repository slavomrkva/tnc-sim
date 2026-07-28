const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const editorSource = read('core/editor-core.js');
const appSource = read('web/app.js');
const panelsSource = read('web/panels.js');
const fieldSource = read('core/field-editing.js');
const cycleSource = read('core/cycle-picker.js');
const blockSource = read('core/block-form-panel.js');

const context = {
  console,
  document: {getElementById(){ return null; }},
  window: {}
};
vm.createContext(context);
vm.runInContext(editorSource, context, {filename:'editor-core.js'});

function lineStart(code, index){
  return code.split('\n').slice(0, index).join('\n').length + (index ? 1 : 0);
}

function enterAt(code, line, column){
  const text = code.split('\n')[line];
  const pos = lineStart(code, line) + (column === undefined ? text.length : column);
  return context.planProgramBlockInsertion(code, pos, pos, '', 'enter');
}

const cycleProgram = [
  'BEGIN PGM TEST MM',
  'CYCL DEF 200',
  ' Q200=+2',
  ' Q201=-5',
  'L X+0 Y+0',
  'END PGM TEST MM'
].join('\n');

{
  const model = context.analyzeProgramRows(cycleProgram.split('\n'));
  assert.deepStrictEqual(Array.from(context.computeBlockNumbers(cycleProgram.split('\n'))),
    [0, 1, null, null, 2, 3]);
  assert.strictEqual(model.blocks[1].anchor, 1);
  assert.strictEqual(model.blocks[1].end, 3);
  assert.strictEqual(model.rows[1].blockIndex, model.rows[3].blockIndex);
}

for(const line of [1, 2, 3]){
  const plan = enterAt(cycleProgram, line);
  assert.strictEqual(plan.changed, true, `Enter on cycle row ${line} inserts a block`);
  assert.strictEqual(plan.value, cycleProgram.replace('\nL X+0 Y+0', '\n\nL X+0 Y+0'));
  assert.deepStrictEqual(Array.from(context.computeBlockNumbers(plan.value.split('\n'))),
    [0, 1, null, null, 2, 3, 4]);
}

{
  const line = 2;
  const start = lineStart(cycleProgram, line);
  const end = start + cycleProgram.split('\n')[line].length;
  const plan = context.planProgramBlockInsertion(cycleProgram, start, end, '', 'enter');
  assert.strictEqual(plan.changed, true, 'a selected cycle row behaves like a caret in that row');
  assert.strictEqual(plan.insertLine, 4);
}

{
  const once = enterAt(cycleProgram, 3).value;
  assert.strictEqual(enterAt(once, 3).reason, 'reuse-placeholder');
  assert.strictEqual(enterAt(once, 4).reason, 'reuse-placeholder');
}

for(const column of [0, 'END PGM TEST MM'.length]){
  const plan = enterAt(cycleProgram, 5, column);
  assert.strictEqual(plan.changed, false, 'Enter on END PGM is a strict no-op');
  assert.strictEqual(plan.reason, 'end-pgm');
}

{
  const cleared='BEGIN PGM TEST MM\nEND PGM TEST MM';
  const plan=enterAt(cleared,0);
  assert.strictEqual(plan.changed,true,'Enter after BEGIN inserts the first block after Clear');
  assert.strictEqual(plan.value,'BEGIN PGM TEST MM\n\nEND PGM TEST MM');
  assert.strictEqual(plan.insertLine,1,'the first blank block is inserted before END PGM');
}

{
  const plan = context.planProgramBlockInsertion(
    cycleProgram, lineStart(cycleProgram, 3), lineStart(cycleProgram, 3),
    'TOOL CALL 1 Z S10000 F2000', 'command');
  assert.strictEqual(plan.insertLine, 4, 'a command on a cycle Q row inserts after the cycle');
}

{
  const plan = context.planProgramBlockInsertion(
    cycleProgram, lineStart(cycleProgram, 5), lineStart(cycleProgram, 5),
    'M30', 'command');
  assert.strictEqual(plan.insertLine, 5, 'a command on END PGM inserts before END PGM');
  assert.ok(plan.value.endsWith('M30\nEND PGM TEST MM'));
}

{
  const plan = context.planProgramBlockInsertion('', 0, 0, 'BEGIN PGM TEST MM', 'command');
  assert.strictEqual(plan.value, 'BEGIN PGM TEST MM', 'the empty Learn editor accepts its first command');
}

{
  const withPlaceholder = enterAt(cycleProgram, 3).value;
  const plan = context.planProgramBlockInsertion(
    withPlaceholder, lineStart(withPlaceholder, 4), lineStart(withPlaceholder, 4),
    'M3', 'command');
  assert.strictEqual(plan.value, withPlaceholder.replace('\n\nL X+0 Y+0', '\nM3\nL X+0 Y+0'));
}

{
  const code = 'BEGIN PGM TEST MM\nL X+0 ~\n Y+1\nEND PGM TEST MM';
  assert.deepStrictEqual(Array.from(context.computeBlockNumbers(code.split('\n'))), [0, 1, null, 2]);
}

{
  const code = 'BEGIN PGM TEST MM\nCYCL DEF 200\n Q200=+2\n\nQ201=-20\nEND PGM TEST MM\n';
  const model = context.analyzeProgramRows(code.split('\n'));
  assert.deepStrictEqual(Array.from(context.computeBlockNumbers(code.split('\n'))),
    [0, 1, null, 2, 3, 4, null]);
  assert.strictEqual(model.blocks.length, 5);
}

{
  const downloads = [];
  context.codeEl = {value:'BEGIN PGM TEST MM\n\nEND PGM TEST MM\n'};
  context._docName = 'TEST.H';
  context._downloadTextFile = (text, name) => downloads.push({text, name});
  context.exportProgram();
  assert.strictEqual(downloads[0].text, '0  BEGIN PGM TEST MM\n1  \n2  END PGM TEST MM');
}

{
  let undoCount = 0;
  context.codeEl = {
    value:cycleProgram,
    selectionStart:0,
    selectionEnd:0,
    setSelectionRange(start, end){ this.selectionStart=start; this.selectionEnd=end; }
  };
  context.lastSel = {start:0,end:0};
  context._selectedLine = 0;
  context._undoPush = () => { undoCount += 1; };
  context.updateLineNums = () => {};
  context.runValidation = () => {};
  context.dirty = false;
  context.FM = {active:false};
  context.deleteLineN(2, true);
  assert.strictEqual(context.codeEl.value, 'BEGIN PGM TEST MM\nL X+0 Y+0\nEND PGM TEST MM');
  assert.strictEqual(undoCount, 1);
}

{
  const structural='BEGIN PGM TEST MM\nL X+0\nEND PGM TEST MM';
  context.codeEl.value=structural;
  context.codeEl.selectionStart=context.codeEl.selectionEnd=0;
  context.deleteLineN(0,true);
  assert.strictEqual(context.codeEl.value,'L X+0\nEND PGM TEST MM',
    'gutter deletion can remove the complete BEGIN PGM block');

  context.codeEl.value=structural;
  context.codeEl.selectionStart=context.codeEl.selectionEnd=0;
  context.deleteLineN(2,true);
  assert.strictEqual(context.codeEl.value,'BEGIN PGM TEST MM\nL X+0',
    'gutter deletion can remove the complete END PGM block');
}

const logicalEnterSection = appSource.slice(
  appSource.indexOf('var isLogicalEnter'),
  appSource.indexOf('if(isInsertion && isLogicalEnter')
);
assert.doesNotMatch(logicalEnterSection, /insertFromPaste|insertFromDrop/,
  'desktop paste/drop is not reclassified as Enter');
assert.match(appSource, /e\.key==='Enter' && !e\.isComposing && e\.keyCode!==229/,
  'desktop Enter does not steal the IME composition confirmation key');
assert.match(appSource, /if\(\/\^BEGIN PGM\\b\/\.test\(lt\)\)\{[\s\S]{0,300}codeEl\.focus/,
  'clicking BEGIN keeps editor focus so Enter reaches logical block insertion');
const lockedLineSection=appSource.slice(
  appSource.indexOf('function isLockedLine'),
  appSource.indexOf('// A Learn answer row stays a row')
);
assert.match(lockedLineSection,/type==='begin'[\s\S]*type==='end'/,
  'BEGIN/END remain protected against native text edits');
assert.match(appSource, /if\(!touchesLocked\) return;[\s\S]*introducesNewline/,
  'multi-line paste is allowed on ordinary blocks and rejected only when it touches a locked block');
assert.match(appSource, /before && before\.inputType==='insertText'[\s\S]*actualInserted[\s\S]*editorInsertBlankAfterActiveBlock/,
  'mobile-browser input fallback is limited to the null-data insertText path');

for(const [name, source] of [
  ['field editing', fieldSource],
  ['cycle picker', cycleSource],
  ['BLK FORM', blockSource]
]){
  assert.match(source, /insertProgramBlock\(/, `${name} uses the shared insertion primitive`);
}
assert.match(panelsSource, /analyzeProgramRows\(lines\)/);
assert.match(panelsSource, /model\.blocks\.length/);
assert.match(panelsSource, /var deleteBtn=rowBlock\s*\?/,
  'every logical block, including BEGIN/END, receives a gutter delete button');

console.log('editor-block-model.test.js: web logical blocks and desktop/mobile inputs verified');
