import { describe, expect, it } from 'vitest';

import {
  isWordInRange,
  normalizeWordRange,
  resolveWordClip,
} from '@/services/quran/word-clip';
import type { WordSegment } from '@/services/quran/word-timings';

const segments: WordSegment[] = [
  [0, 1, 100, 600],
  [1, 3, 650, 1500], // segmen gabungan: kata 1–2
  [3, 4, 1550, 2000],
  [4, 5, 2050, 2600],
];

describe('resolveWordClip', () => {
  it('satu kata → batas segmennya + bantalan', () => {
    expect(resolveWordClip(segments, { from: 3, to: 4 })).toEqual({
      range: { from: 3, to: 4 },
      startMs: 1490,
      endMs: 2120,
    });
  });

  it('kata di segmen gabungan diperluas ke seluruh segmen', () => {
    expect(resolveWordClip(segments, { from: 2, to: 3 })).toEqual({
      range: { from: 1, to: 3 },
      startMs: 590,
      endMs: 1620,
    });
  });

  it('rentang beberapa kata', () => {
    const clip = resolveWordClip(segments, { from: 0, to: 4 }, { padStartMs: 0, padEndMs: 0 });
    expect(clip).toEqual({ range: { from: 0, to: 4 }, startMs: 100, endMs: 2000 });
  });

  it('bantalan awal tidak negatif', () => {
    expect(resolveWordClip([[0, 1, 20, 300]], { from: 0, to: 1 })?.startMs).toBe(0);
  });

  it('qari mengulang frasa → hanya kemunculan pertama', () => {
    const repeated: WordSegment[] = [
      [0, 1, 0, 500],
      [1, 2, 500, 1000],
      [0, 1, 1200, 1700], // qari kembali ke kata 0
      [1, 2, 1700, 2200],
    ];
    expect(
      resolveWordClip(repeated, { from: 0, to: 2 }, { padStartMs: 0, padEndMs: 0 }),
    ).toEqual({ range: { from: 0, to: 2 }, startMs: 0, endMs: 1000 });
  });

  it('tanpa segmen → null', () => {
    expect(resolveWordClip(undefined, { from: 0, to: 1 })).toBeNull();
    expect(resolveWordClip(segments, { from: 9, to: 10 })).toBeNull();
    expect(resolveWordClip(segments, { from: 2, to: 2 })).toBeNull();
  });
});

describe('normalizeWordRange & isWordInRange', () => {
  it('urutan bebas, inklusif → to eksklusif', () => {
    expect(normalizeWordRange(5, 2)).toEqual({ from: 2, to: 6 });
    expect(normalizeWordRange(3, 3)).toEqual({ from: 3, to: 4 });
    expect(normalizeWordRange(-1, 2)).toBeNull();
  });

  it('isWordInRange', () => {
    expect(isWordInRange({ from: 2, to: 4 }, 3)).toBe(true);
    expect(isWordInRange({ from: 2, to: 4 }, 4)).toBe(false);
    expect(isWordInRange(null, 0)).toBe(false);
  });
});
