import { describe, expect, it } from 'vitest';

import { isMatchingSurahSeed, shouldFetchSurah } from '@/lib/surah-seed';
import type { SurahData } from '@/services/quran';

const seed = {
  number: 2,
  englishName: 'Al-Baqara',
  arabicName: 'البقرة',
  meaning: 'Sapi Betina',
  ayahCount: 286,
  type: 'Medinan',
  ayahs: [],
} as unknown as SurahData;

describe('isMatchingSurahSeed', () => {
  it('cocok bila nomor surat sama dengan id URL', () => {
    expect(isMatchingSurahSeed(seed, '2')).toBe(true);
  });

  it('tidak cocok untuk id lain, seed kosong, atau id non-kanonik', () => {
    expect(isMatchingSurahSeed(seed, '3')).toBe(false);
    expect(isMatchingSurahSeed(seed, '02')).toBe(false);
    expect(isMatchingSurahSeed(null, '2')).toBe(false);
    expect(isMatchingSurahSeed(undefined, '2')).toBe(false);
  });
});

describe('shouldFetchSurah', () => {
  it('tidak fetch bila seed cocok & terjemahan id', () => {
    expect(
      shouldFetchSurah({
        seedMatches: true,
        translationLanguage: 'id',
        reloadToken: 0,
      }),
    ).toBe(false);
  });

  it('fetch bila locale terjemahan bukan id', () => {
    expect(
      shouldFetchSurah({
        seedMatches: true,
        translationLanguage: 'en',
        reloadToken: 0,
      }),
    ).toBe(true);
  });

  it('fetch bila seed tidak cocok (app-shell offline)', () => {
    expect(
      shouldFetchSurah({
        seedMatches: false,
        translationLanguage: 'id',
        reloadToken: 0,
      }),
    ).toBe(true);
  });

  it('fetch saat retry manual', () => {
    expect(
      shouldFetchSurah({
        seedMatches: true,
        translationLanguage: 'id',
        reloadToken: 1,
      }),
    ).toBe(true);
  });
});
