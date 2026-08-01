/**
 * Resolve path audio untuk player native Capacitor (bukan HTMLAudioElement).
 * Cache Storage → file di Directory.Cache; selain itu URL HTTPS CDN.
 * Hanya dipakai saat isNativePlatform() — docs/32 §10.1.
 */

import { Directory, Filesystem } from '@capacitor/filesystem';

import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';

export interface NativePlayablePath {
  /** file:// atau https:// untuk NativeAudio.preload */
  assetPath: string;
  isUrl: true;
  fromCache: boolean;
}

function cacheFileName(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i += 1) {
    hash = (Math.imul(31, hash) + url.charCodeAt(i)) | 0;
  }
  return `hq-audio-${Math.abs(hash)}.mp3`;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function writeCacheBlob(url: string, blob: Blob): Promise<string> {
  const path = `hanquran-audio/${cacheFileName(url)}`;
  try {
    await Filesystem.mkdir({
      path: 'hanquran-audio',
      directory: Directory.Cache,
      recursive: true,
    });
  } catch {
    // sudah ada
  }

  const data = await blobToBase64(blob);
  await Filesystem.writeFile({
    path,
    data,
    directory: Directory.Cache,
  });

  const { uri } = await Filesystem.getUri({
    path,
    directory: Directory.Cache,
  });
  return uri;
}

export async function resolveNativePlayablePath(
  url: string,
): Promise<NativePlayablePath> {
  if (!url) {
    return { assetPath: url, isUrl: true, fromCache: false };
  }

  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const response = await cache.match(url);
      if (response?.ok) {
        const blob = await response.blob();
        if (blob.size > 0) {
          const assetPath = await writeCacheBlob(url, blob);
          return { assetPath, isUrl: true, fromCache: true };
        }
      }
    } catch {
      // jatuh ke CDN
    }
  }

  return { assetPath: url, isUrl: true, fromCache: false };
}
