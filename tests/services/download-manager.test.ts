import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import 'fake-indexeddb/auto';

import { db } from '@/services/db/db';
import {
  buildSurahAudioUrls,
  DownloadManager,
} from '@/services/download-manager';
import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';
import { useOfflineStore } from '@/stores/offlineStore';

function mockFetchResponse(size = 1024) {
  return new Response(new Blob([new Uint8Array(size)]), {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}

describe('buildSurahAudioUrls', () => {
  it('membangun URL audio per ayat', () => {
    const urls = buildSurahAudioUrls(1, 'Alafasy_128kbps', 2);
    expect(urls).toHaveLength(2);
    expect(urls[0]).toContain('001001.mp3');
    expect(urls[1]).toContain('001002.mp3');
  });
});

describe('DownloadManager', () => {
  beforeEach(async () => {
    await db.downloadManifest.clear();
    useOfflineStore.setState({
      downloadStatuses: {},
      manifestSummary: { surahsCached: 0, totalSizeBytes: 0 },
    });
    vi.stubGlobal('fetch', vi.fn(async () => mockFetchResponse(512)));
    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({
        keys: vi.fn(async () => []),
        match: vi.fn(async () => undefined),
        put: vi.fn(async () => undefined),
      })),
    });
    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: Promise.resolve({ active: null }),
        addEventListener: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mengunduh via Cache API client saat SW tidak tersedia', async () => {
    const manager = new DownloadManager();
    const progress: number[] = [];

    const result = await manager.downloadSurah(
      { surahId: 1, reciterId: 'Alafasy_128kbps', ayahCount: 3 },
      ({ completed }) => progress.push(completed),
    );

    expect(result.surahId).toBe(1);
    expect(result.ayahsCount).toBe(3);
    expect(result.sizeBytes).toBeGreaterThan(0);
    expect(progress).toEqual([1, 2, 3]);

    const manifest = await db.downloadManifest.get(1);
    expect(manifest?.status).toBe('ready');
    expect(manifest?.ayahsCount).toBe(3);
    expect(useOfflineStore.getState().downloadStatuses[1]).toBe('ready');
  });

  it('menandai manifest gagal saat fetch error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })));

    const manager = new DownloadManager();
    await expect(
      manager.downloadSurah({
        surahId: 2,
        reciterId: 'Alafasy_128kbps',
        ayahCount: 1,
      }),
    ).rejects.toThrow();

    const manifest = await db.downloadManifest.get(2);
    expect(manifest?.status).toBe('failed');
    expect(useOfflineStore.getState().downloadStatuses[2]).toBe('failed');
  });

  it('memakai nama cache audio yang disepakati', async () => {
    const openSpy = vi.fn(async () => ({
      keys: vi.fn(async () => []),
      match: vi.fn(async () => undefined),
      put: vi.fn(async () => undefined),
    }));
    vi.stubGlobal('caches', { open: openSpy });

    const manager = new DownloadManager();
    await manager.downloadSurah({
      surahId: 1,
      reciterId: 'Alafasy_128kbps',
      ayahCount: 1,
    });

    expect(openSpy).toHaveBeenCalledWith(AUDIO_CACHE_NAME);
  });

  it('meneruskan pesan selesai dari Service Worker', async () => {
    const manager = new DownloadManager();
    const handler = (manager as unknown as { handleWorkerMessage: (m: unknown) => void })
      .handleWorkerMessage.bind(manager);

    const promise = new Promise<void>((resolve) => {
      (manager as unknown as { pending: Map<string, unknown> }).pending.set(
        'req-1',
        {
          surahId: 1,
          resolve: () => resolve(),
          reject: vi.fn(),
        },
      );
    });

    handler({
      type: 'download-complete',
      requestId: 'req-1',
      surahId: 1,
      sizeBytes: 2048,
      ayahsCount: 3,
    });

    await promise;

    const manifest = await db.downloadManifest.get(1);
    expect(manifest?.status).toBe('ready');
    expect(manifest?.sizeBytes).toBe(2048);
  });
});
