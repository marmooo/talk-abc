const CACHE_NAME="2023-07-31 07:25",urlsToCache=["/talk-abc/","/talk-abc/index.js","/talk-abc/index.yomi","/talk-abc/mp3/end.mp3","/talk-abc/mp3/cat.mp3","/talk-abc/mp3/correct3.mp3","/talk-abc/kohacu.webp","/talk-abc/favicon/favicon.svg","https://marmooo.github.io/yomico/yomico.min.js","https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css","https://cdn.jsdelivr.net/npm/chart.js@4.2.1/dist/chart.umd.js"];self.addEventListener("install",a=>{a.waitUntil(caches.open(CACHE_NAME).then(a=>a.addAll(urlsToCache)))}),self.addEventListener("fetch",a=>{a.respondWith(caches.match(a.request).then(b=>b||fetch(a.request)))}),self.addEventListener("activate",a=>{a.waitUntil(caches.keys().then(a=>Promise.all(a.filter(a=>a!==CACHE_NAME).map(a=>caches.delete(a)))))})