import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import 'fake-indexeddb/auto';

import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';
import { clearOfflineAudioCache } from '@/services/cache-manager';
import { db } from '@/services/db/db';
import { useOfflineStore } from '@/stores/offlineStore';

describe('cache-manager', () => {
  let cacheHasEntries = true;

  beforeEach(async () => {
    cacheHasEntries = true;
    await db.downloadManifest.clear();
    useOfflineStore.setState({
      downloadStatuses: { '1:Alafasy_128kbps': 'ready' },
      manifestSummary: { surahsCached: 1, totalSizeBytes: 2048 },
    });

    vi.stubGlobal('caches', {
      delete: vi.fn(async () => {
        cacheHasEntries = false;
        return true;
      }),
      open: vi.fn(async () => ({
        keys: vi.fn(async () =>
          cacheHasEntries
            ? [new Request('https://example.com/001001.mp3')]
            : [],
        ),
        match: vi.fn(async () =>
          new Response(new Blob([new Uint8Array(1024)]), { status: 200 }),
        ),
      })),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('menghapus manifest Dexie dan cache audio', async () => {
    await db.downloadManifest.put({
      surahId: 1,
      reciterId: 'Alafasy_128kbps',
      status: 'ready',
      sizeBytes: 2048,
      ayahsCount: 7,
      cachedAt: Date.now(),
      version: 'v1',
    });

    const result = await clearOfflineAudioCache();

    expect(result.manifestRecordsRemoved).toBe(1);
    expect(result.audioEntriesRemoved).toBe(1);
    expect(result.audioCacheDeleted).toBe(true);
    expect(caches.delete).toHaveBeenCalledWith(AUDIO_CACHE_NAME);
    expect(await db.downloadManifest.count()).toBe(0);
    expect(useOfflineStore.getState().downloadStatuses).toEqual({});
    expect(useOfflineStore.getState().manifestSummary).toEqual({
      surahsCached: 0,
      totalSizeBytes: 0,
    });
  });
});
