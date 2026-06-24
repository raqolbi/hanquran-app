'use client';

import { useEffect, useRef } from 'react';

import { trackSurahOpened } from '@/lib/analytics';

interface SurahOpenedSource {
  number: number;
  englishName: string;
}

/**
 * Mencatat `surah_opened` sekali per mount saat surat tersedia.
 * Tidak dipanggil ulang pada rerender dengan `surahId` yang sama.
 */
export function useTrackSurahOpened(surah: SurahOpenedSource | null): void {
  const trackedSurahIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!surah) {
      return;
    }

    if (trackedSurahIdRef.current === surah.number) {
      return;
    }

    trackedSurahIdRef.current = surah.number;
    trackSurahOpened({
      surahId: surah.number,
      surahName: surah.englishName,
    });
  }, [surah]);
}
