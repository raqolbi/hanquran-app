import { describe, expect, it } from 'vitest';

import {
  readSurahForServer,
  readSurahListForServer,
} from '@/services/quran/server-surah';

describe('readSurahForServer', () => {
  it('memuat surat + terjemahan default id dari public/data', async () => {
    const surah = await readSurahForServer(1);

    if (!surah) throw new Error('surat 1 harus tersedia');
    expect(surah.number).toBe(1);
    expect(surah.englishName).toBe('Al-Faatiha');
    expect(surah.ayahs).toHaveLength(7);
    expect(surah.ayahs[0]!.transliteration).toContain('Bismill');
    expect(surah.ayahs[0]!.translation).toContain('Dengan nama Allah');
  }, 15000);

  it('id di luar 1..114 mengembalikan null', async () => {
    expect(await readSurahForServer(0)).toBeNull();
    expect(await readSurahForServer(115)).toBeNull();
  });

  it('surat valid tanpa terjemahan tetap memuat teks Arab', async () => {
    const surah = await readSurahForServer(114);
    if (!surah) throw new Error('surat 114 harus tersedia');
    expect(surah.ayahs).toHaveLength(6);
    expect(surah.ayahs[0]!.arabic.length).toBeGreaterThan(0);
  }, 15000);
});

describe('readSurahListForServer', () => {
  it('memuat 114 ringkasan surat berurutan dari public/data', async () => {
    const surahs = await readSurahListForServer();

    expect(surahs).toHaveLength(114);
    expect(surahs[0]).toMatchObject({
      number: 1,
      englishName: 'Al-Faatiha',
      ayahCount: 7,
      type: 'Meccan',
    });
    expect(surahs.at(-1)).toMatchObject({ number: 114, ayahCount: 6 });
    expect(surahs.map((s) => s.number)).toEqual(
      Array.from({ length: 114 }, (_, i) => i + 1),
    );
    // Ringkasan tidak membawa ayat — payload halaman tetap ringan.
    expect(surahs[0]).not.toHaveProperty('ayahs');
    // Arti kedua bahasa ikut seed agar locale `en` tidak perlu refetch (F8).
    expect(surahs[0]!.meaningTranslations).toEqual({
      id: 'Pembukaan',
      en: 'The Opening',
    });
  }, 20000);

  it('memakai arti bahasa Inggris untuk locale en', async () => {
    const [first] = await readSurahListForServer('en');

    expect(first).toBeDefined();
    expect(first!.meaning).not.toBe(
      (await readSurahListForServer('id'))[0]!.meaning,
    );
  }, 20000);
});
