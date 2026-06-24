const SW_URL = '/sw.js';

/**
 * Daftarkan Service Worker skeleton (Phase 0).
 * Strategi caching runtime di Phase 5.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  try {
    return await navigator.serviceWorker.register(SW_URL, { scope: '/' });
  } catch (error) {
    console.warn('[HanQuran] Service worker registration failed:', error);
    return null;
  }
}
