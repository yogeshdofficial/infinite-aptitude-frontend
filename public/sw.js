/**
 * InfiniteAptitude — Service Worker
 *
 * Strategy overview:
 *
 * 1. Navigation requests (HTML):
 *    Network-first → if offline, serve the cached root page so the SPA
 *    still boots. Once the app boots, SQLite (IndexedDB) provides data.
 *
 * 2. Same-origin assets with a content hash in the URL (JS, CSS, fonts):
 *    Cache-first. Vite includes a hash in every asset filename, so a cached
 *    file is always correct — it never goes stale at the same URL.
 *
 * 3. External fonts / CDN resources:
 *    Stale-while-revalidate. Serve from cache instantly, refresh in background.
 *
 * 4. Everything else (same-origin, no hash):
 *    Network-first with cache fallback.
 *
 * NOTE: This SW only caches HTTP resources (JS, CSS, HTML, fonts).
 *       SQLite data lives in IndexedDB — it is already offline-capable and
 *       completely unaffected by this SW.
 */

const CACHE_VERSION = "ia-v1";
const STATIC_ORIGINS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdn.jsdelivr.net",
];

// ── Helpers ────────────────────────────────────────────────────────────────

/** True when the URL looks like a Vite-hashed asset: /assets/index-AbCd1234.js */
function isHashedAsset(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    /\.[a-f0-9]{8,}\.(js|css|woff2?|ttf|eot)$/.test(url.pathname)
  );
}

function isStaticCdn(url) {
  return STATIC_ORIGINS.some((o) => url.hostname.includes(o));
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached ?? networkPromise;
}

// ── Lifecycle ──────────────────────────────────────────────────────────────

self.addEventListener("install", () => {
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Delete old cache versions
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_VERSION)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ── Fetch interception ─────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip chrome-extension and non-http(s) requests
  if (!url.protocol.startsWith("http")) return;

  // ── External CDN / font hosts ───────────────────────────────────────────
  if (isStaticCdn(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_VERSION));
    return;
  }

  // Skip cross-origin requests that aren't CDN (e.g. analytics, APIs)
  if (url.origin !== self.location.origin) return;

  // ── SPA navigation: serve index.html ───────────────────────────────────
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches
              .open(CACHE_VERSION)
              .then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback: serve any previously cached page, then root
          const cached =
            (await caches.match(request)) ??
            (await caches.match("/")) ??
            (await caches.match("/index.html"));
          return cached ?? Response.error();
        }),
    );
    return;
  }

  // ── Vite-hashed assets: cache-first (never stale at the same URL) ───────
  if (isHashedAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_VERSION));
    return;
  }

  // ── Everything else (unhashed same-origin): network-first ───────────────
  event.respondWith(networkFirst(request, CACHE_VERSION));
});
