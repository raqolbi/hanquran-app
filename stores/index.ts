/**
 * Barrel export & helper inisialisasi store.
 *
 * `initStores()` memanggil `init()` pada store yang membaca Dexie (data
 * pengguna). Dipanggil dari `components/providers/app-providers.tsx`.
 */

import { useUserStore } from './userStore';
import { useRepeatStore } from './repeatStore';
import { useOfflineStore } from './offlineStore';
import { getDownloadManager } from '@/services/download-manager';
import { getRepeatTabSync } from '@/services/repeat-tab-sync';
import { repairOfflineSurahCachesIfNeeded } from '@/services/offline-surah-precache';

export { useAudioStore } from './audioStore';
export { useUserStore } from './userStore';
export { useRepeatStore } from './repeatStore';
export { useOfflineStore } from './offlineStore';

/** Inisialisasi seluruh store persisten dari Dexie. Aman dipanggil sekali. */
export async function initStores(): Promise<void> {
  getDownloadManager().attachServiceWorkerListener();
  getRepeatTabSync();

  // `allSettled`: satu store gagal tidak boleh membatalkan yang lain
  // atau menimbulkan unhandled rejection dari `void initStores()`.
  const results = await Promise.allSettled([
    useUserStore.getState().init(),
    useRepeatStore.getState().init(),
    useOfflineStore.getState().init(),
  ]);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[HanQuran] Inisialisasi store gagal:', result.reason);
    }
  }

  void repairOfflineSurahCachesIfNeeded();
}
