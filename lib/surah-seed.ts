import type { SurahData } from '@/services/quran';

/**
 * Aturan pemakaian seed SSR surat (docs/35 §4 T1 & §9 H2).
 *
 * Halaman surat di-prerender lengkap di server, tetapi app-shell offline
 * dapat melayani shell yang sama untuk id apa pun — jadi seed hanya sah bila
 * nomor suratnya cocok dengan id di URL.
 */
export function isMatchingSurahSeed(
  seed: SurahData | null | undefined,
  surahId: string,
): seed is SurahData {
  return seed != null && String(seed.number) === surahId;
}

/**
 * Apakah `useSurah` perlu mengambil dataset dari klien.
 *
 * Fetch dilewati bila seed cocok dan terjemahan yang diminta sudah `id`
 * (bahasa seed). Retry manual (`reloadToken`) atau locale non-`id` selalu
 * fetch karena seed server hanya berisi terjemahan Indonesia.
 */
export function shouldFetchSurah(options: {
  seedMatches: boolean;
  translationLanguage: string;
  reloadToken: number;
}): boolean {
  const { seedMatches, translationLanguage, reloadToken } = options;

  if (reloadToken > 0) {
    return true;
  }

  return !seedMatches || translationLanguage !== 'id';
}
