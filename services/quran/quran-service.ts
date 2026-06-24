import type { AppLocale } from '@/types';
import type { SurahData, SurahSummary } from './app-types';
import { loadManifest, loadSurahFile, loadTranslationFile, parseSurahId } from './data-loader';
import { DEFAULT_LANGUAGE, mapSurahToDetail, mapSurahToSummary } from './mappers';

const surahListCache = new Map<AppLocale, SurahSummary[]>();

export async function getManifest() {
  return loadManifest();
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
