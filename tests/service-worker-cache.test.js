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
let cacheHasEntry = true;
let fetchCalls = 0;
// When set, fetch stays pending until the test settles it (a stalled connection).
let stalledFetch = null;
const timers = [];
const cache = {
  addAll: async () => {},
  match: async (_request, options) => { matchOptions = options; return cacheHasEntry ? cached : undefined; },
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
  fetch: () => {
    fetchCalls++;
    if (stalledFetch) return new Promise((resolve, reject) => { stalledFetch.resolve = resolve; stalledFetch.reject = reject; });
    return online ? Promise.resolve(fresh) : Promise.reject(Error('offline'));
  },
  // Manual timers: the test decides when the navigation timeout elapses.
  setTimeout: (callback, delay) => { const timer = { callback, delay, cleared: false }; timers.push(timer); return timer; },
  clearTimeout: (timer) => { if (timer) timer.cleared = true; },
  Response: { error: () => ({ source: 'network error' }) }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8'), context);

function start(type, request, extra) {
  const waits = [];
  let response;
  handlers[type](Object.assign({
    request,
    waitUntil: promise => waits.push(promise),
    respondWith: promise => { response = promise; }
  }, extra));
  return { response, waits };
}

async function dispatch(type, request, extra) {
  const { response, waits } = start(type, request, extra);
  if (response) {
    const value = await response;
    await Promise.all(waits);
    return value;
  }
  await Promise.all(waits);
}

const tick = () => new Promise(resolve => setImmediate(resolve));

function elapseNavigationTimeout() {
  const timer = timers.filter(candidate => !candidate.cleared).pop();
  assert.ok(timer, 'a stalled navigation arms a timeout');
  assert.ok(timer.delay >= 2000 && timer.delay <= 8000,
    'the timeout tolerates a slow connection without leaving the app blank for long');
  timer.cleared = true;
  timer.callback();
}

(async () => {
  await dispatch('install');
  await dispatch('activate');
  assert.ok(skipped && claimed, 'new worker takes over without waiting for all tabs to close');

  const request = { method: 'GET', url: 'https://tncsim.org/?preview-whats-new=1', mode: 'navigate' };
  const script = { method: 'GET', url: 'https://tncsim.org/web/app.js', mode: 'no-cors' };

  assert.strictEqual(await dispatch('fetch', request, { resultingClientId: 'online-page' }), fresh,
    'an online navigation serves the current page even when an old page is cached');
  assert.strictEqual(writes[0].response, fresh, 'the current page replaces the cached copy');
  assert.ok(timers.every(timer => timer.cleared), 'a completed navigation leaves no pending timeout');
  assert.strictEqual(await dispatch('fetch', script, { clientId: 'online-page' }), fresh,
    'scripts of a network-served page stay network-first');

  online = false;
  assert.strictEqual(await dispatch('fetch', request, { resultingClientId: 'offline-page' }), cached,
    'an offline navigation still serves the cached page');
  assert.strictEqual(matchOptions.ignoreSearch, true,
    'query parameters do not break the offline page fallback');
  online = true;

  // Stalled connection: the request neither answers nor fails.
  stalledFetch = {};
  writes.length = 0;
  const stalled = start('fetch', request, { resultingClientId: 'stalled-page' });
  await tick();
  let answered = false;
  stalled.response.then(() => { answered = true; });
  await tick();
  assert.strictEqual(answered, false, 'the network gets its chance before the timeout');
  elapseNavigationTimeout();
  assert.strictEqual(await stalled.response, cached,
    'a stalled navigation falls back to the cached page after the timeout');

  const lateResponse = stalledFetch;
  stalledFetch = null;
  lateResponse.resolve(fresh);
  await tick();
  await Promise.all(stalled.waits);
  assert.strictEqual(writes.length, 0,
    'a response arriving after the cached page was served must not half-update the cache');

  const callsBefore = fetchCalls;
  assert.strictEqual(await dispatch('fetch', script, { clientId: 'stalled-page' }), cached,
    'scripts of a cache-served page come from the same cache');
  assert.strictEqual(fetchCalls, callsBefore, 'and do not wait on the stalled network');
  assert.strictEqual(await dispatch('fetch', script, { clientId: 'online-page' }), fresh,
    'other pages remain network-first');

  // First visit on a stalled connection: nothing cached, so keep waiting.
  cacheHasEntry = false;
  stalledFetch = {};
  const firstVisit = start('fetch', request, { resultingClientId: 'first-visit' });
  await tick();
  elapseNavigationTimeout();
  await tick();
  stalledFetch.resolve(fresh);
  assert.strictEqual(await firstVisit.response, fresh,
    'without a cached page the navigation waits for the network instead of failing');

  console.log('service-worker-cache.test.js: online page, offline fallback and stalled-network timeout verified');
})().catch(error => { console.error(error); process.exitCode = 1; });
