import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';
import { resolvePlayableAudioUrl } from '@/services/resolve-playable-audio-url';

describe('resolvePlayableAudioUrl', () => {
  const url = 'https://everyayah.com/data/Qari/001001.mp3';

  beforeEach(() => {
    vi.stubGlobal(
      'URL',
      class {
        static createObjectURL = vi.fn(() => 'blob:hanquran-test');
        static revokeObjectURL = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('mengembalikan URL CDN jika cache kosong', async () => {
    const match = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('caches', {
      open: vi.fn().mockResolvedValue({ match }),
    });

    const resolved = await resolvePlayableAudioUrl(url);

    expect(resolved.src).toBe(url);
    expect(resolved.fromCache).toBe(false);
    expect(resolved.revoke).toBeNull();
  });

  it('memakai blob URL jika audio ada di Cache Storage', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/mpeg' });
    const match = vi.fn().mockResolvedValue(
      new Response(blob, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } }),
    );
    const open = vi.fn().mockResolvedValue({ match });
    vi.stubGlobal('caches', { open });

    const resolved = await resolvePlayableAudioUrl(url);

    expect(open).toHaveBeenCalledWith(AUDIO_CACHE_NAME);
    expect(resolved.fromCache).toBe(true);
    expect(resolved.src).toBe('blob:hanquran-test');
    expect(resolved.revoke).toEqual(expect.any(Function));
    resolved.revoke?.();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:hanquran-test');
  });
});
