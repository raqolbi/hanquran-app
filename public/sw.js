/* eslint-disable no-restricted-globals */
/**
 * HanQuran Service Worker (Phase 5).
 *
 * Strategi caching runtime:
 *   - hanquran-static-v1 : stale-while-revalidate (JS/CSS/font/icon)
 *   - hanquran-shell-v1  : network-first navigasi + precache offline.html
 *   - hanquran-data-v1   : cache-first (`/data/*`)
 *   - hanquran-audio-v1  : cache-first + runtime caching (CDN tilawah)
 *
 * Spesifikasi: `docs/07-api-integration.md` (§8), `docs/15-state-management.md` (§12.1).
 */

importScripts('/sw-helpers.js');
importScripts('/sw-precache-manifest.js');

const SW_VERSION = 'v2';
const CACHE_STATIC = 'hanquran-static-v2';
const CACHE_SHELL = 'hanquran-shell-v2';
const CACHE_DATA = 'hanquran-data-v2';
const CACHE_AUDIO = 'hanquran-audio-v1';
const KNOWN_CACHES = [CACHE_STATIC, CACHE_SHELL, CACHE_DATA, CACHE_AUDIO];

// Route yang shell-nya di-precache saat install (lihat docs/30 §6.1–6.2).
const SHELL_PRECACHE_URLS = ['/offline.html'];
const STATIC_ROUTES = ['/', '/settings', '/settings/about'];
// App-shell template untuk route dinamis: satu shell melayani semua id.
const APP_SHELL_SURAH = '/surah/1';
const APP_SHELL_FOCUS = '/focus/1';
const APP_SHELL_ROUTES = [APP_SHELL_SURAH, APP_SHELL_FOCUS];

const {
  getRequestCategory,
  isNavigationRequest,
  isAppRouterRequest,
  cacheFirst,
  staleWhileRevalidate,
} = self.SwHelpers;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await precacheOnInstall();
      await self.skipWaiting();
    })(),
  );
});

async function precacheOnInstall() {
  const precache = self.__SW_PRECACHE__ || { static: [], data: [] };

  const staticCache = await caches.open(CACHE_STATIC);
  const dataCache = await caches.open(CACHE_DATA);
  const shellCache = await caches.open(CACHE_SHELL);

  const addAll = async (cache, urls) => {
    await runWithConcurrency(urls, PRECACHE_CONCURRENCY, async (url) => {
      try {
        const request = new Request(url, { cache: 'reload' });
        const response = await fetch(request);
        if (response.ok || response.type === 'opaque') {
          await cache.put(new Request(url), response.clone());
        }
      } catch (error) {
        console.warn('[HanQuran SW] Precache install gagal:', url, error);
      }
    });
  };

  // 1) Aset boot aplikasi (JS/CSS/font/ikon) + dataset Qur'an penuh.
  await addAll(staticCache, precache.static || []);
  await addAll(dataCache, precache.data || []);

  // 2) Offline fallback statis.
  await addAll(shellCache, SHELL_PRECACHE_URLS);

  // 3) Shell route (dokumen + RSC) untuk navigasi offline.
  await cacheRouteShells([...STATIC_ROUTES, ...APP_SHELL_ROUTES]);
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (isNavigationRequest(request) && sameOrigin) {
    event.respondWith(handleNavigation(request, url));
    return;
  }

  if (isAppRouterRequest(request) && sameOrigin) {
    event.respondWith(handleAppRouter(event, request, url));
    return;
  }

  const category = getRequestCategory(url, self.location.origin);
  if (category === 'bypass') return;

  event.respondWith(handleCachedFetch(event, request, category));
});

/** Tentukan app-shell template (dokumen/RSC) untuk route dinamis. */
function appShellRouteFor(url) {
  if (url.pathname.startsWith('/focus/')) return APP_SHELL_FOCUS;
  if (url.pathname.startsWith('/surah/')) return APP_SHELL_SURAH;
  return null;
}

