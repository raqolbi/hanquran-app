/**
 * Aturan tombol Previous / Next pada transport audio.
 *
 * Spesifikasi: `docs/29-murotal-mode-spec.md` §7.2
 */

import { getSurahAyahCount } from '@/lib/surah-ayah-counts';
import { TOTAL_SURAHS } from '@/services/murotal-resolver';

export type PlaybackTrackDirection = 'previous' | 'next';

export type PlaybackTrackStep =
  | { type: 'same_surah'; ayahNumber: number }
  | { type: 'cross_surah'; surahId: number; ayahNumber: number }
  | { type: 'none' };

export interface PlaybackTrackNavParams {
  surahId: number;
  currentAyah: number;
  totalAyahs: number;
  murotalEnabled: boolean;
  totalSurahs?: number;
  getSurahAyahCount?: (surahId: number) => number;
}

function resolvePreviousStep(
  params: PlaybackTrackNavParams,
): PlaybackTrackStep {
  const {
    surahId,
    currentAyah,
    murotalEnabled,
    totalSurahs = TOTAL_SURAHS,
    getSurahAyahCount: getAyahCount = getSurahAyahCount,
  } = params;

  if (currentAyah > 1) {
    return { type: 'same_surah', ayahNumber: currentAyah - 1 };
  }

  if (murotalEnabled && surahId > 1) {
    const prevSurahId = surahId - 1;
    return {
      type: 'cross_surah',
      surahId: prevSurahId,
      ayahNumber: getAyahCount(prevSurahId),
    };
  }

  return { type: 'none' };
}

function resolveNextStep(params: PlaybackTrackNavParams): PlaybackTrackStep {
  const {
    surahId,
    currentAyah,
    totalAyahs,
    murotalEnabled,
    totalSurahs = TOTAL_SURAHS,
  } = params;

  if (currentAyah < totalAyahs) {
    return { type: 'same_surah', ayahNumber: currentAyah + 1 };
  }

  if (murotalEnabled && surahId < totalSurahs) {
    return {
      type: 'cross_surah',
      surahId: surahId + 1,
      ayahNumber: 1,
    };
  }

  return { type: 'none' };
}

export function resolvePlaybackTrackStep(
  direction: PlaybackTrackDirection,
  params: PlaybackTrackNavParams,
): PlaybackTrackStep {
  return direction === 'previous'
    ? resolvePreviousStep(params)
    : resolveNextStep(params);
}

export function isPlaybackTrackDisabled(
  direction: PlaybackTrackDirection,
  params: PlaybackTrackNavParams,
): boolean {
  return resolvePlaybackTrackStep(direction, params).type === 'none';
}
