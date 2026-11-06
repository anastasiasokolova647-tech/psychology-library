const CACHE = 'psychology-library-v11-notes-369';
const BASE = new URL('./', self.location.href);
const ASSETS = ["./materials/lectures/2026-11-05/lecture-20261105-8.md","./materials/lectures/2026-11-05/lecture-20261105-9.md","./materials/lectures/2026-11-05/lecture-20261105-10.md","./materials/lectures/2026-11-05/lecture-20261105-11.md",'./client-requests-369.js',"./materials/lectures/2026-11-05/README.md","./materials/lectures/2026-11-05/lecture-20261105-1.md","./materials/lectures/2026-11-05/lecture-20261105-2.md","./materials/lectures/2026-11-05/lecture-20261105-3.md","./materials/lectures/2026-11-05/lecture-20261105-4.md","./materials/lectures/2026-11-05/lecture-20261105-5.md","./materials/lectures/2026-11-05/lecture-20261105-6.md","./materials/lectures/2026-11-05/lecture-20261105-7.md","./materials/lectures/2026-11-05/manifest.json","./materials/lectures/2026-11-05/notes.md","./materials/lectures/2026-10-31/README.md","./materials/lectures/2026-10-31/lecture-20261031-1.md","./materials/lectures/2026-10-31/lecture-20261031-2.md","./materials/lectures/2026-10-31/lecture-20261031-3.md","./materials/lectures/2026-10-31/lecture-20261031-4.md","./materials/lectures/2026-10-31/lecture-20261031-5.md","./materials/lectures/2026-10-31/lecture-20261031-6.md","./materials/lectures/2026-10-31/manifest.json","./materials/lectures/2026-10-31/notes-114435.md","./materials/lectures/2026-10-31/notes-123009.md","./materials/lectures/2026-11-04/01-resilience.md","./materials/lectures/2026-11-04/02-research-personality.md","./materials/lectures/2026-11-04/03-english-history.md","./materials/lectures/2026-11-04/README.md","./materials/lectures/2026-11-04/lecture-20261104-1.md","./materials/lectures/2026-11-04/lecture-20261104-10.md","./materials/lectures/2026-11-04/lecture-20261104-11.md","./materials/lectures/2026-11-04/lecture-20261104-12.md","./materials/lectures/2026-11-04/lecture-20261104-13.md","./materials/lectures/2026-11-04/lecture-20261104-14.md","./materials/lectures/2026-11-04/lecture-20261104-15.md","./materials/lectures/2026-11-04/lecture-20261104-16.md","./materials/lectures/2026-11-04/lecture-20261104-17.md","./materials/lectures/2026-11-04/lecture-20261104-18.md","./materials/lectures/2026-11-04/lecture-20261104-19.md","./materials/lectures/2026-11-04/lecture-20261104-2.md","./materials/lectures/2026-11-04/lecture-20261104-20.md","./materials/lectures/2026-11-04/lecture-20261104-3.md","./materials/lectures/2026-11-04/lecture-20261104-4.md","./materials/lectures/2026-11-04/lecture-20261104-5.md","./materials/lectures/2026-11-04/lecture-20261104-6.md","./materials/lectures/2026-11-04/lecture-20261104-7.md","./materials/lectures/2026-11-04/lecture-20261104-8.md","./materials/lectures/2026-11-04/lecture-20261104-9.md","./materials/lectures/2026-11-04/manifest.json","./materials/lectures/2026-10-28/README.md","./materials/lectures/2026-10-28/lecture-20261028-1.md","./materials/lectures/2026-10-28/lecture-20261028-10.md","./materials/lectures/2026-10-28/lecture-20261028-11.md","./materials/lectures/2026-10-28/lecture-20261028-12.md","./materials/lectures/2026-10-28/lecture-20261028-2.md","./materials/lectures/2026-10-28/lecture-20261028-3.md","./materials/lectures/2026-10-28/lecture-20261028-4.md","./materials/lectures/2026-10-28/lecture-20261028-5.md","./materials/lectures/2026-10-28/lecture-20261028-6.md","./materials/lectures/2026-10-28/lecture-20261028-7.md","./materials/lectures/2026-10-28/lecture-20261028-8.md","./materials/lectures/2026-10-28/lecture-20261028-9.md","./materials/lectures/2026-10-28/manifest.json","./materials/lectures/2026-10-28/notes-132804.md","./materials/lectures/2026-10-28/notes-133001.md","./materials/lectures/2026-10-28/notes-142810.md",'./', './index.html', './client-requests.js', './search.js', './editorial.js', './icon.svg', './manifest.webmanifest',
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
        const page = await cache.match(new URL('./index.html', BASE).href);
        if (page) return page;
      }
      return Response.error();
    }
  })());
});
