import { isNativePlatform } from '@/lib/platform';

const SW_URL = '/sw.js';

/**
 * Daftarkan Service Worker (Phase 5 — runtime caching + DownloadManager messaging).
 *
 * Saat SW baru mengambil alih (dataset fingerprint berubah → install + precache),
 * halaman di-reload sekali agar cache in-memory data-loader tidak menyimpan teks lama.
 *
 * Di Capacitor native: SW tidak didaftarkan (shell sudah di APK). Spek docs/32 §3.4.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  if (isNativePlatform()) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    } catch {
      // ignore
    }
    return null;
  }

  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  try {
    // Hanya reload pada *update* SW (sudah ada controller sebelumnya),
    // bukan pada install pertama.
    let hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) {
        hadController = true;
        return;
      }
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    return await navigator.serviceWorker.register(SW_URL, { scope: '/' });
  } catch (error) {
    console.warn('[HanQuran] Service worker registration failed:', error);
    return null;
  }
}
