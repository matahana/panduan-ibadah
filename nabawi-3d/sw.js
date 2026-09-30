// Service worker PWA: halaman diambil dari jaringan lebih dulu (agar versi baru langsung tampil),
// aset berhash dan fon dari cache lebih dulu (agar bisa dipakai luring).
const CACHE = 'nabawi3d-v0.2.1';
const PRECACHE = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('nabawi3d-') && k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

function cacheable(req, res) {
  return res && res.ok && (req.url.startsWith(self.location.origin) || req.url.includes('fonts.g'));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (cacheable(req, res)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (cacheable(req, res)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
