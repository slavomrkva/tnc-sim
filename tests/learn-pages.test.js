'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const lessons = [
  ['L01', 'program-skeleton-blk-form'],
  ['L02', 'tool-call-spindle-feed'],
  ['L03', 'linear-moves-safe-approach'],
  ['L04', 'incremental-coordinates-slot'],
  ['L05', 'circular-arcs-cc-c-cr'],
  ['L06', 'corner-rounding-chamfer'],
  ['L07', 'radius-compensation-rl-rr-r0'],
  ['L08', 'drilling-cycle-200'],
  ['L09', 'subprograms-labels-q-parameters'],
  ['L10', 'polar-coordinates-cc-lp'],
  ['L11', 'circular-pocket-cycle-208'],
  ['L20', 'precision-hole-cycle-201'],
  ['L21', 'tapping-cycle-209'],
  ['L22', 'chamfering-dl-dr-tool-offsets'],
  ['L23', 'parametric-contour-q-parameters']
];
const locales = {
  en: { directory: 'learn', pathPrefix: '', hubHeading: 'Learn Heidenhain Klartext programming online', alternateLabel: 'Deutsch' },
  de: { directory: path.join('de', 'learn'), pathPrefix: '/de', hubHeading: 'Heidenhain Klartext online lernen', alternateLabel: 'English' }
};

const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const titles = new Set();
const descriptions = new Set();
const expectedUrls = new Set(['https://tncsim.org/']);

