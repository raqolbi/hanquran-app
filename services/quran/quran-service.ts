import type { SurahData, SurahSummary } from './app-types';
import { loadManifest, loadSurahFile, loadTranslationFile, parseSurahId } from './data-loader';
import { DEFAULT_LANGUAGE, mapSurahToDetail, mapSurahToSummary } from './mappers';

let surahListCache: SurahSummary[] | null = null;

export async function getManifest() {
  return loadManifest();
}

export async function getSurahList(): Promise<SurahSummary[]> {
  if (surahListCache) {
    return surahListCache;
  }

  const manifest = await loadManifest();
  const surahNumbers = Array.from({ length: manifest.surahs }, (_, index) => index + 1);

  const summaries = await Promise.all(
    surahNumbers.map(async (surahNumber) => {
      const file = await loadSurahFile(surahNumber);
      return mapSurahToSummary(file);
    }),
  );

  surahListCache = summaries;
  return summaries;
}

export async function getSurah(
  id: string,
  language: string = DEFAULT_LANGUAGE,
): Promise<SurahData> {
  const surahNumber = parseSurahId(id);
  const [surahFile, translationFile] = await Promise.all([
    loadSurahFile(surahNumber),
    loadTranslationFile(surahNumber, language),
  ]);

  return mapSurahToDetail(surahFile, translationFile ?? undefined);
}

export async function getSurahSummary(id: string): Promise<SurahSummary> {
  const surahNumber = parseSurahId(id);
  const file = await loadSurahFile(surahNumber);
  return mapSurahToSummary(file);
}
