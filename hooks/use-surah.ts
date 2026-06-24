'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import type { SurahData } from '@/services/quran';
import { getSurah } from '@/services/quran';

interface UseSurahResult {
  surah: SurahData | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useSurah(surahId: string, language = 'id'): UseSurahResult {
  const t = useTranslations('errors');
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadToken((token) => token + 1);
  }, []);

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
      .catch(() => {
        if (!cancelled) {
          setSurah(null);
          setError(t('loadSurahFailed'));
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
  }, [surahId, language, t, reloadToken]);

  return { surah, loading, error, retry };
}
