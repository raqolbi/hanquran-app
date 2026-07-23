import { describe, expect, it } from 'vitest';

import { matchesSurahSearch, normalizeSearchText } from '@/lib/surah-search';

const alFaatiha = {
  number: 1,
  englishName: 'Al-Faatiha',
  meaning: 'Pembukaan',
  arabicName: 'الفاتحة',
};

const alAnaam = {
  number: 6,
  englishName: "Al-An'aam",
  meaning: 'Binatang Ternak',
  arabicName: 'الأنعام',
};

describe('normalizeSearchText', () => {
  it('menghapus spasi, strip, apostrof, huruf dobel, dan h akhir', () => {
    expect(normalizeSearchText('Al-Faatiha')).toBe('alfatiha');
    expect(normalizeSearchText('al faatihah')).toBe('alfatiha');
    expect(normalizeSearchText('al fa')).toBe('alfa');
    expect(normalizeSearchText("Al-An'aam")).toBe('alanam');
  });
});

describe('matchesSurahSearch', () => {
  it('mencocokkan tanpa strip atau spasi', () => {
    expect(matchesSurahSearch('al fa', alFaatiha)).toBe(true);
    expect(matchesSurahSearch('alfaatiha', alFaatiha)).toBe(true);
    expect(matchesSurahSearch('al faatihah', alFaatiha)).toBe(true);
    expect(matchesSurahSearch('al-faa', alFaatiha)).toBe(true);
    expect(matchesSurahSearch('faatiha', alFaatiha)).toBe(true);
    expect(matchesSurahSearch('fatihah', alFaatiha)).toBe(true);
  });

  it('mencocokkan nama dengan apostrof', () => {
    expect(matchesSurahSearch('al anaam', alAnaam)).toBe(true);
    expect(matchesSurahSearch('alanaam', alAnaam)).toBe(true);
    expect(matchesSurahSearch("al-an'aam", alAnaam)).toBe(true);
  });

  it('mencocokkan arti surat', () => {
    expect(matchesSurahSearch('pembukaan', alFaatiha)).toBe(true);
  });

  it('mencocokkan nomor surat', () => {
    expect(matchesSurahSearch('1', alFaatiha)).toBe(true);
    expect(matchesSurahSearch('6', alAnaam)).toBe(true);
  });

  it('query kosong mencocokkan semua', () => {
    expect(matchesSurahSearch('', alFaatiha)).toBe(true);
    expect(matchesSurahSearch('   ', alFaatiha)).toBe(true);
  });

  it('tidak mencocokkan query yang tidak relevan', () => {
    expect(matchesSurahSearch('baqarah', alFaatiha)).toBe(false);
  });
});
