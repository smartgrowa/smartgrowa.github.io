const CACHE_NAME = "smartgrowa-v3-offline"; // Versi dinaikkan
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo-1.png",
  "./logo-2.png", // Pastikan aset ini ada sesuai index.html
  // Library eksternal
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11", // Tambahkan SWAL agar alert tetap jalan offline
];

// 1. Install SW
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Caching aset statis...");
      return cache.addAll(urlsToCache);
    }),
  );
});

// 2. Activate & Bersihkan Cache Lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[ServiceWorker] Hapus cache lama:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// 3. Fetch Strategy: Stale-While-Revalidate
// (Load dari cache DULUAN agar instan, lalu update cache di background dari network)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // PENTING: Jangan cache request ke API Firebase/Firestore/Google Auth via Service Worker.
  // Biarkan SDK Firebase menangani sinkronisasi datanya sendiri lewat IndexedDB.
  if (
    url.origin.includes("googleapis.com") ||
    url.origin.includes("firebase") ||
    url.origin.includes("firestore")
  ) {
    return; // Langsung ke network (bypass SW)
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Fetch dari network untuk update cache di masa depan
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Jika offline total dan tidak ada di cache, biarkan return undefined
          // atau bisa diarahkan ke halaman offline.html jika ada.
        });

      // Kembalikan data dari cache jika ada (INSTANT LOAD), jika tidak tunggu network
      return cachedResponse || fetchPromise;
    }),
  );
});
