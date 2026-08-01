import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  isPlaybackPathname,
  shouldStopPlaybackOnNavigate,
} from '@/lib/stop-playback-on-leave';

describe('stop-playback-on-leave', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('isPlaybackPathname mengenali surah/focus termasuk .html', () => {
    expect(isPlaybackPathname('/surah/1')).toBe(true);
    expect(isPlaybackPathname('/surah/1.html')).toBe(true);
    expect(isPlaybackPathname('/focus/114?ayah=2')).toBe(true);
    expect(isPlaybackPathname('/')).toBe(false);
    expect(isPlaybackPathname('/settings')).toBe(false);
  });

  it('shouldStopPlaybackOnNavigate true saat meninggalkan konteks putar', () => {
    vi.stubGlobal('window', {
      location: { pathname: '/surah/1.html' },
    });
    expect(shouldStopPlaybackOnNavigate('/')).toBe(true);
    expect(shouldStopPlaybackOnNavigate('/settings')).toBe(true);
    expect(shouldStopPlaybackOnNavigate('/focus/2')).toBe(false);
    expect(shouldStopPlaybackOnNavigate('/surah/2?ayah=1')).toBe(false);
  });

  it('shouldStopPlaybackOnNavigate false di Beranda', () => {
    vi.stubGlobal('window', {
      location: { pathname: '/' },
    });
    expect(shouldStopPlaybackOnNavigate('/surah/1')).toBe(false);
  });
});
