const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'web', 'styles.css'), 'utf8');

const actionsStart = index.indexOf('<span class="ph-actions">');
const actionsEnd = index.indexOf('</span>', actionsStart);
const blockCount = index.indexOf('id="blockCount"');
assert.match(index, /<span class="ph-actions">[\s\S]*?id="mCodesBtn"[\s\S]*?exportProgram\(\)[\s\S]*?importProgram\(\)/);
assert.ok(blockCount > actionsEnd, 'block count must follow the button group');
assert.match(index, /<span class="ph-controls">[\s\S]*?<span class="ph-actions">[\s\S]*?id="blockCount"/);
assert.match(styles, /\.editor-panel\{[^}]*container-type:inline-size/);
assert.match(styles, /\.panel-header\{[^}]*display:grid[^}]*grid-template-columns:auto minmax\(0,1fr\) auto/);
assert.match(styles, /\.ph-actions\{[^}]*flex-wrap:wrap[^}]*min-width:0/);
assert.match(styles, /\.ph-controls\{[^}]*grid-column:3[^}]*justify-self:end/);
assert.match(styles, /\.ph-actions \.ph-btn\{[^}]*white-space:nowrap/);
assert.doesNotMatch(styles, /@container[^}]+\.ph-blocks\{display:none/);
assert.match(styles, /@container \(max-width:570px\)\{\.panel-header\{[^}]*\}\.ph-controls\{grid-column:1\/-1[^}]*justify-self:end/);

console.log('editor-header-layout.test.js: narrow desktop header wraps controls without splitting labels');
