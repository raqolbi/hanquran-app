'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { getTranslationLanguage } from '@/lib/translation-language';
import type { SurahData } from '@/services/quran';
import { getSurah } from '@/services/quran';
import { useUserStore } from '@/stores/userStore';

interface UseSurahResult {
  surah: SurahData | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useSurah(surahId: string, initialSurah?: SurahData | null): UseSurahResult {
  const t = useTranslations('errors');
  const appLocale = useUserStore((s) => s.settings.appLocale);
  const translationLanguage = getTranslationLanguage(appLocale);
  // Seed dari server (docs/35 §4 T1): dipakai bila cocok dengan id URL
  // (guards app-shell offline yang melayani shell untuk id mana pun),
  // sehingga SSR konten tidak tertutup spinner saat hidrasi.
  const [surah, setSurah] = useState<SurahData | null>(() => {
    return initialSurah && String(initialSurah.number) === surahId
      ? initialSurah
      : null;
  });
  const [loading, setLoading] = useState(() => {
    return !(
      initialSurah && String(initialSurah.number) === surahId
    );
  });
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

    getSurah(surahId, translationLanguage, appLocale)
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
  }, [appLocale, surahId, translationLanguage, t, reloadToken]);

  return { surah, loading, error, retry };
}
