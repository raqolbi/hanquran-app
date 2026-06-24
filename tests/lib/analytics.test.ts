import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const trackMock = vi.hoisted(() => vi.fn());

vi.mock('@vercel/analytics', () => ({
  track: trackMock,
}));

import {
  ANALYTICS_EVENTS,
  isAnalyticsEnabled,
  repeatTargetToAnalyticsMode,
  trackAudioPlay,
  trackBookmarkCreated,
  trackLastReadUpdated,
  trackRepeatEnabled,
  trackSurahOpened,
} from '@/lib/analytics';

describe('lib/analytics', () => {
  beforeEach(() => {
    trackMock.mockClear();
    vi.stubEnv('NODE_ENV', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('isAnalyticsEnabled true di production browser', () => {
    expect(isAnalyticsEnabled()).toBe(true);
  });

  it('isAnalyticsEnabled false di development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it('trackSurahOpened mengirim payload ke Vercel', () => {
    trackSurahOpened({ surahId: 1, surahName: 'Al-Fatihah' });

    expect(trackMock).toHaveBeenCalledWith(ANALYTICS_EVENTS.SURAH_OPENED, {
      surahId: 1,
      surahName: 'Al-Fatihah',
    });
  });

  it('trackAudioPlay mengirim payload ke Vercel', () => {
    trackAudioPlay({
      surahId: 2,
      ayahNumber: 5,
      reciterId: 'Alafasy_128kbps',
    });

    expect(trackMock).toHaveBeenCalledWith(ANALYTICS_EVENTS.AUDIO_PLAY, {
      surahId: 2,
      ayahNumber: 5,
      reciterId: 'Alafasy_128kbps',
    });
  });

  it('trackBookmarkCreated mengirim payload ke Vercel', () => {
    trackBookmarkCreated({ surahId: 36, ayahNumber: 12 });

    expect(trackMock).toHaveBeenCalledWith(ANALYTICS_EVENTS.BOOKMARK_CREATED, {
      surahId: 36,
      ayahNumber: 12,
    });
  });

  it('trackLastReadUpdated mengirim payload ke Vercel', () => {
    trackLastReadUpdated({ surahId: 18, ayahNumber: 3 });

    expect(trackMock).toHaveBeenCalledWith(ANALYTICS_EVENTS.LAST_READ_UPDATED, {
      surahId: 18,
      ayahNumber: 3,
    });
  });

  it('trackRepeatEnabled mengirim mode range', () => {
    trackRepeatEnabled({ mode: 'range' });

    expect(trackMock).toHaveBeenCalledWith(ANALYTICS_EVENTS.REPEAT_ENABLED, {
      mode: 'range',
    });
  });

  it('tidak memanggil track di development', () => {
    vi.stubEnv('NODE_ENV', 'development');

    trackSurahOpened({ surahId: 1, surahName: 'Al-Fatihah' });

    expect(trackMock).not.toHaveBeenCalled();
  });

  describe('repeatTargetToAnalyticsMode', () => {
    it('memetakan target repeat ke mode analytics', () => {
      expect(repeatTargetToAnalyticsMode('current_ayah')).toBe('ayah');
      expect(repeatTargetToAnalyticsMode('entire_surah')).toBe('ayah');
      expect(repeatTargetToAnalyticsMode('ayah_range')).toBe('range');
    });
  });
});
