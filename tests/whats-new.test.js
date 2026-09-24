const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'web', 'whats-new.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'web', 'styles.css'), 'utf8');

const context = { Date, Number, isFinite };
vm.createContext(context);
vm.runInContext(source, context, { filename: 'web/whats-new.js' });

const release = context.WHATS_NEW_RELEASE;
// This branch is a preview. Set mergedAt only after the real production merge.
const start = Date.parse('2026-09-24T12:00:00+02:00');
const windowMs = release.visibleDays * 24 * 60 * 60 * 1000;

assert.strictEqual(release.visibleDays, 10, 'the announcement window is exactly 10 days');
assert.strictEqual(release.mergedAt, null, 'preview does not invent a production merge time');
assert.strictEqual(context._whatsNewIsActive(Date.now(), release.mergedAt, release.visibleDays), false,
  'the production announcement stays hidden before merge');
assert.strictEqual(context._whatsNewIsActive(start - 1, start, release.visibleDays), false,
  'the button stays hidden before the merge');
assert.strictEqual(context._whatsNewIsActive(start, start, release.visibleDays), true,
  'the button appears at the merge time');
assert.strictEqual(context._whatsNewIsActive(start + windowMs - 1, start, release.visibleDays), true,
  'the button remains visible through the 10-day window');
assert.strictEqual(context._whatsNewIsActive(start + windowMs, start, release.visibleDays), false,
  'the button disappears exactly after 10 days');
assert.strictEqual(context._whatsNewIsActive(start, 'not-a-date', 10), false,
  'invalid release metadata fails closed');
context.location = { hostname: 'fix-issue-44-compensated-retrace-tnc-sim.slavo-zett.workers.dev', search: '?preview-whats-new=1' };
assert.strictEqual(context._whatsNewPreview(), true, 'explicit branch preview can show the announcement');
context.location = { hostname: 'tncsim.org', search: '?preview-whats-new=1' };
assert.strictEqual(context._whatsNewPreview(), false, 'production cannot force a pending announcement');

assert.match(index, /id="whatsNewBtn"[\s\S]*hidden/,
  'the header button starts hidden to avoid a pre-init flash');
assert.match(index, /id="whatsNewOverlay"[\s\S]*role="dialog"[\s\S]*aria-modal="true"/,
  'the popup exposes accessible dialog semantics');
assert.ok(index.indexOf('web/whats-new.js') > index.indexOf('web/app.js'),
  'the announcement loads after APP_VERSION is initialized');
assert.match(css, /\.whats-new-card\{[^}]*position:absolute;[^}]*right:20px/,
  'the desktop popup is anchored at the top right');
assert.match(css, /\.whats-new-btn\{[^}]*border:1px solid var\(--border\);[^}]*background:var\(--surface2\);[^}]*color:var\(--text2\)/,
  'What’s New uses the standard neutral header treatment');
assert.ok(release.content.en.items.length === 3 && release.content.de.items.length === release.content.en.items.length,
  'English and German summaries contain the same concise set of changes');
assert.match(release.content.en.items.join(' '), /href="\/examples\/report-44\/"/);
assert.match(release.content.de.items.join(' '), /href="\/de\/examples\/report-44\/"/);

console.log('What’s New release-window and popup contract passed');
