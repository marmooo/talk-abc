const CACHE_NAME = "2023-07-29 10:17";
const urlsToCache = [
  "/talk-abc/",
  "/talk-abc/index.js",
  "/talk-abc/index.yomi",
  "/talk-abc/mp3/end.mp3",
  "/talk-abc/mp3/cat.mp3",
  "/talk-abc/mp3/correct3.mp3",
  "/talk-abc/kohacu.webp",
  "/talk-abc/favicon/favicon.svg",
  "https://marmooo.github.io/yomico/yomico.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@4.2.1/dist/chart.umd.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
