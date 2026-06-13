// Versioning : incrémenter ce numéro (v1 -> v2 -> ...) à chaque modification
// d'une ressource listée dans urlsToCache. Le handler "activate" supprime
// automatiquement les caches portant un ancien nom, ce qui force le
// téléchargement des nouvelles versions au prochain chargement.
const CACHE_NAME = 'immoviz-v2';
const urlsToCache = [
  '/immo-plans/',
  '/immo-plans/index.html',
  '/immo-plans/privacy.html',
  '/immo-plans/conditions.html',
  '/immo-plans/livraison.html',
  '/immo-plans/plan-interactif-romorantin.html',
  '/immo-plans/plan-interactif-niort.html',
  '/immo-plans/plan-interactif-tours.html',
  '/immo-plans/manifest.json',
  '/immo-plans/icons/icon-192.png',
  '/immo-plans/icons/icon-512.png',
  '/immo-plans/icons/icon-maskable-192.png',
  '/immo-plans/icons/icon-maskable-512.png',
  '/immo-plans/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/immo-plans/index.html'))
  );
});
