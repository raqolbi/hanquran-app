import { beforeEach, describe, expect, it, vi } from 'vitest';

import { canPlayAyahOffline } from '@/lib/can-play-ayah-offline';
import { fixtureAyahAudioUrl } from '@/tests/fixtures/audio';

describe('canPlayAyahOffline', () => {
  beforeEach(() => {
    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({
        match: vi.fn(async () => undefined),
      })),
    });
  });

  it('selalu true saat online', async () => {
    await expect(
      canPlayAyahOffline('online', 'idle', 'Alafasy_128kbps', 1, 1),
    ).resolves.toBe(true);
  });

  it('true saat offline dan surat ready', async () => {
    await expect(
      canPlayAyahOffline('offline', 'ready', 'Alafasy_128kbps', 1, 1),
    ).resolves.toBe(true);
  });

  it('true saat offline dan ayat ada di cache', async () => {
    const url = fixtureAyahAudioUrl(1, 2);
    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({
        match: vi.fn(async (requestUrl: string) =>
          requestUrl === url ? new Response(new Blob()) : undefined,
        ),
      })),
    });

    await expect(
      canPlayAyahOffline('offline', 'idle', 'Alafasy_128kbps', 1, 2),
    ).resolves.toBe(true);
  });

  it('false saat offline tanpa manifest ready dan tanpa cache', async () => {
    await expect(
      canPlayAyahOffline('offline', 'idle', 'Alafasy_128kbps', 1, 3),
    ).resolves.toBe(false);
  });
});
