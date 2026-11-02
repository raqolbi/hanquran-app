import type { AppLocale } from '@/types';

/** Kode folder `public/data/translations/{lang}` yang sesuai locale UI aktif. */
export function getTranslationLanguage(appLocale: AppLocale): AppLocale {
  return appLocale;
}

/** Bahasa terjemahan lain — dipakai untuk prefetch saat ganti bahasa. */
export function getAlternateTranslationLanguage(language: string): AppLocale {
  return language === 'id' ? 'en' : 'id';
}
