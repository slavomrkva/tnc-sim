// Bump this on every deploy that should invalidate old caches.
const CACHE_VERSION = 'v111';
const CACHE_NAME = `tnc-sim-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
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
  '/vendor/OrbitControls.js'
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
