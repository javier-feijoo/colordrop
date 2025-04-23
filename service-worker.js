const CACHE_NAME = 'color-drop-static-v1';
const urlsToCache = [
  "/assets/images/logo.png",
  "/assets/sounds/background_loop.mp3",
  "/assets/sounds/click.mp3",
  "/assets/sounds/error.mp3",
  "/assets/sounds/success.mp3",
  "/assets/images/icon-192.png",
  "/assets/images/icon-512.png"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  const requestPath = new URL(event.request.url).pathname;
  if (urlsToCache.includes(requestPath)) {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});