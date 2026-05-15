const CACHE_NAME = 'gds-notes-v5';

// 1. OFFLINE SUPPORT (Files to Cache)
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// INSTALL: Caching logic
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 2. HAS LOGIC (Fetch Handling)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => caches.match(event.request)) // Offline functionality
  );
});

// 3. BACKGROUND SYNC
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-exam-data') {
    event.waitUntil(
      console.log('Background Sync: Data being sent to server...')
    );
  }
});

// 4. PERIODIC SYNC
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-notes') {
    event.waitUntil(
      console.log('Periodic Sync: Checking for new content...')
    );
  }
});

// 5. PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  const options = {
    body: 'Naya study material update ho gaya hai!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate:,
    data: { url: '/' }
  };
  event.waitUntil(
    self.registration.showNotification('GDS Notes Update', options)
  );
});

// Notification Click Logic
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
