'use client';

import { useEffect, useState } from 'react';

import type { SurahData } from '@/services/quran';
import { getSurah } from '@/services/quran';

interface UseSurahResult {
  surah: SurahData | null;
  loading: boolean;
  error: string | null;
}

export function useSurah(surahId: string, language = 'id'): UseSurahResult {
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getSurah(surahId, language)
      .then((data) => {
        if (!cancelled) {
          setSurah(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSurah(null);
          setError(err instanceof Error ? err.message : 'Gagal memuat surat.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [surahId, language]);

  return { surah, loading, error };
}
