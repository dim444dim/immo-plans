// Versioning : incrémenter ce numéro (v1 -> v2 -> ...) à chaque modification
// d'une ressource listée dans urlsToCache. Le handler "activate" supprime
// automatiquement les caches portant un ancien nom, ce qui force le
// téléchargement des nouvelles versions au prochain chargement.
const CACHE_NAME = 'immoviz-v5';
// Precache volontairement limité à l'app shell (page d'accueil + assets
// critiques) : les pages secondaires (privacy/conditions/livraison, les 3
// plans interactifs avec Three.js) sont lourdes et ne doivent pas bloquer
// l'event "install" au premier chargement. Elles sont mises en cache à la
// volée par le handler "fetch" (stale-while-revalidate) dès leur première
// visite réelle.
const urlsToCache = [
  '/immo-plans/',
  '/immo-plans/index.html',
  '/immo-plans/manifest.json',
  '/immo-plans/css/tailwind.min.css?v=20260614',
  '/immo-plans/css/main.css?v=20260615',
  '/immo-plans/js/main.js?v=20260615',
  '/immo-plans/fonts/inter-tight-latin-700-900.woff2?v=20260614',
  '/immo-plans/fonts/playfair-display-italic-400-latin.woff2?v=20260614',
  '/immo-plans/icons/icon-192.png?v=20260614',
  '/immo-plans/icons/icon-512.png',
  '/immo-plans/icons/icon-maskable-192.png',
  '/immo-plans/icons/icon-maskable-512.png',
  '/immo-plans/icons/apple-touch-icon.png?v=20260614'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
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
    }).then(() => self.clients.claim())
  );
});

// Stratégie "stale-while-revalidate" : on répond immédiatement avec la
// version en cache si elle existe (instantané, fonctionne hors-ligne), tout
// en relançant une requête réseau en arrière-plan pour rafraîchir le cache.
// Les ressources jamais vues (CDN Three.js/OrbitControls/qrcode, polices,
// images, panoramas...) sont mises en cache dès leur premier chargement.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          if (response && (response.status === 200 || response.type === 'opaque')) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('/immo-plans/index.html');
          return Promise.reject('Ressource indisponible (hors-ligne et non mise en cache)');
        });

        return cached || networkFetch;
      })
    )
  );
});
