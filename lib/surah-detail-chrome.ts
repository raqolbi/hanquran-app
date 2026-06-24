/** Konstanta layout chrome Surah Detail — sumber tunggal untuk audio & repeat. */

/** Tinggi minimum area kontrol audio (tanpa safe-area). Selaras `AudioPlayer`. */
export const SURAH_DETAIL_AUDIO_MIN_HEIGHT = 96;

/**
 * Perkiraan tinggi baris Reading Controls saat sticky (tanpa safe-area atas).
 * Dipakai untuk `scroll-margin` ayat jika diperlukan.
 */
export const SURAH_DETAIL_READING_CONTROLS_HEIGHT = 68;

/** Jarak antara panel repeat dan atas audio player. */
export const SURAH_DETAIL_REPEAT_ABOVE_AUDIO_GAP = 16;

/** Ruang baca tambahan di bawah ayat terakhir setelah melewati chrome. */
export const SURAH_DETAIL_READING_COMFORT_GAP = 32;

/**
 * Lantai aman jika pengukuran DOM belum siap.
 * ~audio (96) + gap (16) + repeat panel (~140) + comfort (32)
 */
export const SURAH_DETAIL_MIN_SCROLL_INSET = 284;
