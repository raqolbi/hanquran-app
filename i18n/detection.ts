import type { AppLocale } from '@/types';

const INDONESIAN_TIMEZONES = new Set([
  'Asia/Jakarta',
  'Asia/Makassar',
  'Asia/Jayapura',
]);

function isIndonesianLocale(locale: string): boolean {
  return locale.toLowerCase().startsWith('id');
}

/**
 * Deteksi bahasa UI pada first launch.
 * Hanya dipanggil saat belum ada `settings.appLocale` tersimpan.
 */
export function detectAppLocale(): AppLocale {
  if (typeof navigator === 'undefined') {
    return 'id';
  }

  const browserLocales = [
    navigator.language,
    ...(navigator.languages ?? []),
  ].filter(Boolean);

  for (const locale of browserLocales) {
    if (isIndonesianLocale(locale)) {
      return 'id';
    }
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (INDONESIAN_TIMEZONES.has(timezone)) {
      return 'id';
    }
  } catch {
    // Abaikan — fallback ke en di bawah.
  }

  return 'en';
}
