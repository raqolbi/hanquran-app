import { isAppInstalled } from '@/lib/install-prompt';

/** Durasi minimum splash agar transisi tidak terasa berkedip. */
export const PWA_SPLASH_MIN_MS = 500;

/** Batas waktu menunggu `load` sebelum splash ditutup paksa. */
export const PWA_SPLASH_MAX_MS = 2500;

const PWA_LAUNCHING_CLASS = 'pwa-launching';
const PWA_SPLASH_DISMISSED_CLASS = 'pwa-splash-dismissed';

export function isPwaLaunching(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.documentElement.classList.contains(PWA_LAUNCHING_CLASS);
}

/** Menandai sesi peluncuran PWA — dipanggil dari inline script di layout. */
export function markPwaLaunching(): void {
  if (typeof document === 'undefined' || !isAppInstalled()) {
    return;
  }

  document.documentElement.classList.add(PWA_LAUNCHING_CLASS);
}

export function dismissPwaSplash(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  if (!root.classList.contains(PWA_LAUNCHING_CLASS)) {
    return;
  }

  root.classList.add(PWA_SPLASH_DISMISSED_CLASS);

  window.setTimeout(() => {
    root.classList.remove(PWA_LAUNCHING_CLASS, PWA_SPLASH_DISMISSED_CLASS);
  }, 220);
}

export function computeSplashDismissDelay(
  elapsedMs: number,
  minMs = PWA_SPLASH_MIN_MS,
): number {
  return Math.max(0, minMs - elapsedMs);
}
