'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

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

const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const hub = read('learn', 'index.html');
const titles = new Set();
const descriptions = new Set();
const expectedUrls = new Set([
  'https://tncsim.org/',
  'https://tncsim.org/learn/',
  ...lessons.map(([, slug]) => `https://tncsim.org/learn/${slug}/`)
]);

assert.strictEqual((hub.match(/<h1(?:\s|>)/g) || []).length, 1, 'Learn hub must have one h1');
assert.match(hub, /<link rel="canonical" href="https:\/\/tncsim\.org\/learn\/">/);
assert.match(hub, /"@type": "Course"/);

for (const [id, slug] of lessons) {
  const relativeUrl = `/learn/${slug}/`;
  assert.ok(hub.includes(`href="${relativeUrl}"`), `Learn hub must link to ${relativeUrl}`);

  const html = read('learn', slug, 'index.html');
  const canonical = `https://tncsim.org${relativeUrl}`;
  const title = html.match(/<title>([^<]+)<\/title>/);
  const description = html.match(/<meta name="description" content="([^"]+)">/);

  assert.ok(title, `${slug} must have a title`);
  assert.ok(description, `${slug} must have a meta description`);
  assert.ok(!titles.has(title[1]), `${slug} title must be unique`);
  assert.ok(!descriptions.has(description[1]), `${slug} description must be unique`);
  titles.add(title[1]);
  descriptions.add(description[1]);

  assert.strictEqual((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${slug} must have one h1`);
  assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), `${slug} canonical must match its URL`);
  assert.ok(html.includes(`"url": "${canonical}"`), `${slug} structured URL must match its canonical`);
  assert.ok(html.includes('"@type": "LearningResource"'), `${slug} must identify its learning content`);
  assert.ok(html.includes(`/?learn=${id}&utm_source=learn_guide`), `${slug} must open lesson ${id}`);
  assert.ok(html.includes('not affiliated with or endorsed by HEIDENHAIN GmbH'), `${slug} must keep the independence disclaimer`);
}

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.strictEqual(sitemapUrls.length, expectedUrls.size, 'Sitemap must contain root, hub and all 15 lessons');
assert.strictEqual(new Set(sitemapUrls).size, sitemapUrls.length, 'Sitemap URLs must be unique');
for (const url of expectedUrls) assert.ok(sitemapUrls.includes(url), `Sitemap must contain ${url}`);

const index = read('index.html');
const app = read('web', 'app.js');
const worker = read('service-worker.js');
assert.ok(index.includes('href="/learn/">Klartext guide</a>'), 'Main footer must expose the Learn hub to crawlers');
assert.ok(app.includes("new URLSearchParams(window.location.search).get('learn')"), 'App must read a Learn deep link');
assert.ok(app.includes('learnOpenLesson(i)'), 'App must open the matching interactive lesson');
assert.ok(worker.includes("'/learn/'"), 'Service worker must precache the Learn hub');
assert.ok(worker.includes("'/learn/learn.css'"), 'Service worker must precache Learn styles');

console.log('Learn pages tests passed.');
