/**
 * useOfflineStore — status koneksi, status unduhan per-track, & ringkasan manifest.
 *
 * `connectionStatus` dan `downloadStatuses` bersifat runtime; ringkasan manifest
 * dibaca dari Dexie `downloadManifest`. Mengacu `docs/15-state-management.md`
 * (Bagian 12) dan `docs/06-database-schema.md` (5.9).
 */

import { create } from 'zustand';
import { db } from '@/services/db/db';
import { measureAudioCacheStats } from '@/services/audio-cache-stats';
import type {
  ConnectionStatus,
  DownloadStatus,
  ManifestSummary,
  OfflineBadgeVariant,
} from '@/types';

interface OfflineStateData {
  connectionStatus: ConnectionStatus;
  downloadStatuses: Record<number, DownloadStatus>;
  manifestSummary: ManifestSummary;
  initialized: boolean;
}

interface OfflineActions {
  /** Baca ringkasan manifest dari Dexie & set status koneksi awal. */
  init: () => Promise<void>;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setDownloadStatus: (surahId: number, status: DownloadStatus) => void;
  /** Hitung ulang ringkasan manifest dari Dexie + ukuran aktual Cache Storage audio. */
  refreshManifest: () => Promise<void>;
  /** Varian badge turunan (docs/15 Bagian 12.2). */
  badgeVariant: () => OfflineBadgeVariant;
}

const emptySummary: ManifestSummary = { surahsCached: 0, totalSizeBytes: 0 };

let connectionListenersAttached = false;

const readConnectionStatus = (): ConnectionStatus =>
  typeof navigator !== 'undefined' && navigator.onLine === false
    ? 'offline'
    : 'online';

/** Selector turunan untuk OfflineStatusBadge (docs/15 §12.2). */
export function selectBadgeVariant(
  state: Pick<
    OfflineStateData,
    'connectionStatus' | 'downloadStatuses' | 'manifestSummary'
  >,
): OfflineBadgeVariant {
  const statuses = Object.values(state.downloadStatuses);
  if (statuses.includes('downloading')) return 'downloading';
  if (statuses.includes('failed')) return 'download_failed';
  if (state.connectionStatus === 'offline') {
    const hasOfflineAudio =
      state.manifestSummary.surahsCached > 0 ||
      state.manifestSummary.totalSizeBytes > 0;
    return hasOfflineAudio ? 'offline_ready' : 'offline';
  }
  return 'online';
}

/** Subset 3-state untuk ConnectionIndicator di Header (docs/12 §22). */
export function selectConnectionIndicatorStatus(
  state: Pick<
    OfflineStateData,
    'connectionStatus' | 'downloadStatuses' | 'manifestSummary'
  >,
): Extract<ConnectionStatus, 'online' | 'offline_ready' | 'offline'> {
  const badge = selectBadgeVariant(state);
  if (badge === 'offline_ready') return 'offline_ready';
  if (badge === 'offline') return 'offline';
  return 'online';
}

function attachConnectionListeners(
  setConnectionStatus: (status: ConnectionStatus) => void,
): void {
  if (typeof window === 'undefined' || connectionListenersAttached) return;

  const onOnline = () => setConnectionStatus('online');
  const onOffline = () => setConnectionStatus('offline');

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  connectionListenersAttached = true;
}

export const useOfflineStore = create<OfflineStateData & OfflineActions>()(
  (set, get) => ({
    connectionStatus: 'online',
    downloadStatuses: {},
    manifestSummary: emptySummary,
    initialized: false,

    init: async () => {
      set({ connectionStatus: readConnectionStatus(), initialized: true });
      attachConnectionListeners(get().setConnectionStatus);
      await get().refreshManifest();
    },

    setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

    setDownloadStatus: (surahId, status) =>
      set((s) => ({
        downloadStatuses: { ...s.downloadStatuses, [surahId]: status },
      })),

    refreshManifest: async () => {
      const [ready, cacheStats] = await Promise.all([
        db.downloadManifest.where('status').equals('ready').toArray(),
        measureAudioCacheStats(),
      ]);

      set({
        manifestSummary: {
          surahsCached: ready.length,
          totalSizeBytes: cacheStats.totalSizeBytes,
        },
      });
    },

    badgeVariant: () => selectBadgeVariant(get()),
  }),
);
