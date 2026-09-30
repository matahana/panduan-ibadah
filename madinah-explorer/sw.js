// Service worker PWA Madinah Explorer: cangkang aplikasi dari cache (luring); paket data disimpan
// aplikasi di OPFS/IndexedDB, bukan di sini. 675008d066c3 diganti sidik build oleh scripts/postbuild.mjs
// sehingga setiap rilis memasang cache baru dan menghapus yang lama.
const CACHE = 'mx-shell-675008d066c3';
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const list = new Set(['./', './index.html']);
    try {
      const r = await fetch('./precache.json', { cache: 'no-store' });
      if (r.ok) for (const u of await r.json()) list.add(u);
    } catch (_) { /* luring saat pasang: pakai daftar minimum */ }
    // addAll menolak entri ganda, jadi daftar dijadikan Set.
    await c.addAll([...list]);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('mx-shell-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  // Paket diunduh langsung oleh aplikasi (dengan Range/lanjut-unduh); jangan dicegat.
  if (url.pathname.includes('/packs/') && !url.pathname.endsWith('manifest.json')) return;
  const isNav = req.mode === 'navigate';
  const networkFirst = isNav || url.pathname.endsWith('manifest.json') || url.pathname.endsWith('dynamic.json');
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    if (networkFirst) {
      try {
        const r = await fetch(req);
        if (r.ok) c.put(isNav ? './index.html' : req, r.clone());
        return r;
      } catch (_) {
        return (await c.match(isNav ? './index.html' : req)) || Response.error();
      }
    }
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    const r = await fetch(req);
    if (r.ok) c.put(req, r.clone());
    return r;
  })());
});
