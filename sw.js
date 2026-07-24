const CACHE_NAME = "gnostyk-biblioteka-v1.7.54";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app-content.js",
  "./book-loader.js",
  "./coptic-config.js",
  "./coptic-text-tools.js",
  "./interlinear-engine.js",
  "./coptic-lookup.js",
  "./dictionary-engine.js",
  "./citation-engine.js",
  "./reader-engine.js",
  "./changelog-fallback.js",
  "./storage.js",
  "./changelog-tools.js",
  "./app.js",
  "./books/index.json",
  "./books/pistis-sophia/book.json",
  "./books/pistis-sophia/data.js",
  "./books/pistis-sophia/coptic-data.js",
  "./books/pistis-sophia/themes.json",
  "./books/pistis-sophia/polish-translations.js",
  "./books/gospel-of-thomas/book.json",
  "./books/gospel-of-thomas/data.js",
  "./books/gospel-of-thomas/coptic-data.js",
  "./books/gospel-of-thomas/themes.json",
  "./books/gospel-of-philip/book.json",
  "./books/gospel-of-philip/data.js",
  "./books/gospel-of-philip/coptic-data.js",
  "./books/gospel-of-philip/themes.json",
  "./coptic-dictionary.js",
  "./coptic-polish-overrides.js",
  "./coptic-missing-dictionary-map.json",
  "./manifest.webmanifest",
  "./VERSION.json",
  "./library.json",
  "./CHANGELOG.md",
  "./PUBLIC_CHANGELOG.md",
  "./assets/gnostyk-icon.png",
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
    "app-content.js",
    "book-loader.js",
    "coptic-config.js",
    "coptic-text-tools.js",
    "interlinear-engine.js",
    "coptic-lookup.js",
    "dictionary-engine.js",
    "citation-engine.js",
    "reader-engine.js",
    "changelog-fallback.js",
    "storage.js",
    "changelog-tools.js",
    "app.js",
    "sw.js",
    "manifest.webmanifest",
    "CHANGELOG.md",
    "PUBLIC_CHANGELOG.md",
    "VERSION.json",
    "library.json",
    "books/index.json",
    "books/pistis-sophia/book.json",
    "books/pistis-sophia/data.js",
    "books/pistis-sophia/coptic-data.js",
    "books/pistis-sophia/polish-translations.js",
    "books/gospel-of-thomas/book.json",
    "books/gospel-of-thomas/data.js",
    "books/gospel-of-thomas/coptic-data.js",
    "books/gospel-of-philip/book.json",
    "books/gospel-of-philip/data.js",
    "books/gospel-of-philip/coptic-data.js",
    "coptic-dictionary.js",
    "coptic-polish-overrides.js"
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









