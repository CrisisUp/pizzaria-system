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

// Fetch: network-first, sem cachear chamadas de API
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Pula requests não-GET, WebSocket e chamadas de API
  if (request.method !== 'GET' || request.url.includes('/api/socket.io') || request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cacheia apenas assets estáticos, não dados de API
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

// Push: exibe notificação quando recebe push do servidor
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Pizzaria', body: event.data.text() };
  }

  const { title = 'Pizzaria', body = '', icon = '/icon-192.svg', badge = '/icon-192.svg', tag = 'pizzaria-notification', data = {} } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data,
      requireInteraction: true,
      vibrate: [200, 100, 200],
    })
  );
});

// Click na notificação: foca a janela ou abre a URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já tem uma janela aberta, foca nela
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão abre nova janela
      return clients.openWindow(url);
    })
  );
});