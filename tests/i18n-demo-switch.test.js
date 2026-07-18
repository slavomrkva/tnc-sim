'use strict';

// The language switch reloads the page. Browsers may restore textarea.value
// from the previous page, so EN must recover the canonical markup default when
// that value is exactly the German Complete Part starter program.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const app = fs.readFileSync(path.join(__dirname, '..', 'web', 'app.js'), 'utf8');
const start = app.indexOf('function _selectDefaultDemoCode(');
const end = app.indexOf('\nvar DEFAULT_CODE =', start);
assert.ok(start >= 0 && end > start, 'default-demo language resolver must exist');

const ctx = {};
vm.createContext(ctx);
vm.runInContext(app.slice(start, end), ctx);

const en = 'EN Complete Part';
const de = 'DE Vollstaendiges Werkstueck';

// Browser restores the DE editor value after switching back to EN.
{
  const el = { defaultValue: en, value: de };
  assert.strictEqual(ctx._selectDefaultDemoCode(el, 'en', de), en);
  assert.strictEqual(el.value, en, 'DE Complete Part must return to EN after the reload');
}

// A user-authored program must not be replaced merely because the UI is EN.
{
  const el = { defaultValue: en, value: 'MY CUSTOM PROGRAM' };
  assert.strictEqual(ctx._selectDefaultDemoCode(el, 'en', de), en);
  assert.strictEqual(el.value, 'MY CUSTOM PROGRAM');
}

// Switching to DE still replaces the shipped default as before.
{
  const el = { defaultValue: en, value: en };
  assert.strictEqual(ctx._selectDefaultDemoCode(el, 'de', de), de);
  assert.strictEqual(el.value, de);
}

console.log('i18n Complete Part DE-to-EN regression passed');
