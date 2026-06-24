'use client';

import { useCallback, useEffect, useState } from 'react';

import { getDownloadManager } from '@/services/download-manager';
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
  const downloadStatus = useOfflineStore((s) => s.downloadStatuses[surahId]);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const record = await db.downloadManifest.get(surahId);
      if (cancelled || !record) return;
      useOfflineStore
        .getState()
        .setDownloadStatus(surahId, mapManifestStatus(record.status));
    })();

    return () => {
      cancelled = true;
    };
  }, [surahId]);

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
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unduhan audio gagal',
      );
    } finally {
      setIsSaving(false);
      setProgress(null);
    }
  }, [ayahCount, downloadStatus, isSaving, reciterId, surahId]);

  const isOfflineReady = downloadStatus === 'ready';
  const isDownloading = downloadStatus === 'downloading' || isSaving;
  const badgeStatus = toSurahBadgeStatus(downloadStatus);
  const canSave =
    typeof caches !== 'undefined' && !isOfflineReady && !isDownloading;

  return {
    saveOffline,
    downloadStatus: downloadStatus ?? 'idle',
    isOfflineReady,
    isDownloading,
    canSave,
    badgeStatus,
    progress,
    errorMessage,
  };
}
