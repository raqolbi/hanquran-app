/**
 * Warna ikon status bar mengikuti halaman (docs/32 §3.4).
 *
 * Android 15+ (targetSdk 36) memaksa edge-to-edge: warna latar status bar
 * diabaikan OS dan header halaman yang tampil di belakangnya. Ikon terang hanya
 * terbaca di atas gradien Beranda; subhalaman berlatar putih butuh ikon gelap.
 * Di Android lama status bar tetap berlatar teal (#0F766E) → ikon terang.
 */

import { StatusBar, Style } from '@capacitor/status-bar';

import { isNativePlatform } from '@/lib/platform';

export type StatusBarIcons = 'light' | 'dark';

/** Halaman dengan header berwarna gelap di belakang status bar. */
function hasDarkTopChrome(pathname: string): boolean {
  const path = pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  return path === '/' || path === '';
}

/** Ikon status bar yang terbaca untuk halaman dan mode tampilan saat ini. */
export function resolveStatusBarIcons(input: {
  pathname: string;
  edgeToEdge: boolean;
}): StatusBarIcons {
  if (!input.edgeToEdge) return 'light';
  return hasDarkTopChrome(input.pathname) ? 'light' : 'dark';
}

/** Tinggi jarak aman atas yang diterapkan CSS (`--app-safe-top`), dalam px. */
export function measureSafeTopInset(): number {
  if (typeof document === 'undefined' || !document.body) return 0;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-top:var(--app-safe-top)';
  document.body.appendChild(probe);
  const value = Number.parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  return value;
}

/** Terapkan warna ikon status bar untuk `pathname` (no-op di web). */
export async function syncStatusBarIcons(pathname: string): Promise<void> {
  if (!isNativePlatform()) return;
  const icons = resolveStatusBarIcons({ pathname, edgeToEdge: measureSafeTopInset() > 0 });
  try {
    // Style.Dark = ikon terang (untuk latar gelap), Style.Light = ikon gelap.
    await StatusBar.setStyle({ style: icons === 'light' ? Style.Dark : Style.Light });
  } catch {
    // ignore — plugin tidak tersedia
  }
}
