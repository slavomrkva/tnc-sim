'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const styles = fs.readFileSync(path.join(__dirname, '..', 'web', 'styles.css'), 'utf8');
const footerMatch = html.match(/<footer>[\s\S]*?<\/footer>/);

assert.ok(footerMatch, 'index.html must contain the website footer');
const footer = footerMatch[0];
const emailIndex = footer.indexOf('href="mailto:info@tncsim.org"');
const playIndex = footer.indexOf('href="https://play.google.com/store/apps/details?id=org.tncsim.twa&amp;pcampaignid=web_share"');

assert.ok(emailIndex >= 0, 'the footer must contain the contact email');
assert.ok(playIndex > emailIndex, 'the Google Play link must follow the contact email');
assert.match(
  footer,
  /<a class="footer-play-link" href="https:\/\/play\.google\.com\/store\/apps\/details\?id=org\.tncsim\.twa&amp;pcampaignid=web_share"[^>]*><svg class="footer-play-icon"[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/svg><span>Google Play<\/span><\/a><\/p>/,
  'the official Google Play link must be last and include its decorative Play icon'
);
assert.match(
  styles,
  /footer a\{[^}]*color:var\(--text\)[^}]*\}/,
  'footer links must use the neutral theme text colour'
);
assert.match(
  styles,
  /footer \.footer-play-icon\{[^}]*width:20px;[^}]*height:20px;[^}]*fill:rgba\(245,154,86,\.18\);[^}]*stroke:rgb\(245 154 86\);[^}]*\}/,
  'the Google Play triangle must use the approved 20 px dark-theme treatment'
);
assert.match(
  styles,
  /html\[data-theme="light"\] footer \.footer-play-icon\{[^}]*fill:rgba\(243,136,59,\.18\);[^}]*stroke:rgb\(243 136 59\);[^}]*\}/,
  'the Google Play triangle must use the matching light-theme treatment'
);

console.log('Footer Google Play link test passed.');
