const CACHE_NAME = "cheerio-cache-v1";
const OFFLINE_URL = "/offline.html";

const ASSETS_TO_CACHE = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/maskable-icon.png",
  // Add other static assets like fonts or common images here if needed
];

// Install event: Pre-cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first for navigation, Cache-first for assets
self.addEventListener("fetch", (event) => {
  // We only want to handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Navigation requests: Network-first, fallback to offline.html
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Static assets and other requests: Cache-first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache external images (like Cloudinary) on the fly
        if (url.origin !== self.location.origin) {
           // Optionally cache specific domains
           return fetchResponse;
        }
        
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // If both network and cache fail for an image, we could return a placeholder
      if (event.request.destination === 'image') {
        return caches.match('/icons/icon-192x192.png');
      }
    })
  );
});
