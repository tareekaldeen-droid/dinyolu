const CACHE_NAME = 'app-v6-fixed';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))));
    return self.clients.claim();
});

self.addEventListener('fetch', e => {
    // استثناء ملف الإشعارات ليتم جلبه من الشبكة دائماً
    if (e.request.url.includes('notifications.json')) {
        e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
        return;
    }
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
