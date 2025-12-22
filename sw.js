// اسم النسخة (قم بتغييره عند كل تحديث ليتم تحديث التطبيق عند المستخدمين)
const CACHE_NAME = 'app-v2-emerald-night';

// الملفات التي سيتم تخزينها للعمل بدون نت
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// 1. تثبيت التطبيق وتخزين الملفات
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Caching assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // تفعيل التحديث فوراً
    self.skipWaiting();
});

// 2. تفعيل التحديث وحذف النسخ القديمة
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. جلب الملفات (استراتيجية: الشبكة أولاً، ثم الكاش)
// هذا يضمن حصول المستخدم على أحدث نسخة إذا كان متصلاً بالنت
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // إذا نجح الاتصال، قم بتحديث النسخة المخزنة
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clone);
                });
                return response;
            })
            .catch(() => {
                // إذا فشل الاتصال (بدون نت)، هات من الكاش
                return caches.match(event.request);
            })
    );
});
