const assert = require('assert');
const harness = require('./_cycle-harness');

const context = harness.makeContext();
const code = harness.program(`LBL 7
L IX+10 F100
L IY+10
LBL 0
CALL LBL 7`);
const callLine = code.split('\n').findIndex(line => line === 'CALL LBL 7');

context.codeEl = { value: code };
const parsed = context.parseProgram(code);
const callSegments = parsed.sub.filter(segment => segment.srcLine === callLine);

assert.strictEqual(callSegments.length, 2, 'CALL LBL body should produce executable segments');
assert.strictEqual(context.getLblAtLine(callLine), '7', 'CALL LBL segments should report their called LBL');
assert.strictEqual(context.getLblAtLine(4), '7', 'fall-through LBL body should retain its label');
assert.strictEqual(context.getLblAtLine(6), null, 'LBL 0 should clear the active label');

console.log('LBL simulation-status regression passed');
