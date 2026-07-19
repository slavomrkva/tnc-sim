/* turnstile-config.js — Cloudflare Turnstile PUBLIC site key.
 *
 * This file is safe to commit: the site key is public by design (it ships to
 * every browser). The matching SECRET (TURNSTILE_SECRET_KEY) is NEVER stored
 * here — it lives only as a Cloudflare Worker secret. See
 * docs/bug-report-setup.md.
 *
 * This production Site Key belongs to the Invisible widget used by the
 * one-click report flow. Its allowed hostnames are tncsim.org and localhost.
 * Never replace it with Cloudflare's "always passes" test key in production.
 */
window.TURNSTILE_SITE_KEY = '0x4AAAAAAD4vKPMHsScVzVSp';
