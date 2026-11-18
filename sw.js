var CACHE = 'life-v1';
var ASSETS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// сначала сеть, чтобы обновления приложения доходили сразу; без сети берётся копия
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var d = e.notification.data || {};
  e.waitUntil((async function () {
    var cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (cs.length) {
      cs[0].focus();
      if (e.action === 'done') cs[0].postMessage({ type: 'done', id: d.id, day: d.day });
      return;
    }
    var url = e.action === 'done' ? './?done=' + encodeURIComponent(d.id) + '&day=' + encodeURIComponent(d.day) : './';
    await self.clients.openWindow(url);
  })());
});
