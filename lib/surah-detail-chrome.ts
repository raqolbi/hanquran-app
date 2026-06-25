/** Konstanta layout chrome Surah Detail — sumber tunggal untuk audio & repeat. */

/** Tinggi minimum area kontrol audio + repeat inline (tanpa safe-area). */
export const SURAH_DETAIL_AUDIO_MIN_HEIGHT = 112;

/**
 * Perkiraan tinggi baris Reading Controls saat sticky (tanpa safe-area atas).
 * Dipakai untuk `scroll-margin` ayat jika diperlukan.
 */
export const SURAH_DETAIL_READING_CONTROLS_HEIGHT = 68;

/** Ruang baca tambahan di bawah ayat terakhir setelah melewati chrome. */
export const SURAH_DETAIL_READING_COMFORT_GAP = 16;

/**
 * Lantai aman jika pengukuran DOM belum siap.
 * ~audio + repeat inline (~112) + comfort (16)
 */
export const SURAH_DETAIL_MIN_SCROLL_INSET = 136;
