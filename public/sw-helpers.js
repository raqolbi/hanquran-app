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
   * Route dinamis App Router yang dilayani via app-shell offline (docs/30 §6.2).
   *
   * @param {URL} url
   * @returns {boolean}
   */
  function isDynamicAppRoute(url) {
    return (
      /^\/surah\/[^/]+/.test(url.pathname) ||
      /^\/focus\/[^/]+/.test(url.pathname)
    );
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

    // `ignoreSearch` agar `/surah/5?ayah=3` cocok dengan shell `/surah/5`.
    const cached =
      (await cache.match(request)) ||
      (await cache.match(request, { ignoreSearch: true })) ||
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
    if (cached) {
      const range = request.headers.get('range');
      return range ? rangeResponseFromCache(cached, range) : cached;
    }

    const response = await fetch(request);
    // Hanya respons penuh (200) yang boleh disimpan: Cache API menolak 206
    // (Partial Content) dengan TypeError, yang dulu membuat pemutaran gagal.
    if (response.status === 200) {
      await cache.put(request, response.clone());
    }
    return response;
  }

  /**
   * Parse header `Range: bytes=…` untuk ukuran `size`.
   * Mendukung `start-end`, `start-`, dan `-suffix`. `null` bila tidak valid.
   *
   * @param {string} header
   * @param {number} size
   * @returns {{ start: number, end: number } | null}
   */
  function parseByteRange(header, size) {
    const match = /^bytes=(\d*)-(\d*)$/.exec((header || '').trim());
    if (!match || size <= 0) return null;
    const [, rawStart, rawEnd] = match;
    if (rawStart === '' && rawEnd === '') return null;

    let start;
    let end;
    if (rawStart === '') {
      const suffix = Number(rawEnd);
      if (suffix <= 0) return null;
      start = Math.max(0, size - suffix);
      end = size - 1;
    } else {
      start = Number(rawStart);
      end = rawEnd === '' ? size - 1 : Math.min(Number(rawEnd), size - 1);
    }
    if (start > end || start >= size) return null;
    return { start, end };
  }

  /**
   * Bangun respons `206 Partial Content` dari respons cache penuh.
   * Safari/iOS mewajibkan 206 untuk media; 200 utuh membuat audio offline
   * gagal diputar/di-seek (docs/39 B3).
   *
   * @param {Response} cached
   * @param {string} rangeHeader
   * @returns {Promise<Response>}
   */
  async function rangeResponseFromCache(cached, rangeHeader) {
    const blob = await cached.blob();
    const range = parseByteRange(rangeHeader, blob.size);
    const contentType = cached.headers.get('content-type') || 'audio/mpeg';

    if (!range) {
      return new Response(null, {
        status: 416,
        statusText: 'Range Not Satisfiable',
        headers: { 'Content-Range': `bytes */${blob.size}` },
      });
    }

    const body = blob.slice(range.start, range.end + 1, contentType);
    return new Response(body, {
      status: 206,
      statusText: 'Partial Content',
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(body.size),
        'Content-Range': `bytes ${range.start}-${range.end}/${blob.size}`,
        'Accept-Ranges': 'bytes',
      },
    });
  }

  /**
   * Kunci cache dokumen navigasi **tanpa query** (`?ayah=` dsb.): satu
   * halaman melayani semua query, jadi cukup satu entri per path (docs/39 B1).
   *
   * @param {URL} url
   * @returns {Request}
   */
  function navigationCacheKey(url) {
    return new Request(url.origin + url.pathname, {
      headers: { Accept: 'text/html,application/xhtml+xml' },
    });
  }

  /**
   * Kunci cache payload RSC per path (abaikan `?_rsc=<hash>` yang berubah
   * tiap navigasi) — sama dengan bentuk yang dipakai `cacheRouteShells`.
   *
   * @param {URL} url
   * @returns {Request}
   */
  function rscCacheKey(url) {
    return new Request(url.origin + url.pathname, {
      headers: { RSC: '1', Accept: 'text/x-component' },
    });
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
    const ignoreSearch = Boolean(options && options.ignoreSearch);
    // `Vary: RSC` membedakan entri RSC vs dokumen pada URL yang sama;
    // `ignoreSearch` menetralkan query `?_rsc=<hash>` yang berubah per build.
    const cached =
      (await cache.match(request)) ||
      (ignoreSearch ? await cache.match(request, { ignoreSearch: true }) : null);

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
    isDynamicAppRoute,
    networkFirstNavigation,
    getRequestCategory,
    cacheFirst,
    parseByteRange,
    rangeResponseFromCache,
    navigationCacheKey,
    rscCacheKey,
    staleWhileRevalidate,
  };
})(typeof self !== 'undefined' ? self : globalThis);
