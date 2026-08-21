const CACHE_NAME = 'pizzaria-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

// Install: cache assets estáticos do shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first para tudo (API, HTML, assets)
// Só serve cache quando offline
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Pula requests não-GET e WebSocket
  if (request.method !== 'GET' || request.url.includes('/api/socket.io')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cacheia a resposta bem-sucedida
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => {
        // Offline: tenta servir do cache
        return caches.match(request).then((cached) => cached || caches.match('/'));
      })
  );
});
