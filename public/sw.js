/* eslint-disable no-restricted-globals */
/**
 * HanQuran Service Worker — SKELETON (Phase 0).
 *
 * Tujuan Phase 0: mendaftarkan SW agar browser mengenali aplikasi sebagai
 * PWA-ready dan menyiapkan kerangka lifecycle + kanal pesan.
 *
 * Strategi caching runtime (stale-while-revalidate aset, cache-first data
 * Quran, runtime caching audio) serta DownloadManager DIIMPLEMENTASIKAN di
 * Phase 5 — JANGAN tambahkan logika fetch caching di sini sebelum Phase 5.
 *
 * Nama cache disepakati sejak awal agar konsisten (docs/06 Bagian 6):
 *   - hanquran-static-v1 : aset statis (JS/CSS/font/icon)
 *   - hanquran-data-v1   : dataset statis public/data (layer tambahan, opsional)
 *   - hanquran-audio-v1  : file audio MP3 per ayat
 */

const SW_VERSION = 'v1';
const CACHE_STATIC = 'hanquran-static-v1';
const CACHE_DATA = 'hanquran-data-v1';
const CACHE_AUDIO = 'hanquran-audio-v1';
const KNOWN_CACHES = [CACHE_STATIC, CACHE_DATA, CACHE_AUDIO];

self.addEventListener('install', (event) => {
  // Aktifkan SW baru segera tanpa menunggu tab lama tertutup.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Bersihkan cache lama yang tidak dikenal versi ini.
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('hanquran-') && !KNOWN_CACHES.includes(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

// Phase 0: belum ada strategi fetch. Biarkan request lewat ke jaringan.
// Handler caching ditambahkan di Phase 5.

// Kanal pesan client ↔ SW (kerangka untuk DownloadManager di Phase 5).
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'PING') {
    event.source?.postMessage({ type: 'PONG', version: SW_VERSION });
  }
});
