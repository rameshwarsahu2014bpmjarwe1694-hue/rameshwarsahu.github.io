const CACHE_NAME = "gds-notes-v9";

const ASSETS = [
  "/gdsnotes/",
  "/gdsnotes/index.html",
  "/gdsnotes/manifest.json",
  "/gdsnotes/icon-192.png",
  "/gdsnotes/icon-512.png"
];

/* INSTALL */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );

  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key.startsWith("gds-notes")) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // clone & cache valid responses
        if (
          event.request.url.startsWith("http") &&
          response.status === 200
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((res) => {
          return res || caches.match("/gdsnotes/index.html");
        });
      })
  );
});
