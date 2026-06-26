import { buildAyahAudioUrl } from '@/services/quran/audio-service';
import { isAyahAudioCached } from '@/services/audio-play-cache';
import type { ConnectionStatus, DownloadStatus } from '@/types';

/**
 * Apakah ayat tertentu dapat diputar offline.
 * Online → selalu true. Offline → manifest surat `ready` atau file ayat di cache.
 */
export async function canPlayAyahOffline(
  connectionStatus: ConnectionStatus,
  downloadStatus: DownloadStatus | undefined,
  reciterId: string,
  surahId: number,
  ayahNumber: number,
): Promise<boolean> {
  if (connectionStatus !== 'offline') return true;
  if (downloadStatus === 'ready') return true;

  const url = buildAyahAudioUrl(reciterId, surahId, ayahNumber);
  return isAyahAudioCached(url);
}
