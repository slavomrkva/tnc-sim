/* turnstile-config.js — Cloudflare Turnstile PUBLIC site key.
 *
 * This file is safe to commit: the site key is public by design (it ships to
 * every browser). The matching SECRET (TURNSTILE_SECRET_KEY) is NEVER stored
 * here — it lives only as a Cloudflare Pages secret. See
 * docs/bug-report-setup.md.
 *
 * ▶ REPLACE the placeholder below with the real site key from the Cloudflare
 *   dashboard (Turnstile → your widget → "Site Key"). Create the widget as an
 *   *Invisible* widget for the one-click report flow.
 *
 * The value shipped here is Cloudflare's official "always passes, invisible"
 * TEST key so the report dialog works locally before a real widget is created.
 * It must be swapped for the production key before launch.
 */
window.TURNSTILE_SITE_KEY = '1x00000000000000000000BB'; // <-- PUBLIC placeholder (test key). REPLACE ME.
