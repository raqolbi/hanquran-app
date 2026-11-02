import type { AppLocale } from '@/types';
import type { SurahData, SurahSummary } from './app-types';
import {
  loadManifest,
  loadSurahFile,
  loadTranslationFile,
  parseSurahId,
  warmTranslationFile,
} from './data-loader';
import { DEFAULT_LANGUAGE, mapSurahToDetail, mapSurahToSummary } from './mappers';

const surahListCache = new Map<AppLocale, SurahSummary[]>();

export async function getManifest() {
  return loadManifest();
}

/**
 * Panaskan terjemahan `language` untuk surat ini di waktu idle (docs/21 §5.6).
 *
 * Tujuannya agar ganti bahasa di Surah Detail tidak menampilkan area
 * terjemahan kosong sambil menunggu jaringan: berkasnya biasanya sudah ada di
 * cache SW, jadi permintaan berikutnya selesai dalam satu microtask.
 * Tidak ada efek samping bila gagal atau bila berjalan di server.
 */
export function prefetchSurahTranslation(
  id: string,
  language: string,
  schedule: (task: () => void) => void = scheduleIdle,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  let surahNumber: number;
  try {
    surahNumber = parseSurahId(id);
  } catch {
    return;
  }

  schedule(() => warmTranslationFile(surahNumber, language));
}

function scheduleIdle(task: () => void): void {
  const idle = (
    window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
    }
  ).requestIdleCallback;

  if (typeof idle === 'function') {
    idle(task, { timeout: 2000 });
    return;
  }

  window.setTimeout(task, 1200);
}

export async function getSurahList(locale: AppLocale = 'id'): Promise<SurahSummary[]> {
  const cached = surahListCache.get(locale);
  if (cached) {
    return cached;
  }

  const manifest = await loadManifest();
  const surahNumbers = Array.from({ length: manifest.surahs }, (_, index) => index + 1);

  const summaries = await Promise.all(
    surahNumbers.map(async (surahNumber) => {
      const file = await loadSurahFile(surahNumber);
      return mapSurahToSummary(file, locale);
    }),
  );

  surahListCache.set(locale, summaries);
  return summaries;
}

export async function getSurah(
  id: string,
  language: string = DEFAULT_LANGUAGE,
  locale: AppLocale = 'id',
): Promise<SurahData> {
  const surahNumber = parseSurahId(id);
  const [surahFile, translationFile] = await Promise.all([
    loadSurahFile(surahNumber),
    loadTranslationFile(surahNumber, language),
  ]);

  return mapSurahToDetail(surahFile, translationFile ?? undefined, locale);
}

export async function getSurahSummary(
  id: string,
  locale: AppLocale = 'id',
): Promise<SurahSummary> {
  const surahNumber = parseSurahId(id);
  const file = await loadSurahFile(surahNumber);
  return mapSurahToSummary(file, locale);
}
