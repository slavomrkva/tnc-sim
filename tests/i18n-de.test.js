/* i18n-de.test.js — guards the German localization layer.
 * No dependencies: reads the source files and checks key coverage so a renamed
 * or mistyped key can never ship a half-translated UI.
 *
 *   node tests/i18n-de.test.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'web/i18n.js'), 'utf8');
const panels = fs.readFileSync(path.join(root, 'web/panels.js'), 'utf8');

let failures = 0;
const fail = (m) => { console.error('✗ ' + m); failures++; };
const pass = (m) => console.log('✓ ' + m);

// keys referenced in markup (any data-i18n* attribute)
const htmlKeys = new Set();
for (const m of html.matchAll(/data-i18n(?:-html|-title|-aria|-ph)?="([^"]+)"/g)) htmlKeys.add(m[1]);

// keys referenced via t('key', ...) in web-only JS
const jsKeys = new Set();
for (const src of [panels]) for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9.]+)'/g)) jsKeys.add(m[1]);

// keys defined in the German map
const deStart = i18n.indexOf('de: {');
const deBody = i18n.slice(deStart, i18n.indexOf('\n    }', deStart));
const deKeys = new Set();
for (const m of deBody.matchAll(/'([a-zA-Z0-9.]+)':/g)) deKeys.add(m[1]);

const used = new Set([...htmlKeys, ...jsKeys]);

const missing = [...used].filter((k) => !deKeys.has(k)).sort();
if (missing.length) fail('German translations missing for: ' + missing.join(', '));
else pass(`every used key has a German translation (${used.size} keys)`);

const orphan = [...deKeys].filter((k) => !used.has(k)).sort();
if (orphan.length) fail('German keys defined but never used: ' + orphan.join(', '));
else pass(`no orphan German keys (${deKeys.size} defined)`);

// sanity: values must not still read as their English source for a few anchors
const anchors = { 'toolbar.run': 'Run', 'view.tools': 'Tool Table', 'bug.cancel': 'Cancel' };
for (const [k, en] of Object.entries(anchors)) {
  const re = new RegExp("'" + k.replace('.', '\\.') + "':\\s*'([^']+)'");
  const v = (deBody.match(re) || [])[1];
  if (!v) fail(`anchor key ${k} not found in DE map`);
  else if (v === en) fail(`anchor key ${k} still English ("${v}")`);
  else pass(`${k} localized -> "${v}"`);
}

// ── Learn lessons overlay (web/i18n-lessons-de.js vs core/data-tables.js) ──
try {
  const dt = fs.readFileSync(path.join(root, 'core/data-tables.js'), 'utf8');
  const ov = fs.readFileSync(path.join(root, 'web/i18n-lessons-de.js'), 'utf8');
  const a = dt.indexOf('var LESSONS = [');
  const b = dt.indexOf('\n];', a) + 3;
  const helpers = new Set(['learnSnippet']);
  for (const m of (dt.slice(a, b) + ov).matchAll(/\b(learn[A-Za-z0-9]+)\s*\(/g)) helpers.add(m[1]);
  const stub = [...helpers].map((h) => h === 'learnSnippet' ? 'var learnSnippet=x=>x;' : 'var ' + h + '=()=>"";').join('') +
    'var _isMTab=()=>false;var window={I18N:{getLang:()=>"de"}},I18N=window.I18N;';
  const out = new Function(stub + dt.slice(a, b) + ov + ';return {L:LESSONS,DE:LESSONS_DE};')();
  const ids = out.L.map((x) => x.id);
  const cov = Object.keys(out.DE);
  const uncovered = ids.filter((i) => !cov.includes(i));
  if (uncovered.length) fail('lessons without German overlay: ' + uncovered.join(', '));
  else pass(`all ${ids.length} lessons have a German overlay`);
  // check/slide count parity + slide fns render
  const mism = [];
  cov.forEach((id) => {
    const le = out.L.find((x) => x.id === id);
    const d = out.DE[id];
    if (d.slides && le.slides && d.slides.length !== le.slides.length) mism.push(id + ' slides');
    (d.tasks || []).forEach((dt2, ti) => {
      const en = le.tasks[ti];
      if (dt2.checks && en && dt2.checks.length !== en.checks.length) mism.push(id + ' t' + ti + ' checks');
    });
    (le.slides || []).forEach((sl, si) => { try { sl.html(); } catch (e) { mism.push(id + ' slide' + si + ' render'); } });
  });
  if (mism.length) fail('lesson parity/render issues: ' + mism.join(', '));
  else pass('lesson check/slide counts match EN and all German slides render');
} catch (e) {
  fail('lessons overlay check crashed: ' + e.message);
}

if (failures) { console.error(`\n${failures} FAILURE(S)`); process.exit(1); }
console.log('\nAll i18n-de checks passed.');
