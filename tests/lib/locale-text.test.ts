import { describe, expect, it } from 'vitest';

import { getLocalePair } from '@/lib/locale-text';

describe('getLocalePair', () => {
  it('mengembalikan teks id + en untuk namespace sederhana', () => {
    expect(getLocalePair('home', 'searchPlaceholder')).toEqual({
      id: 'Cari surat...',
      en: 'Search surahs...',
    });
  });

  it('mendukung namespace bertingkat', () => {
    expect(getLocalePair('about.credits', 'opensInNewTab')).toEqual({
      id: '(buka di tab baru)',
      en: '(opens in new tab)',
    });
  });

  it('mengembalikan string kosong untuk kunci yang tidak ada', () => {
    expect(getLocalePair('tidakAda', 'kunci')).toEqual({ id: '', en: '' });
  });
});
