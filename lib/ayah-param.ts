/**
 * Parsing & validasi query `?ayah` (docs/35 §9 H1 & H7).
 *
 * Nilai dari URL diperlakukan sebagai input tak tepercaya: harus bilangan
 * bulat positif, lalu diklem ke rentang jumlah ayat surat yang aktif.
 */

const POSITIVE_INTEGER = /^\d+$/;

/** Ambil nomor ayat dari string query. Nilai tidak valid → `fallback`. */
export function parseAyahParam(
  raw: string | null | undefined,
  fallback = 1,
): number {
  if (!raw) {
    return fallback;
  }

  const trimmed = raw.trim();
  if (!POSITIVE_INTEGER.test(trimmed)) {
    return fallback;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : fallback;
}

/** Klem nomor ayat ke `1..ayahCount` (selalu minimal 1). */
export function clampAyahNumber(value: number, ayahCount: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  const max = Math.max(1, Math.trunc(ayahCount));
  return Math.min(Math.max(1, Math.trunc(value)), max);
}
