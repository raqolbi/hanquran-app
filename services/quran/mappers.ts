import type {
  DatasetSurahFile,
  DatasetTranslationFile,
} from './dataset-types';
import type { RevelationType, SurahAyah, SurahData, SurahSummary } from './app-types';

const DEFAULT_LANGUAGE = 'id';

function toRevelationType(place: DatasetSurahFile['revelation_place']): RevelationType {
  return place === 'medinan' ? 'Medinan' : 'Meccan';
}

export function mapSurahToSummary(surah: DatasetSurahFile): SurahSummary {
  return {
    number: surah.id,
    arabicName: surah.name_ar,
    englishName: surah.name_simple,
    meaning: surah.meaning,
    ayahCount: surah.ayah_count,
    type: toRevelationType(surah.revelation_place),
  };
}

export function mapSurahToDetail(
  surah: DatasetSurahFile,
  translation?: DatasetTranslationFile,
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
    ...mapSurahToSummary(surah),
    ayahs,
  };
}

export { DEFAULT_LANGUAGE };
