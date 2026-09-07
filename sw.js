const CACHE = 'travel-english-v24';
const PRECACHE = [
  './',
  'index.html',
  'lesson.html',
  'app.js',
  'manifest.json',
  'icons/icon-192-v2.png',
  'icons/icon-512-v2.png'
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

// Lesson data and the pages that frame it change whenever a lesson is added,
// so serving them from cache first meant a new lesson only showed up on the
// second visit. Audio and icons never change under a given name, so those stay
// cache-first and keep the app fast and usable offline.
function isMutable(url, req) {
  return req.mode === 'navigate' || url.pathname.indexOf('/data/') !== -1;
}

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
          // Offline: the cached copy is better than nothing, and a navigation
          // with nothing cached still gets the shell.
          return hit || cache.match('index.html');
        });
        return isMutable(url, req) ? fresh : (hit || fresh);
      });
    })
  );
});
