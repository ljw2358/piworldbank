// ============================
// PiWorldBank PWA Service Worker (Final)
// ============================

const CACHE_NAME = 'pwb-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/PWB-192.png',
  './assets/PWB-512.png',
  './assets/PWB-cover.png'
];

// 📌 설치 단계: 핵심 파일들을 캐시에 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // 즉시 활성화
});

// 📌 fetch 단계: 캐시 우선, 없으면 네트워크 요청
self.addEventListener('fetch', event => {
  const { request } = event;
  // API / POST 등은 캐시하지 않고 통과
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return (
        cachedResponse ||
        fetch(request).then(networkResponse => {
          // 정적 파일만 캐시에 저장
          if (request.url.startsWith(self.location.origin)) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          }
          return networkResponse;
        })
      );
    })
  );
});

// 📌 활성화 단계: 이전 캐시 정리
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // 즉시 컨트롤
});
