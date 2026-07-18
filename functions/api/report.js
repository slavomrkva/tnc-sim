/* Cloudflare Pages Function — POST /api/report
 *
 * Opens a PUBLIC GitHub issue on behalf of a site visitor, without requiring
 * the visitor to have a GitHub account. The one-click Bug Report / Suggestion
 * dialog (core/bug-report.js) posts JSON here.
 *
 * Security model:
 *   - The endpoint only accepts requests whose Origin is the production site
 *     (https://tncsim.org, overridable with the ALLOWED_ORIGIN env var).
 *   - Every request must carry a valid Cloudflare Turnstile token, verified
 *     server-side with TURNSTILE_SECRET_KEY.
 *   - Request field lengths are bounded before anything is forwarded.
 *
 * Required Cloudflare Pages secrets (never commit these):
 *   - GITHUB_TOKEN          fine-grained PAT with Issues: Read and write on the
 *                           target repo (see docs/bug-report-setup.md)
 *   - TURNSTILE_SECRET_KEY  the secret paired with the public site key in
 *                           web/turnstile-config.js
 * Optional env vars:
 *   - ALLOWED_ORIGIN        default 'https://tncsim.org'
 *   - GITHUB_REPO           default 'slavomrkva/tnc-sim' (owner/name)
 */

const DEFAULT_ORIGIN = 'https://tncsim.org';
const DEFAULT_REPO = 'slavomrkva/tnc-sim';

const MAX_TITLE = 150;
const MAX_BODY = 24000;   // whole issue body (program + context) hard cap
const MAX_TOKEN = 4000;

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
  const allowed = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const origin = request.headers.get('Origin') || '';
  if (origin !== allowed) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: corsHeaders(allowed) });
}

export async function onRequestPost({ request, env }) {
  const allowed = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const origin = request.headers.get('Origin') || '';

  // 1) Origin restriction — only the production site may call this endpoint.
  if (origin !== allowed) {
    return json({ error: 'Reports can only be sent from ' + allowed + '.' }, 403, allowed);
  }

  // 2) Server must be configured.
  if (!env.GITHUB_TOKEN || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: 'Reporting is not configured on the server yet.' }, 500, allowed);
  }

  // 3) Parse + validate the payload.
  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ error: 'Malformed request.' }, 400, allowed);
  }
  if (!payload || typeof payload !== 'object') {
    return json({ error: 'Malformed request.' }, 400, allowed);
  }

  const kind = payload.kind === 'suggest' ? 'suggest' : 'bug';
  const token = typeof payload.token === 'string' ? payload.token : '';
  let title = typeof payload.title === 'string' ? payload.title.trim() : '';
  let body = typeof payload.body === 'string' ? payload.body : '';

  if (!token || token.length > MAX_TOKEN) {
    return json({ error: 'Missing verification token.' }, 400, allowed);
  }
  if (!body.trim()) {
    return json({ error: 'The report is empty.' }, 400, allowed);
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
    return json({ error: 'Could not reach the verification service.' }, 502, allowed);
  }
  if (!verify || verify.success !== true) {
    return json({ error: 'Verification failed. Please try again.' }, 400, allowed);
  }

  // 5) Create the public GitHub issue.
  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  const labels = kind === 'suggest' ? ['enhancement'] : ['bug'];
  const footer = '\n\n<sub>Filed from the in-app report dialog on ' + allowed + '.</sub>';

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
      return json({ error: 'Could not create the report (GitHub error ' + gh.status + ').' }, 502, allowed);
    }
    issue = await gh.json();
  } catch (e) {
    return json({ error: 'Could not reach GitHub.' }, 502, allowed);
  }

  return json({ ok: true, url: issue && issue.html_url ? issue.html_url : null }, 200, allowed);
}
