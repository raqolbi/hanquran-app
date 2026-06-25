import { describe, expect, it } from 'vitest';

import { isAudioPlaybackBlocked } from '@/lib/is-audio-playback-blocked';

describe('isAudioPlaybackBlocked', () => {
  it('memblokir saat offline dan audio belum siap', () => {
    expect(isAudioPlaybackBlocked('offline', 'idle')).toBe(true);
    expect(isAudioPlaybackBlocked('offline', 'downloading')).toBe(true);
    expect(isAudioPlaybackBlocked('offline', 'failed')).toBe(true);
    expect(isAudioPlaybackBlocked('offline', undefined)).toBe(true);
  });

  it('tidak memblokir saat offline dan audio siap', () => {
    expect(isAudioPlaybackBlocked('offline', 'ready')).toBe(false);
  });

  it('tidak memblokir saat online', () => {
    expect(isAudioPlaybackBlocked('online', 'idle')).toBe(false);
    expect(isAudioPlaybackBlocked('online', undefined)).toBe(false);
    expect(isAudioPlaybackBlocked('online', 'ready')).toBe(false);
  });
});
