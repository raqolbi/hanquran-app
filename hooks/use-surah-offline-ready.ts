'use client';

import { useEffect, useState } from 'react';

import { downloadManifestKey } from '@/services/download-manifest-key';
import { isSurahAudioFullyCached } from '@/services/surah-audio-cache';
import { useOfflineStore } from '@/stores/offlineStore';

/**
 * Apakah seluruh audio surat+qari tersedia offline.
 * `true` jika manifest `ready` atau semua ayat ada di Cache Storage (auto download).
 */
export function useSurahOfflineReady(
  surahId: number,
  reciterId: string,
  ayahCount: number,
): boolean {
  const manifestKey = downloadManifestKey(surahId, reciterId);
  const downloadStatus = useOfflineStore((s) => s.downloadStatuses[manifestKey]);
  const cacheSizeBytes = useOfflineStore((s) => s.manifestSummary.totalSizeBytes);
  const manifestReady = downloadStatus === 'ready';
  const [allAyahsCached, setAllAyahsCached] = useState<boolean | null>(null);

  useEffect(() => {
    if (manifestReady) {
      setAllAyahsCached(null);
      return;
    }

    let cancelled = false;
    setAllAyahsCached(null);

    void isSurahAudioFullyCached(surahId, reciterId, ayahCount).then((ready) => {
      if (!cancelled) {
        setAllAyahsCached(ready);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [surahId, reciterId, ayahCount, manifestReady, cacheSizeBytes]);

  if (manifestReady) {
    return true;
  }

  return allAyahsCached === true;
}
