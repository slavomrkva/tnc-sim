# One-click Bug Report / Suggestion — Worker setup

The in-app **Report a problem / Suggest improvement** dialog posts to
`https://tncsim.org/api/report`. The endpoint is implemented by
[`worker/report-worker.mjs`](../worker/report-worker.mjs), while all ordinary
site requests continue through the same Worker's Static Assets binding.

Nothing secret is stored in the repository. Production requires one public
Turnstile Site Key in the web and Android clients plus two encrypted Worker
secrets.

## 1. Create the production Turnstile widget

In Cloudflare Turnstile, create an **Invisible** widget with these hostnames:

- `tncsim.org`
- `localhost` — required by the Android Capacitor WebView

Cloudflare provides a public **Site Key** and a private **Secret Key**.

- Put the real Site Key in [`web/turnstile-config.js`](../web/turnstile-config.js)
  as `window.TURNSTILE_SITE_KEY`.
- Put the same Site Key in the Android repository at
  `www/android/turnstile-config.js`.
- Never commit the Secret Key or Cloudflare's always-pass test keys.

The Worker validates both the token result and returned hostname. Its default
hostname allowlist is `tncsim.org,localhost`.

## 2. Create the GitHub token

Create a fine-grained personal access token:

- **Resource owner / Repository access:** only `slavomrkva/tnc-sim`.
- **Repository permissions:** **Issues → Read and write**. Nothing else.
- Use the shortest expiry you are willing to rotate.

The token is shown only once. Do not commit it.

## 3. Deploy the Worker code once

[`wrangler.jsonc`](../wrangler.jsonc) defines both the Worker entrypoint and the
current static site. The first deployment can complete without secrets; until
they are configured, `/api/report` fails closed with HTTP `503` and ordinary
site assets continue to work.

Cloudflare Workers Builds should deploy the GitHub branch with Wrangler. The
deployed resource must show Worker code plus static assets, not **Worker that
only has static assets**.

## 4. Add encrypted Worker secrets

In Cloudflare Dashboard open **Workers & Pages → tnc-sim → Settings → Variables
and Secrets**. Add both values with type **Secret**:

| Name | Value |
| --- | --- |
| `GITHUB_TOKEN` | fine-grained token from step 2 |
| `TURNSTILE_SECRET_KEY` | private key from step 1 |

Deploy the new Worker version after saving them. The non-secret values
`ALLOWED_ORIGIN`, `ALLOWED_TURNSTILE_HOSTNAME`, `GITHUB_REPO`, and `SITE_URL`
are already versioned in `wrangler.jsonc`.

Wrangler CLI is an alternative:

```bash
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Enter each value only at Wrangler's protected prompt.

## Android app

The Android app posts to the same absolute endpoint from origin
`https://localhost`. Keep `localhost` in both the Turnstile widget hostnames and
the Worker's origin/hostname allowlists. Keep the public Site Key identical in
both repositories.

The Origin check is only a soft browser filter because a non-browser client can
forge that header. Turnstile server-side validation is the actual abuse gate.

## Endpoint protections

`worker/report-worker.mjs`:

1. runs before assets only for `/api/*`; existing static files stay on the
   assets-first path;
2. accepts `/api/report` only from the configured origins;
3. requires encrypted GitHub and Turnstile secrets;
4. verifies every single-use Turnstile token server-side and checks its hostname;
5. bounds request, token, title, and body sizes;
6. creates only a `bug` or `enhancement` issue and never exposes either secret.

## Verification

After deployment:

1. Confirm `/`, `/privacy.html`, icons, and the service worker still return the
   current site.
2. Confirm an `OPTIONS /api/report` request from `https://tncsim.org` returns
   `204` with that exact CORS origin.
3. Send one real website report and confirm the resulting public GitHub issue.
4. Send one report from the Android app on a device and confirm `localhost`
   Turnstile validation succeeds.
5. Confirm an unapproved Origin and a reused/invalid Turnstile token are rejected.

For local development, use an ignored `.dev.vars` file and Cloudflare's paired
test keys only in the local working copy. Never commit either test key, and use
a throwaway GitHub repository if exercising issue creation.
