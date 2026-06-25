import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

type RequestCategory = 'static' | 'data' | 'audio' | 'bypass';

type SwHelpers = {
  AUDIO_CDN_HOST: string;
  isNavigationRequest: (request: Request) => boolean;
  isAppRouterRequest: (request: Request) => boolean;
  networkFirstNavigation: (
    request: Request,
    shellCacheName: string,
    offlinePath: string,
  ) => Promise<Response>;
  getRequestCategory: (url: URL, appOrigin: string) => RequestCategory;
  cacheFirst: (request: Request, cacheName: string) => Promise<Response>;
  staleWhileRevalidate: (
    request: Request,
    cacheName: string,
    options?: { waitUntil?: (promise: Promise<unknown>) => void },
  ) => Promise<Response>;
};

function loadSwHelpers(overrides?: {
  caches?: Partial<CacheStorage>;
  fetch?: typeof fetch;
}): { helpers: SwHelpers; cachesOpen: ReturnType<typeof vi.fn> } {
  const self: { SwHelpers?: SwHelpers } = {};
  const cacheStore = {
    match: vi.fn(async () => undefined as Response | undefined),
    put: vi.fn(async () => undefined),
  };
  const cachesOpen = vi.fn(async () => cacheStore);
  const caches = {
    open: cachesOpen,
    ...overrides?.caches,
  };
  const fetchFn = overrides?.fetch ?? vi.fn();

  const script = readFileSync(
    resolve(process.cwd(), 'public/sw-helpers.js'),
    'utf8',
  );
  const run = new Function(
    'self',
    'caches',
    'fetch',
    `${script}\nreturn self.SwHelpers;`,
  ) as (
    self: { SwHelpers?: SwHelpers },
    caches: CacheStorage,
    fetch: typeof fetch,
  ) => SwHelpers;

  const helpers = run(self, caches as CacheStorage, fetchFn as typeof fetch);
  return { helpers, cachesOpen };
}

const APP_ORIGIN = 'https://hanquran.test';

describe('SwHelpers.getRequestCategory', () => {
  let helpers: SwHelpers;

  beforeEach(() => {
    helpers = loadSwHelpers().helpers;
  });

  it('mengklasifikasi dataset /data/* sebagai data', () => {
    expect(
      helpers.getRequestCategory(
        new URL(`${APP_ORIGIN}/data/manifest.json`),
        APP_ORIGIN,
      ),
    ).toBe('data');
    expect(
      helpers.getRequestCategory(
        new URL(`${APP_ORIGIN}/data/quran/001.json`),
        APP_ORIGIN,
      ),
    ).toBe('data');
  });

  it('mengklasifikasi CDN audio everyayah sebagai audio', () => {
    expect(
      helpers.getRequestCategory(
        new URL('https://everyayah.com/data/Alafasy_128kbps/001001.mp3'),
        APP_ORIGIN,
      ),
    ).toBe('audio');
  });

  it('mengklasifikasi aset _next/static sebagai static', () => {
    expect(
      helpers.getRequestCategory(
        new URL(`${APP_ORIGIN}/_next/static/chunks/main.js`),
        APP_ORIGIN,
      ),
    ).toBe('static');
  });

  it('mengklasifikasi offline.html dan manifest sebagai static', () => {
    expect(
      helpers.getRequestCategory(
        new URL(`${APP_ORIGIN}/offline.html`),
        APP_ORIGIN,
      ),
    ).toBe('static');
    expect(
      helpers.getRequestCategory(
        new URL(`${APP_ORIGIN}/manifest.json`),
        APP_ORIGIN,
      ),
    ).toBe('static');
  });

  it('mengabaikan navigasi HTML dan API', () => {
    expect(
      helpers.getRequestCategory(new URL(`${APP_ORIGIN}/surah/1`), APP_ORIGIN),
    ).toBe('bypass');
    expect(
      helpers.getRequestCategory(
        new URL('https://example.com/other.js'),
        APP_ORIGIN,
      ),
    ).toBe('bypass');
  });
});

describe('SwHelpers.isNavigationRequest', () => {
  it('mendeteksi mode navigate dan Accept text/html', () => {
    const { helpers } = loadSwHelpers();
    const navigate = {
      mode: 'navigate',
      headers: new Headers(),
    } as Request;
    const htmlAccept = new Request(`${APP_ORIGIN}/surah/1`, {
      headers: { Accept: 'text/html,application/xhtml+xml' },
    });
    const api = new Request(`${APP_ORIGIN}/api/health`, {
      headers: { Accept: 'application/json' },
    });

    expect(helpers.isNavigationRequest(navigate)).toBe(true);
    expect(helpers.isNavigationRequest(htmlAccept)).toBe(true);
    expect(helpers.isNavigationRequest(api)).toBe(false);
  });
});

describe('SwHelpers.isAppRouterRequest', () => {
  it('mendeteksi header RSC dan prefetch App Router', () => {
    const { helpers } = loadSwHelpers();
    const rsc = new Request(`${APP_ORIGIN}/surah/1`, {
      headers: { RSC: '1', Accept: 'text/x-component' },
    });
    const prefetch = new Request(`${APP_ORIGIN}/surah/1`, {
      headers: { 'Next-Router-Prefetch': '1' },
    });
    const html = new Request(`${APP_ORIGIN}/surah/1`, {
      headers: { Accept: 'text/html' },
    });

    expect(helpers.isAppRouterRequest(rsc)).toBe(true);
    expect(helpers.isAppRouterRequest(prefetch)).toBe(true);
    expect(helpers.isAppRouterRequest(html)).toBe(false);
  });
});

