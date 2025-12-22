const CACHE_NAME = 'app-v4-updates';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(
        keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
    )));
    return self.clients.claim();
});

self.addEventListener('fetch', e => {
    // استثناء ملف التحديثات ليتم جلبه من الشبكة دائماً
    if (e.request.url.includes('updates.json')) {
        e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
        return;
    }
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});
