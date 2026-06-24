/**
 * Manajemen cache offline — pembersihan audio & manifest unduhan.
 * Spesifikasi: `docs/15-state-management.md` (§6.4).
 */

import { measureAudioCacheStats } from '@/services/audio-cache-stats';
import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';
import { db } from '@/services/db/db';
import { useOfflineStore } from '@/stores/offlineStore';

export interface ClearOfflineCacheResult {
  manifestRecordsRemoved: number;
  audioEntriesRemoved: number;
  audioCacheDeleted: boolean;
}

/**
 * Hapus cache audio offline & manifest Dexie.
 * Tidak menyentuh `settings`, `favorites`, atau `lastRead`.
 */
export async function clearOfflineAudioCache(): Promise<ClearOfflineCacheResult> {
  const [manifestRecordsRemoved, cacheStats] = await Promise.all([
    db.downloadManifest.count(),
    measureAudioCacheStats(),
  ]);

  await db.downloadManifest.clear();

  let audioCacheDeleted = false;
  if (typeof caches !== 'undefined') {
    audioCacheDeleted = await caches.delete(AUDIO_CACHE_NAME);
  }

  useOfflineStore.setState({ downloadStatuses: {} });
  await useOfflineStore.getState().refreshManifest();

  return {
    manifestRecordsRemoved,
    audioEntriesRemoved: cacheStats.entryCount,
    audioCacheDeleted,
  };
}
