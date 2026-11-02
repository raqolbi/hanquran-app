import localFont from 'next/font/local';

/**
 * Font teks Al-Qur'an (rasm Utsmani).
 *
 * Dataset memakai karakter Utsmani seperti alif wasla (U+0671), alif kecil
 * (U+0670) dan tanda waqaf kecil (U+06D6–U+06ED). Font sistem / `font-serif`
 * banyak yang tidak punya glyph ini sehingga tampil sebagai kotak (tofu).
 * Amiri Quran (OFL 1.1, `app/fonts/OFL-amiri-quran.txt`) mencakup seluruh
 * karakter yang dipakai dataset.
 *
 * Self-host lewat `next/font/local`: tidak butuh jaringan saat build,
 * ikut ter-hash di `/_next/static/media` sehingga ikut precache SW &
 * tersedia offline (termasuk build Android). Hanya di-import oleh komponen
 * halaman surat/fokus/pengaturan, jadi beranda tidak ikut memuat font ini.
 */
export const quranFont = localFont({
  src: '../app/fonts/amiri-quran-arabic-400-normal.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  fallback: ['serif'],
});
