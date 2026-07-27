/* i18n-de.test.js — guards the German localization layer.
 * No dependencies: reads the source files and checks key coverage so a renamed
 * or mistyped key can never ship a half-translated UI.
 *
 *   node tests/i18n-de.test.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const vmRun = (src, ctx) => { vm.createContext(ctx); vm.runInContext(src, ctx); };
const vmRunExpr = (src) => vm.runInNewContext(src);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'web/i18n.js'), 'utf8');
const panels = fs.readFileSync(path.join(root, 'web/panels.js'), 'utf8');
const webApp = fs.readFileSync(path.join(root, 'web/app.js'), 'utf8');
const bugReport = fs.readFileSync(path.join(root, 'core/bug-report.js'), 'utf8');
const programAutosave = fs.readFileSync(path.join(root, 'core/program-autosave.js'), 'utf8');

let failures = 0;
const fail = (m) => { console.error('✗ ' + m); failures++; };
const pass = (m) => console.log('✓ ' + m);

// keys referenced in markup (any data-i18n* attribute)
const htmlKeys = new Set();
for (const m of html.matchAll(/data-i18n(?:-html|-title|-aria|-ph)?="([^"]+)"/g)) htmlKeys.add(m[1]);

// keys referenced via t('key', ...) in web-only JS
const jsKeys = new Set();
for (const src of [panels, webApp]) for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9.]+)'/g)) jsKeys.add(m[1]);
// bug-report.js localizes through the _bugT('key', english) helper
for (const m of bugReport.matchAll(/_bugT\(\s*'([a-zA-Z0-9.]+)'/g)) jsKeys.add(m[1]);
// program-autosave.js localizes through the _programAutosaveT helper
for (const m of programAutosave.matchAll(/_programAutosaveT\(\s*'([a-zA-Z0-9.]+)'/g)) jsKeys.add(m[1]);

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

// ── M list / auto-insert comments (web/app.js: M_DEFS vs M_DEFS_DE) ──
{
  const appSrc = fs.readFileSync(path.join(root, 'web/app.js'), 'utf8');
  const mDefsBody = appSrc.slice(appSrc.indexOf('var M_DEFS = ['), appSrc.indexOf('\n];\n', appSrc.indexOf('var M_DEFS = [')));
  const mCodes = new Set([...mDefsBody.matchAll(/\{m:'(M\d+)'/g)].map((m) => m[1]));
  const mDefsDeBody = appSrc.slice(appSrc.indexOf('var M_DEFS_DE = {'), appSrc.indexOf('\n};', appSrc.indexOf('var M_DEFS_DE = {')));
  const mCodesDe = new Set([...mDefsDeBody.matchAll(/\n\s*(M\d+):/g)].map((m) => m[1]));
  const missingM = [...mCodes].filter((c) => !mCodesDe.has(c)).sort();
  const orphanM = [...mCodesDe].filter((c) => !mCodes.has(c)).sort();
  if (missingM.length) fail('M_DEFS_DE missing codes: ' + missingM.join(', '));
  else pass(`every M_DEFS code has a German translation (${mCodes.size} codes)`);
  if (orphanM.length) fail('M_DEFS_DE has orphan codes: ' + orphanM.join(', '));
  else pass('no orphan M_DEFS_DE codes');
}

// ── CYCLES name/param overlay (web/i18n-cycles-de.js vs core/data-tables.js) ──
try {
  const dt = fs.readFileSync(path.join(root, 'core/data-tables.js'), 'utf8');
  const cyclesCtx = {};
  const cyclesSrc = dt.match(/var CYCLES = \[[\s\S]*?\r?\n\];/);
  if (!cyclesSrc) throw new Error('CYCLES table not found');
  vmRun(cyclesSrc[0], cyclesCtx);
  const overlaySrc = fs.readFileSync(path.join(root, 'web/i18n-cycles-de.js'), 'utf8');
  const cycleNamesDe = {};
  for (const m of overlaySrc.matchAll(/(\d+):\s*'([^']+)'/g)) cycleNamesDe[m[1]] = m[2];
  const paramNamesDe = {};
  for (const m of overlaySrc.matchAll(/'([^']+)':(?:\s*)'([^']+)'/g)) paramNamesDe[m[1]] = m[2];

  const missingCycles = cyclesCtx.CYCLES.filter((c) => !cycleNamesDe[c.num]).map((c) => c.num);
  if (missingCycles.length) fail('CYCLES missing German name for cycle(s): ' + missingCycles.join(', '));
  else pass(`every cycle has a German name (${cyclesCtx.CYCLES.length} cycles)`);

  const paramNames = new Set();
  cyclesCtx.CYCLES.forEach((c) => c.params.forEach((p) => paramNames.add(p.name)));
  const missingParams = [...paramNames].filter((n) => !paramNamesDe[n]).sort();
  if (missingParams.length) fail('CYCLES params missing German name: ' + missingParams.join(', '));
  else pass(`every cycle parameter has a German name (${paramNames.size} unique names)`);
} catch (e) {
  fail('CYCLES overlay check crashed: ' + e.message);
}

// ── Demo programs: DE overlay must translate comments only, never touch Klartext ──
// For every line, the portion before the first ';' must be byte-identical between
// the English source and its German counterpart — only text after ';' may differ.
function assertCommentsOnlyDiff(label, en, de) {
  const enLines = en.split('\n');
  const deLines = de.split('\n');
  if (enLines.length !== deLines.length) { fail(`${label}: line count differs (EN ${enLines.length} vs DE ${deLines.length})`); return; }
  for (let i = 0; i < enLines.length; i++) {
    const enCode = enLines[i].split(';')[0].replace(/\s+$/, '');
    const deCode = deLines[i].split(';')[0].replace(/\s+$/, '');
    if (enCode !== deCode) { fail(`${label}: line ${i + 1} Klartext differs\n    EN: ${enLines[i]}\n    DE: ${deLines[i]}`); return; }
  }
  pass(`${label}: Klartext identical, only comments differ (${enLines.length} lines)`);
}

try {
  const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const completeEn = indexHtml.match(/<textarea id="code"[^>]*>([\s\S]*?)<\/textarea>/)[1];
  const appSrc = fs.readFileSync(path.join(root, 'web/app.js'), 'utf8');
  const completeDe = appSrc.match(/var DEFAULT_CODE_DE = `([\s\S]*?)`;/)[1];
  assertCommentsOnlyDiff('Complete Part (default program)', completeEn, completeDe);

  const angleEnMatch = appSrc.match(/\{ name: 'Angle Mill', code: (('[^'\\]*(?:\\.[^'\\]*)*')) \}/);
  const angleEn = vmRunExpr(angleEnMatch[1]);
  const angleDe = appSrc.match(/var _angleMillDE = `([\s\S]*?)`;/)[1];
  assertCommentsOnlyDiff('Angle Mill', angleEn, angleDe);
} catch (e) {
  fail('starter/Angle Mill overlay check crashed: ' + e.message);
}

try {
  const dpCtx = {};
  vmRun(fs.readFileSync(path.join(root, 'core/demo-programs.js'), 'utf8'), dpCtx);
  const overlayCtx = { window: {} };
  vmRun(fs.readFileSync(path.join(root, 'web/i18n-demos-de.js'), 'utf8'), overlayCtx);

  const enNames = dpCtx.EXTRA_DEMO_PROGRAMS.map((d) => d.name);
  const deNames = overlayCtx.EXTRA_DEMO_PROGRAMS_DE.map((d) => d.name);
  const missingDemo = enNames.filter((n) => !deNames.includes(n));
  const orphanDemo = deNames.filter((n) => !enNames.includes(n));
  if (missingDemo.length) fail('EXTRA_DEMO_PROGRAMS_DE missing entries: ' + missingDemo.join(', '));
  if (orphanDemo.length) fail('EXTRA_DEMO_PROGRAMS_DE has orphan entries: ' + orphanDemo.join(', '));
  if (!missingDemo.length && !orphanDemo.length) pass(`EXTRA_DEMO_PROGRAMS_DE covers all ${enNames.length} demos`);

  dpCtx.EXTRA_DEMO_PROGRAMS.forEach((demo) => {
    const de = overlayCtx.EXTRA_DEMO_PROGRAMS_DE.find((d) => d.name === demo.name);
    if (de) assertCommentsOnlyDiff(`demo "${demo.name}"`, demo.code, de.code);
  });
} catch (e) {
  fail('EXTRA_DEMO_PROGRAMS_DE overlay check crashed: ' + e.message);
}

if (failures) { console.error(`\n${failures} FAILURE(S)`); process.exit(1); }
console.log('\nAll i18n-de checks passed.');
