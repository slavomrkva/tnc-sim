const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'web', 'styles.css'), 'utf8');

assert.match(index, /<span class="ph-actions">[\s\S]*?id="mCodesBtn"[\s\S]*?exportProgram\(\)[\s\S]*?importProgram\(\)/);
assert.match(styles, /\.editor-panel\{[^}]*container-type:inline-size/);
assert.match(styles, /\.panel-header\{[^}]*flex-wrap:nowrap/);
assert.match(styles, /\.ph-actions\{[^}]*flex-wrap:wrap[^}]*min-width:0/);
assert.match(styles, /\.ph-actions \.ph-btn\{[^}]*white-space:nowrap/);
assert.match(styles, /@container \(max-width:620px\)\{\.panel-header \.ph-blocks\{display:none/);
assert.match(styles, /@container \(max-width:510px\)\{\.panel-header\{flex-wrap:wrap/);

console.log('editor-header-layout.test.js: narrow desktop header wraps controls without splitting labels');
