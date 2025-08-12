const CACHE = 'prepolab-cache-v1'
const ASSETS = ['/', '/index.html']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(self.skipWaiting())
  )
})

self.addEventListener('activate', e => 
  e.waitUntil(self.clients.claim())
)

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url)
  if (u.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request)
        .then(x => x || fetch(e.request))
    )
  }
})