const CACHE_NAME = 'timer-pwa-v1';
const ASSETS = [
  '/',
  '/timer',
  '/notification.mp3',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});