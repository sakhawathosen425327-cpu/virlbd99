const CACHE_NAME = 'viralbd99-assets-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Disable service worker caching for HTML files to avoid serving stale index templates.
  const isHtml = 
    event.request.mode === 'navigate' || 
    url.pathname.endsWith('.html') || 
    url.pathname === '/';

  if (isHtml) {
    // Network-only for HTML files to guarantee the latest index.html is loaded from server
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle other assets (CSS, JS, media files)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Only cache successful assets under `/assets/` that have long-term hashed/versioned filenames
        if (
          networkResponse && 
          networkResponse.status === 200 && 
          url.pathname.includes('/assets/')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return new Response('Network error occurred.', {
          status: 480,
          statusText: 'Network Error'
        });
      });
    })
  );
});
