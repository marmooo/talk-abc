var CACHE_NAME = '2021-11-06 11:20';
var urlsToCache = [
  "/talk-abc/",
  "/talk-abc/kohacu.webp",
  "/talk-abc/index.js",
  "/talk-abc/mp3/incorrect1.mp3",
  "/talk-abc/mp3/end.mp3",
  "/talk-abc/mp3/cat.mp3",
  "/talk-abc/mp3/correct3.mp3",
  "/talk-abc/favicon/original.svg",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@3.5.0/dist/chart.min.js",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
