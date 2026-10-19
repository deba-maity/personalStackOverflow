/* Bump CACHE for every release that changes an application asset. */
const CACHE = "patch-atlas-v2-5";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./data.js",
  "./stackoverflow-data.js",
  "./app.js",
  "./icon.svg",
  "./manifest.webmanifest",
  "./legacy.js",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("patch-atlas-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  // Keep one coherent app version. A changed worker installs the entire next
  // asset set before activation; never mix a fresh HTML shell with stale JS.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request, { ignoreSearch: true });
      if (cached) return cached;
      try {
        return await fetch(event.request);
      } catch (error) {
        if (event.request.mode === "navigate")
          return cache.match("./index.html");
        throw error;
      }
    }),
  );
});
