/**
 * Barrel export & helper inisialisasi store.
 *
 * `initStores()` memanggil `init()` pada seluruh store yang membaca Dexie
 * saat aplikasi start. Dipanggil dari komponen client root (lihat
 * `components/shared/StoreInitializer.tsx`).
 */

import { useUserStore } from './userStore';
import { useRepeatStore } from './repeatStore';
import { useOfflineStore } from './offlineStore';

export { useAudioStore } from './audioStore';
export { useUserStore } from './userStore';
export { useRepeatStore } from './repeatStore';
export { useOfflineStore } from './offlineStore';

/** Inisialisasi seluruh store persisten dari Dexie. Aman dipanggil sekali. */
export async function initStores(): Promise<void> {
  await Promise.all([
    useUserStore.getState().init(),
    useRepeatStore.getState().init(),
    useOfflineStore.getState().init(),
  ]);
}