describe('SwHelpers.networkFirstNavigation', () => {
  it('mengembalikan respons jaringan dan menyimpan shell saat online', async () => {
    const network = new Response('<html>ok</html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
    Object.defineProperty(network, 'type', { value: 'basic' });
    const cacheStore = {
      match: vi.fn(async () => undefined),
      put: vi.fn(async () => undefined),
    };
    const fetchFn = vi.fn(async () => network);
    const { helpers } = loadSwHelpers({
      caches: { open: vi.fn(async () => cacheStore) },
      fetch: fetchFn,
    });

    const request = new Request(`${APP_ORIGIN}/surah/1`, {
      headers: { Accept: 'text/html' },
    });
    const response = await helpers.networkFirstNavigation(
      request,
      'hanquran-shell-v1',
      '/offline.html',
    );

    expect(response).toBe(network);
    expect(cacheStore.put).toHaveBeenCalledWith(request, network);
  });

  it('mengembalikan cache shell untuk URL yang sama saat offline', async () => {
    const surahShell = new Response('<html>surah</html>', { status: 200 });
    const cacheStore = {
      match: vi.fn(async (key: RequestInfo | URL) => {
        const request = key instanceof Request ? key : new Request(String(key));
        if (request.url.endsWith('/surah/1')) return surahShell;
        return undefined;
      }),
      put: vi.fn(),
    };
    const fetchFn = vi.fn(async () => {
      throw new Error('offline');
    });
    const { helpers } = loadSwHelpers({
      caches: { open: vi.fn(async () => cacheStore) },
      fetch: fetchFn,
    });

    const request = new Request(`${APP_ORIGIN}/surah/1`, {
      headers: { Accept: 'text/html' },
    });
    const response = await helpers.networkFirstNavigation(
      request,
      'hanquran-shell-v1',
      '/offline.html',
    );

    expect(response).toBe(surahShell);
  });

  it('fallback ke offline.html saat offline tanpa cache route', async () => {
    const offlinePage = new Response('<html>offline</html>', { status: 200 });
    const cacheStore = {
      match: vi.fn(async (key: RequestInfo) => {
        const url = typeof key === 'string' ? key : key.url;
        if (url.endsWith('/offline.html')) return offlinePage;
        return undefined;
      }),
      put: vi.fn(),
    };
    const fetchFn = vi.fn(async () => {
      throw new Error('offline');
    });
    const { helpers } = loadSwHelpers({
      caches: { open: vi.fn(async () => cacheStore) },
      fetch: fetchFn,
    });

    const request = new Request(`${APP_ORIGIN}/surah/1`, {
      headers: { Accept: 'text/html' },
    });
    const response = await helpers.networkFirstNavigation(
      request,
      'hanquran-shell-v1',
      '/offline.html',
    );

    expect(response).toBe(offlinePage);
  });
});

describe('SwHelpers.cacheFirst', () => {
  it('mengembalikan respons cache jika tersedia', async () => {
    const cached = new Response('cached', { status: 200 });
    const cacheStore = {
      match: vi.fn(async () => cached),
      put: vi.fn(),
    };
    const fetchFn = vi.fn();
    const { helpers } = loadSwHelpers({
      caches: { open: vi.fn(async () => cacheStore) },
      fetch: fetchFn,
    });

    const request = new Request('https://everyayah.com/data/Qari/001001.mp3');
    const response = await helpers.cacheFirst(request, 'hanquran-audio-v1');

    expect(response).toBe(cached);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('fetch jaringan dan simpan ke cache saat miss', async () => {
    const network = new Response('network', { status: 200 });
    const cacheStore = {
      match: vi.fn(async () => undefined),
      put: vi.fn(async () => undefined),
    };
    const fetchFn = vi.fn(async () => network);
    const { helpers } = loadSwHelpers({
      caches: { open: vi.fn(async () => cacheStore) },
      fetch: fetchFn,
    });

    const url = 'https://everyayah.com/data/Qari/001001.mp3';
    const request = new Request(url);
    const response = await helpers.cacheFirst(request, 'hanquran-audio-v1');

    expect(response).toBe(network);
    expect(cacheStore.put).toHaveBeenCalledWith(request, network);
  });
});

describe('SwHelpers.staleWhileRevalidate', () => {
  it('mengembalikan cache segera dan revalidate di background', async () => {
    const cached = new Response('stale', { status: 200 });
    const fresh = new Response('fresh', { status: 200 });
    const cacheStore = {
      match: vi.fn(async () => cached),
      put: vi.fn(async () => undefined),
    };
    let resolveFetch!: (value: Response) => void;
    const fetchFn = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const waitUntil = vi.fn();
    const { helpers } = loadSwHelpers({
      caches: { open: vi.fn(async () => cacheStore) },
      fetch: fetchFn,
    });

    const request = new Request(`${APP_ORIGIN}/_next/static/chunks/app.js`);
    const responsePromise = helpers.staleWhileRevalidate(
      request,
      'hanquran-static-v1',
      { waitUntil },
    );

    await expect(responsePromise).resolves.toBe(cached);
    expect(waitUntil).toHaveBeenCalledTimes(1);

    resolveFetch(fresh);
    await waitUntil.mock.calls[0][0];
    expect(cacheStore.put).toHaveBeenCalled();
  });

  it('menunggu jaringan saat belum ada cache', async () => {
    const network = new Response('new', { status: 200 });
    const cacheStore = {
      match: vi.fn(async () => undefined),
      put: vi.fn(async () => undefined),
    };
    const { helpers } = loadSwHelpers({
      caches: { open: vi.fn(async () => cacheStore) },
      fetch: vi.fn(async () => network),
    });

    const request = new Request(`${APP_ORIGIN}/fonts/main.woff2`);
    const response = await helpers.staleWhileRevalidate(
      request,
      'hanquran-static-v1',
    );

    expect(response).toBe(network);
    expect(cacheStore.put).toHaveBeenCalled();
  });
});
