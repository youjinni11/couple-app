// 우리둘 service worker: push notifications with deep links + light offline cache
const CACHE = 'uridul-v5';
const SHELL = ['./', './index.html', './styles.css', './app.js', './lib.js', './i18n.js', './config.js', './manifest.webmanifest', './icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// network-first for our own files so updates show up immediately
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(e.request);
      const c = await caches.open(CACHE);
      c.put(e.request, res.clone());
      return res;
    } catch (err) {
      const hit = await caches.match(e.request);
      return hit || caches.match('./index.html');
    }
  })());
});

self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { title: '우리둘', body: e.data && e.data.text() }; }
  const title = data.title || '우리둘';
  e.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    tag: data.tag,
    data: { url: data.url || '#/' },
  }));
});

// 알림을 누르면 해당 화면(#/...)으로 바로 이동
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const hash = (e.notification.data && e.notification.data.url) || '#/';
  const target = new URL(self.registration.scope);
  target.hash = hash.replace(/^#/, '');
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.startsWith(self.registration.scope)) {
        try { w.postMessage({ type: 'navigate', hash }); } catch (err) {}
        try { await w.focus(); } catch (err) {}
        return;
      }
    }
    await self.clients.openWindow(target.href);
  })());
});
