const CACHE = 'psychology-library-v2-restored-304';
const BASE = new URL('./', self.location.href);
const ASSETS = ['./', './index.html', './icon.svg', './manifest.webmanifest',
  './materials/techniques/Озеро та сміття.md'].map(path => new URL(path, BASE).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('psychology-library-') && key !== CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(cache.put(event.request, copy));
      }
      return response;
    } catch {
      const saved = await cache.match(event.request);
      if (saved) return saved;
      if (event.request.mode === 'navigate') {
        const page = await cache.match(new URL('./index.html', BASE).href);
        if (page) return page;
      }
      return Response.error();
    }
  })());
});
