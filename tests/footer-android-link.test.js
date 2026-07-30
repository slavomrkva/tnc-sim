'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const footerMatch = html.match(/<footer>[\s\S]*?<\/footer>/);

assert.ok(footerMatch, 'index.html must contain the website footer');
assert.match(
  footerMatch[0],
  /<a href="https:\/\/play\.google\.com\/store\/apps\/details\?id=org\.tncsim\.twa&amp;pcampaignid=web_share"[^>]*>Google Play<\/a>/,
  'the footer must link to the official TNC Sim Google Play listing'
);

console.log('Footer Android link test passed.');
