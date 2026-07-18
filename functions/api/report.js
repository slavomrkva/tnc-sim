/* Cloudflare Pages Function — POST /api/report
 *
 * Opens a PUBLIC GitHub issue on behalf of a site visitor, without requiring
 * the visitor to have a GitHub account. The one-click Bug Report / Suggestion
 * dialog (core/bug-report.js) posts JSON here — both from the website
 * (https://tncsim.org) and from the Android app's WebView (https://localhost).
 *
 * Security model:
 *   - The endpoint only accepts requests whose Origin is in the allowlist
 *     (the website plus the Capacitor app origin). The Origin header is a soft
 *     filter only — it stops casual cross-site browser abuse but can be forged
 *     by non-browser clients, so it is NOT the real gate.
 *   - The real gate is Cloudflare Turnstile: every request must carry a valid
 *     token, verified server-side with TURNSTILE_SECRET_KEY. For the app to
 *     pass, add "localhost" to the Turnstile widget's allowed hostnames.
 *   - Request field lengths are bounded before anything is forwarded.
 *
 * Required Cloudflare Pages secrets (never commit these):
 *   - GITHUB_TOKEN          fine-grained PAT with Issues: Read and write
 *   - TURNSTILE_SECRET_KEY  the secret paired with the public site key
 * Optional env vars:
 *   - ALLOWED_ORIGIN  comma-separated origin allowlist. Default:
 *                     "https://tncsim.org,https://localhost,capacitor://localhost"
 *   - SITE_URL        canonical site shown in the issue footer (default tncsim.org)
 *   - GITHUB_REPO     default 'slavomrkva/tnc-sim' (owner/name)
 */

const DEFAULT_ORIGINS = ['https://tncsim.org', 'https://localhost', 'capacitor://localhost'];
const DEFAULT_REPO = 'slavomrkva/tnc-sim';
const DEFAULT_SITE = 'https://tncsim.org';

const MAX_TITLE = 150;
const MAX_BODY = 24000;   // whole issue body (program + context) hard cap
const MAX_TOKEN = 4000;

function allowlist(env) {
  if (env.ALLOWED_ORIGIN) {
    return env.ALLOWED_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return DEFAULT_ORIGINS;
}

// The request's Origin if it is allowed, otherwise null.
function pickOrigin(request, list) {
  const o = request.headers.get('Origin') || '';
  return list.indexOf(o) >= 0 ? o : null;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: Object.assign({ 'Content-Type': 'application/json' }, corsHeaders(origin || '*'))
  });
}

export async function onRequestOptions({ request, env }) {
  const origin = pickOrigin(request, allowlist(env));
  if (!origin) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function onRequestPost({ request, env }) {
  const list = allowlist(env);
  const origin = pickOrigin(request, list);

  // 1) Origin restriction — website or the app WebView only.
  if (!origin) {
    return json({ error: 'Reports can only be sent from the TNC Sim website or app.' }, 403, list[0]);
  }

  // 2) Server must be configured.
  if (!env.GITHUB_TOKEN || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: 'Reporting is not configured on the server yet.' }, 500, origin);
  }

  // 3) Parse + validate the payload.
  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ error: 'Malformed request.' }, 400, origin);
  }
  if (!payload || typeof payload !== 'object') {
    return json({ error: 'Malformed request.' }, 400, origin);
  }

  const kind = payload.kind === 'suggest' ? 'suggest' : 'bug';
  const token = typeof payload.token === 'string' ? payload.token : '';
  let title = typeof payload.title === 'string' ? payload.title.trim() : '';
  let body = typeof payload.body === 'string' ? payload.body : '';

  if (!token || token.length > MAX_TOKEN) {
    return json({ error: 'Missing verification token.' }, 400, origin);
  }
  if (!body.trim()) {
    return json({ error: 'The report is empty.' }, 400, origin);
  }
  if (title.length > MAX_TITLE) title = title.slice(0, MAX_TITLE);
  if (!title) title = kind === 'suggest' ? 'Suggestion' : 'Bug report';
  if (body.length > MAX_BODY) {
    body = body.slice(0, MAX_BODY) + '\n\n…(truncated: report exceeded the size limit)';
  }

  // 4) Verify Turnstile.
  const verifyForm = new FormData();
  verifyForm.append('secret', env.TURNSTILE_SECRET_KEY);
  verifyForm.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) verifyForm.append('remoteip', ip);

  let verify;
  try {
    const vr = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: verifyForm
    });
    verify = await vr.json();
  } catch (e) {
    return json({ error: 'Could not reach the verification service.' }, 502, origin);
  }
  if (!verify || verify.success !== true) {
    return json({ error: 'Verification failed. Please try again.' }, 400, origin);
  }

  // 5) Create the public GitHub issue.
  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  const site = env.SITE_URL || DEFAULT_SITE;
  const labels = kind === 'suggest' ? ['enhancement'] : ['bug'];
  const source = origin === 'https://tncsim.org' ? 'the website' : 'the app';
  const footer = '\n\n<sub>Filed from ' + source + ' via the in-app report dialog (' + site + ').</sub>';

  let issue;
  try {
    const gh = await fetch('https://api.github.com/repos/' + repo + '/issues', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.GITHUB_TOKEN,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'tncsim-report-function',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: title, body: body + footer, labels: labels })
    });
    if (!gh.ok) {
      // Do not leak the token / GitHub internals to the browser.
      return json({ error: 'Could not create the report (GitHub error ' + gh.status + ').' }, 502, origin);
    }
    issue = await gh.json();
  } catch (e) {
    return json({ error: 'Could not reach GitHub.' }, 502, origin);
  }

  return json({ ok: true, url: issue && issue.html_url ? issue.html_url : null }, 200, origin);
}
