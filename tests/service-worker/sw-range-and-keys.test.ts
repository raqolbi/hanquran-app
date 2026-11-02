// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

type Helpers = {
  parseByteRange: (header: string, size: number) => { start: number; end: number } | null;
  rangeResponseFromCache: (cached: Response, range: string) => Promise<Response>;
  navigationCacheKey: (url: URL) => Request;
  rscCacheKey: (url: URL) => Request;
  cacheFirst: (request: Request, cacheName: string) => Promise<Response>;
};

function load(cacheStore: { match: unknown; put: unknown }, fetchFn: unknown): Helpers {
  const self: { SwHelpers?: Helpers } = {};
  const script = readFileSync(resolve(process.cwd(), 'public/sw-helpers.js'), 'utf8');
  const run = new Function('self', 'caches', 'fetch', `${script}\nreturn self.SwHelpers;`);
  return run(self, { open: async () => cacheStore }, fetchFn) as Helpers;
}

const AUDIO = 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3';

describe('parseByteRange', () => {
  const { parseByteRange } = load({ match: vi.fn(), put: vi.fn() }, vi.fn());

  it('mendukung start-end, start-, dan -suffix', () => {
    expect(parseByteRange('bytes=0-99', 1000)).toEqual({ start: 0, end: 99 });
    expect(parseByteRange('bytes=500-', 1000)).toEqual({ start: 500, end: 999 });
    expect(parseByteRange('bytes=-100', 1000)).toEqual({ start: 900, end: 999 });
    expect(parseByteRange('bytes=900-5000', 1000)).toEqual({ start: 900, end: 999 });
  });

  it('null untuk rentang tidak valid', () => {
    expect(parseByteRange('bytes=1000-', 1000)).toBeNull();
    expect(parseByteRange('bytes=50-10', 1000)).toBeNull();
    expect(parseByteRange('items=0-1', 1000)).toBeNull();
    expect(parseByteRange('bytes=-', 1000)).toBeNull();
  });
});

describe('cacheFirst audio + Range', () => {
  it('mengembalikan 206 dengan Content-Range dari salinan cache penuh', async () => {
    const full = new Response(new Uint8Array(1000), {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
    });
    const helpers = load({ match: vi.fn(async () => full), put: vi.fn() }, vi.fn());

    const response = await helpers.cacheFirst(
      new Request(AUDIO, { headers: { Range: 'bytes=100-199' } }),
      'hanquran-audio-v1',
    );

    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 100-199/1000');
    expect(response.headers.get('Content-Length')).toBe('100');
    expect(response.headers.get('Accept-Ranges')).toBe('bytes');
    expect((await response.arrayBuffer()).byteLength).toBe(100);
  });

  it('416 bila rentang di luar ukuran', async () => {
    const full = new Response(new Uint8Array(10), { status: 200 });
    const helpers = load({ match: vi.fn(async () => full), put: vi.fn() }, vi.fn());
    const response = await helpers.cacheFirst(
      new Request(AUDIO, { headers: { Range: 'bytes=50-' } }),
      'hanquran-audio-v1',
    );
    expect(response.status).toBe(416);
  });

  it('tidak menyimpan respons 206 dari jaringan ke cache', async () => {
    const put = vi.fn();
    const partial = new Response(new Uint8Array(10), { status: 206 });
    const helpers = load({ match: vi.fn(async () => undefined), put }, vi.fn(async () => partial));
    const response = await helpers.cacheFirst(
      new Request(AUDIO, { headers: { Range: 'bytes=0-9' } }),
      'hanquran-audio-v1',
    );
    expect(response.status).toBe(206);
    expect(put).not.toHaveBeenCalled();
  });
});

describe('kunci cache tanpa query', () => {
  const helpers = load({ match: vi.fn(), put: vi.fn() }, vi.fn());

  it('navigasi /surah/2?ayah=7 → /surah/2', () => {
    const key = helpers.navigationCacheKey(new URL('https://hanquran.test/surah/2?ayah=7'));
    expect(key.url).toBe('https://hanquran.test/surah/2');
    expect(key.headers.get('Accept')).toContain('text/html');
  });

  it('RSC /surah/2?_rsc=abc → /surah/2 dengan header RSC', () => {
    const key = helpers.rscCacheKey(new URL('https://hanquran.test/surah/2?_rsc=abc'));
    expect(key.url).toBe('https://hanquran.test/surah/2');
    expect(key.headers.get('RSC')).toBe('1');
  });
});