for (const [locale, config] of Object.entries(locales)) {
  const hubPath = `${config.pathPrefix}/learn/`;
  const hubCanonical = `https://tncsim.org${hubPath}`;
  const hub = read(config.directory, 'index.html');
  expectedUrls.add(hubCanonical);

  assert.match(hub, new RegExp(`<html lang="${locale}">`), `${locale} hub must declare its language`);
  assert.strictEqual((hub.match(/<h1(?:\s|>)/g) || []).length, 1, `${locale} hub must have one h1`);
  assert.ok(hub.includes(`<h1>${config.hubHeading}</h1>`), `${locale} hub must use localized copy`);
  assert.ok(hub.includes(`<link rel="canonical" href="${hubCanonical}">`), `${locale} hub canonical must match`);
  assert.match(hub, /"@type": "Course"/, `${locale} hub must identify its course`);
  assert.match(hub, new RegExp(`"inLanguage": "${locale}"`), `${locale} hub structured data must declare its language`);
  assert.ok(hub.includes('hreflang="en" href="https://tncsim.org/learn/"'), `${locale} hub must link its English alternate`);
  assert.ok(hub.includes('hreflang="de" href="https://tncsim.org/de/learn/"'), `${locale} hub must link its German alternate`);
  assert.ok(hub.includes(`>${config.alternateLabel}</a>`), `${locale} hub must expose a visible language switch`);

  for (const [id, slug] of lessons) {
    const relativeUrl = `${hubPath}${slug}/`;
    const canonical = `https://tncsim.org${relativeUrl}`;
    const englishCanonical = `https://tncsim.org/learn/${slug}/`;
    const germanCanonical = `https://tncsim.org/de/learn/${slug}/`;
    expectedUrls.add(canonical);

    assert.ok(hub.includes(`href="${relativeUrl}"`), `${locale} hub must link to ${relativeUrl}`);

    const html = read(config.directory, slug, 'index.html');
    const title = html.match(/<title>([^<]+)<\/title>/);
    const description = html.match(/<meta name="description" content="([^"]+)">/);

    assert.ok(title, `${locale}/${slug} must have a title`);
    assert.ok(description, `${locale}/${slug} must have a meta description`);
    assert.ok(!titles.has(title[1]), `${locale}/${slug} title must be unique`);
    assert.ok(!descriptions.has(description[1]), `${locale}/${slug} description must be unique`);
    titles.add(title[1]);
    descriptions.add(description[1]);

    assert.ok(html.includes(`<html lang="${locale}">`), `${locale}/${slug} must declare its language`);
    assert.strictEqual((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${locale}/${slug} must have one h1`);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), `${locale}/${slug} canonical must match its URL`);
    assert.ok(html.includes(`hreflang="en" href="${englishCanonical}"`), `${locale}/${slug} must link its English alternate`);
    assert.ok(html.includes(`hreflang="de" href="${germanCanonical}"`), `${locale}/${slug} must link its German alternate`);
    assert.ok(html.includes(`hreflang="x-default" href="${englishCanonical}"`), `${locale}/${slug} must have an English x-default`);
    assert.ok(html.includes(`"url": "${canonical}"`), `${locale}/${slug} structured URL must match its canonical`);
    assert.ok(html.includes('"@type": "LearningResource"'), `${locale}/${slug} must identify its learning content`);
    assert.ok(html.includes(`"inLanguage": "${locale}"`), `${locale}/${slug} structured data must declare its language`);
    assert.ok(html.includes(`/?lang=${locale}&amp;learn=${id}&amp;utm_source=learn_guide`), `${locale}/${slug} must open lesson ${id} in ${locale}`);
    assert.ok(html.includes('HEIDENHAIN GmbH'), `${locale}/${slug} must keep the independence disclaimer`);
  }
}

const germanFirstLesson = read('de', 'learn', 'program-skeleton-blk-form', 'index.html');
assert.ok(
  germanFirstLesson.includes('<h1>Programmgerüst &amp; BLK FORM (das Rohteil)</h1>'),
  'German static lesson titles must follow the German interactive course terminology'
);

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.ok(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), 'Sitemap must declare the hreflang namespace');
assert.strictEqual(sitemapUrls.length, expectedUrls.size, 'Sitemap must contain root and all 32 localized Learn URLs');
assert.strictEqual(new Set(sitemapUrls).size, sitemapUrls.length, 'Sitemap URLs must be unique');
for (const url of expectedUrls) assert.ok(sitemapUrls.includes(url), `Sitemap must contain ${url}`);
assert.strictEqual((sitemap.match(/<xhtml:link rel="alternate" hreflang="de"/g) || []).length, 32, 'Every localized Learn URL must have a German sitemap alternate');

const index = read('index.html');
const app = read('web', 'app.js');
const i18n = read('web', 'i18n.js');
const styles = read('web', 'styles.css');
const worker = read('service-worker.js');
assert.ok(index.includes('id="footerGuideLink" href="/learn/"'), 'Desktop footer must expose the Learn hub');
assert.ok(index.includes('id="mtabGuide" href="/learn/"'), 'Mobile navigation must expose the Learn hub');
assert.ok(styles.includes('.mtab-bar button,.mtab-bar>a'), 'Mobile Guide link must share the tab layout');
assert.ok(i18n.includes("new URLSearchParams(window.location.search).get('lang')"), 'App must accept the static page language');
assert.ok(i18n.includes("_lang === 'de' ? '/de/learn/' : '/learn/'"), 'Main-page Guide links must follow the selected language');
assert.ok(app.includes("new URLSearchParams(window.location.search).get('learn')"), 'App must read a Learn deep link');
assert.ok(app.includes('learnOpenLesson(i)'), 'App must open the matching interactive lesson');
assert.ok(
  app.indexOf('(function openRequestedLearnLesson()') > app.indexOf('var LEARN ='),
  'Learn deep links must run only after the Learn state is initialized'
);
assert.ok(worker.includes("'/learn/'"), 'Service worker must precache the English Learn hub');
assert.ok(worker.includes("'/de/learn/'"), 'Service worker must precache the German Learn hub');
assert.ok(worker.includes("'/learn/learn.css'"), 'Service worker must precache Learn styles');

const stored = {};
const runtime = {
  URL,
  URLSearchParams,
  document: { readyState: 'loading', addEventListener() {} },
  localStorage: {
    getItem(key) { return stored[key] || null; },
    setItem(key, value) { stored[key] = value; }
  },
  location: { reload() {}, replace() {} },
  window: { location: { search: '?lang=de&learn=L01', href: 'https://tncsim.org/?lang=de&learn=L01' } }
};
vm.createContext(runtime);
vm.runInContext(i18n, runtime);
assert.strictEqual(runtime.window.I18N.getLang(), 'de', 'German lesson deep link must select German before lesson overlays load');
assert.strictEqual(stored['tncsim.lang'], 'de', 'Explicit lesson language must become the selected UI language');

console.log('Localized Learn pages tests passed.');
