/**
 * Navigasi tombol Back Android di Capacitor (docs/32 A2).
 *
 * Pure helpers agar mudah diuji tanpa plugin native.
 */

/** Normalisasi pathname App Router / static export (`/surah/1.html` → `/surah/1`). */
export function normalizeAppPathname(pathname: string): string {
  if (!pathname) return '/';
  let path = pathname.split('?')[0]?.split('#')[0] ?? '/';
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  path = path.replace(/\.html$/i, '');
  if (path === '/index' || path === '') {
    return '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
}

/** True jika Back pada rute ini harus keluar aplikasi (bukan history.back). */
export function isRootAppPath(pathname: string): boolean {
  return normalizeAppPathname(pathname) === '/';
}

export type AndroidBackAction = 'history_back' | 'go_home' | 'exit_app';

/**
 * Putuskan aksi Back.
 * - Ada history WebView → mundur
 * - Tidak di root → ke Beranda (deep link / cold start)
 * - Di Beranda → keluar
 */
export function resolveAndroidBackAction(input: {
  pathname: string;
  canGoBack: boolean;
}): AndroidBackAction {
  if (input.canGoBack) {
    return 'history_back';
  }
  if (isRootAppPath(input.pathname)) {
    return 'exit_app';
  }
  return 'go_home';
}