async function handleNavigation(request, url) {
  const cache = await caches.open(CACHE_SHELL);

  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline → cache cocok (abaikan query seperti ?ayah).
  }

  const cached =
    (await cache.match(request)) ||
    (await cache.match(request, { ignoreSearch: true }));
  if (cached) return cached;

  // Route dinamis: layani app-shell agar bisa render id apa pun offline.
  const shellRoute = appShellRouteFor(url);
  if (shellRoute) {
    const shell = await matchShellDocument(cache, shellRoute);
    if (shell) return shell;
  }

  const offline = await cache.match('/offline.html');
  if (offline) return offline;

  return new Response('Offline', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function matchShellDocument(cache, route) {
  const url = new URL(route, self.location.origin).href;
  const docRequest = new Request(url, {
    headers: { Accept: 'text/html,application/xhtml+xml' },
  });
  return (
    (await cache.match(docRequest)) ||
    (await cache.match(url)) ||
    (await cache.match(url, { ignoreSearch: true }))
  );
}

async function handleAppRouter(event, request, url) {
  const cache = await caches.open(CACHE_SHELL);

  const cached =
    (await cache.match(request)) ||
    (await cache.match(request, { ignoreSearch: true }));

  if (cached) {
    event.waitUntil(
      fetch(request)
        .then((response) => {
          if (response.ok) return cache.put(request, response.clone());
          return undefined;
        })
        .catch(() => undefined),
    );
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline & id belum pernah dicache → pakai app-shell RSC.
  }

  const shellRoute = appShellRouteFor(url);
  if (shellRoute) {
    const shellRsc = await matchShellRsc(cache, shellRoute);
    if (shellRsc) return shellRsc;
  }

  return new Response('', { status: 503, statusText: 'Offline' });
}

async function matchShellRsc(cache, route) {
  const url = new URL(route, self.location.origin).href;
  const rscRequest = new Request(url, {
    headers: { RSC: '1', Accept: 'text/x-component' },
  });
  return (
    (await cache.match(rscRequest)) ||
    (await cache.match(rscRequest, { ignoreSearch: true }))
  );
}

async function handleCachedFetch(event, request, category) {
  try {
    switch (category) {
      case 'data':
        return await cacheFirst(request, CACHE_DATA);
      case 'audio':
        return await cacheFirst(request, CACHE_AUDIO);
      case 'static':
        return await staleWhileRevalidate(request, CACHE_STATIC, {
          waitUntil: (promise) => event.waitUntil(promise),
        });
      default:
        return fetch(request);
    }
  } catch (error) {
    const cached = await caches.match(request.url);
    if (cached) return cached;
    throw error;
  }
}

// Kanal pesan client ↔ SW (DownloadManager).
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'PING') {
    event.source?.postMessage({ type: 'PONG', version: SW_VERSION });
    return;
  }

  if (data.type === 'prefetch-surah') {
    const { requestId, surahId, urls } = data;
    if (!requestId || !surahId || !Array.isArray(urls)) return;

    void prefetchSurahAudio(event, { requestId, surahId, urls });
    return;
  }

  if (data.type === 'cache-surah-offline') {
    const { surahId, dataUrls, routeUrls } = data;
    if (!surahId || !Array.isArray(dataUrls) || !Array.isArray(routeUrls)) return;

    void cacheSurahOfflineContent({ dataUrls, routeUrls });
    return;
  }

  if (data.type === 'cache-offline-batch') {
    const { requestId, dataUrls, routeUrls } = data;
    const data2 = Array.isArray(dataUrls) ? dataUrls : [];
    const routes2 = Array.isArray(routeUrls) ? routeUrls : [];

    void (async () => {
      await cacheSurahOfflineContent({ dataUrls: data2, routeUrls: routes2 });
      if (requestId) {
        postDownloadMessage(event, { type: 'cache-offline-batch-done', requestId });
      }
    })();
  }
});

const DOWNLOAD_CONCURRENCY = 3;
const PRECACHE_CONCURRENCY = 6;

async function runWithConcurrency(items, limit, worker) {
  for (let offset = 0; offset < items.length; offset += limit) {
    const batch = items.slice(offset, offset + limit);
    await Promise.all(batch.map((item) => worker(item)));
  }
}

function postDownloadMessage(event, payload) {
  const target = event.source;
  if (!target || typeof target.postMessage !== 'function') return;
  target.postMessage(payload);
}

async function cacheSurahOfflineContent({ dataUrls, routeUrls }) {
  const dataCache = await caches.open(CACHE_DATA);

  await runWithConcurrency(dataUrls, PRECACHE_CONCURRENCY, async (path) => {
    try {
      const url = new URL(path, self.location.origin).href;
      const response = await fetch(url);
      if (response.ok) {
        await dataCache.put(new Request(url), response.clone());
      }
    } catch (error) {
      console.warn('[HanQuran SW] Precache data gagal:', path, error);
    }
  });

  await cacheRouteShells(routeUrls);
}

/** Cache dokumen HTML + payload RSC untuk daftar route (App Router). */
async function cacheRouteShells(routeUrls) {
  const shellCache = await caches.open(CACHE_SHELL);

  await runWithConcurrency(routeUrls, PRECACHE_CONCURRENCY, async (path) => {
    try {
      const url = new URL(path, self.location.origin).href;
      const documentRequest = new Request(url, {
        headers: { Accept: 'text/html,application/xhtml+xml' },
      });
      const documentResponse = await fetch(documentRequest);
      if (documentResponse.ok) {
        await shellCache.put(documentRequest, documentResponse.clone());
      }

      const rscRequest = new Request(url, {
        headers: {
          RSC: '1',
          Accept: 'text/x-component',
        },
      });
      const rscResponse = await fetch(rscRequest);
      if (rscResponse.ok) {
        await shellCache.put(rscRequest, rscResponse.clone());
      }
    } catch (error) {
      console.warn('[HanQuran SW] Precache route gagal:', path, error);
    }
  });
}

async function prefetchSurahAudio(event, { requestId, surahId, urls }) {
  const total = urls.length;
  let completed = 0;
  let totalSize = 0;

  const notifyProgress = () => {
    postDownloadMessage(event, {
      type: 'download-progress',
      requestId,
      surahId,
      completed,
      total,
    });
  };

  try {
    const cache = await caches.open(CACHE_AUDIO);

    for (let offset = 0; offset < urls.length; offset += DOWNLOAD_CONCURRENCY) {
      const batch = urls.slice(offset, offset + DOWNLOAD_CONCURRENCY);
      await Promise.all(
        batch.map(async (url) => {
          const cached = await cache.match(url);
          if (cached) {
            const blob = await cached.clone().blob();
            totalSize += blob.size;
          } else {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) {
              throw new Error(`Fetch gagal ${url} (${response.status})`);
            }
            await cache.put(url, response.clone());
            const blob = await response.blob();
            totalSize += blob.size;
          }
          completed += 1;
          notifyProgress();
        }),
      );
    }

    postDownloadMessage(event, {
      type: 'download-complete',
      requestId,
      surahId,
      sizeBytes: totalSize,
      ayahsCount: total,
    });
  } catch (error) {
    const name = error && error.name ? String(error.name) : '';
    const reason =
      name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED'
        ? 'quota-exceeded'
        : error instanceof TypeError
          ? 'network'
          : 'unknown';

    postDownloadMessage(event, {
      type: 'download-failed',
      requestId,
      surahId,
      reason,
      message: error && error.message ? String(error.message) : undefined,
    });
  }
}
