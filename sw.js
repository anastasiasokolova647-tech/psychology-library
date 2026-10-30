const CACHE = 'psychology-library-v5-content-320';
const BASE = new URL('./', self.location.href);
const ASSETS = ['./', './index.html', './client-requests.js', './search.js', './editorial.js', './icon.svg', './manifest.webmanifest',
  './materials/techniques/Озеро та сміття.md',
  './materials/lectures/2026-10-24/source-notes.md',
  './materials/lectures/2026-10-24/supplement-notes.md',
  './materials/lectures/2026-10-24/lecture-20261024-1.md',
  './materials/lectures/2026-10-24/lecture-20261024-2.md',
  './materials/lectures/2026-10-24/lecture-20261024-3.md',
  './materials/lectures/2026-10-24/lecture-20261024-4.md',
  './materials/lectures/2026-10-24/lecture-20261024-5.md',
  './materials/lectures/2026-10-24/lecture-20261024-6.md',
  './materials/lectures/2026-10-24/lecture-20261024-7.md',
  './materials/lectures/2026-10-24/lecture-20261024-8.md',
  './materials/lectures/2026-10-24/lecture-20261024-9.md',
  './materials/lectures/2026-10-24/lecture-20261024-10.md',
  './materials/lectures/2026-10-24/lecture-20261024-11.md',
  './materials/lectures/2026-10-24/lecture-20261024-12.md',
  './materials/lectures/2026-10-24/supplement-20261024-1.md',
  './materials/lectures/2026-10-24/supplement-20261024-2.md',
  './materials/lectures/2026-10-24/supplement-20261024-3.md',
  './materials/lectures/2026-10-24/supplement-20261024-4.md'].map(path => new URL(path, BASE).href);
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
        const page = await cache.match(new URL('./index.html', './client-requests.js', './search.js', './editorial.js', BASE).href);
        if (page) return page;
      }
      return Response.error();
    }
  })());
});
