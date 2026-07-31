'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const authPath = path.join(root, 'BingSiteAuth.xml');
const assetsIgnore = fs.readFileSync(path.join(root, '.assetsignore'), 'utf8');
const authXml = fs.readFileSync(authPath, 'utf8');

assert.match(
  authXml,
  /^<\?xml version="1\.0"\?>\s*<users>\s*<user>2C7598153B4236ABED75AAFD86C64C95<\/user>\s*<\/users>\s*$/,
  'BingSiteAuth.xml must contain the current Bing Webmaster Tools verification key'
);
assert.equal(
  assetsIgnore.split(/\r?\n/).some((entry) => entry.trim() === 'BingSiteAuth.xml'),
  false,
  'BingSiteAuth.xml must remain part of the published static assets'
);

console.log('Bing site authentication asset: OK');
