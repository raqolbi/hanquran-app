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

const SW_VERSION = 'v1';
const CACHE_STATIC = 'hanquran-static-v1';
const CACHE_SHELL = 'hanquran-shell-v1';
const CACHE_DATA = 'hanquran-data-v1';
const CACHE_AUDIO = 'hanquran-audio-v1';
const KNOWN_CACHES = [CACHE_STATIC, CACHE_SHELL, CACHE_DATA, CACHE_AUDIO];
const SHELL_PRECACHE_URLS = ['/offline.html'];

const {
  getRequestCategory,
  isNavigationRequest,
  isAppRouterRequest,
  networkFirstNavigation,
  cacheFirst,
  staleWhileRevalidate,
} = self.SwHelpers;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_SHELL);
      await Promise.all(
        SHELL_PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: 'reload' }));
          } catch (error) {
            console.warn('[HanQuran SW] Precache gagal:', url, error);
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

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
  if (isNavigationRequest(request) && url.origin === self.location.origin) {
    event.respondWith(
      networkFirstNavigation(request, CACHE_SHELL, '/offline.html'),
    );
    return;
  }

  if (isAppRouterRequest(request) && url.origin === self.location.origin) {
    event.respondWith(
      staleWhileRevalidate(request, CACHE_SHELL, {
        ignoreSearch: true,
        waitUntil: (promise) => event.waitUntil(promise),
      }),
    );
    return;
  }

  const category = getRequestCategory(url, self.location.origin);
  if (category === 'bypass') return;

  event.respondWith(handleCachedFetch(event, request, category));
});

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
  const shellCache = await caches.open(CACHE_SHELL);

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
