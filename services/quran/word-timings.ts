/**
 * Data waktu per kata (word timings) untuk sorot kata saat tilawah diputar.
 *
 * Sumber: quran-align (CC BY 4.0, Collin Fair) — dibangun oleh
 * `scripts/build-word-timings.mjs` ke `public/data/word-timings/v1/`.
 * Hanya tersedia untuk qari di `data/word-timing-reciters.json`; qari lain
 * tetap berfungsi normal tanpa sorot kata.
 *
 * File di-fetch per surat saat dibutuhkan (tidak di-precache saat install SW),
 * lalu di-cache SW (`hanquran-data-v3`, cache-first) dan di memori.
 */

import wordTimingIndex from '@/data/word-timing-reciters.json';
import { formatSurahId } from '@/services/quran/paths';

/** `[indeksKataAwal, indeksKataSesudahAkhir, mulaiMs, selesaiMs]` */
export type WordSegment = readonly [number, number, number, number];

export type SurahWordTimings = Readonly<Record<number, readonly WordSegment[]>>;

/** Rentang kata aktif: `from` inklusif, `to` eksklusif. */
export interface WordRange {
  from: number;
  to: number;
}

const WORD_TIMINGS_BASE = `/data/word-timings/${wordTimingIndex.version}`;

const SUPPORTED_RECITERS = new Set(
  wordTimingIndex.reciters.map((reciter) => reciter.reciterId),
);

export function hasWordTimings(reciterId: string): boolean {
  return SUPPORTED_RECITERS.has(reciterId);
}

export function getWordTimingReciterIds(): string[] {
  return [...SUPPORTED_RECITERS];
}

export function wordTimingsPath(reciterId: string, surahId: number): string {
  return `${WORD_TIMINGS_BASE}/${reciterId}/${formatSurahId(surahId)}.json`;
}

const memoryCache = new Map<string, Promise<SurahWordTimings | null>>();

/**
 * Muat data waktu satu surat untuk satu qari. `null` bila qari tidak
 * didukung atau fetch gagal (mis. offline dan belum pernah di-cache) —
 * pemanggil cukup tidak menampilkan sorotan.
 */
export function loadSurahWordTimings(
  reciterId: string,
  surahId: number,
): Promise<SurahWordTimings | null> {
  if (!hasWordTimings(reciterId)) {
    return Promise.resolve(null);
  }

  const key = `${reciterId}/${surahId}`;
  const cached = memoryCache.get(key);
  if (cached) return cached;

  const request = fetch(wordTimingsPath(reciterId, surahId))
    .then(async (response) => {
      if (!response.ok) return null;
      const payload = (await response.json()) as {
        ayahs?: Record<string, WordSegment[]>;
      };
      return (payload.ayahs ?? null) as SurahWordTimings | null;
    })
    .catch(() => null)
    .then((result) => {
      // Jangan simpan kegagalan permanen — coba lagi di pemanggilan berikutnya.
      if (result === null) memoryCache.delete(key);
      return result;
    });

  memoryCache.set(key, request);
  return request;
}

/** Hanya untuk test. */
export function clearWordTimingsMemoryCache(): void {
  memoryCache.clear();
}

/**
 * Cari rentang kata yang sedang dibaca pada posisi `positionMs`.
 *
 * - Sebelum segmen pertama dimulai → `null` (belum ada kata dibaca).
 * - Di celah antar-segmen → tetap segmen terakhir yang sudah mulai,
 *   agar sorotan tidak berkedip.
 */
export function findActiveWordRange(
  segments: readonly WordSegment[] | undefined,
  positionMs: number,
): WordRange | null {
  if (!segments || segments.length === 0 || !Number.isFinite(positionMs)) {
    return null;
  }

  let low = 0;
  let high = segments.length - 1;
  let found = -1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (segments[mid][2] <= positionMs) {
      found = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (found < 0) return null;
  const [from, to] = segments[found];
  return { from, to };
}
