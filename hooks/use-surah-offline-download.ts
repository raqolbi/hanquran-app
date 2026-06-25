'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getDownloadManager } from '@/services/download-manager';
import { downloadManifestKey } from '@/services/download-manifest-key';
import { routes } from '@/lib/routes';
import { db } from '@/services/db/db';
import { useOfflineStore } from '@/stores/offlineStore';
import type { ConnectionStatus, DownloadStatus } from '@/types';

function mapManifestStatus(
  status: 'downloading' | 'ready' | 'failed' | undefined,
): DownloadStatus {
  if (status === 'ready') return 'ready';
  if (status === 'failed') return 'failed';
  if (status === 'downloading') return 'downloading';
  return 'idle';
}

function toSurahBadgeStatus(
  downloadStatus: DownloadStatus | undefined,
): ConnectionStatus | null {
  if (downloadStatus === 'downloading') return 'downloading';
  if (downloadStatus === 'failed') return 'download_failed';
  return null;
}

interface UseSurahOfflineDownloadInput {
  surahId: number;
  ayahCount: number;
  reciterId: string;
}

interface DownloadProgress {
  completed: number;
  total: number;
}

export function useSurahOfflineDownload({
  surahId,
  ayahCount,
  reciterId,
}: UseSurahOfflineDownloadInput) {
  const router = useRouter();
  const manifestKey = downloadManifestKey(surahId, reciterId);
  const downloadStatus = useOfflineStore((s) => s.downloadStatuses[manifestKey]);
  const connectionStatus = useOfflineStore((s) => s.connectionStatus);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const record = await db.downloadManifest.get([surahId, reciterId]);
      if (cancelled) return;

      if (!record) {
        useOfflineStore.getState().setDownloadStatus(surahId, reciterId, 'idle');
        return;
      }

      useOfflineStore
        .getState()
        .setDownloadStatus(
          surahId,
          reciterId,
          mapManifestStatus(record.status),
        );
    })();

    return () => {
      cancelled = true;
    };
  }, [surahId, reciterId]);

  useEffect(() => {
    setErrorMessage(null);
    setProgress(null);
  }, [reciterId, surahId]);

  const saveOffline = useCallback(async () => {
    if (downloadStatus === 'ready' || downloadStatus === 'downloading' || isSaving) {
      return;
    }

    setErrorMessage(null);
    setProgress(null);
    setIsSaving(true);

    try {
      await getDownloadManager().downloadSurah(
        { surahId, reciterId, ayahCount },
        ({ completed, total }) => setProgress({ completed, total }),
      );
      router.prefetch(routes.surah(surahId));
      router.prefetch(routes.focus(surahId));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unduhan audio gagal',
      );
    } finally {
      setIsSaving(false);
      setProgress(null);
    }
  }, [ayahCount, downloadStatus, isSaving, reciterId, router, surahId]);

  const isOfflineReady = downloadStatus === 'ready';
  const isDownloading = downloadStatus === 'downloading' || isSaving;
  const badgeStatus = toSurahBadgeStatus(downloadStatus);
  const isOnline = connectionStatus === 'online';
  const canSave =
    isOnline &&
    typeof caches !== 'undefined' &&
    !isOfflineReady &&
    !isDownloading;
  const showDownloadUi = isOnline && !isOfflineReady;

  return {
    saveOffline,
    downloadStatus: downloadStatus ?? 'idle',
    isOfflineReady,
    isDownloading,
    canSave,
    showDownloadUi,
    badgeStatus,
    progress,
    errorMessage,
  };
}
