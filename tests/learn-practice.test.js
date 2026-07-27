
/* Contract for the Learn practice experience.

   The point of these assertions is that practice is rendered ONCE, in
   core/learn-tutorial.js, for every layout. A previous iteration re-arranged
   the rendered DOM from web/app.js after the fact; that silently fell back to
   the old layout whenever a selector drifted, so it is asserted against here. */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('index.html');
const app = read('web/app.js');
const core = read('core/learn-tutorial.js');
const css = read('web/styles.css');

/* ── architecture ── */
assert.ok(!/installDesktopLearnWorkspace/.test(app),
  'practice is not re-assembled by a web-only DOM pass');
assert.ok(!/window\.learnRender\s*=/.test(app),
  'web/app.js does not monkey-patch the shared renderer');
assert.match(html, /id="learnAnswerHead"/,
  'desktop practice has an explicit answer boundary above the editor');
assert.match(app, /window\.learnHostUpdate\s*=/,
  'the web host synchronizes only editor chrome outside the shared Learn panel');
assert.ok(!/appendChild\([^)]*lp-|insertBefore\([^)]*lp-/.test(app),
  'the host hook never re-parents shared practice markup');
assert.match(core, /function _learnPracticeHtml/,
  'one shared builder produces the practice markup for every layout');
assert.match(core, /return \{ body: body, foot: foot \}/,
  'the builder returns body and footer separately so each layout can mount them');

/* ── the action row is chrome, not scrolling content ── */
assert.match(css, /\.lp-foot\{[^}]*flex-shrink:0/,
  'the action row is pinned and cannot scroll out of reach');
assert.ok(!/\.lp-practice-btns/.test(css), 'the old in-flow button row is gone');
assert.ok(!/\.lp-slide-view\{[^}]*overflow-y:auto/.test(css),
  'theory no longer nests a second scroll container inside the panel');
assert.match(core, /L\.slides\[LEARN\.slide\]\.html\(\)/,
  'expanded theory keeps the lesson slide structure instead of one long wall');

/* ── live grading semantics ── */
assert.match(core, /function learnPaintGoals/, 'goals repaint without a full re-render');
assert.match(core, /codeEl\.addEventListener\('input', learnCodeChanged\)/,
  'typing re-evaluates the goal list');

const context = {
  console, Math, JSON, RegExp, Date, parseFloat, parseInt, isFinite,
  TOOL_R: 5, DEFAULT_FEED: 500, lastDefinedFeed: 500,
  currentToolNum: 1, _WORKPIECE_TOP_Z: 0,
  pFloat: value => parseFloat(String(value).replace(',', '.')),
  getToolByNum: number => ({
    T:number, R:number === 4 ? 3.4 : (number === 5 ? 0.001 : (number === 7 ? 4 : 5)),
    L:100, DR:0, DL:0, TYPE:number === 1 ? 'MILL' : (number === 5 ? 'COUNTERSINK' : 'DRILL')
  }),
  inferToolType: tool => tool.TYPE || 'MILL',
  _synHighlightLine: line => line,
  document: {getElementById: () => null, querySelectorAll: () => []}
};
context.window = context;
vm.createContext(context);
vm.runInContext(read('core/data-tables.js'), context, {filename:'data-tables.js'});
vm.runInContext(read('core/parser-engine.js'), context, {filename:'parser-engine.js'});
vm.runInContext(read('core/learn-tutorial.js'), context, {filename:'learn-tutorial.js'});

function solutionFor(task, starter){
  if(task.solRepl) return starter.replace(task.solRepl[0], task.solRepl[1]);
  if(task.sol !== undefined) return starter.replace('\n\n', '\n' + task.sol + '\n');
  return null;
}

/* ── a concise answer cue is written into marked starter programs ── */
let marked = 0, plain = 0;
for(const lesson of context.LESSONS){
  for(let i = 0; i < lesson.tasks.length; i++){
    const task = lesson.tasks[i];
    const injected = context._learnStarterFor(lesson, i);
    const hasMark = /^[ \t]*;[ \t]*>>>/m.test(task.starter || '');

    if(!hasMark){
      plain++;
      assert.strictEqual(injected, task.starter,
        `${lesson.id}.${i+1} has no answer line, so its starter must be untouched`);
      continue;
    }
    marked++;

    assert.ok(injected.includes('; >>> YOUR ANSWER — TASK ' + (i+1) + '/' + lesson.tasks.length),
      `${lesson.id}.${i+1} carries a concise answer cue in the program`);
    assert.ok(!/>>> write here/.test(injected),
      `${lesson.id}.${i+1} replaced the placeholder marker`);
    assert.strictEqual(injected.split('\n').filter(l => /;\s*>>>/.test(l)).length, 1,
      `${lesson.id}.${i+1} uses one short marker line instead of duplicating the assignment`);

    // grading must be blind to the injected comment
    assert.deepStrictEqual(
      context._learnStripTaskMarks(injected).replace(/\n+/g, '\n'),
      context._learnStripTaskMarks(task.starter).replace(/\n+/g, '\n'),
      `${lesson.id}.${i+1} injection changes nothing but the marker line`);

    const solved = context.learnEvalChecks(solutionFor(task, injected) || injected, task);
    if(solutionFor(task, injected)){
      assert.ok(solved.every(r => r.ok),
        `${lesson.id}.${i+1} official solution still passes with the assignment injected: `
        + solved.filter(r => !r.ok).map(r => r.label).join(', '));
    }
    const fresh = context.learnEvalChecks(injected, task);
    assert.ok(!fresh.every(r => r.ok),
      `${lesson.id}.${i+1} the injected assignment must not pass the task by itself`);
  }
}
assert.ok(marked > 25 && plain > 0, `injection covers the marked starters (${marked} marked, ${plain} plain)`);

/* An answer marker is never the student's own comment. */
const commentTask = context.LESSONS.find(l => l.id === 'L01').tasks[0];
assert.ok(commentTask.checks.some(c => c.t === 'has_comment'), 'L01.1 grades a comment');
const onlyMarker = 'BEGIN PGM A MM\n; >>> YOUR ANSWER — TASK 1/3\nEND PGM A MM';
assert.ok(!context.learnEvalChecks(onlyMarker, commentTask).some(r => r.ok && r.label.match(/comment/i)),
  'the injected answer marker cannot satisfy has_comment');

/* ── goals render grey/green while typing, red only after Check ── */
const goalTask = context.LESSONS[4].tasks[1];
context.LEARN = {open:true, lesson:4, task:1, live:null, lastResults:null, theoryOpen:false};
const pending = context._learnGoalsHtml(goalTask);
assert.ok(!/&#10007;/.test(pending), 'an unchecked goal list shows no crosses');
assert.match(pending, /data-ci="0"/, 'goal rows are addressable for in-place repaint');

context.LEARN.live = goalTask.checks.map((c, i) => ({ok: i === 0, label: c.label, hint: c.hint}));
const live = context._learnGoalsHtml(goalTask);
assert.ok(!/&#10007;/.test(live), 'live progress never shows a cross');
assert.match(live, /lp-check ok/, 'a satisfied goal ticks green while typing');

context.LEARN.lastResults = context.LEARN.live;
assert.match(context._learnGoalsHtml(goalTask), /&#10007;/, 'Check produces the verdict');

console.log(`Learn practice contract passed (${marked} injected starters, ${plain} free-form)`);
