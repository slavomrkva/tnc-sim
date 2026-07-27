
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

/* ── grading requirements appear only as a Check verdict ── */
assert.ok(!/_learnGoalsHtml|lp-goals/.test(core),
  'practice has no always-visible goals component');
assert.match(core, /function _learnResultsHtml[\s\S]*if\(!res \|\| !T\.checks\.length\) return ''/,
  'the requirement checklist stays hidden until Check supplies a verdict');
assert.match(core, /codeEl\.addEventListener\('input', learnCodeChanged\)/,
  'typing clears a stale Check verdict');

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

/* ── every real task exposes a visible answer range in the editor ── */
let inserted = 0, edited = 0, none = 0;
for(const lesson of context.LESSONS){
  for(let i = 0; i < lesson.tasks.length; i++){
    const task = lesson.tasks[i];
    const plan = context._learnStarterPlan(lesson, i);
    const injected = plan.code;

    if(plan.start < 0){
      none++;
      assert.strictEqual(task.checks.length, 0,
        `${lesson.id}.${i+1} may omit an answer range only when it has no graded task`);
      continue;
    }

    assert.ok(plan.count >= 1, `${lesson.id}.${i+1} highlights at least one answer block`);
    assert.ok(plan.start + plan.count <= injected.split('\n').length,
      `${lesson.id}.${i+1} answer range stays inside the starter program`);

    if(plan.mode === 'insert'){
      inserted++;
      if(task.answerPrefix !== undefined){
        assert.strictEqual(injected.split('\n')[plan.start], task.answerPrefix,
          `${lesson.id}.${i+1} starts with its editable answer prefix`);
        assert.strictEqual(plan.caretColumn, task.answerPrefix.length,
          `${lesson.id}.${i+1} places the caret after the answer prefix`);
        assert.ok(!/;\s*>>>/.test(injected),
          `${lesson.id}.${i+1} avoids a marker that could be mistaken for the requested comment`);
      } else {
        assert.ok(injected.includes('; >>> YOUR ANSWER — TASK ' + (i+1) + '/' + lesson.tasks.length),
          `${lesson.id}.${i+1} carries a concise answer cue in the program`);
        assert.ok(!/>>> write here/.test(injected),
          `${lesson.id}.${i+1} replaced the placeholder marker`);
        assert.strictEqual(injected.split('\n').filter(l => /;\s*>>>/.test(l)).length, 1,
          `${lesson.id}.${i+1} uses one short marker line instead of duplicating the assignment`);
        assert.ok(injected.split('\n').slice(plan.start, plan.start + plan.count).every(line => line === ''),
          `${lesson.id}.${i+1} begins with visibly empty answer blocks`);
      }
    } else {
      edited++;
      assert.ok(injected.split('\n').slice(plan.start, plan.start + plan.count).some(Boolean),
        `${lesson.id}.${i+1} highlights the existing blocks that must be edited`);
    }

    // Grading must be blind to the cue and the extra visual blank rows.
    assert.deepStrictEqual(
      context._learnExecutableCode(injected).replace(/\n+/g, '\n'),
      context._learnExecutableCode(task.starter).replace(/\n+/g, '\n'),
      `${lesson.id}.${i+1} answer zoning changes no executable Klartext`);

    const solvedCode = context._learnSolvedCode(lesson, i);
    const solved = context.learnEvalChecks(solvedCode, task);
    assert.ok(solved.every(r => r.ok),
      `${lesson.id}.${i+1} official solution still passes in the answer range: `
      + solved.filter(r => !r.ok).map(r => r.label).join(', '));
    const fresh = context.learnEvalChecks(injected, task);
    assert.ok(!fresh.every(r => r.ok),
      `${lesson.id}.${i+1} the empty answer range must not pass the task by itself`);
  }
}
assert.ok(inserted > 40 && edited > 0 && none === 1,
  `answer zoning covers the course (${inserted} insert ranges, ${edited} edit ranges, ${none} ungraded)`);

/* An answer marker is never the student's own comment. */
const commentTask = context.LESSONS.find(l => l.id === 'L01').tasks[0];
assert.ok(commentTask.checks.some(c => c.t === 'has_comment'), 'L01.1 grades a comment');
const onlyMarker = 'BEGIN PGM A MM\n; >>> YOUR ANSWER — TASK 1/3\nEND PGM A MM';
assert.ok(!context.learnEvalChecks(onlyMarker, commentTask).some(r => r.ok && r.label.match(/comment/i)),
  'the injected answer marker cannot satisfy has_comment');
const emptyComment = 'BEGIN PGM A MM\n; \nBLK FORM 0.1 Z X+0 Y+0 Z-20\nEND PGM A MM';
assert.ok(!context.learnEvalChecks(emptyComment, commentTask).some(r => r.ok && r.label.match(/comment/i)),
  'an empty comment prefix cannot borrow text from the next NC block');

/* The old requirements panel is now a verdict rendered only after Check. */
context.LEARN = {lastResults:null};
assert.strictEqual(context._learnResultsHtml(commentTask), '',
  'requirements are hidden before Check');
context.LEARN.lastResults = commentTask.checks.map((check, i) => ({
  ok:i !== 0, label:check.label, hint:check.hint
}));
const failedResult = context._learnResultsHtml(commentTask);
assert.match(failedResult, /DONE WHEN/, 'Check reveals the requirement panel');
assert.match(failedResult, /lp-check bad/, 'failed requirements are red verdict rows');
assert.match(failedResult, /lp-check ok/, 'met requirements are green verdict rows');
context.LEARN.lastResults = commentTask.checks.map(check => ({
  ok:true, label:check.label, hint:check.hint
}));
assert.match(context._learnResultsHtml(commentTask), /lp-results all-ok/,
  'an all-correct Check renders a green result panel');

console.log(`Learn practice contract passed (${inserted} insert ranges, ${edited} edit ranges)`);
