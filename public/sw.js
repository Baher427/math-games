const CACHE_NAME = 'math-games-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/avatars/avatar-1.png',
  '/avatars/avatar-2.png',
  '/avatars/avatar-3.png',
  '/avatars/avatar-4.png',
  '/avatars/avatar-5.png',
  '/avatars/avatar-6.png',
  '/avatars/avatar-7.png',
  '/avatars/avatar-8.png',
  '/avatars/avatar-9.png',
  '/avatars/avatar-10.png',
  '/avatars/avatar-11.png',
  '/avatars/avatar-12.png',
  '/avatars/avatar-13.png',
  '/avatars/avatar-14.png',
  '/avatars/avatar-15.png',
  '/avatars/avatar-16.png',
  '/avatars/avatar-17.png',
  '/avatars/avatar-18.png',
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية Cache First مع Network Fallback
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات API و NextAuth
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('_next') ||
      event.request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا وجد في الكاش، أرجعه
        if (response) {
          return response;
        }

        // وإلا، اجلب من الشبكة
        return fetch(event.request).then((response) => {
          // تأكد من أن الاستجابة صحيحة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // انسخ الاستجابة للكاش
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // في حالة عدم وجود اتصال، أرجع الصفحة الرئيسية
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});
