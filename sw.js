
// Dr.Suji Chat Service Worker
const CACHE_NAME = 'dr-suji-app-shell-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  // Vite injects script tags, we try to cache the root which usually serves index.html
  // In production, the manifest will handle hashed filenames. 
  // For this basic SW, we focus on the main entry point and network-first for others.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // We handle WebLLM requests differently (they are large and handled by the lib)
  // We strictly handle app shell here.
  
  if (event.request.url.includes('webllm')) {
    // Let WebLLM handle its own caching logic via simple fetch
    return; 
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Don't cache API calls or external resources indefinitely in this simple strategy
          if (!event.request.url.startsWith('http') || event.request.method !== 'GET') return;
          
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
