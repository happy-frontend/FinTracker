// Service worker for Gill Brothers Crockery Services.
//
// Strategy: cache-first for SAME-ORIGIN static assets only (JS/CSS/images/fonts).
// Everything else — page navigations, Supabase API calls, and any cross-origin
// request — goes straight to the network and is never cached.
//
// This app is intentionally online-only: there is no offline data sync and no
// offline app-shell fallback. If the network is down, requests simply fail as
// they would without a service worker.

const CACHE = "gbcs-static-v1";
const STATIC_RE = /\.(?:js|css|png|jpe?g|gif|webp|svg|ico|woff2?)$/;

self.addEventListener("install", () => {
  // Activate this worker as soon as it finishes installing.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from older versions of this worker.
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only ever touch GET requests.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOriginStatic =
    url.origin === self.location.origin && STATIC_RE.test(url.pathname);

  // Let the browser handle everything that isn't a same-origin static asset
  // (navigations, Supabase, APIs, cross-origin) with a normal network fetch.
  if (!isSameOriginStatic) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      // Only cache successful, complete responses.
      if (response.ok && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })()
  );
});
