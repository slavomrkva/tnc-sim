const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'web', 'styles.css'), 'utf8');
const keyboard = fs.readFileSync(path.join(root, 'web', 'keyboard.js'), 'utf8');

assert.match(css, /body\[data-mtab\] \.mtab-bar\{[^}]*position:relative[^}]*flex-shrink:0/,
  'mobile bottom tabs stay in the bounded app flex layout');
for(const section of ['learn', 'view', 'editor']){
  assert.match(css, new RegExp(
    `body\\[data-mtab="${section}"\\]\\{[^}]*height:var\\(--vvh,100dvh\\)[^}]*padding-bottom:0`
  ), `${section} uses the live visual viewport without fixed-bar padding`);
}
assert.match(css, /html\.kbd-open \.mtab-bar\{display:none;\}/,
  'the in-flow bottom row releases its space while the keyboard is open');
assert.match(keyboard, /setProperty\('--vvh', vv\.height \+ 'px'\)/,
  'visualViewport height drives the bounded mobile app layout');
assert.match(keyboard, /drop > 200 && hasTextFocus\(\)/,
  'ordinary browser-chrome resizing cannot be mistaken for the keyboard');
assert.match(keyboard, /keyboardOpen && drop < 160/,
  'the bar returns after the keyboard closes even if text focus remains');

console.log('mobile-bottom-tabs.test.js: mobile tab row remains in the live viewport layout');
