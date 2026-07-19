'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const title = 'TNC Sim — Heidenhain CNC Simulator';
const description = 'TNC Sim is an open-source online Heidenhain simulator and 3D CNC mill simulator for Klartext programming and interactive learning, directly in your browser.';

assert.ok(html.includes(`<title>${title}</title>`), 'HTML title must use the approved CNC wording');
assert.ok(html.includes(`<meta name="description" content="${description}">`), 'meta description must use the approved search description');
assert.ok(html.includes(`<meta property="og:title" content="${title}">`), 'Open Graph title must match');
assert.ok(html.includes(`<meta property="og:description" content="${description}">`), 'Open Graph description must match');
assert.ok(html.includes(`<meta name="twitter:title" content="${title}">`), 'Twitter title must match');
assert.ok(html.includes(`<meta name="twitter:description" content="${description}">`), 'Twitter description must match');
assert.ok(html.includes('"name": "TNC Sim — Heidenhain CNC Simulator"'), 'JSON-LD name must match');
assert.ok(html.includes(`"description": "${description}"`), 'JSON-LD description must match');
assert.ok(!/\bfree\b/i.test(html.slice(0, html.indexOf('</head>'))), 'SEO metadata must not describe the app as free');
assert.match(
  html,
  /<h1 class="logo-heading">[\s\S]*?<span class="logo-text">TNC Sim<\/span>[\s\S]*?Online Heidenhain simulator for CNC milling[\s\S]*?<\/h1>/,
  'the visible brand and subtitle must form the main heading'
);

console.log('SEO metadata tests passed.');
