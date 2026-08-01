/**
 * Navigasi in-app yang aman di Capacitor (static export) dan PWA.
 *
 * Soft-nav Next.js sering gagal di WebView Capacitor; hard document load
 * ke file `.html` adalah jalur yang terbukti di spike A0.
 */

import { isAndroidBuild, isNativePlatform } from '@/lib/platform';
import { toStaticExportHref } from '@/lib/routes';
import { stopPlaybackIfLeavingPlaybackContext } from '@/lib/stop-playback-on-leave';

function shouldHardNavigate(): boolean {
  return (
    typeof window !== 'undefined' &&
    (isAndroidBuild() || isNativePlatform())
  );
}

export function navigateApp(
  href: string,
  push: (href: string) => void,
): void {
  if (shouldHardNavigate()) {
    stopPlaybackIfLeavingPlaybackContext(href);
    window.location.assign(toStaticExportHref(href));
    return;
  }

  stopPlaybackIfLeavingPlaybackContext(href);
  push(href);
}

export function replaceApp(
  href: string,
  replace: (href: string) => void,
): void {
  // Murotal lintas surat: jangan stop — pending play di halaman berikutnya.
  if (shouldHardNavigate()) {
    window.location.replace(toStaticExportHref(href));
    return;
  }

  replace(href);
}
