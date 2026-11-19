/**
 * Resolve path audio untuk player native Capacitor (bukan HTMLAudioElement).
 * Berkas di folder data (`docs/30` §2.2a) → `file://` tanpa menyalin; audio lama
 * di Cache Storage dipindah ke folder data saat diputar; selain itu URL CDN.
 * Hanya dipakai saat isNativePlatform() — docs/32 §10.1.
 */

import { AUDIO_CACHE_NAME } from "@/services/audio-cache-constants";
import {
  parseAyahAudioUrl,
  storedAudioUri,
  writeStoredAudio,
} from "@/services/audio-store/audio-store";

export interface NativePlayablePath {
  /** file:// atau https:// untuk NativeAudio.preload */
  assetPath: string;
  isUrl: true;
  fromCache: boolean;
}

/** Pindahkan satu entri Cache Storage lama ke folder data (`docs/30` §2.2a). */
async function moveLegacyCacheEntry(url: string): Promise<string | null> {
  const ref = parseAyahAudioUrl(url);
  if (!ref || typeof caches === "undefined") return null;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(url);
    if (!response?.ok) return null;
    const blob = await response.blob();
    if (blob.size === 0) return null;
    const uri = await writeStoredAudio(ref, blob);
    await cache.delete(url);
    return uri;
  } catch {
    return null;
  }
}

export async function resolveNativePlayablePath(
  url: string
): Promise<NativePlayablePath> {
  if (!url) {
    return { assetPath: url, isUrl: true, fromCache: false };
  }

  const ref = parseAyahAudioUrl(url);
  const stored = ref ? await storedAudioUri(ref) : null;
  const assetPath = stored ?? (await moveLegacyCacheEntry(url));
  if (assetPath) return { assetPath, isUrl: true, fromCache: true };

  return { assetPath: url, isUrl: true, fromCache: false };
}
