import { beforeEach, describe, expect, it, vi } from 'vitest';

import { measureAudioCacheStats } from '@/services/audio-cache-stats';
import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';

describe('measureAudioCacheStats', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('mengembalikan nol jika Cache API tidak tersedia', async () => {
    const stats = await measureAudioCacheStats();
    expect(stats).toEqual({ entryCount: 0, totalSizeBytes: 0 });
  });

  it('menjumlahkan ukuran blob di cache audio', async () => {
    const entries = [
      {
        url: 'https://everyayah.com/data/Qari/001001.mp3',
        size: 512,
      },
      {
        url: 'https://everyayah.com/data/Qari/001002.mp3',
        size: 768,
      },
    ];

    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({
        keys: vi.fn(async () =>
          entries.map((entry) => new Request(entry.url)),
        ),
        match: vi.fn(async (request: Request) => {
          const entry = entries.find((item) => item.url === request.url);
          if (!entry) return undefined;
          return new Response(new Blob([new Uint8Array(entry.size)]), {
            status: 200,
          });
        }),
      })),
    });

    const stats = await measureAudioCacheStats();

    expect(caches.open).toHaveBeenCalledWith(AUDIO_CACHE_NAME);
    expect(stats.entryCount).toBe(2);
    expect(stats.totalSizeBytes).toBeGreaterThan(0);
  });
});
