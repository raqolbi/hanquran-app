import { describe, expect, it } from 'vitest';

import { clampAyahNumber, parseAyahParam } from '@/lib/ayah-param';

describe('parseAyahParam', () => {
  it('menerima bilangan bulat positif', () => {
    expect(parseAyahParam('5')).toBe(5);
    expect(parseAyahParam(' 12 ')).toBe(12);
    expect(parseAyahParam('999')).toBe(999);
  });

  it('fallback untuk nilai kosong/absen', () => {
    expect(parseAyahParam(null)).toBe(1);
    expect(parseAyahParam(undefined)).toBe(1);
    expect(parseAyahParam('')).toBe(1);
    expect(parseAyahParam('', 7)).toBe(7);
  });

  it('fallback untuk nilai bukan bilangan bulat positif', () => {
    expect(parseAyahParam('0')).toBe(1);
    expect(parseAyahParam('-3')).toBe(1);
    expect(parseAyahParam('1.5')).toBe(1);
    expect(parseAyahParam('abc')).toBe(1);
    expect(parseAyahParam('2x')).toBe(1);
  });
});

describe('clampAyahNumber', () => {
  it('mempertahankan nilai di dalam rentang', () => {
    expect(clampAyahNumber(3, 7)).toBe(3);
    expect(clampAyahNumber(1, 7)).toBe(1);
    expect(clampAyahNumber(7, 7)).toBe(7);
  });

  it('menglem nilai di luar rentang', () => {
    expect(clampAyahNumber(999, 7)).toBe(7);
    expect(clampAyahNumber(0, 7)).toBe(1);
    expect(clampAyahNumber(-3, 7)).toBe(1);
    expect(clampAyahNumber(Number.NaN, 7)).toBe(1);
  });

  it('tidak pernah menghasilkan 0 walau jumlah ayat tidak valid', () => {
    expect(clampAyahNumber(5, 0)).toBe(1);
    expect(clampAyahNumber(5, -2)).toBe(1);
  });
});
