import { describe, expect, it } from 'vitest';

import { readSurahForServer } from '@/services/quran/server-surah';

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
