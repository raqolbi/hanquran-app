import type { ConnectionStatus, DownloadStatus } from '@/types';

import { isAudioPlaybackBlocked } from '@/lib/is-audio-playback-blocked';

/**
 * Apakah audio surat tujuan dapat diputar pada kondisi koneksi saat ini.
 * Online → selalu bisa (stream). Offline → hanya jika surat sudah `ready`.
 * Spesifikasi: `docs/30-offline-behavior-spec.md` §4.2 & §5.
 */
export function isSurahAudioAvailableOffline(
  connectionStatus: ConnectionStatus,
  targetDownloadStatus: DownloadStatus | undefined,
): boolean {
  return !isAudioPlaybackBlocked(connectionStatus, targetDownloadStatus);
}
