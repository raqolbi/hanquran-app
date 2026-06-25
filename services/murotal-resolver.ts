/**
 * MurotalResolver — logika tilawah berkelanjutan (pure functions).
 *
 * Spesifikasi: `docs/29-murotal-mode-spec.md`
 */

export const TOTAL_SURAHS = 114;

export type MurotalStopReason = 'quran_complete';

export type MurotalAction =
  | { type: 'advance_ayah'; ayahNumber: number }
  | { type: 'advance_surah'; surahId: number; ayahNumber: 1 }
  | { type: 'stop'; reason: MurotalStopReason };

export interface MurotalResolverParams {
  surahId: number;
  currentAyah: number;
  totalAyahs: number;
  totalSurahs?: number;
}

/**
 * Tentukan langkah berikutnya setelah satu ayat selesai dan Mode Murotal aktif.
 * Dipanggil hanya ketika RepeatEngine mengembalikan `stop` atau repeat tidak aktif.
 */
export function resolveMurotalAfterAyahEnd(
  params: MurotalResolverParams,
): MurotalAction {
  const {
    surahId,
    currentAyah,
    totalAyahs,
    totalSurahs = TOTAL_SURAHS,
  } = params;

  if (currentAyah < totalAyahs) {
    return { type: 'advance_ayah', ayahNumber: currentAyah + 1 };
  }

  if (surahId < totalSurahs) {
    return {
      type: 'advance_surah',
      surahId: surahId + 1,
      ayahNumber: 1,
    };
  }

  return { type: 'stop', reason: 'quran_complete' };
}
