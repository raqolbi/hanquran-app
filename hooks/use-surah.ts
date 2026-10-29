'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  isMatchingSurahSeed,
  shouldFetchSurah,
} from '@/lib/surah-seed';
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
  const [surah, setSurah] = useState<SurahData | null>(() =>
    isMatchingSurahSeed(initialSurah, surahId) ? initialSurah ?? null : null,
  );
  const [loading, setLoading] = useState(
    () => !isMatchingSurahSeed(initialSurah, surahId),
  );
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const seedMatches = isMatchingSurahSeed(initialSurah, surahId);

    // Seed sudah berisi konten + terjemahan `id` → pakai langsung, tanpa
    // fetch dataset dari klien (docs/35 §9 H2). Juga dipakai saat navigasi
    // klien ke surat lain yang sudah di-prerender.
    if (
      !shouldFetchSurah({ seedMatches, translationLanguage, reloadToken })
    ) {
      setSurah((current) =>
        current === initialSurah ? current : initialSurah ?? null,
      );
      setError(null);
      setLoading(false);
      return;
    }

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
  }, [appLocale, initialSurah, reloadToken, surahId, t, translationLanguage]);

  return { surah, loading, error, retry };
}
