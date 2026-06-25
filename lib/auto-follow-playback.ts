import {
  SURAH_DETAIL_READING_CONTROLS_HEIGHT,
} from '@/lib/surah-detail-chrome';

/** Jeda setelah scroll manual sebelum auto follow aktif kembali. */
export const AUTO_FOLLOW_SCROLL_RESUME_MS = 2000;

/** Durasi mengabaikan event scroll dari auto-scroll programatik. */
export const AUTO_FOLLOW_PROGRAMMATIC_SCROLL_MS = 800;

/** Padding dalam zona baca (px) — ayat tidak menempel ke tepi chrome. */
export const AUTO_FOLLOW_READABLE_PADDING = 8;

/** Toleransi (px) dari pusat zona baca sebelum auto follow menggeser lagi. */
export const AUTO_FOLLOW_CENTER_TOLERANCE = 32;

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

export interface ReadableBounds {
  top: number;
  bottom: number;
  height: number;
  center: number;
}

export function getReadableBounds(viewport: ReadableViewport): ReadableBounds {
  const top = viewport.topInset + AUTO_FOLLOW_READABLE_PADDING;
  const bottom =
    viewport.viewportHeight - viewport.bottomInset - AUTO_FOLLOW_READABLE_PADDING;
  const height = Math.max(0, bottom - top);

  return {
    top,
    bottom,
    height,
    center: top + height / 2,
  };
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
 * Ayat dianggap terlihat penuh jika seluruh kartu berada di zona baca
 * (antara chrome atas dan bawah, dengan padding).
 */
export function isAyahVisibleInReadableZone(
  rect: ElementRect,
  viewport: ReadableViewport,
): boolean {
  const { top, bottom } = getReadableBounds(viewport);

  return rect.top >= top && rect.bottom <= bottom;
}

export function isAyahWellPositionedForAutoFollow(
  rect: ElementRect,
  viewport: ReadableViewport,
  centerTolerance = AUTO_FOLLOW_CENTER_TOLERANCE,
): boolean {
  if (!isAyahVisibleInReadableZone(rect, viewport)) {
    return false;
  }

  const delta = computeScrollDeltaForReadableZone(rect, viewport);
  return Math.abs(delta) <= centerTolerance;
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
  return !isAyahWellPositionedForAutoFollow(rect, viewport);
}

export function getScrollBehavior(
  smoothAnimation: boolean,
): ScrollBehavior {
  return smoothAnimation ? 'smooth' : 'instant';
}

/**
 * Delta scroll vertikal agar ayat berada di tengah zona baca (jika muat),
 * atau menempel aman di bawah chrome atas jika kartu lebih tinggi dari zona.
 */
export function computeScrollDeltaForReadableZone(
  rect: ElementRect,
  viewport: ReadableViewport,
): number {
  const { top, center, height } = getReadableBounds(viewport);
  const elementHeight = rect.bottom - rect.top;

  if (elementHeight >= height) {
    return rect.top - top;
  }

  const elementCenter = (rect.top + rect.bottom) / 2;
  return elementCenter - center;
}

export function scrollAyahIntoReadableZone(
  element: HTMLElement,
  viewport: ReadableViewport,
  smoothAnimation: boolean,
  scrollY = typeof window !== 'undefined' ? window.scrollY : 0,
): void {
  const rect = element.getBoundingClientRect();
  const delta = computeScrollDeltaForReadableZone(rect, viewport);

  if (Math.abs(delta) < 1) {
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
