import type { AppLocale } from '@/types';

/** Kode folder `public/data/translations/{lang}` yang sesuai locale UI aktif. */
export function getTranslationLanguage(appLocale: AppLocale): AppLocale {
  return appLocale;
}
