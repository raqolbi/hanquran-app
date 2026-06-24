import { describe, expect, it } from 'vitest';

import type { DatasetSurahFile } from '@/services/quran/dataset-types';
import {
  getSurahMeaning,
  mapSurahToDetail,
  mapSurahToSummary,
} from '@/services/quran/mappers';

const sampleSurah: DatasetSurahFile = {
  id: 1,
  name_ar: 'الفاتحة',
  name_simple: 'Al-Faatiha',
  name_en: 'The Opening',
  meaning: 'Pembukaan',
  description: '',
  revelation_place: 'meccan',
  ayah_count: 7,
  verses: [],
  word_by_word: {},
  tafsir: {},
};

describe('surah mappers — locale', () => {
  it('mengembalikan arti Indonesia untuk locale id', () => {
    expect(getSurahMeaning(sampleSurah, 'id')).toBe('Pembukaan');
    expect(mapSurahToSummary(sampleSurah, 'id').meaning).toBe('Pembukaan');
  });

  it('mengembalikan arti Inggris untuk locale en', () => {
    expect(getSurahMeaning(sampleSurah, 'en')).toBe('The Opening');
    expect(mapSurahToSummary(sampleSurah, 'en').meaning).toBe('The Opening');
  });

  it('memetakan terjemahan ayat sesuai bahasa', () => {
    const detail = mapSurahToDetail(
      {
        ...sampleSurah,
        verses: [
          {
            ayah: 1,
            text: 'بِسْمِ ٱللَّهِ',
            transliteration: 'Bismillah',
          },
        ],
      },
      {
        surah: 1,
        language: 'en',
        verses: [{ ayah: 1, text: 'In the name of Allah.' }],
      },
      'en',
    );

    expect(detail.ayahs[0]?.translation).toBe('In the name of Allah.');
    expect(detail.meaning).toBe('The Opening');
  });
});
