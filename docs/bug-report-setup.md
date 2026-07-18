# One-click Bug Report / Suggestion — setup

The in-app **Report a problem / Suggest improvement** dialog posts to the
Cloudflare Pages Function at [`functions/api/report.js`](../functions/api/report.js),
which verifies a Cloudflare Turnstile token and opens a **public** GitHub issue
on the visitor's behalf. Visitors do **not** need a GitHub account.

Nothing secret is stored in the repository. You need to configure two secrets
in Cloudflare and one public site key in the repo.

## 1. GitHub fine-grained token (secret)

Create a **fine-grained personal access token**
(GitHub → Settings → Developer settings → Fine-grained tokens):

- **Resource owner / Repository access:** only `slavomrkva/tnc-sim`.
- **Repository permissions:** **Issues → Read and write**. Nothing else.
  (Metadata read-only is added automatically.)
- Set the shortest expiry you are willing to rotate on.

Copy the token value — it is shown only once.

## 2. Cloudflare Turnstile widget (public key + secret)

In the Cloudflare dashboard → **Turnstile** → **Add widget**:

- **Widget mode:** Invisible.
- **Hostnames:** `tncsim.org` (add `www.tncsim.org` if used). **Also add
  `localhost`** so the Android app's WebView (which runs at `https://localhost`)
  can obtain a token — see "Android app" below.

This gives you a **Site Key** (public) and a **Secret Key** (private).

- Put the **Site Key** in [`web/turnstile-config.js`](../web/turnstile-config.js)
  (`window.TURNSTILE_SITE_KEY`). This file is committed — the site key is public
  by design. The file currently ships Cloudflare's "always passes" **test** key
  so the dialog works before a real widget exists; replace it before launch.
- Keep the **Secret Key** for step 3. Never commit it.

## 3. Cloudflare Pages secrets

In the Cloudflare Pages project (Settings → **Environment variables** →
Production, and Preview if you use it), add these as **encrypted** variables /
secrets:

| Name | Value | Notes |
| --- | --- | --- |
| `GITHUB_TOKEN` | the fine-grained token from step 1 | required |
| `TURNSTILE_SECRET_KEY` | the Turnstile secret from step 2 | required |
| `ALLOWED_ORIGIN` | `https://tncsim.org,https://localhost,capacitor://localhost` | optional; comma-separated allowlist. Default already includes the website and the app origin |
| `GITHUB_REPO` | `slavomrkva/tnc-sim` | optional; defaults to `slavomrkva/tnc-sim` |

Redeploy after adding them so the Function picks them up.

## Android app

The Android app (repo `slavomrkva/tnc-sim-android`) reuses **this same
endpoint** — its report dialog posts to `https://tncsim.org/api/report`. Its
Capacitor WebView runs at origin `https://localhost`, which is already in the
default `ALLOWED_ORIGIN` list. Two things make it work:

1. **Turnstile hostname:** the widget must list `localhost` (step 2 above), or
   the app cannot obtain a token.
2. **Public site key:** the app ships the same site key in its own
   `www/android/turnstile-config.js`. Keep it identical to the website's key.

The `Origin` allowlist is only a soft filter (any non-browser client can forge
the header); the real gate for both the site and the app is the Turnstile
token, so allowing the app origin does not weaken the endpoint.

## How the endpoint is protected

`functions/api/report.js`:

1. Rejects any request whose `Origin` is not `ALLOWED_ORIGIN` (`403`).
2. Requires and server-side verifies a Turnstile token with
   `TURNSTILE_SECRET_KEY`.
3. Bounds field lengths (title ≤ 150, body ≤ 24000, token ≤ 4000 chars) before
   forwarding anything to GitHub.
4. Creates the issue with the `GITHUB_TOKEN`, labelling it `bug` or
   `enhancement`, and returns only the resulting issue URL — GitHub/token
   details are never exposed to the browser.

## Local testing

- The committed **test** site/secret keys (Cloudflare's dummy
  `1x…`/`2x…` values) let the dialog and Turnstile flow run without a real
  widget, but the origin check still requires the request to come from
  `https://tncsim.org`. For local runs, set `ALLOWED_ORIGIN` to your dev origin
  (e.g. `http://localhost:8788`) in `wrangler`/Pages dev, and use the
  Turnstile test secret `1x0000000000000000000000000000000AA`.
- Because a real GitHub issue is created, point `GITHUB_REPO` at a throwaway
  repository while testing.
