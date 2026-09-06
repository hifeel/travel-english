const CACHE = 'travel-english-v19';
const PRECACHE = [
  './',
  'index.html',
  'lesson.html',
  'app.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var cacheKey = req.mode === 'navigate'
    ? new Request(url.origin + url.pathname)
    : req;

  event.respondWith(
    caches.open(CACHE).then(function(cache) {
      return cache.match(cacheKey).then(function(hit) {
        var fresh = fetch(req).then(function(res) {
          if (res && res.ok && res.type === 'basic') {
            cache.put(cacheKey, res.clone());
          }
          return res;
        }).catch(function() {
          return hit || cache.match('index.html');
        });
        return hit || fresh;
      });
    })
  );
});
