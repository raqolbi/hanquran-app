import {
  getAyahElementId,
  getReadableViewport,
  getViewportHeight,
  measureSurahDetailTopInset,
  scrollAyahIntoReadableZone,
} from '@/lib/auto-follow-playback';

/**
 * Scroll ke kartu ayat tertentu memakai zona baca yang sama dengan
 * auto-follow playback (docs/35 §9 H7). Mengembalikan `false` bila elemen
 * belum ada di DOM (mis. saat SSR/test tanpa kartu).
 */
export function scrollToAyah(
  ayahNumber: number,
  bottomInset = 0,
  smoothAnimation = false,
): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const element = document.getElementById(getAyahElementId(ayahNumber));
  if (!element) {
    return false;
  }

  const viewport = getReadableViewport(
    getViewportHeight(),
    bottomInset,
    measureSurahDetailTopInset(),
  );
  scrollAyahIntoReadableZone(element, viewport, smoothAnimation);

  return true;
}

/**
 * Versi aman untuk dipanggil tepat setelah perubahan state: tunggu satu
 * frame agar layout kartu (border aktif, inset audio) sudah diterapkan.
 */
export function scrollToAyahAfterPaint(
  ayahNumber: number,
  bottomInset = 0,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const run = () => {
    scrollToAyah(ayahNumber, bottomInset);
  };

  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(run);
    return;
  }

  window.setTimeout(run, 0);
}
