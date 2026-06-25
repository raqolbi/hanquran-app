'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { downloadManifestKey } from '@/services/download-manifest-key';
import { isAudioPlaybackBlocked } from '@/lib/is-audio-playback-blocked';
import { showAppToast } from '@/lib/app-toast';
import { useOfflineStore } from '@/stores/offlineStore';

/**
 * Gate pemutaran audio saat offline tanpa unduhan — `docs/30-offline-behavior-spec.md` §4.2.
 */
export function useAudioPlaybackGate(surahId: number, reciterId: string) {
  const t = useTranslations('audio');
  const connectionStatus = useOfflineStore((s) => s.connectionStatus);
  const manifestKey = downloadManifestKey(surahId, reciterId);
  const downloadStatus = useOfflineStore((s) => s.downloadStatuses[manifestKey]);

  const isPlaybackBlocked = useMemo(
    () => isAudioPlaybackBlocked(connectionStatus, downloadStatus),
    [connectionStatus, downloadStatus],
  );

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
