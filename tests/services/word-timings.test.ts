import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearWordTimingsMemoryCache,
  findActiveWordRange,
  hasWordTimings,
  loadSurahWordTimings,
  wordTimingsPath,
  type WordSegment,
} from '@/services/quran/word-timings';

const SEGMENTS: WordSegment[] = [
  [0, 1, 100, 500],
  [1, 3, 510, 900], // dua kata dalam satu segmen
  [3, 4, 950, 1400],
];

describe('findActiveWordRange', () => {
  it('null sebelum kata pertama dibaca', () => {
    expect(findActiveWordRange(SEGMENTS, 50)).toBeNull();
  });

  it('mengembalikan rentang segmen yang sedang dibaca', () => {
    expect(findActiveWordRange(SEGMENTS, 100)).toEqual({ from: 0, to: 1 });
    expect(findActiveWordRange(SEGMENTS, 700)).toEqual({ from: 1, to: 3 });
    expect(findActiveWordRange(SEGMENTS, 1200)).toEqual({ from: 3, to: 4 });
  });

  it('di celah antar-segmen tetap menyorot kata terakhir', () => {
    expect(findActiveWordRange(SEGMENTS, 920)).toEqual({ from: 1, to: 3 });
    expect(findActiveWordRange(SEGMENTS, 5000)).toEqual({ from: 3, to: 4 });
  });

  it('aman untuk data kosong / posisi tidak valid', () => {
    expect(findActiveWordRange(undefined, 100)).toBeNull();
    expect(findActiveWordRange([], 100)).toBeNull();
    expect(findActiveWordRange(SEGMENTS, Number.NaN)).toBeNull();
  });
});

describe('dukungan qari', () => {
  it('hanya qari dengan data quran-align', () => {
    expect(hasWordTimings('Alafasy_128kbps')).toBe(true);
    expect(hasWordTimings('Husary_128kbps')).toBe(true);
    expect(hasWordTimings('Minshawy_Mujawwad_192kbps')).toBe(true);
    expect(hasWordTimings('Abdullaah_3awwaad_Al-Juhaynee_128kbps')).toBe(false);
  });

  it('membangun path berversi per qari & surat', () => {
    expect(wordTimingsPath('Alafasy_128kbps', 2)).toBe(
      '/data/word-timings/v1/Alafasy_128kbps/002.json',
    );
  });
});

describe('loadSurahWordTimings', () => {
  afterEach(() => {
    clearWordTimingsMemoryCache();
    vi.unstubAllGlobals();
  });

  it('memuat sekali per surat & qari lalu memakai cache memori', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ ayahs: { 1: SEGMENTS } }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const first = await loadSurahWordTimings('Alafasy_128kbps', 1);
    const second = await loadSurahWordTimings('Alafasy_128kbps', 1);
    expect(first?.[1]).toEqual(SEGMENTS);
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('null untuk qari tanpa data, tanpa fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(loadSurahWordTimings('Abdullaah_3awwaad_Al-Juhaynee_128kbps', 1)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('kegagalan tidak di-cache permanen', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ayahs: { 1: SEGMENTS } }) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadSurahWordTimings('Alafasy_128kbps', 3)).resolves.toBeNull();
    await expect(loadSurahWordTimings('Alafasy_128kbps', 3)).resolves.not.toBeNull();
  });
});
