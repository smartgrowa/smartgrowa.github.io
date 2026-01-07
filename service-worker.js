const CACHE_NAME = 'smartgrowa-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  // Aset Eksternal (CDN) yang digunakan di HTML Anda
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// 1. Install Service Worker & Cache Aset
self.addEventListener('install', (event) => {
  // Paksa SW baru untuk segera aktif, tidak menunggu tab ditutup
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Membuka cache...');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activate Service Worker & Hapus Cache Lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Pastikan SW segera mengontrol semua klien (halaman) yang terbuka
      return self.clients.claim();
    })
  );
});

// 3. Strategi Fetch: Network First, Fallback to Cache
// (Coba ambil dari internet dulu agar selalu dapat update terbaru, jika offline baru ambil cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Jika berhasil ambil dari internet:
        // 1. Cek apakah respon valid
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // 2. Clone respon karena stream hanya bisa dibaca sekali
        const responseToCache = response.clone();

        // 3. Simpan versi terbaru ke cache (update cache)
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Jika internet mati (offline), ambil dari cache
        return caches.match(event.request);
      })
  );
});