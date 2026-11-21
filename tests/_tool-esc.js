// The real toolEsc() from core/tool-table.js, for tests that load a single
// core module whose HTML output escapes text with it.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'core', 'tool-table.js'), 'utf8');
const match = source.match(/function toolEsc\(value\)\{[\s\S]*?\n\}/);
if (!match) throw new Error('toolEsc() not found in core/tool-table.js');
module.exports = vm.runInNewContext('(' + match[0] + ')');
