const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'web', 'analytics.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const handlers = {};
const code = {
  addEventListener(type, fn) { handlers[`code:${type}`] = fn; }
};
const refine = {
  addEventListener(type, fn) { handlers[`refine:${type}`] = fn; }
};
const events = [];

const context = {
  console,
  document: {
    getElementById(id) {
      if(id === 'code') return code;
      if(id === 'refineBtnCanvas') return refine;
      return null;
    }
  },
  umami: {
    track(name, data) {
      events.push({
        name,
        data: data === undefined ? undefined : JSON.parse(JSON.stringify(data))
      });
    }
  },
  mode: 'idle',
  VX_QUALITY: 1,
  curView: '3d',
  toolLibrary: [{T: 1, NAME: 'DEFAULT'}],
  LESSONS: [{id: 'start'}, {id: 'contours'}],
  LEARN: {open: false, lesson: -1, task: -1, hint: 0}
};
context.window = context;

context.onRun = function(){ context.mode = context.blockRun ? 'idle' : 'running'; };
context.onStop = function(){ context.mode = 'idle'; };
context.onReset = function(){ context.mode = 'idle'; };
context.advance = function(){ if(context.finishRun) context.mode = 'done'; };
context.setQuality = function(q){ context.VX_QUALITY = q; context.mode = 'idle'; };
context.switchView = function(v){ context.curView = v; };
context.toolSave = function(oldNum){
  if(context.rejectToolSave) return;
  if(oldNum === null) context.toolLibrary.push({T: 2, NAME: 'NEW'});
  else context.toolLibrary[0] = {T: 1, NAME: 'EDITED'};
};
context.learnOpenLesson = function(i){ context.LEARN.lesson = i; };
context.learnFinishLesson = function(){ context.LEARN.lesson = -1; };
context.learnHint = function(){ context.LEARN.hint = Math.min(3, context.LEARN.hint + 1); };

vm.createContext(context);
vm.runInContext(source, context, {filename: 'web/analytics.js'});

assert.match(index, /src="web\/analytics\.js"/);
assert.match(index, /data-website-id="683107a3-589f-4490-927e-ff60ef848347"/);

context.blockRun = true;
context.onRun();
assert.strictEqual(events.length, 0, 'validation-blocked Run must not be tracked');

context.blockRun = false;
context.onRun();
context.onRun();
assert.deepStrictEqual(events[0], {
  name: 'simulation_started',
  data: {quality: 'default'}
});
assert.strictEqual(events.filter((e) => e.name === 'simulation_started').length, 1);

context.finishRun = true;
context.advance();
assert.deepStrictEqual(events[1], {
  name: 'simulation_completed',
  data: {quality: 'default'}
});

context.setQuality(2);
context.setQuality(2);
assert.strictEqual(events.filter((e) => e.name === 'simulation_quality_selected').length, 1);
assert.deepStrictEqual(events.find((e) => e.name === 'simulation_quality_selected').data, {
  quality: 'high'
});

context.onRun();
context.setQuality(2);
context.onRun();
assert.strictEqual(
  events.filter((e) => e.name === 'simulation_started').length,
  3,
  'a quality rebuild must end the previous analytics run'
);
context.onReset();

context.LEARN.open = true;
handlers['code:input']();
context.LEARN.open = false;
handlers['code:input']();
handlers['code:input']();
assert.strictEqual(events.filter((e) => e.name === 'editor_used').length, 1);

context.switchView('tools');
context.switchView('3d');
context.switchView('tools');
assert.strictEqual(events.filter((e) => e.name === 'tool_table_opened').length, 1);

context.rejectToolSave = true;
context.toolSave(null);
context.rejectToolSave = false;
context.toolSave(null);
context.toolSave(1);
assert.deepStrictEqual(
  events.filter((e) => e.name === 'tool_table_saved').map((e) => e.data.action),
  ['add', 'edit']
);

context.learnOpenLesson(1);
context.LEARN.task = 2;
context.learnHint();
context.learnFinishLesson();
assert.deepStrictEqual(events.find((e) => e.name === 'lesson_started').data, {
  lesson_id: 'contours'
});
assert.deepStrictEqual(events.find((e) => e.name === 'lesson_hint_used').data, {
  lesson_id: 'contours',
  task: 3,
  level: 1
});
assert.deepStrictEqual(events.find((e) => e.name === 'lesson_completed').data, {
  lesson_id: 'contours'
});

handlers['refine:click']();
assert.deepStrictEqual(events.find((e) => e.name === 'simulation_refine_used').data, {
  quality: 'high'
});

delete context.umami;
assert.doesNotThrow(() => context.TNC_ANALYTICS.track('offline_noop'));

const forbiddenKeys = ['program', 'code', 'filename', 'tool', 'name', 'text', 'user_id'];
events.forEach((event) => {
  Object.keys(event.data || {}).forEach((key) => {
    assert.ok(!forbiddenKeys.includes(key), `forbidden analytics property: ${key}`);
  });
});

console.log('analytics event tests: OK');
