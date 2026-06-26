'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { canPlayAyahOffline } from '@/lib/can-play-ayah-offline';
import { downloadManifestKey } from '@/services/download-manifest-key';
import { showAppToast } from '@/lib/app-toast';
import { useOfflineStore } from '@/stores/offlineStore';

/**
 * Gate pemutaran audio saat offline — per ayat jika surat belum unduh penuh.
 * Spesifikasi: `docs/30-offline-behavior-spec.md` §4.2, `docs/31-auto-download-audio-spec.md`.
 */
export function useAudioPlaybackGate(
  surahId: number,
  reciterId: string,
  currentAyah: number,
) {
  const t = useTranslations('audio');
  const connectionStatus = useOfflineStore((s) => s.connectionStatus);
  const manifestKey = downloadManifestKey(surahId, reciterId);
  const downloadStatus = useOfflineStore((s) => s.downloadStatuses[manifestKey]);
  const [offlinePlayable, setOfflinePlayable] = useState<boolean | null>(null);

  useEffect(() => {
    if (connectionStatus !== 'offline') {
      setOfflinePlayable(null);
      return;
    }

    if (downloadStatus === 'ready') {
      setOfflinePlayable(true);
      return;
    }

    let cancelled = false;

    void canPlayAyahOffline(
      connectionStatus,
      downloadStatus,
      reciterId,
      surahId,
      currentAyah,
    ).then((playable) => {
      if (!cancelled) {
        setOfflinePlayable(playable);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    connectionStatus,
    downloadStatus,
    reciterId,
    surahId,
    currentAyah,
  ]);

  const isPlaybackBlocked = useMemo(() => {
    if (connectionStatus !== 'offline') return false;
    if (downloadStatus === 'ready') return false;
    if (offlinePlayable === true) return false;
    return true;
  }, [connectionStatus, downloadStatus, offlinePlayable]);

  const notifyIfPlaybackBlocked = useCallback(() => {
    if (!isPlaybackBlocked) {
      return false;
    }
    showAppToast(t('offlineUnavailableToast'));
    return true;
  }, [isPlaybackBlocked, t]);

  return {
    isPlaybackBlocked,
    notifyIfPlaybackBlocked,
  };
}
