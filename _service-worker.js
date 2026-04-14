// Service Worker for PreventX - AI Health Companion
const CACHE_NAME = 'preventx-cache-v2';
const OFFLINE_URL = '/index.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Never intercept non-GET requests (auth, API calls, uploads, etc.).
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignore cross-origin requests.
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Avoid caching API responses.
  if (requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        if (response && response.status === 200) {
          const isStaticAsset = requestUrl.pathname.startsWith('/assets/') || requestUrl.pathname.endsWith('.css') || requestUrl.pathname.endsWith('.js');
          if (isStaticAsset) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          }
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') return caches.match(OFFLINE_URL);
          return Response.error();
        });
      })
  );
});
