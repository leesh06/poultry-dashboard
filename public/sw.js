const CACHE_NAME = 'poultry-dashboard-v1'
const STATIC_ASSETS = ['/', '/price', '/production', '/statistics']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  // API 요청은 네트워크 우선
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
    return
  }
  // 나머지는 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  )
})
