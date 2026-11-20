// Bump this on every deploy that should invalidate old caches.
const CACHE_VERSION = 'v129';
const CACHE_NAME = `tnc-sim-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/LICENSE',
  '/LICENSING.md',
  '/ADDITIONAL-USE-GRANT.txt',
  '/vendor/THREE-LICENSE.txt',
  '/favicon.ico',
  '/favicon-32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/learn/',
  '/de/learn/',
  '/learn/learn.css',
  '/examples/',
  '/de/examples/',
  '/examples/report-44/',
  '/de/examples/report-44/',
  '/examples/report-44/PROGRAM.H',
  '/examples/examples.css',
  // Three.js is vendored locally — without these two, offline mode has no 3D engine.
  '/vendor/three.min.js',
  '/vendor/OrbitControls.js',
  // Cache the complete runtime with the matching HTML on the first install.
  '/web/i18n.js',
  '/core/data-tables.js',
  '/web/i18n-lessons-de.js',
  '/web/i18n-cycles-de.js',
  '/core/block-form-panel.js',
  '/core/bug-report.js',
  '/core/cycle-picker.js',
  '/core/demo-programs.js',
  '/web/i18n-demos-de.js',
  '/core/editor-core.js',
  '/core/program-autosave.js',
  '/core/field-editing.js',
  '/core/help-popups.js',
  '/core/klartext-syntax.js',
  '/core/learn-tutorial.js',
  '/core/mcode-panel.js',
  '/core/measure-tool.js',
  '/core/mobile-tabs.js',
  '/core/parser-engine.js',
  '/core/qparam-panel.js',
  '/core/render3d.js',
  '/core/sim-controls.js',
  '/core/theme-toast.js',
  '/web/i18n-about-de.js',
  '/core/tool-table.js',
  '/core/view2d.js',
  '/core/voxel-cutting.js',
  '/web/keyboard.js',
  '/web/layout.js',
  '/web/panels.js',
  '/web/app.js',
  '/web/ui-shell.js',
  '/web/whats-new.js',
  '/web/analytics.js',
  '/web/styles.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// A connection that neither answers nor fails must not leave the app blank:
// after this long a navigation falls back to the cached page.
const NAVIGATION_TIMEOUT_MS = 4000;

// Pages that were served from the cache. Their scripts and styles come from the
// same cache, so one page never mixes cached HTML with newer network scripts.
// Losing this set when the worker restarts only returns to network-first.
const cachedPageClients = new Set();

function rememberCachedPage(clientId) {
  if (!clientId) return;
  if (cachedPageClients.size >= 50) cachedPageClients.clear();
  cachedPageClients.add(clientId);
}

// Use the current network response while online. The old cache-first policy
// could mix an outdated index.html with newer scripts and hide new UI links.
// Cached responses remain available when the network is unavailable or stalled.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  // Ignore non-http(s) schemes (browser extensions etc.) — cache.put would throw.
  if (!request.url.startsWith('http')) return;

  const isNavigation = request.mode === 'navigate';

  event.respondWith(caches.open(CACHE_NAME).then((cache) => {
    // ignoreSearch lets offline navigations with query parameters use the page cache.
    const fromCache = () => cache.match(request, { ignoreSearch: isNavigation });
    const fromCacheOrError = () => fromCache().then((cached) => cached || Response.error());

    if (!isNavigation && event.clientId && cachedPageClients.has(event.clientId)) {
      return fromCache().then((cached) => cached || fetch(request));
    }

    // Once the cached page has been served, a late network response is dropped
    // rather than stored: the cache must stay one consistent set of files.
    let servedFromCache = false;
    const network = fetch(request).then((networkResponse) => {
      // Cache normal and opaque cross-origin responses for offline reuse.
      if (!servedFromCache && networkResponse &&
          (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
        event.waitUntil(cache.put(request, networkResponse.clone()).catch(() => {}));
      }
      return networkResponse;
    });

    if (!isNavigation) return network.catch(fromCacheOrError);

    const pageId = event.resultingClientId || event.clientId;
    return new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        fromCache().then((cached) => {
          // Without a cached page there is nothing better than waiting.
          if (settled || !cached) return;
          settled = true;
          servedFromCache = true;
          rememberCachedPage(pageId);
          resolve(cached);
        }).catch(() => {});
      }, NAVIGATION_TIMEOUT_MS);

      network.then((networkResponse) => {
        clearTimeout(timer);
        if (settled) return;
        settled = true;
        resolve(networkResponse);
      }, () => {
        clearTimeout(timer);
        if (settled) return;
        settled = true;
        rememberCachedPage(pageId);
        resolve(fromCacheOrError());
      });
    });
  }));
});
