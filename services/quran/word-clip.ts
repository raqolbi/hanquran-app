/**
 * Potongan audio untuk Ulang Kata (docs/38 §4.1).
 *
 * Mengubah rentang kata yang dipilih pengguna menjadi batas waktu di file
 * audio ayat, memakai segmen waktu quran-align (`services/quran/word-timings`).
 */

import type { WordRange, WordSegment } from '@/services/quran/word-timings';

/** Bantalan default agar awal/akhir kata tidak terpotong (docs/38 §4.1). */
export const WORD_CLIP_PAD_START_MS = 60;
export const WORD_CLIP_PAD_END_MS = 120;

export interface WordClip {
  /**
   * Rentang kata yang benar-benar terdengar. Bisa lebih lebar dari pilihan
   * bila kata berada di segmen gabungan (satu segmen memuat >1 kata).
   */
  range: WordRange;
  /** Awal potongan (ms), sudah termasuk bantalan. */
  startMs: number;
  /** Akhir potongan (ms), sudah termasuk bantalan. */
  endMs: number;
}

interface ResolveWordClipOptions {
  padStartMs?: number;
  padEndMs?: number;
}

/** Normalkan rentang (urutan bebas, `to` eksklusif) — `null` bila kosong. */
export function normalizeWordRange(a: number, b: number): WordRange | null {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
    return null;
  }
  return { from: Math.min(a, b), to: Math.max(a, b) + 1 };
}

/**
 * Hitung potongan untuk `range` di ayat dengan segmen `segments` (urut waktu).
 *
 * Diambil **kemunculan pertama** rentang itu: segmen berurutan dimulai dari
 * segmen pertama yang menyentuh rentang, berhenti saat segmen melewati akhir
 * rentang atau saat qari kembali ke kata sebelumnya (mengulang frasa) —
 * supaya potongan tidak ikut memuat pengulangan qari.
 *
 * `null` bila tidak ada segmen yang menyentuh rentang (mis. ayat 10:1, 13:1).
 */
export function resolveWordClip(
  segments: readonly WordSegment[] | undefined,
  range: WordRange,
  {
    padStartMs = WORD_CLIP_PAD_START_MS,
    padEndMs = WORD_CLIP_PAD_END_MS,
  }: ResolveWordClipOptions = {},
): WordClip | null {
  if (!segments || segments.length === 0 || range.to <= range.from) {
    return null;
  }

  const overlaps = (segment: WordSegment) =>
    segment[0] < range.to && segment[1] > range.from;

  const first = segments.findIndex(overlaps);
  if (first < 0) return null;

  let from = segments[first][0];
  let to = segments[first][1];
  let startMs = segments[first][2];
  let endMs = segments[first][3];
  let previousFrom = segments[first][0];

  for (let i = first + 1; i < segments.length; i += 1) {
    const segment = segments[i];
    if (segment[0] >= range.to || segment[0] < previousFrom) break;
    previousFrom = segment[0];
    if (!overlaps(segment)) continue;
    from = Math.min(from, segment[0]);
    to = Math.max(to, segment[1]);
    startMs = Math.min(startMs, segment[2]);
    endMs = Math.max(endMs, segment[3]);
  }

  return {
    range: { from, to },
    startMs: Math.max(0, startMs - padStartMs),
    endMs: endMs + padEndMs,
  };
}

/** Kata `index` berada di dalam rentang? */
export function isWordInRange(range: WordRange | null | undefined, index: number): boolean {
  return !!range && index >= range.from && index < range.to;
}
