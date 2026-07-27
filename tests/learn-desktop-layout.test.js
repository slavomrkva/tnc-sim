const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('index.html');
const app = read('web/app.js');
const css = read('web/styles.css');

const answerHeadAt = html.indexOf('id="learnAnswerHead"');
const editorAt = html.indexOf('class="editor-wrap"');
assert.ok(answerHeadAt >= 0, 'Learn answer header is present');
assert.ok(answerHeadAt < editorAt, 'Learn answer header sits directly before the editor');
assert.match(html, /id="code"[^>]+aria-label="NC program editor"/);

assert.match(app, /installDesktopLearnWorkspace/, 'web installs the desktop-only Learn enhancement');
assert.match(app, /typeof _isMTab === 'function'[\s\S]*?!_isMTab\(\)/,
  'desktop enhancement follows the shared responsive breakpoint');
assert.match(app, /className = 'lp-practice-workspace'/, 'practice gets a dedicated task-first workspace');
assert.match(app, /document\.createElement\('details'\)/, 'info slides use an accessible disclosure');
assert.match(app, /className = 'lp-theory-drawer'/, 'info disclosure has a stable layout hook');
assert.match(app, /code\.setAttribute\('aria-describedby', 'learnTaskPrompt'\)/,
  'the answer editor is associated with the active assignment');
assert.match(app, /window\.learnCheck = function\(\)[\s\S]*desktopTheoryOpen = false/,
  'checking collapses info slides so feedback is visible');

assert.match(css, /@media \(min-width:1025px\) and \(min-height:601px\)/,
  'new workspace is limited to desktop-sized viewports');
assert.match(css, /body\.learn-desktop-practice \.learn-answer-head[\s\S]*display:flex/,
  'answer header is visible only in focused desktop practice');
assert.match(css, /body\.learn-desktop-practice \.lp-assignment-card/,
  'assignment has a dedicated visual card');
assert.match(css, /body\.learn-desktop-practice \.lp-theory-summary/,
  'info disclosure has an explicit interactive summary');
assert.match(css, /@media\(max-width:1024px\), \(max-height:600px\)/,
  'the existing mobile/short viewport breakpoint remains present');

console.log('Desktop Learn layout contract passed');
