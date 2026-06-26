/**
 * Cache audio ayat saat diputar — opt-in via `settings.autoDownloadOnPlay`.
 * Spesifikasi: `docs/31-auto-download-audio-spec.md`.
 */

import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';
import { useOfflineStore } from '@/stores/offlineStore';
import { useUserStore } from '@/stores/userStore';

/** Apakah URL audio sudah ada di Cache Storage. */
export async function isAyahAudioCached(url: string): Promise<boolean> {
  if (typeof caches === 'undefined' || !url) return false;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(url);
    return Boolean(response);
  } catch {
    return false;
  }
}

/**
 * Unduh file MP3 ayat ke cache (best-effort, tidak memblokir playback).
 * Tidak memperbarui Dexie `downloadManifest`.
 */
export async function cacheAyahAudioOnPlay(url: string): Promise<void> {
  if (typeof caches === 'undefined' || !url) return;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const existing = await cache.match(url);
    if (existing) {
      useOfflineStore.getState().notifyAudioCacheUpdated();
      return;
    }

    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return;

    await cache.put(url, response.clone());
    useOfflineStore.getState().notifyAudioCacheUpdated();
    void useOfflineStore.getState().refreshManifest();
  } catch {
    // best-effort — kegagalan tidak memengaruhi streaming
  }
}

/** Cache ayat jika pengaturan ON dan perangkat online. */
export function maybeCacheAyahOnPlay(url: string): void {
  if (typeof window === 'undefined' || !url) return;

  const { autoDownloadOnPlay } = useUserStore.getState().settings;
  if (!autoDownloadOnPlay) return;

  if (useOfflineStore.getState().connectionStatus === 'offline') return;

  void cacheAyahAudioOnPlay(url);
}
