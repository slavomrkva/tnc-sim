const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

assert.doesNotMatch(read('web/app.js'), /\{l:'GOTO'|toolCallList/);
assert.doesNotMatch(read('core/block-form-panel.js'), /openGotoPanel|gotoSelect/);
assert.doesNotMatch(read('core/editor-core.js'), /function onGoto\b|toolCallList/);
assert.doesNotMatch(read('core/field-editing.js'), /gotoLine\s*:|openGotoPanel/);
assert.doesNotMatch(read('core/parser-engine.js'), /toolCallList|GOTO dropdown/);

console.log('goto-removed.test.js: all assertions passed');
