const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
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
  document: {getElementById: () => null}
};
context.window = context;
vm.createContext(context);
vm.runInContext(read('core/data-tables.js'), context, {filename:'data-tables.js'});
vm.runInContext(read('core/parser-engine.js'), context, {filename:'parser-engine.js'});
vm.runInContext(read('core/learn-tutorial.js'), context, {filename:'learn-tutorial.js'});

function solutionFor(task){
  if(task.solRepl) return task.starter.replace(task.solRepl[0], task.solRepl[1]);
  if(task.sol !== undefined) return task.starter.replace('\n\n', '\n' + task.sol + '\n');
  return null;
}

const intro = context.LESSONS.find(lesson => lesson.id === 'L00');
assert.strictEqual(intro.slides.length, 3, 'Start here has three information slides');
assert.match(intro.slides[0].html(), /reopen these slides at any time during practice/);
assert.match(intro.slides[1].html(), /question panel[\s\S]*highlighted answer row/);
assert.match(intro.slides[1].html(), /Hint 1[\s\S]*Hint 2[\s\S]*Hint 3/, 'Hint levels render in order');
assert.match(intro.slides[2].html(), /green[\s\S]*Check[\s\S]*green or red/);
assert.strictEqual(intro.tasks[0].prompt, 'Type a short comment on the highlighted line');
assert.strictEqual(intro.tasks[0].answerPrefix, '; ', 'Start here exposes a real highlighted answer row');
assert.strictEqual(intro.tasks[0].checks.length, 2, 'Start here demonstrates the post-Check verdict');
assert.ok(context.learnEvalChecks(solutionFor(intro.tasks[0]), intro.tasks[0]).every(result => result.ok),
  'Start here has a working example solution');
assert.match(read('core/data-tables.js'), /Switch between the Editor and 3D view at any time/);
const coachSource = read('core/learn-coach.js');
assert.match(coachSource, /key === 'prompt'[\s\S]*learnAnswerHead/,
  'desktop tutorial targets the visible question panel instead of the hidden task card');
assert.match(coachSource, /key === 'answer'[\s\S]*#hlLayer \.learn-answer-line/,
  'tutorial targets the exact highlighted answer row');
assert.match(coachSource, /key === 'theory'[\s\S]*\.lp-theory-sum/,
  'tutorial explains that Info Slides remain available during practice');

for(const lesson of context.LESSONS){
  for(let i=0; i<lesson.tasks.length; i++){
    const task = lesson.tasks[i];
    const solution = solutionFor(task);
    if(!solution || !task.checks) continue;

    const solved = context.learnEvalChecks(solution, task);
    assert.ok(solved.every(result => result.ok),
      `${lesson.id}.${i+1} official solution failed: ${solved.filter(r => !r.ok).map(r => r.label).join(', ')}`);

    const starter = context.learnEvalChecks(task.starter, task);
    assert.ok(!starter.every(result => result.ok), `${lesson.id}.${i+1} starter already passes`);

    if(!task.checks.some(check => check.t === 'has_comment')){
      const answer = task.solRepl ? task.solRepl[1] : task.sol;
      const comments = String(answer).split('\n').map(line => '; ' + line).join('\n');
      const cheated = task.starter.replace(/\nEND PGM/i, '\n' + comments + '\nEND PGM');
      const results = context.learnEvalChecks(cheated, task);
      assert.ok(!results.every(result => result.ok), `${lesson.id}.${i+1} accepts answer only in comments`);
    }
  }
}

const chamfer = context.LESSONS.find(lesson => lesson.id === 'L22');
for(const [taskIndex, wrong, correct] of [[0, 'Q201=+4', 'Q201=-4'], [1, 'Q201=+1', 'Q201=-1']]){
  const task = chamfer.tasks[taskIndex];
  const wrongCode = solutionFor(task).replace(new RegExp(correct.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'), wrong);
  const results = context.learnEvalChecks(wrongCode, task);
  assert.ok(!results.every(result => result.ok), `L22.${taskIndex+1} accepted the wrong Q201 sign`);
}

console.log('Learn tutorial checks passed');
