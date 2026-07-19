/* Cloudflare Worker entrypoint for the static TNC Sim site.
 *
 * `/api/report` verifies a Turnstile token and creates a public GitHub issue.
 * All other requests are delegated to the Static Assets binding.
 */

const DEFAULT_ORIGINS = ['https://tncsim.org', 'https://localhost', 'capacitor://localhost'];
const DEFAULT_TURNSTILE_HOSTNAMES = ['tncsim.org', 'localhost'];
const DEFAULT_REPO = 'slavomrkva/tnc-sim';
const DEFAULT_SITE = 'https://tncsim.org';

const MAX_TITLE = 150;
const MAX_BODY = 24000;
const MAX_TOKEN = 2048;
const MAX_REQUEST_BYTES = 32000;

function csv(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function allowedOrigins(env) {
  return csv(env.ALLOWED_ORIGIN, DEFAULT_ORIGINS);
}

function allowedTurnstileHostnames(env) {
  return csv(env.ALLOWED_TURNSTILE_HOSTNAME, DEFAULT_TURNSTILE_HOSTNAMES);
}

function requestOrigin(request, origins) {
  const origin = request.headers.get('Origin') || '';
  return origins.includes(origin) ? origin : null;
}

function corsHeaders(origin) {
  if (!origin) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(data, status, origin, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
      ...extraHeaders
    }
  });
}

async function verifyTurnstile(request, env, token) {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) form.append('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });
  if (!response.ok) throw new Error('Turnstile Siteverify returned ' + response.status);

  const result = await response.json();
  if (!result || result.success !== true) return false;
  return allowedTurnstileHostnames(env).includes(result.hostname);
}

async function createGitHubIssue(env, origin, kind, title, body) {
  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  const site = env.SITE_URL || DEFAULT_SITE;
  const labels = kind === 'suggest' ? ['enhancement'] : ['bug'];
  const source = origin === 'https://tncsim.org' ? 'the website' : 'the app';
  const footer = '\n\n<sub>Filed from ' + source + ' via the in-app report dialog (' + site + ').</sub>';

  const response = await fetch('https://api.github.com/repos/' + repo + '/issues', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.GITHUB_TOKEN,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tncsim-report-worker',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, body: body + footer, labels })
  });
  if (!response.ok) throw new Error('GitHub returned ' + response.status);
  return response.json();
}

async function handleReport(request, env) {
  const origins = allowedOrigins(env);
  const origin = requestOrigin(request, origins);

  if (!origin) {
    return json({ error: 'Reports can only be sent from the TNC Sim website or app.' }, 403);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, origin, { 'Allow': 'POST, OPTIONS' });
  }

  if (!env.GITHUB_TOKEN || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: 'Reporting is not configured on the server yet.' }, 503, origin);
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json({ error: 'Content-Type must be application/json.' }, 415, origin);
  }
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return json({ error: 'The report is too large.' }, 413, origin);
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch (error) {
    return json({ error: 'Malformed request.' }, 400, origin);
  }
  if (rawBody.length > MAX_REQUEST_BYTES) {
    return json({ error: 'The report is too large.' }, 413, origin);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    return json({ error: 'Malformed request.' }, 400, origin);
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json({ error: 'Malformed request.' }, 400, origin);
  }
  if (payload.kind !== 'bug' && payload.kind !== 'suggest') {
    return json({ error: 'Unknown report type.' }, 400, origin);
  }

  const kind = payload.kind;
  const token = typeof payload.token === 'string' ? payload.token : '';
  let title = typeof payload.title === 'string' ? payload.title.trim() : '';
  let body = typeof payload.body === 'string' ? payload.body : '';

  if (!token || token.length > MAX_TOKEN) {
    return json({ error: 'Missing or invalid verification token.' }, 400, origin);
  }
  if (!body.trim()) {
    return json({ error: 'The report is empty.' }, 400, origin);
  }
  if (title.length > MAX_TITLE) title = title.slice(0, MAX_TITLE);
  if (!title) title = kind === 'suggest' ? 'Suggestion' : 'Bug report';
  if (body.length > MAX_BODY) {
    body = body.slice(0, MAX_BODY) + '\n\n…(truncated: report exceeded the size limit)';
  }

  let verified;
  try {
    verified = await verifyTurnstile(request, env, token);
  } catch (error) {
    return json({ error: 'Could not reach the verification service.' }, 502, origin);
  }
  if (!verified) {
    return json({ error: 'Verification failed. Please try again.' }, 400, origin);
  }

  let issue;
  try {
    issue = await createGitHubIssue(env, origin, kind, title, body);
  } catch (error) {
    return json({ error: 'Could not create the report.' }, 502, origin);
  }

  return json({ ok: true, url: issue && issue.html_url ? issue.html_url : null }, 200, origin);
}

async function fetchHandler(request, env) {
  const pathname = new URL(request.url).pathname;
  if (pathname === '/api/report') return handleReport(request, env);
  if (pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404);
  return env.ASSETS.fetch(request);
}

export { fetchHandler, handleReport };

export default {
  fetch: fetchHandler
};
