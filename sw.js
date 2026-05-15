const CACHE_NAME = 'gds-notes-v2';
const APP_URL = 'https://rameshwarsahu2014bpmjarwe1694-hue.github.io';

// Wo files jo offline bhi milni chahiye
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/quiz.html',
  '/notes.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/Screenshots1dashboard.jpg',
  '/Screenshotpyq.jpg',
  '/Screenshotsquiz.jpg'
].map(path => path.startsWith('http') ? path : `${APP_URL}${path}`);

// 1. Service Worker Install aur Assets Cache karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Purana Cache saaf karna (Activation)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Network First Strategy (Offline Support)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Agar net hai toh naya data cache mein daalo
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Agar net nahi hai toh cache se serve karo
        return caches.match(event.request);
      })
  );
});

// 4. Background Sync (Data upload ke liye)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-exam-data') {
    event.waitUntil(syncExamResults());
  }
});

async function syncExamResults() {
  console.log('Background Syncing started...');
  // Yahan aapka offline saved data server pe bhejne ka logic aayega
}

// 5. App Capabilities: Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'GDS Notes Update', body: 'New study material available!' };
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate:
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click par app kholna
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(`${APP_URL}/`));
});
