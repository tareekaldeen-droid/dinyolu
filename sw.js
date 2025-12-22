// اسم النسخة (قم بتغيير الرقم v1 عند كل تحديث ليتم تحديث التطبيق عند المستخدمين)
const CACHE_NAME = 'app-cache-v3';

// الملفات التي سيتم تخزينها
const ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

// تثبيت التطبيق
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// تفعيل التحديث وحذف الكاش القديم
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
    return self.clients.claim();
});

// استراتيجية الجلب (الشبكة أولاً للملفات الديناميكية، والكاش أولاً للثابتة)
self.addEventListener('fetch', event => {
    // استثناء ملف الإشعارات ليتم جلبه من الشبكة دائماً
    if (event.request.url.includes('notifications.json')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedRes => {
            return cachedRes || fetch(event.request).then(fetchRes => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, fetchRes.clone());
                    return fetchRes;
                });
            });
        })
    );
});
