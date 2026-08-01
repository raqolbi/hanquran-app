/**
 * Hentikan sesi tilawah saat meninggalkan konteks putar (surah/focus),
 * dan bersihkan notifikasi native yatim setelah hard nav.
 */

import { isNativePlatform } from '@/lib/platform';
import { cancelCrossSurahNavigation } from '@/lib/murotal-pending-play';
import {
  dismissOrphanNativeAudioSession,
  peekAudioController,
} from '@/services/audio-controller';

/** Pathname putar: `/surah/1`, `/focus/2.html`, dll. */
export function isPlaybackPathname(pathname: string): boolean {
  const normalized = pathname.split(/[?#]/)[0]?.replace(/\.html$/i, '') ?? '';
  return /^\/(surah|focus)(\/|$)/.test(normalized);
}

function destinationPathname(href: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    try {
      return new URL(href).pathname;
    } catch {
      return href;
    }
  }
  return href.split(/[?#]/)[0] ?? href;
}

/**
 * True jika navigasi meninggalkan halaman surat/fokus menuju
 * beranda/settings/dll (bukan antar halaman putar).
 */
export function shouldStopPlaybackOnNavigate(nextHref: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!isPlaybackPathname(window.location.pathname)) return false;
  return !isPlaybackPathname(destinationPathname(nextHref));
}

/** Stop controller bila ada; selain itu bersihkan sesi native yatim. */
export function stopPlaybackSession(): void {
  const controller = peekAudioController();
  if (controller) {
    controller.stopPlayback();
    return;
  }
  void dismissOrphanNativeAudioSession();
}

export function stopPlaybackIfLeavingPlaybackContext(nextHref: string): void {
  if (!shouldStopPlaybackOnNavigate(nextHref)) return;
  cancelCrossSurahNavigation();
  stopPlaybackSession();
}

/** Safety net setelah hard nav ke halaman non-putar. */
export function dismissOrphanPlaybackIfNeeded(): void {
  if (!isNativePlatform() || typeof window === 'undefined') return;
  if (isPlaybackPathname(window.location.pathname)) return;
  cancelCrossSurahNavigation();
  void dismissOrphanNativeAudioSession();
}
