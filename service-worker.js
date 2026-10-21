// Bump this on every deploy that should invalidate old caches.
const CACHE_VERSION = 'v116';
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
  '/core/learn-coach.js',
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

// Use the current network response while online. The old cache-first policy
// could mix an outdated index.html with newer scripts and hide new UI links.
// Cached responses remain available when the network is unavailable.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Ignore non-http(s) schemes (browser extensions etc.) — cache.put would throw.
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => fetch(event.request).then((networkResponse) => {
      // Cache normal and opaque cross-origin responses for offline reuse.
      if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
        event.waitUntil(cache.put(event.request, networkResponse.clone()).catch(() => {}));
      }
      return networkResponse;
    }).catch(() =>
      // ignoreSearch lets offline navigations with query parameters use the page cache.
      cache.match(event.request, { ignoreSearch: event.request.mode === 'navigate' })
        .then((cachedResponse) => cachedResponse || Response.error())
    ))
  );
});
