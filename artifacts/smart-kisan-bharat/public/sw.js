const CACHE = 'smart-kisan-bharat-v3';
const BASE_PATH = new URL('.', self.registration.scope).pathname;
const APP_SHELL = [
  BASE_PATH,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}icon.svg`,
  `${BASE_PATH}favicon.svg`
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (url.pathname === `${BASE_PATH}api/events`) return;
  const isApi = url.pathname.startsWith(`${BASE_PATH}api/`);
  const publicApi = isApi && !url.searchParams.has('farmerId') && (
    url.pathname === `${BASE_PATH}api/dashboard` ||
    url.pathname === `${BASE_PATH}api/government` ||
    url.pathname === `${BASE_PATH}api/listings` ||
    url.pathname === `${BASE_PATH}api/marketplace/options` ||
    (url.pathname === `${BASE_PATH}api/bids` && url.searchParams.has('listingId'))
  );

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic' && (!isApi || publicApi)) {
        await cache.put(request, response.clone());
        const cachedApiKeys = (await cache.keys()).filter(key =>
          new URL(key.url).pathname.startsWith(`${BASE_PATH}api/`)
        );
        for (const key of cachedApiKeys.slice(0, Math.max(0, cachedApiKeys.length - 100))) {
          await cache.delete(key);
        }
      }
      return response;
    } catch {
      const cached = !isApi || publicApi ? await cache.match(request) : null;
      if (cached) return cached;

      if (isApi) {
        return new Response(JSON.stringify({ error: 'You are offline and no saved server response is available.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
      if (request.mode === 'navigate') {
        return await cache.match(BASE_PATH) || new Response('Offline', { status: 503 });
      }
      return new Response('', { status: 504 });
    }
  })());
});
