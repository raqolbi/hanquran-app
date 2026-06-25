import type { ConnectionStatus, DownloadStatus } from '@/types';

/**
 * Audio tidak dapat diputar saat offline kecuali surat+qari sudah diunduh.
 * Spesifikasi: `docs/30-offline-behavior-spec.md` §4.2
 */
export function isAudioPlaybackBlocked(
  connectionStatus: ConnectionStatus,
  downloadStatus: DownloadStatus | undefined,
): boolean {
  return connectionStatus === 'offline' && downloadStatus !== 'ready';
}
