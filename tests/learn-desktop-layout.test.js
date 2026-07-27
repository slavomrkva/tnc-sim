const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('index.html');
const app = read('web/app.js');
const css = read('web/styles.css');
const core = read('core/learn-tutorial.js');
const editorCore = read('core/editor-core.js');
const panels = read('web/panels.js');

const answerHeadAt = html.indexOf('id="learnAnswerHead"');
const editorAt = html.indexOf('class="editor-wrap"');
assert.ok(answerHeadAt >= 0, 'Learn answer header is present');
assert.ok(answerHeadAt < editorAt, 'Learn answer header sits directly before the editor');
assert.match(html, /id="code"[^>]+aria-label="NC program editor"/);

assert.ok(!/installDesktopLearnWorkspace/.test(app),
  'web does not reassemble the shared Learn DOM');
assert.match(app, /window\.learnHostUpdate\s*=/,
  'web synchronizes the external editor chrome through a narrow host hook');
assert.match(app, /classList\.toggle\('learn-desktop-open', open\)/,
  'web identifies every open desktop Learn view, including lesson selection');
assert.match(app, /title\.innerHTML = task \? task\.prompt/,
  'desktop task prompt is mirrored into the banner above the editor');
assert.match(core, /function _learnPracticeHtml/, 'core owns the task-first practice workspace');
assert.match(core, /<details class="lp-theory"/, 'info slides use an accessible disclosure');
assert.match(core, /L\.slides\[LEARN\.slide\]\.html\(\)/,
  'practice theory remains a navigable slide instead of one long document');
assert.match(app, /code\.setAttribute\('aria-describedby', 'learnAnswerTitle learnAnswerDirection'\)/,
  'the answer editor is associated with the task and answer direction');
assert.match(core, /function learnCheck\(\)[\s\S]*LEARN\.theoryOpen = false/,
  'checking collapses info slides so feedback is visible');
assert.match(core, /var onLastSlide = LEARN\.slide === L\.slides\.length - 1/,
  'practice is offered only after the final information slide');
assert.match(core, /lp-slide-arrow lp-slide-prev[\s\S]*lp-slide-arrow lp-slide-next/,
  'information slides expose dedicated previous and next controls');
assert.match(editorCore, /learn-answer-line/,
  'the syntax overlay paints the intended answer blocks');
assert.match(panels, /cls\+=' learn-target'/,
  'the answer blocks are also marked in the line-number gutter');

assert.match(css, /@media \(min-width:1025px\) and \(min-height:601px\)/,
  'new workspace is limited to desktop-sized viewports');
assert.match(css, /body\.learn-desktop-practice \.learn-answer-head[\s\S]*display:flex/,
  'answer header is visible only in focused desktop practice');
assert.match(css, /body\.learn-desktop-practice #learnPanel,[\s\S]*body\.learn-desktop-practice \.canvas-panel\{[^}]*width:33\.333333% !important;[^}]*flex:0 0 33\.333333%/,
  'lesson, editor and result use equal desktop thirds');
assert.match(css, /body\.learn-desktop-open:not\(\.learn-desktop-practice\) #learnPanel\{[^}]*width:33\.333333% !important/,
  'lesson selection retains the same one-third desktop width');
assert.match(css, /body\.learn-desktop-practice \.learn-answer-head\{[^}]*background:linear-gradient\(135deg,rgba\(240,169,74/,
  'question banner uses a clearly distinct amber background');
assert.match(app, /t\('learn\.question', 'QUESTION'\)[\s\S]*LEARN\.task \+ 1/,
  'question banner identifies the current task number');
assert.match(app, /t\('learn\.answerThenCheck'[\s\S]*After writing your answer, press Check/,
  'question banner ends with the answer-to-check instruction');
assert.ok(!/_learnGoalsHtml|lp-goals|learn\.doneWhen/.test(core),
  'DONE WHEN is absent from every rendered lesson');
assert.match(css, /body\.learn-desktop-practice \.lp-task\{[^}]*display:none/,
  'the duplicate task card is removed from the desktop lesson panel');
assert.match(css, /\.lp-theory-sum/,
  'info disclosure has an explicit interactive summary');
assert.match(css, /\.lp-theory:not\(\[open\]\)\{[^}]*background:rgba\(93,202,165/,
  'collapsed info slides have a subtle green background');
assert.match(css, /\.lp-slides-nav \.lp-slide-arrow\{[^}]*width:44px/,
  'slide arrows retain large, stable previous/next hit targets');
assert.match(css, /#hlLayer \.learn-answer-line\{[^}]*background:rgba\(240,169,74/,
  'answer blocks have a full-width amber highlight');
assert.match(css, /\.lp-btn\.chk\{[^}]*background:#c6df4a/,
  'Check uses a distinct yellow-green action colour');
assert.match(css, /@media\(max-width:1024px\), \(max-height:600px\)/,
  'the existing mobile/short viewport breakpoint remains present');

console.log('Desktop Learn layout contract passed');
