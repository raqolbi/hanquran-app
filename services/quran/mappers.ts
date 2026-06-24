import type {
  DatasetSurahFile,
  DatasetTranslationFile,
} from './dataset-types';
import type { RevelationType, SurahAyah, SurahData, SurahSummary } from './app-types';
import type { AppLocale } from '@/types';

const DEFAULT_LANGUAGE = 'id';

function toRevelationType(place: DatasetSurahFile['revelation_place']): RevelationType {
  return place === 'medinan' ? 'Medinan' : 'Meccan';
}

export function getSurahMeaning(surah: DatasetSurahFile, locale: AppLocale): string {
  return locale === 'en' ? surah.name_en : surah.meaning;
}

export function mapSurahToSummary(
  surah: DatasetSurahFile,
  locale: AppLocale = 'id',
): SurahSummary {
  return {
    number: surah.id,
    arabicName: surah.name_ar,
    englishName: surah.name_simple,
    meaning: getSurahMeaning(surah, locale),
    ayahCount: surah.ayah_count,
    type: toRevelationType(surah.revelation_place),
  };
}

export function mapSurahToDetail(
  surah: DatasetSurahFile,
  translation?: DatasetTranslationFile,
  locale: AppLocale = 'id',
): SurahData {
  const translationByAyah = new Map(
    translation?.verses.map((v) => [v.ayah, v.text]) ?? [],
  );

  const ayahs: SurahAyah[] = surah.verses.map((verse) => ({
    number: verse.ayah,
    arabic: verse.text,
    translation: translationByAyah.get(verse.ayah) ?? '',
    transliteration: verse.transliteration,
  }));

  return {
    ...mapSurahToSummary(surah, locale),
    ayahs,
  };
}

export { DEFAULT_LANGUAGE };
