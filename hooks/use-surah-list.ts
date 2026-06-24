'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import type { SurahSummary } from '@/services/quran';
import { getSurahList } from '@/services/quran';
import { useUserStore } from '@/stores/userStore';

interface UseSurahListResult {
  surahs: SurahSummary[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useSurahList(): UseSurahListResult {
  const t = useTranslations('errors');
  const appLocale = useUserStore((s) => s.settings.appLocale);
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
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
  }, [appLocale, t, reloadToken]);

  return { surahs, loading, error, retry };
}
