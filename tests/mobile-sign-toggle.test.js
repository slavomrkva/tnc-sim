const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'core', 'editor-core.js'), 'utf8');
const qPanelSource = fs.readFileSync(path.join(__dirname, '..', 'core', 'qparam-panel.js'), 'utf8');
const appSource = fs.readFileSync(path.join(__dirname, '..', 'web', 'app.js'), 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(source, context);

assert.strictEqual(context.applyNumericSign('123', '-'), '-123', 'minus moves behind-the-value input to the front');
assert.strictEqual(context.applyNumericSign('-123', '-'), '123', 'a second minus restores the positive value');
assert.strictEqual(context.applyNumericSign('+123', '-'), '-123', 'minus replaces an explicit plus');
assert.strictEqual(context.applyNumericSign('-123', '+'), '+123', 'plus selects an explicit positive value');
assert.strictEqual(context.normalizeTrailingNumericSign('123-'), '-123', 'fallback normalizes a mobile-appended minus');
assert.strictEqual(context.normalizeTrailingNumericSign('-123-'), '123', 'fallback toggles a negative mobile value to positive');
assert.match(qPanelSource, /id="qPanelInput" type="text" inputmode="decimal"/, 'editing a cycle Q value requests the mobile decimal keypad');
assert.match(appSource, /'L':\s*\{title:'L[^]*?p:'Z'[^]*?type:'rc'[^]*?p:'F'[^]*?p:'M'/, 'L guided fields keep radius compensation before feed and M');

const simulationProblems = [
  { line: 0, sev: 'err', msg: 'Radius comp. RL still active at END PGM — cancel with R0' },
  { line: 4, sev: 'err', msg: 'Inner corner/radius is smaller than the compensation radius (5.000mm) — compensated cutting run rejected (tool radius too large).' }
];
const displayedProblems = context._problemsForDisplay(simulationProblems);
assert.strictEqual(displayedProblems.length,2,
  'simulation-start diagnostics remain complete even if a field was just edited');
assert.ok(displayedProblems.every(problem => problem.sev==='err'),
  'simulation-start compensation errors retain their blocking severity');

console.log('mobile numeric sign toggle regression passed');
