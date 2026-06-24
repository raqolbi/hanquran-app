/**
 * useOfflineStore — status koneksi, status unduhan per-track, & ringkasan manifest.
 *
 * `connectionStatus` dan `downloadStatuses` bersifat runtime; ringkasan manifest
 * dibaca dari Dexie `downloadManifest`. Mengacu `docs/15-state-management.md`
 * (Bagian 12) dan `docs/06-database-schema.md` (5.9).
 */

import { create } from 'zustand';
import { db } from '@/services/db/db';
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
  /** Hitung ulang ringkasan manifest dari Dexie. */
  refreshManifest: () => Promise<void>;
  /** Varian badge turunan (docs/15 Bagian 12.2). */
  badgeVariant: () => OfflineBadgeVariant;
}

const emptySummary: ManifestSummary = { surahsCached: 0, totalSizeBytes: 0 };

const readConnectionStatus = (): ConnectionStatus =>
  typeof navigator !== 'undefined' && navigator.onLine === false
    ? 'offline'
    : 'online';

export const useOfflineStore = create<OfflineStateData & OfflineActions>()(
  (set, get) => ({
    connectionStatus: 'online',
    downloadStatuses: {},
    manifestSummary: emptySummary,
    initialized: false,

    init: async () => {
      set({ connectionStatus: readConnectionStatus(), initialized: true });
      await get().refreshManifest();
    },

    setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

    setDownloadStatus: (surahId, status) =>
      set((s) => ({
        downloadStatuses: { ...s.downloadStatuses, [surahId]: status },
      })),

    refreshManifest: async () => {
      const ready = await db.downloadManifest
        .where('status')
        .equals('ready')
        .toArray();
      set({
        manifestSummary: {
          surahsCached: ready.length,
          totalSizeBytes: ready.reduce((sum, r) => sum + r.sizeBytes, 0),
        },
      });
    },

    badgeVariant: () => {
      const { connectionStatus, downloadStatuses, manifestSummary } = get();
      const statuses = Object.values(downloadStatuses);
      if (statuses.includes('downloading')) return 'downloading';
      if (statuses.includes('failed')) return 'download_failed';
      if (connectionStatus === 'offline') {
        return manifestSummary.surahsCached > 0 ? 'offline_ready' : 'offline';
      }
      return 'online';
    },
  }),
);
