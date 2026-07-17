const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'core', 'editor-core.js'), 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(source, context);

assert.strictEqual(context.applyNumericSign('123', '-'), '-123', 'minus moves behind-the-value input to the front');
assert.strictEqual(context.applyNumericSign('-123', '-'), '123', 'a second minus restores the positive value');
assert.strictEqual(context.applyNumericSign('+123', '-'), '-123', 'minus replaces an explicit plus');
assert.strictEqual(context.applyNumericSign('-123', '+'), '+123', 'plus selects an explicit positive value');
assert.strictEqual(context.normalizeTrailingNumericSign('123-'), '-123', 'fallback normalizes a mobile-appended minus');
assert.strictEqual(context.normalizeTrailingNumericSign('-123-'), '123', 'fallback toggles a negative mobile value to positive');

console.log('mobile numeric sign toggle regression passed');
