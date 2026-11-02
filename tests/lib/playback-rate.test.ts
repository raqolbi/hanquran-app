import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PLAYBACK_RATE,
  formatPlaybackRate,
  isPlaybackRate,
  PLAYBACK_RATES,
} from '@/lib/playback-rate';

describe('playback-rate', () => {
  it('pilihan 0.5× – 1.5×, default 1×', () => {
    expect(PLAYBACK_RATES).toEqual([0.5, 0.75, 1, 1.25, 1.5]);
    expect(DEFAULT_PLAYBACK_RATE).toBe(1);
  });

  it('validasi nilai tersimpan', () => {
    expect(isPlaybackRate(0.5)).toBe(true);
    expect(isPlaybackRate(2)).toBe(false);
    expect(isPlaybackRate('1')).toBe(false);
    expect(isPlaybackRate(undefined)).toBe(false);
  });

  it('label mengikuti locale', () => {
    expect(formatPlaybackRate(0.75, 'id')).toBe('0,75×');
    expect(formatPlaybackRate(0.75, 'en')).toBe('0.75×');
    expect(formatPlaybackRate(1, 'id')).toBe('1×');
  });
});
