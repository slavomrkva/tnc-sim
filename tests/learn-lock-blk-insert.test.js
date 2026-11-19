/* Regression: Lesson 1 tasks 2 and 3 start without BLK FORM. The BLK FORM
   panel's Insert targets the end of BEGIN PGM, which is in the locked prefix
   of the practice task. insertProgramBlock() must redirect that target into
   the highlighted answer line instead of writing into the locked prefix (the
   lock then rolled the insert back, so nothing appeared in the editor). */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const codeEl = { value:'', selectionStart:0, selectionEnd:0 };
const ctx = {
  console, Math, JSON, RegExp, Date, parseFloat, parseInt, isFinite, String, Number,
  codeEl, dirty:false, lastSel:null,
  document:{ getElementById:() => null, querySelectorAll:() => [] },
  requestAnimationFrame:() => {}
};
ctx.window = ctx;
vm.createContext(ctx);
// Globals owned by web/app.js in the browser.
vm.runInContext("var LEARN = { open:false, lesson:-1, slide:0, task:-1 };"
  + "var BLK = { shape:'BOX', x0:0, y0:0, z0:0, x1:100, y1:100, z1:20, cx:50, cy:50, cz0:0, cz1:20, cr:50, step:0, typing:false, active:false, editLine:null };"
  + "var BLK_FIELDS_BOX = ['x0','y0','z0','x1','y1','z1'].map(function(k){ return {key:k, lbl:k}; });"
  + "var BLK_FIELDS_CYL = ['cx','cy','cz0','cr','cz1'].map(function(k){ return {key:k, lbl:k}; });", ctx);
vm.runInContext(read('core/data-tables.js'), ctx, {filename:'data-tables.js'});
vm.runInContext(read('core/editor-core.js'), ctx, {filename:'editor-core.js'});
vm.runInContext(read('core/learn-tutorial.js'), ctx, {filename:'learn-tutorial.js'});
vm.runInContext(read('core/block-form-panel.js'), ctx, {filename:'block-form-panel.js'});

// Minimal editor host stubs (the real ones touch the DOM).
ctx._undoPush = () => {};
ctx._toast = () => {};
ctx.runValidation = () => {};
ctx.closeCtxPanel = () => { vm.runInContext('BLK.active=false',ctx); };
ctx.syncEditorSelection = (s, e) => { codeEl.selectionStart = s; codeEl.selectionEnd = e; };
ctx.updateLineNums = () => { ctx.learnEnforceLock(); };

for(const taskIndex of [1, 2]){
  const lesson = ctx.LESSONS.find(l => l.id === 'L01');
  const plan = ctx._learnStarterPlan(lesson, taskIndex);
  codeEl.value = plan.code;
  vm.runInContext('LEARN',ctx).open = true;
  vm.runInContext('LEARN',ctx).lesson = ctx.LESSONS.indexOf(lesson);
  vm.runInContext('LEARN',ctx).task = taskIndex;
  vm.runInContext('LEARN',ctx).answerStartLine = plan.start;
  vm.runInContext('LEARN',ctx).answerLineCount = plan.count;
  vm.runInContext('_learnLockCapture(codeEl.value, LEARN.answerStartLine, LEARN.answerLineCount)', ctx);

  // Caret sits on the highlighted answer line, as on a phone after the tap.
  const caret = ctx._learnAnswerCaret();
  codeEl.selectionStart = codeEl.selectionEnd = caret;
  ctx.lastSel = { start:caret, end:caret };

  vm.runInContext("BLK.active=true; BLK.editLine=null; BLK.shape='BOX'; BLK.x0=0; BLK.y0=0; BLK.z0=-15; BLK.x1=90; BLK.y1=40; BLK.z1=0; BLK.step=6;", ctx);
  ctx.insertBlkForm();

  assert.match(codeEl.value, /BLK FORM 0\.1 Z X\+0 Y\+0 Z-15\nBLK FORM 0\.2 X\+90 Y\+40 Z\+0/,
    'L01 task ' + (taskIndex + 1) + ': Insert writes both BLK FORM lines into the editor');
  assert.ok(ctx._learnLockValid(codeEl.value),
    'L01 task ' + (taskIndex + 1) + ': the locked prefix and suffix stay untouched');
  const range = ctx.learnAnswerLineRange();
  const rows = codeEl.value.split('\n');
  const blkRow = rows.findIndex(r => /^BLK FORM 0\.1/.test(r));
  assert.ok(blkRow >= range.start && blkRow + 1 <= range.end,
    'L01 task ' + (taskIndex + 1) + ': BLK FORM lands inside the highlighted answer range');
}
console.log('learn-lock-blk-insert: BLK FORM Insert lands in the answer range');
