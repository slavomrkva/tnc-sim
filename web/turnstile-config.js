/* turnstile-config.js — Cloudflare Turnstile PUBLIC site key.
 *
 * This file is safe to commit: the site key is public by design (it ships to
 * every browser). The matching SECRET (TURNSTILE_SECRET_KEY) is NEVER stored
 * here — it lives only as a Cloudflare Worker secret. See
 * docs/bug-report-setup.md.
 *
 * ▶ REPLACE the placeholder below with the real site key from the Cloudflare
 *   dashboard (Turnstile → your widget → "Site Key"). Create the widget as an
 *   *Invisible* widget for the one-click report flow.
 *
 * Reporting deliberately stays unavailable until a production key is set.
 * Never commit Cloudflare's "always passes" test key here.
 */
window.TURNSTILE_SITE_KEY = ''; // Set the real public production Site Key before merge.
