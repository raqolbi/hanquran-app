'use client';

import { useEffect, useState } from 'react';

import type { SurahSummary } from '@/services/quran';
import { getSurahList } from '@/services/quran';

interface UseSurahListResult {
  surahs: SurahSummary[];
  loading: boolean;
  error: string | null;
}

export function useSurahList(): UseSurahListResult {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getSurahList()
      .then((data) => {
        if (!cancelled) {
          setSurahs(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat daftar surat.');
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
  }, []);

  return { surahs, loading, error };
}
