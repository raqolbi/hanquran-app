import { describe, expect, it } from 'vitest';

import { parseSurahIdFromPathname, routes } from '@/lib/routes';

describe('routes', () => {
  it('membangun href surah & focus dengan/ tanpa ayah', () => {
    expect(routes.surah(5)).toBe('/surah/5');
    expect(routes.surah(5, 3)).toBe('/surah/5?ayah=3');
    expect(routes.focus(5)).toBe('/focus/5');
    expect(routes.focus(5, 3)).toBe('/focus/5?ayah=3');
  });
});

describe('parseSurahIdFromPathname', () => {
  it('mengambil id dari pathname surah & focus', () => {
    expect(parseSurahIdFromPathname('/surah/5')).toBe('5');
    expect(parseSurahIdFromPathname('/focus/114')).toBe('114');
    expect(parseSurahIdFromPathname('/surah/5/')).toBe('5');
  });

  it('mengembalikan string kosong untuk path lain / null', () => {
    expect(parseSurahIdFromPathname('/')).toBe('');
    expect(parseSurahIdFromPathname('/settings/about')).toBe('');
    expect(parseSurahIdFromPathname(null)).toBe('');
  });
});
