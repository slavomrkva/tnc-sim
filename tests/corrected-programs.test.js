const assert = require('assert');
const fs = require('fs');
const path = require('path');
const H = require('./_cycle-harness.js');

const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const code = read('examples/report-44/PROGRAM.H').trimEnd();
const english = read('examples/report-44/index.html');
const german = read('de/examples/report-44/index.html');

for (const page of [english, german]) {
  const displayed = page.match(/<pre class="code"[^>]*>([\s\S]*?)<\/pre>/);
  assert.ok(displayed, 'detail page shows the NC program');
  assert.strictEqual(displayed[1], code, 'displayed code matches the downloadable file');
  assert.match(page, /href="\/examples\/report-44\/PROGRAM\.H"/);
}

assert.match(read('examples/index.html'), /href="\/examples\/report-44\/"/);
assert.match(read('de/examples/index.html'), /href="\/de\/examples\/report-44\/"/);
assert.match(read('index.html'), /id="footerExamplesLink"/);
assert.match(read('core/theme-toast.js'), /href="\/examples\/"/);
assert.match(read('web/i18n-about-de.js'), /href="\/de\/examples\/"/);
assert.ok(!code.includes('&#x20;'), 'HTML entity is decoded in the NC file');
assert.ok(!H.validate(code).some(p => p.sev === 'err'), 'published program passes validation');

const parsed = H.parse(code);
assert.ok(!parsed.resultProblems.some(p => p.sev === 'err'), 'published program parses');
assert.deepStrictEqual(Array.from(parsed.sub.filter(s => s.rcActivation), s => s.to.z),
  [-5, -10, -15, -20, -25, -31], 'all six depths receive compensated contours');
assert.ok(parsed.sub.filter(s => s.rc === 'RL').length > 100, 'compensated path is not skipped');

console.log('Corrected program publication and six-pass path passed');
