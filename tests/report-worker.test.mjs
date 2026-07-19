import assert from 'node:assert/strict';
import worker from '../worker/report-worker.mjs';

const originalFetch = globalThis.fetch;

function request(path = '/api/report', options = {}) {
  return new Request('https://tncsim.org' + path, {
    method: options.method || 'POST',
    headers: {
      Origin: options.origin || 'https://tncsim.org',
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
}

function env(overrides = {}) {
  return {
    GITHUB_TOKEN: 'github-secret',
    TURNSTILE_SECRET_KEY: 'turnstile-secret',
    ASSETS: {
      fetch: async () => new Response('asset', { status: 200 })
    },
    ...overrides
  };
}

async function responseJson(response) {
  return JSON.parse(await response.text());
}

async function testStaticAssetFallback() {
  let called = false;
  const response = await worker.fetch(request('/privacy.html', { method: 'GET' }), env({
    ASSETS: {
      fetch: async () => {
        called = true;
        return new Response('privacy', { status: 200 });
      }
    }
  }));
  assert.equal(called, true);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'privacy');
}

async function testOptionsAndOrigin() {
  const preflight = await worker.fetch(request('/api/report', { method: 'OPTIONS' }), env());
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://tncsim.org');

  const rejected = await worker.fetch(request('/api/report', {
    origin: 'https://example.com',
    body: { kind: 'bug', token: 'token', body: 'body' }
  }), env());
  assert.equal(rejected.status, 403);
  assert.equal(rejected.headers.get('Access-Control-Allow-Origin'), null);
}

async function testMissingSecretsFailsClosed() {
  const response = await worker.fetch(request('/api/report', {
    body: { kind: 'bug', token: 'token', body: 'body' }
  }), env({ GITHUB_TOKEN: '' }));
  assert.equal(response.status, 503);
}

async function testOversizedBodyIsRejected() {
  const response = await worker.fetch(request('/api/report', {
    body: { kind: 'bug', token: 'token', body: 'x'.repeat(33000) }
  }), env());
  assert.equal(response.status, 413);
}

async function testSuccessfulReport() {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('/siteverify')) {
      return Response.json({ success: true, hostname: 'tncsim.org' });
    }
    return Response.json({ html_url: 'https://github.com/slavomrkva/tnc-sim/issues/123' });
  };

  const response = await worker.fetch(request('/api/report', {
    body: { kind: 'suggest', token: 'turnstile-token', title: 'Suggestion', body: 'Add a feature' }
  }), env());
  const data = await responseJson(response);

  assert.equal(response.status, 200);
  assert.equal(data.url, 'https://github.com/slavomrkva/tnc-sim/issues/123');
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /siteverify/);
  assert.equal(calls[0].options.body.get('secret'), 'turnstile-secret');
  assert.equal(calls[0].options.body.get('response'), 'turnstile-token');
  assert.match(calls[1].url, /repos\/slavomrkva\/tnc-sim\/issues$/);
  assert.equal(calls[1].options.headers.Authorization, 'Bearer github-secret');
  assert.deepEqual(JSON.parse(calls[1].options.body).labels, ['enhancement']);
}

async function testTurnstileHostnameMismatch() {
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls += 1;
    assert.match(String(url), /siteverify/);
    return Response.json({ success: true, hostname: 'attacker.example' });
  };

  const response = await worker.fetch(request('/api/report', {
    body: { kind: 'bug', token: 'turnstile-token', title: 'Bug', body: 'Details' }
  }), env());
  assert.equal(response.status, 400);
  assert.equal(calls, 1);
}

async function testUnknownApiRoute() {
  const response = await worker.fetch(request('/api/unknown', { method: 'GET' }), env());
  assert.equal(response.status, 404);
}

try {
  await testStaticAssetFallback();
  await testOptionsAndOrigin();
  await testMissingSecretsFailsClosed();
  await testOversizedBodyIsRejected();
  await testSuccessfulReport();
  await testTurnstileHostnameMismatch();
  await testUnknownApiRoute();
  console.log('report-worker tests: ok');
} finally {
  globalThis.fetch = originalFetch;
}
