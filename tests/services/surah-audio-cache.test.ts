import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildSurahAudioUrls } from '@/services/download-manager';
import { isSurahAudioFullyCached } from '@/services/surah-audio-cache';
import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';

describe('isSurahAudioFullyCached', () => {
  const cacheMatch = vi.fn(async () => undefined as Response | undefined);

  beforeEach(() => {
    cacheMatch.mockReset();
    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({
        match: cacheMatch,
      })),
    });
  });

  it('mengembalikan false jika ada ayat yang belum di cache', async () => {
    const urls = buildSurahAudioUrls(1, 'Alafasy_128kbps', 3);
    cacheMatch.mockImplementation(async (url: string) =>
      url === urls[0] ? new Response(new Blob()) : undefined,
    );

    await expect(
      isSurahAudioFullyCached(1, 'Alafasy_128kbps', 3),
    ).resolves.toBe(false);
    expect(caches.open).toHaveBeenCalledWith(AUDIO_CACHE_NAME);
  });

  it('mengembalikan true jika seluruh ayat ada di cache', async () => {
    const urls = buildSurahAudioUrls(2, 'Alafasy_128kbps', 2);
    cacheMatch.mockImplementation(async (url: string) =>
      urls.includes(url) ? new Response(new Blob()) : undefined,
    );

    await expect(
      isSurahAudioFullyCached(2, 'Alafasy_128kbps', 2),
    ).resolves.toBe(true);
  });

  it('mengembalikan false jika caches tidak tersedia', async () => {
    vi.stubGlobal('caches', undefined);

    await expect(
      isSurahAudioFullyCached(1, 'Alafasy_128kbps', 7),
    ).resolves.toBe(false);
  });
});
