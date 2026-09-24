const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const handlers = {};
const writes = [];
const cached = { source: 'old index' };
const fresh = { source: 'new index', status: 200, type: 'basic', clone() { return this; } };
let online = true;
let skipped = false;
let claimed = false;
let matchOptions;
const cache = {
  addAll: async () => {},
  match: async (_request, options) => { matchOptions = options; return cached; },
  put: async (request, response) => { writes.push({ request, response }); }
};
const context = {
  self: {
    addEventListener: (type, handler) => { handlers[type] = handler; },
    skipWaiting: async () => { skipped = true; },
    clients: { claim: async () => { claimed = true; } }
  },
  caches: {
    open: async () => cache,
    keys: async () => ['tnc-sim-old'],
    delete: async () => true
  },
  fetch: async () => { if (!online) throw Error('offline'); return fresh; },
  Response: { error: () => ({ source: 'network error' }) }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8'), context);

async function dispatch(type, request) {
  const waits = [];
  let response;
  handlers[type]({
    request,
    waitUntil: promise => waits.push(promise),
    respondWith: promise => { response = promise; }
  });
  if (response) {
    const value = await response;
    await Promise.all(waits);
    return value;
  }
  await Promise.all(waits);
}

(async () => {
  await dispatch('install');
  await dispatch('activate');
  assert.ok(skipped && claimed, 'new worker takes over without waiting for all tabs to close');

  const request = { method: 'GET', url: 'https://tncsim.org/?preview-whats-new=1', mode: 'navigate' };
  assert.strictEqual(await dispatch('fetch', request), fresh,
    'an online navigation serves the current page even when an old page is cached');
  assert.strictEqual(writes[0].response, fresh, 'the current page replaces the cached copy');

  online = false;
  assert.strictEqual(await dispatch('fetch', request), cached,
    'an offline navigation still serves the cached page');
  assert.strictEqual(matchOptions.ignoreSearch, true,
    'query parameters do not break the offline page fallback');
  console.log('service-worker-cache.test.js: current online page and offline fallback verified');
})().catch(error => { console.error(error); process.exitCode = 1; });
