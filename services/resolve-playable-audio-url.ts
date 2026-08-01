/**
 * Resolve URL audio yang bisa diputar HTMLAudioElement.
 *
 * Di PWA, Service Worker biasanya menyajikan CDN dari Cache Storage.
 * Di Capacitor native SW di-skip — jadi kita baca Cache Storage langsung
 * dan memakai blob: URL agar Simpan Offline tetap bisa diputar (docs/32 A3).
 */

import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';

export interface PlayableAudioUrl {
  /** src untuk HTMLAudioElement (CDN atau blob:). */
  src: string;
  /** True jika sumber dari Cache Storage (blob). */
  fromCache: boolean;
  /** Panggil saat src diganti untuk melepaskan blob URL. */
  revoke: (() => void) | null;
}

export async function resolvePlayableAudioUrl(
  url: string,
): Promise<PlayableAudioUrl> {
  if (!url || typeof caches === 'undefined') {
    return { src: url, fromCache: false, revoke: null };
  }

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(url);
    if (!response || !response.ok) {
      return { src: url, fromCache: false, revoke: null };
    }

    const blob = await response.blob();
    if (!blob.size) {
      return { src: url, fromCache: false, revoke: null };
    }

    const objectUrl = URL.createObjectURL(blob);
    return {
      src: objectUrl,
      fromCache: true,
      revoke: () => {
        URL.revokeObjectURL(objectUrl);
      },
    };
  } catch {
    return { src: url, fromCache: false, revoke: null };
  }
}
