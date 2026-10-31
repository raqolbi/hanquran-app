'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { shouldFetchSurah } from '@/lib/surah-seed';
import type { SurahSummary } from '@/services/quran';
import { getSurahList } from '@/services/quran';
import { useUserStore } from '@/stores/userStore';

interface UseSurahListResult {
  surahs: SurahSummary[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useSurahList(
  initialSurahs?: SurahSummary[],
): UseSurahListResult {
  const t = useTranslations('errors');
  const appLocale = useUserStore((s) => s.settings.appLocale);
  // Seed dari server (docs/36 §3): beranda di-SSG agar HTML awal berisi
  // daftar surat. Seed hanya berisi locale `id`.
  const [surahs, setSurahs] = useState<SurahSummary[]>(
    () => initialSurahs ?? [],
  );
  const [loading, setLoading] = useState(() => !initialSurahs?.length);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const seedMatches = Boolean(initialSurahs?.length);

    if (
      !shouldFetchSurah({
        seedMatches,
        translationLanguage: appLocale,
        reloadToken,
      })
    ) {
      setSurahs((current) =>
        current === initialSurahs ? current : initialSurahs ?? [],
      );
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getSurahList(appLocale)
      .then((data) => {
        if (!cancelled) {
          setSurahs(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSurahs([]);
          setError(t('loadSurahListFailed'));
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
  }, [appLocale, initialSurahs, reloadToken, t]);

  return { surahs, loading, error, retry };
}
