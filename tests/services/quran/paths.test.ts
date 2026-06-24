import { describe, expect, it } from 'vitest';

import {
  formatAyahCode,
  formatSurahId,
  manifestPath,
  surahPath,
  translationPath,
} from '@/services/quran/paths';

describe('services/quran/paths', () => {
  it('formatSurahId mem-pad ke tiga digit', () => {
    expect(formatSurahId(1)).toBe('001');
    expect(formatSurahId(114)).toBe('114');
  });

  it('formatAyahCode menggabungkan surat dan ayat', () => {
    expect(formatAyahCode(2, 255)).toBe('002255');
  });

  it('membangun path dataset statis', () => {
    expect(manifestPath()).toBe('/data/manifest.json');
    expect(surahPath(1)).toBe('/data/quran/001.json');
    expect(translationPath(1, 'id')).toBe('/data/translations/id/001.json');
  });
});
