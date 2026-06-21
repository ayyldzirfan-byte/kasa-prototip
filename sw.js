const CACHE_NAME = "kasam-production-v20260614-2115";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./kasa-extra.css",
  "./kasam-ui-fixes.css",
  "./cloud-config.js",
  "./app-state.js",
  "./app-core.js",
  "./app-views.js",
  "./app-bind.js",
  "./app-model.js",
  "./app-cloud.js",
  "./app-blocks.js",
  "./app-product-pass.js",
  "./app-production.js",
  "./app-sounds.js",
  "./app-game-v2.js",
  "./app-ui-fixes.js",
  "./app-critical-fixes.js",
  "./app-test-scenarios.js",
  "./app-init.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-16.png",
  "./icon-32.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-192.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./robots.txt",
  "./sitemap.xml",
  "./404.html",
  "./gizlilik.html",
  "./sartlar.html",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
