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
import { precacheAppForOffline } from '@/services/offline-app-precache';

export { useAudioStore } from './audioStore';
export { useUserStore } from './userStore';
export { useRepeatStore } from './repeatStore';
export { useOfflineStore } from './offlineStore';

/** Inisialisasi seluruh store persisten dari Dexie. Aman dipanggil sekali. */
export async function initStores(): Promise<void> {
  getDownloadManager().attachServiceWorkerListener();
  getRepeatTabSync();

  await Promise.all([
    useUserStore.getState().init(),
    useRepeatStore.getState().init(),
    useOfflineStore.getState().init(),
  ]);

  void repairOfflineSurahCachesIfNeeded();
  void precacheAppForOffline();
}
