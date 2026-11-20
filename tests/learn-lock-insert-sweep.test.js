/* Every locked Learn insert task must accept its official solution when the
   blocks are inserted through insertProgramBlock() (the keypad/panel path),
   without the practice lock rolling anything back. Guards against inserts
   that target the locked prefix/suffix (see C63, BLK FORM). */
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
vm.runInContext('var LEARN = { open:false, lesson:-1, slide:0, task:-1 };', ctx);
for(const f of ['core/data-tables.js', 'core/editor-core.js', 'core/learn-tutorial.js'])
  vm.runInContext(read(f), ctx, {filename:f});

let rollbacks = 0;
ctx._undoPush = () => {};
ctx._toast = () => { rollbacks++; };
ctx.runValidation = () => {};
ctx.syncEditorSelection = (s, e) => {
  codeEl.selectionStart = s; codeEl.selectionEnd = e === undefined ? s : e;
  ctx.lastSel = { start:s, end:codeEl.selectionEnd };
};
ctx.updateLineNums = () => { ctx.learnEnforceLock(); };

const LEARN = vm.runInContext('LEARN', ctx);
const norm = s => s.split('\n').map(x => x.trim()).filter(Boolean).join('\n');
let checked = 0;
ctx.LESSONS.forEach((lesson, li) => lesson.tasks.forEach((task, ti) => {
  if(task.sol === undefined) return;
  const plan = ctx._learnStarterPlan(lesson, ti);
  if(plan.mode !== 'insert' || plan.start < 0) return;
  codeEl.value = plan.code;
  Object.assign(LEARN, {open:true, lesson:li, task:ti, answerStartLine:plan.start, answerLineCount:plan.count});
  vm.runInContext('_learnLockCapture(codeEl.value, LEARN.answerStartLine, LEARN.answerLineCount)', ctx);
  if(!LEARN.lock) return;
  checked++;
  const caret = ctx._learnAnswerCaret();
  ctx.syncEditorSelection(caret, caret);
  const rows = task.sol.split('\n');
  const blocks = ctx.analyzeProgramRows(rows).blocks
    .filter(b => b.type !== 'placeholder')
    .map(b => rows.slice(b.anchor, b.end + 1).join('\n'));
  rollbacks = 0;
  for(const b of blocks) ctx.insertProgramBlock(b, ctx.lastSel.start, ctx.lastSel.end, {mode:'command'});
  const id = lesson.id + ' task ' + (ti + 1);
  assert.strictEqual(rollbacks, 0, id + ': no insert is rolled back by the practice lock');
  assert.ok(norm(codeEl.value).includes(norm(task.sol)), id + ': the official solution is in the editor');
  assert.ok(ctx._learnLockValid(codeEl.value), id + ': locked lines are unchanged');
}));
assert.ok(checked >= 40, 'sweep covers the locked insert tasks (' + checked + ')');

/* Edit tasks that add blocks around the highlighted ones (L09: LBL 1 above,
   LBL 0 below) reserve empty answer rows; each added block must be insertable
   there through the keypad path, and the result must equal the official one. */
let wrapped = 0;
ctx.LESSONS.forEach((lesson, li) => lesson.tasks.forEach((task, ti) => {
  if(!task.solRepl) return;
  const plan = ctx._learnStarterPlan(lesson, ti);
  const oldN = task.solRepl[0].split('\n').length;
  if(plan.mode !== 'edit' || plan.start < 0 || plan.count <= oldN) return;
  wrapped++;
  codeEl.value = plan.code;
  Object.assign(LEARN, {open:true, lesson:li, task:ti, answerStartLine:plan.start, answerLineCount:plan.count, answerMode:'edit'});
  vm.runInContext('_learnLockCapture(codeEl.value, LEARN.answerStartLine, LEARN.answerLineCount)', ctx);
  const want = task.solRepl[1].split('\n');
  rollbacks = 0;
  want.forEach((line, i) => {
    const row = plan.start + i;
    if(codeEl.value.split('\n')[row] !== '') return;
    const at = ctx._learnLineOffset(codeEl.value, row);
    ctx.syncEditorSelection(at, at);
    ctx.insertProgramBlock(line, at, at, {mode:'command'});
  });
  const id = lesson.id + ' task ' + (ti + 1);
  assert.strictEqual(rollbacks, 0, id + ': no added block is rolled back by the practice lock');
  assert.strictEqual(codeEl.value, ctx._learnSolvedCode(lesson, ti), id + ': keypad result equals the official solution');
  assert.ok(ctx._learnLockValid(codeEl.value), id + ': locked lines are unchanged');
}));
assert.ok(wrapped >= 1, 'sweep covers the edit tasks that add blocks around the highlighted ones');
console.log('learn-lock-insert-sweep: ' + checked + ' insert tasks and ' + wrapped + ' wrap task(s) accept keypad inserts');
