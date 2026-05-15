const CACHE_NAME = 'gds-notes-v6';

// ALL PATHS UPDATED FOR /gdsnotes/
const ASSETS = [
  '/gdsnotes/',
  '/gdsnotes/index.html',
  '/gdsnotes/manifest.json',
  '/gdsnotes/icon-192.png',
  '/gdsnotes/icon-512.png'
];

// INSTALL
self.addEventListener('install', (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
  );

  self.skipWaiting();

});

// ACTIVATE
self.addEventListener('activate', (event) => {

  event.waitUntil(

    caches.keys().then((cacheNames) => {

      return Promise.all(

        cacheNames.map((cache) => {

          if (cache !== CACHE_NAME) {

            console.log('Service Worker: Clearing Old Cache');

            return caches.delete(cache);

          }

        })

      );

    })

  );

  return self.clients.claim();

});

// FETCH
self.addEventListener('fetch', (event) => {

  event.respondWith(

    fetch(event.request)

      .then((networkResponse) => {

        return caches.open(CACHE_NAME).then((cache) => {

          // Cache only valid requests
          if (event.request.url.startsWith('http')) {

            cache.put(event.request, networkResponse.clone());

          }

          return networkResponse;

        });

      })

      .catch(() => {

        return caches.match(event.request);

      })

  );

});

// BACKGROUND SYNC
self.addEventListener('sync', (event) => {

  if (event.tag === 'sync-exam-data') {

    event.waitUntil(

      Promise.resolve(
        console.log('Background Sync: Data being sent to server...')
      )

    );

  }

});

// PERIODIC SYNC
self.addEventListener('periodicsync', (event) => {

  if (event.tag === 'get-latest-notes') {

    event.waitUntil(

      Promise.resolve(
        console.log('Periodic Sync: Checking for new content...')
      )

    );

  }

});

// PUSH NOTIFICATION
self.addEventListener('push', (event) => {

  const options = {

    body: 'Naya study material update ho gaya hai!',

    icon: '/gdsnotes/icon-192.png',

    badge: '/gdsnotes/icon-192.png',

    // FIXED VIBRATE ERROR
    vibrate: [200, 100, 200],

    data: {
      url: '/gdsnotes/'
    }

  };

  event.waitUntil(

    self.registration.showNotification(
      'GDS Notes Update',
      options
    )

  );

});

// NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {

  event.notification.close();

  event.waitUntil(

    clients.matchAll({
      type: 'window'
    })

    .then((windowClients) => {

      for (let i = 0; i < windowClients.length; i++) {

        let client = windowClients[i];

        if (
          client.url === event.notification.data.url &&
          'focus' in client
        ) {

          return client.focus();

        }

      }

      if (clients.openWindow) {

        return clients.openWindow(
          event.notification.data.url
        );

      }

    })

  );

});
