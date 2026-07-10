// Bump this on every deploy that should invalidate old caches.
const CACHE_VERSION = 'v2';
const CACHE_NAME = `tnc-sim-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // Three.js comes from a CDN — without these two, offline mode has no 3D engine.
  'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

// Stale-while-revalidate: serve the cached response immediately, then
// fetch a fresh copy in the background and update the cache for next launch.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Ignore non-http(s) schemes (browser extensions etc.) — cache.put would throw.
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      // ignoreSearch on navigations so "/?utm=..." still hits the cached "/".
      cache.match(event.request, { ignoreSearch: event.request.mode === 'navigate' }).then((cachedResponse) => {
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            // status 200 = normal same-origin/CORS; status 0 (opaque) = no-cors
            // cross-origin (e.g. CDN scripts) — both are worth keeping for offline.
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const copy = networkResponse.clone();
              cache.put(event.request, copy).catch(() => {});
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
    )
  );
});
