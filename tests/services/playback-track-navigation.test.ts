import { describe, expect, it } from 'vitest';

import {
  isPlaybackTrackDisabled,
  resolvePlaybackTrackStep,
} from '@/services/playback-track-navigation';

const base = {
  surahId: 2,
  currentAyah: 5,
  totalAyahs: 286,
  murotalEnabled: false,
};

describe('playback-track-navigation', () => {
  describe('murotal OFF', () => {
    it('previous dalam surat', () => {
      expect(resolvePlaybackTrackStep('previous', base)).toEqual({
        type: 'same_surah',
        ayahNumber: 4,
      });
    });

    it('next dalam surat', () => {
      expect(resolvePlaybackTrackStep('next', base)).toEqual({
        type: 'same_surah',
        ayahNumber: 6,
      });
    });

    it('previous nonaktif di ayat pertama', () => {
      expect(
        resolvePlaybackTrackStep('previous', {
          ...base,
          currentAyah: 1,
        }),
      ).toEqual({ type: 'none' });
      expect(
        isPlaybackTrackDisabled('previous', {
          ...base,
          currentAyah: 1,
        }),
      ).toBe(true);
    });

    it('next nonaktif di ayat terakhir', () => {
      expect(
        resolvePlaybackTrackStep('next', {
          ...base,
          currentAyah: 286,
        }),
      ).toEqual({ type: 'none' });
      expect(
        isPlaybackTrackDisabled('next', {
          ...base,
          currentAyah: 286,
        }),
      ).toBe(true);
    });
  });

  describe('murotal ON', () => {
  it('previous dari ayat 1 ke surat sebelumnya ayat terakhir', () => {
      expect(
        resolvePlaybackTrackStep('previous', {
          surahId: 2,
          currentAyah: 1,
          totalAyahs: 286,
          murotalEnabled: true,
        }),
      ).toEqual({
        type: 'cross_surah',
        surahId: 1,
        ayahNumber: 7,
      });
    });

    it('previous nonaktif di surat 1 ayat 1', () => {
      expect(
        isPlaybackTrackDisabled('previous', {
          surahId: 1,
          currentAyah: 1,
          totalAyahs: 7,
          murotalEnabled: true,
        }),
      ).toBe(true);
    });

    it('next dari ayat terakhir ke surat berikutnya ayat 1', () => {
      expect(
        resolvePlaybackTrackStep('next', {
          surahId: 1,
          currentAyah: 7,
          totalAyahs: 7,
          murotalEnabled: true,
        }),
      ).toEqual({
        type: 'cross_surah',
        surahId: 2,
        ayahNumber: 1,
      });
    });

    it('next nonaktif di An-Nas ayat terakhir', () => {
      expect(
        isPlaybackTrackDisabled('next', {
          surahId: 114,
          currentAyah: 6,
          totalAyahs: 6,
          murotalEnabled: true,
        }),
      ).toBe(true);
    });
  });
});
