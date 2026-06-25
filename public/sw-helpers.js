/**
 * Helper strategi caching Service Worker (Phase 5).
 * Dimuat via `importScripts` dari `public/sw.js`.
 *
 * Host audio CDN selaras `services/quran/audio-config.ts` (`AYAH_AUDIO_BASE_URL`).
 */
(function initSwHelpers(global) {
  const AUDIO_CDN_HOST = 'everyayah.com';
  const AUDIO_PATH_PREFIX = '/data/';

  /**
   * @param {Request} request
   * @returns {boolean}
   */
  function isNavigationRequest(request) {
    if (request.mode === 'navigate') return true;
    const accept = request.headers.get('accept');
    return Boolean(accept && accept.includes('text/html'));
  }

  /**
   * Permintaan RSC / prefetch App Router Next.js — perlu di-cache agar navigasi client offline.
   *
   * @param {Request} request
   * @returns {boolean}
   */
  function isAppRouterRequest(request) {
    if (request.headers.get('RSC') === '1') return true;
    if (request.headers.get('Next-Router-Prefetch') === '1') return true;
    if (request.headers.get('Next-Router-State-Tree')) return true;
    const accept = request.headers.get('accept') || '';
    return accept.includes('text/x-component');
  }

  /**
   * Network-first untuk navigasi dokumen; fallback ke cache shell lalu offline.html.
   * Tidak fallback ke beranda — mencegah URL /surah/* menampilkan HTML salah.
   *
   * @param {Request} request
   * @param {string} shellCacheName
   * @param {string} offlinePath
   */
  async function networkFirstNavigation(request, shellCacheName, offlinePath) {
    const cache = await caches.open(shellCacheName);
    const offlineUrl = new URL(offlinePath, request.url).href;

    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      // Lanjut ke fallback cache di bawah.
    }

    const cached =
      (await cache.match(request)) ||
      (await cache.match(offlineUrl));

    if (cached) return cached;

    return new Response('Offline', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  /**
   * @param {URL} url
   * @param {string} appOrigin Origin aplikasi (`self.location.origin`)
   * @returns {'static' | 'data' | 'audio' | 'bypass'}
   */
  function getRequestCategory(url, appOrigin) {
    const sameOrigin = url.origin === appOrigin;

    if (sameOrigin && url.pathname === '/offline.html') {
      return 'static';
    }

    if (sameOrigin && url.pathname === '/manifest.json') {
      return 'static';
    }

    if (sameOrigin && url.pathname.startsWith('/data/')) {
      return 'data';
    }

    if (
      url.hostname === AUDIO_CDN_HOST &&
      url.pathname.startsWith(AUDIO_PATH_PREFIX) &&
      url.pathname.endsWith('.mp3')
    ) {
      return 'audio';
    }

    if (sameOrigin) {
      if (url.pathname.startsWith('/_next/static/')) return 'static';
      if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/fonts/')) {
        return 'static';
      }
      if (/\.(js|css|woff2?|ttf|otf|ico|png|svg|webp)$/i.test(url.pathname)) {
        return 'static';
      }
    }

    return 'bypass';
  }

  /**
   * Cache-first: kembalikan cache jika ada; jika tidak, fetch jaringan lalu simpan.
   * Lookup mengabaikan header Range agar pemutaran audio dari cache tetap berfungsi.
   *
   * @param {Request} request
   * @param {string} cacheName
   */
  async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  }

  /**
   * Stale-while-revalidate: kembalikan cache segera; segarkan di background.
   *
   * @param {Request} request
   * @param {string} cacheName
   * @param {{ waitUntil?: (promise: Promise<unknown>) => void }} [options]
   */
  async function staleWhileRevalidate(request, cacheName, options) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const networkPromise = fetch(request)
      .then(async (response) => {
        if (response.ok) {
          await cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => null);

    if (cached) {
      const waiter = options && options.waitUntil;
      if (waiter) {
        waiter(networkPromise);
      } else {
        void networkPromise;
      }
      return cached;
    }

    const networkResponse = await networkPromise;
    if (networkResponse) return networkResponse;

    return fetch(request);
  }

  global.SwHelpers = {
    AUDIO_CDN_HOST,
    isNavigationRequest,
    isAppRouterRequest,
    networkFirstNavigation,
    getRequestCategory,
    cacheFirst,
    staleWhileRevalidate,
  };
})(typeof self !== 'undefined' ? self : globalThis);
