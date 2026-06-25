import {
  SURAH_DETAIL_READING_CONTROLS_HEIGHT,
} from '@/lib/surah-detail-chrome';

/** Jeda setelah scroll manual sebelum auto follow aktif kembali. */
export const AUTO_FOLLOW_SCROLL_RESUME_MS = 2000;

/** Durasi mengabaikan event scroll dari auto-scroll programatik. */
export const AUTO_FOLLOW_PROGRAMMATIC_SCROLL_MS = 800;

export const SURAH_DETAIL_TOP_CHROME_SELECTOR =
  '[data-surah-detail-top-chrome]';

export interface ReadableViewport {
  topInset: number;
  bottomInset: number;
  viewportHeight: number;
}

export interface ElementRect {
  top: number;
  bottom: number;
}

export function getReadableViewport(
  viewportHeight: number,
  bottomInset: number,
  topInset = SURAH_DETAIL_READING_CONTROLS_HEIGHT,
): ReadableViewport {
  return {
    topInset,
    bottomInset,
    viewportHeight,
  };
}

/**
 * Mengukur tinggi chrome atas (sticky header + kontrol baca) dari DOM.
 */
export function measureSurahDetailTopInset(
  fallback = SURAH_DETAIL_READING_CONTROLS_HEIGHT,
): number {
  if (typeof document === 'undefined') {
    return fallback;
  }

  const chrome = document.querySelector(SURAH_DETAIL_TOP_CHROME_SELECTOR);
  if (!chrome) {
    return fallback;
  }

  return Math.ceil(chrome.getBoundingClientRect().bottom);
}

/**
 * Ayat dianggap terlihat jika ada overlap dengan zona baca
 * (di antara chrome atas dan bawah).
 */
export function isAyahVisibleInReadableZone(
  rect: ElementRect,
  viewport: ReadableViewport,
): boolean {
  const readableTop = viewport.topInset;
  const readableBottom = viewport.viewportHeight - viewport.bottomInset;

  return rect.bottom > readableTop && rect.top < readableBottom;
}

export function isAutoFollowSuspended(
  suspendedUntil: number,
  now = Date.now(),
): boolean {
  return now < suspendedUntil;
}

export function shouldAutoFollowScroll(options: {
  enabled: boolean;
  isPlaying: boolean;
  suspendedUntil: number;
  element: Element | null;
  viewport: ReadableViewport;
  now?: number;
}): boolean {
  const { enabled, isPlaying, suspendedUntil, element, viewport, now } = options;

  if (!enabled || !isPlaying || !element) {
    return false;
  }

  if (isAutoFollowSuspended(suspendedUntil, now)) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return !isAyahVisibleInReadableZone(rect, viewport);
}

export function getScrollBehavior(
  smoothAnimation: boolean,
): ScrollBehavior {
  return smoothAnimation ? 'smooth' : 'instant';
}

/**
 * Delta scroll vertikal agar ayat masuk zona baca.
 * Negatif = gulir ke atas, positif = gulir ke bawah.
 */
export function computeScrollDeltaForReadableZone(
  rect: ElementRect,
  viewport: ReadableViewport,
): number {
  const readableTop = viewport.topInset;
  const readableBottom = viewport.viewportHeight - viewport.bottomInset;

  if (rect.top < readableTop) {
    return rect.top - readableTop;
  }

  if (rect.bottom > readableBottom) {
    return rect.bottom - readableBottom;
  }

  return 0;
}

export function scrollAyahIntoReadableZone(
  element: HTMLElement,
  viewport: ReadableViewport,
  smoothAnimation: boolean,
  scrollY = typeof window !== 'undefined' ? window.scrollY : 0,
): void {
  const rect = element.getBoundingClientRect();
  const delta = computeScrollDeltaForReadableZone(rect, viewport);

  if (delta === 0) {
    return;
  }

  window.scrollTo({
    top: Math.max(0, scrollY + delta),
    behavior: getScrollBehavior(smoothAnimation),
  });
}

/** @deprecated Gunakan scrollAyahIntoReadableZone — dipertahankan untuk kompatibilitas test. */
export function scrollAyahIntoView(
  element: Element,
  smoothAnimation: boolean,
): void {
  const viewport = getReadableViewport(
    typeof window !== 'undefined' ? window.innerHeight : 800,
    0,
  );
  scrollAyahIntoReadableZone(element as HTMLElement, viewport, smoothAnimation);
}

export function getAutoFollowResumeTimestamp(
  now = Date.now(),
  delayMs = AUTO_FOLLOW_SCROLL_RESUME_MS,
): number {
  return now + delayMs;
}

export function getAyahElementId(ayahNumber: number): string {
  return `ayah-${ayahNumber}`;
}

export function getAutoFollowProgrammaticScrollClearDelay(
  smoothAnimation: boolean,
): number {
  return smoothAnimation
    ? AUTO_FOLLOW_PROGRAMMATIC_SCROLL_MS
    : 50;
}
