var CACHE_NAME="2023-06-11 11:00",urlsToCache=["/talk-abc/","/talk-abc/index.js","/talk-abc/index.yomi","/talk-abc/mp3/end.mp3","/talk-abc/mp3/cat.mp3","/talk-abc/mp3/correct3.mp3","/talk-abc/kohacu.webp","/talk-abc/favicon/favicon.svg","https://marmooo.github.io/yomico/yomico.min.js","https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css","https://cdn.jsdelivr.net/npm/chart.js@4.2.1/dist/chart.umd.js"];self.addEventListener("install",function(a){a.waitUntil(caches.open(CACHE_NAME).then(function(a){return a.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(b){return b||fetch(a.request)}))}),self.addEventListener("activate",function(a){var b=[CACHE_NAME];a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(b.indexOf(a)===-1)return caches.delete(a)}))}))})