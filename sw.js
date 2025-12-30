const CACHE_NAME = 'pocketbench-v1.0.2';
const BASE_URL = 'https://elnunezz.github.io/pocketbench/';

const urlsToCache = [
  BASE_URL,
  BASE_URL + 'index.html',
  BASE_URL + 'manifest.json',
  BASE_URL + 'icon-192.png',
  BASE_URL + 'icon-512.png'
];

// Instalar
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando pocketbench v1.0.2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((error) => console.error('Service Worker: Error cacheando', error))
  );
  self.skipWaiting();
});

// Activar
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando pocketbench v1.0.2...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // No interceptar Apps Script/Google domains: siempre red
  if (url.includes('script.google.com') || url.includes('googleusercontent.com')) {
    return event.respondWith(fetch(event.request));
  }

  // Para el shell: network-first con fallback a cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match(BASE_URL + 'index.html');
        });
      })
  );
});
