import { describe, expect, it } from 'vitest';

import { isSurahAudioAvailableOffline } from '@/lib/is-surah-audio-available-offline';

describe('isSurahAudioAvailableOffline', () => {
  it('selalu tersedia saat online', () => {
    expect(isSurahAudioAvailableOffline('online', undefined)).toBe(true);
    expect(isSurahAudioAvailableOffline('online', 'idle')).toBe(true);
    expect(isSurahAudioAvailableOffline('online', 'ready')).toBe(true);
  });

  it('saat offline hanya tersedia jika surat sudah ready', () => {
    expect(isSurahAudioAvailableOffline('offline', 'ready')).toBe(true);
    expect(isSurahAudioAvailableOffline('offline', 'idle')).toBe(false);
    expect(isSurahAudioAvailableOffline('offline', 'downloading')).toBe(false);
    expect(isSurahAudioAvailableOffline('offline', undefined)).toBe(false);
  });
});
