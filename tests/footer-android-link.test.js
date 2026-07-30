'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const footerMatch = html.match(/<footer>[\s\S]*?<\/footer>/);

assert.ok(footerMatch, 'index.html must contain the website footer');
const footer = footerMatch[0];
const emailIndex = footer.indexOf('href="mailto:info@tncsim.org"');
const playIndex = footer.indexOf('href="https://play.google.com/store/apps/details?id=org.tncsim.twa&amp;pcampaignid=web_share"');

assert.ok(emailIndex >= 0, 'the footer must contain the contact email');
assert.ok(playIndex > emailIndex, 'the Google Play link must follow the contact email');
assert.match(
  footer,
  /<a class="footer-play-link" href="https:\/\/play\.google\.com\/store\/apps\/details\?id=org\.tncsim\.twa&amp;pcampaignid=web_share"[^>]*><svg class="footer-android-icon"[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/svg><span>Google Play<\/span><\/a><\/p>/,
  'the official Google Play link must be last and include its decorative Android icon'
);

console.log('Footer Android link test passed.');
