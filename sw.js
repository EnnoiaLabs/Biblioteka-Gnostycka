const CACHE_NAME = "gnostyk-biblioteka-v1.0.55";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data.js",
  "./manifest.webmanifest",
  "./VERSION.json",
  "./library.json",
  "./CHANGELOG.md",
  "./TRANSLATION_REPORT.md",
  "./translation-audit.json",
  "./tools/audit-translation.mjs",
  "./assets/gnostyk-icon.png",
  "./assets/gnostyk-logo.png",
  "./assets/gnostyk-slit-bg.png",
  "./assets/pwa-icon-32.png",
  "./assets/pwa-icon-64.png",
  "./assets/pwa-icon-96.png",
  "./assets/pwa-icon-180.png",
  "./assets/pwa-icon-192.png",
  "./assets/pwa-icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const networkFirst = [
    "/",
    "index.html",
    "styles.css",
    "app.js",
    "sw.js",
    "manifest.webmanifest",
    "CHANGELOG.md",
    "VERSION.json",
    "library.json"
  ].some(file => url.pathname.endsWith(file));
  if (networkFirst) {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
