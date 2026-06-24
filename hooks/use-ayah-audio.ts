'use client';

import { useMemo } from 'react';

import { buildAyahAudioUrl } from '@/services/quran';

export function useAyahAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number,
): string {
  return useMemo(
    () => buildAyahAudioUrl(reciterId, surahNumber, ayahNumber),
    [reciterId, surahNumber, ayahNumber],
  );
}
