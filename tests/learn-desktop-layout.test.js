const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('index.html');
const app = read('web/app.js');
const css = read('web/styles.css');
const core = read('core/learn-tutorial.js');

const answerHeadAt = html.indexOf('id="learnAnswerHead"');
const editorAt = html.indexOf('class="editor-wrap"');
assert.ok(answerHeadAt >= 0, 'Learn answer header is present');
assert.ok(answerHeadAt < editorAt, 'Learn answer header sits directly before the editor');
assert.match(html, /id="code"[^>]+aria-label="NC program editor"/);

assert.ok(!/installDesktopLearnWorkspace/.test(app),
  'web does not reassemble the shared Learn DOM');
assert.match(app, /window\.learnHostUpdate\s*=/,
  'web synchronizes the external editor chrome through a narrow host hook');
assert.match(core, /function _learnPracticeHtml/, 'core owns the task-first practice workspace');
assert.match(core, /<details class="lp-theory"/, 'info slides use an accessible disclosure');
assert.match(core, /L\.slides\[LEARN\.slide\]\.html\(\)/,
  'practice theory remains a navigable slide instead of one long document');
assert.match(app, /code\.setAttribute\('aria-describedby', 'learnAnswerTitle'\)/,
  'the answer editor is associated with its unique external answer direction');
assert.match(core, /function learnCheck\(\)[\s\S]*LEARN\.theoryOpen = false/,
  'checking collapses info slides so feedback is visible');

assert.match(css, /@media \(min-width:1025px\) and \(min-height:601px\)/,
  'new workspace is limited to desktop-sized viewports');
assert.match(css, /body\.learn-desktop-practice \.learn-answer-head[\s\S]*display:flex/,
  'answer header is visible only in focused desktop practice');
assert.match(css, /body\.learn-desktop-practice \.lp-task/,
  'assignment has a dedicated visual card');
assert.match(css, /\.lp-theory-sum/,
  'info disclosure has an explicit interactive summary');
assert.match(css, /@media\(max-width:1024px\), \(max-height:600px\)/,
  'the existing mobile/short viewport breakpoint remains present');

console.log('Desktop Learn layout contract passed');
