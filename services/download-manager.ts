/**
 * DownloadManager — orkestrasi unduhan audio surat ke Cache Storage.
 *
 * Spesifikasi: `docs/15-state-management.md` (§12.3–12.4), `docs/06-database-schema.md` (§5.9).
 */

import { db } from '@/services/db/db';
import { buildAyahAudioUrl } from '@/services/quran/audio-service';
import { useOfflineStore } from '@/stores/offlineStore';
import {
  AUDIO_CACHE_NAME,
  DOWNLOAD_CONCURRENCY,
  DOWNLOAD_MANIFEST_VERSION,
} from '@/services/audio-cache-constants';
import { downloadManifestKey } from '@/services/download-manifest-key';
import { precacheSurahForOffline } from '@/services/offline-surah-precache';
import type {
  DownloadProgressHandler,
  DownloadSurahParams,
  DownloadSurahResult,
  DownloadWorkerMessage,
} from '@/services/download-manager-types';

export function buildSurahAudioUrls(
  surahId: number,
  reciterId: string,
  ayahCount: number,
): string[] {
  return Array.from({ length: ayahCount }, (_, index) =>
    buildAyahAudioUrl(reciterId, surahId, index + 1),
  );
}

function manifestRecord(
  surahId: number,
  reciterId: string,
  status: 'downloading' | 'ready' | 'failed',
  ayahsCount: number,
  sizeBytes: number,
) {
  return {
    surahId,
    reciterId,
    status,
    sizeBytes,
    ayahsCount,
    cachedAt: Date.now(),
    version: DOWNLOAD_MANIFEST_VERSION,
  };
}

async function putManifestDownloading(
  surahId: number,
  reciterId: string,
  ayahsCount: number,
): Promise<void> {
  await db.downloadManifest.put(
    manifestRecord(surahId, reciterId, 'downloading', ayahsCount, 0),
  );
}

async function putManifestReady(
  surahId: number,
  reciterId: string,
  ayahsCount: number,
  sizeBytes: number,
): Promise<void> {
  await db.downloadManifest.put(
    manifestRecord(surahId, reciterId, 'ready', ayahsCount, sizeBytes),
  );
}

async function putManifestFailed(
  surahId: number,
  reciterId: string,
  ayahsCount: number,
): Promise<void> {
  await db.downloadManifest.put(
    manifestRecord(surahId, reciterId, 'failed', ayahsCount, 0),
  );
}

async function responseSize(response: Response): Promise<number> {
  const blob = await response.clone().blob();
  return blob.size;
}

async function downloadUrlsWithConcurrency(
  urls: string[],
  onProgress: (completed: number, total: number) => void,
): Promise<number> {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  let completed = 0;
  let totalSize = 0;

  for (let offset = 0; offset < urls.length; offset += DOWNLOAD_CONCURRENCY) {
    const batch = urls.slice(offset, offset + DOWNLOAD_CONCURRENCY);
    await Promise.all(
      batch.map(async (url) => {
        const cached = await cache.match(url);
        if (cached) {
          totalSize += await responseSize(cached);
        } else {
          const response = await fetch(url, { mode: 'cors' });
          if (!response.ok) {
            throw new Error(`Gagal mengunduh audio: ${url} (${response.status})`);
          }
          await cache.put(url, response.clone());
          totalSize += await responseSize(response);
        }
        completed += 1;
        onProgress(completed, urls.length);
      }),
    );
  }

  return totalSize;
}

export class DownloadManager {
  private listenerAttached = false;

  private readonly pending = new Map<
    string,
    {
      surahId: number;
      reciterId: string;
      resolve: (result: DownloadSurahResult) => void;
      reject: (error: Error) => void;
      onProgress?: DownloadProgressHandler;
    }
  >();

  /** Daftarkan listener pesan dari Service Worker (sekali). */
  attachServiceWorkerListener(): void {
    if (this.listenerAttached || typeof navigator === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleWorkerMessage(event.data as DownloadWorkerMessage);
    });
    this.listenerAttached = true;
  }

  async isServiceWorkerAvailable(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      return Boolean(registration.active);
    } catch {
      return false;
    }
  }

  async getManifestStatus(surahId: number, reciterId: string) {
    return db.downloadManifest.get([surahId, reciterId]);
  }

  /**
   * Unduh seluruh audio ayat satu surat ke Cache Storage.
   * Memperbarui Dexie `downloadManifest` dan `useOfflineStore`.
   */
  async downloadSurah(
    params: DownloadSurahParams,
    onProgress?: DownloadProgressHandler,
  ): Promise<DownloadSurahResult> {
    this.attachServiceWorkerListener();

    const { surahId, reciterId, ayahCount } = params;
    const urls = buildSurahAudioUrls(surahId, reciterId, ayahCount);

    await putManifestDownloading(surahId, reciterId, ayahCount);
    useOfflineStore.getState().setDownloadStatus(surahId, reciterId, 'downloading');

    const swAvailable = await this.isServiceWorkerAvailable();
    if (swAvailable) {
      return this.downloadViaServiceWorker({
        surahId,
        reciterId,
        urls,
        onProgress,
      });
    }

    return this.downloadViaClientCache({
      surahId,
      reciterId,
      urls,
      ayahCount,
      onProgress,
    });
  }

  private downloadViaServiceWorker(input: {
    surahId: number;
    reciterId: string;
    urls: string[];
    onProgress?: DownloadProgressHandler;
  }): Promise<DownloadSurahResult> {
    const requestId = crypto.randomUUID();

    return new Promise<DownloadSurahResult>((resolve, reject) => {
      this.pending.set(requestId, {
        surahId: input.surahId,
        reciterId: input.reciterId,
        resolve,
        reject,
        onProgress: input.onProgress,
      });

      void navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: 'prefetch-surah',
          requestId,
          surahId: input.surahId,
          urls: input.urls,
        });
      });
    });
  }

  private async downloadViaClientCache(input: {
    surahId: number;
    reciterId: string;
    urls: string[];
    ayahCount: number;
    onProgress?: DownloadProgressHandler;
  }): Promise<DownloadSurahResult> {
    const { surahId, reciterId, urls, ayahCount, onProgress } = input;

    try {
      const sizeBytes = await downloadUrlsWithConcurrency(urls, (completed, total) => {
        onProgress?.({ surahId, completed, total });
      });

      await putManifestReady(surahId, reciterId, ayahCount, sizeBytes);
      useOfflineStore.getState().setDownloadStatus(surahId, reciterId, 'ready');
      await useOfflineStore.getState().refreshManifest();
      await precacheSurahForOffline(surahId);

      return { surahId, sizeBytes, ayahsCount: ayahCount };
    } catch (error) {
      await putManifestFailed(surahId, reciterId, ayahCount);
      useOfflineStore.getState().setDownloadStatus(surahId, reciterId, 'failed');
      await useOfflineStore.getState().refreshManifest();
      throw error instanceof Error ? error : new Error('Unduhan audio gagal');
    }
  }

  private handleWorkerMessage(message: DownloadWorkerMessage): void {
    if (!message?.type) return;

    const pending = this.pending.get(message.requestId);

    switch (message.type) {
      case 'download-progress':
        if (pending) {
          pending.onProgress?.({
            surahId: message.surahId,
            completed: message.completed,
            total: message.total,
          });
          useOfflineStore
            .getState()
            .setDownloadStatus(pending.surahId, pending.reciterId, 'downloading');
        }
        break;

      case 'download-complete': {
        void (async () => {
          const reciterId = pending?.reciterId;
          if (!reciterId) return;

          await putManifestReady(
            message.surahId,
            reciterId,
            message.ayahsCount,
            message.sizeBytes,
          );
          useOfflineStore
            .getState()
            .setDownloadStatus(message.surahId, reciterId, 'ready');
          await useOfflineStore.getState().refreshManifest();
          await precacheSurahForOffline(message.surahId);
          pending?.resolve({
            surahId: message.surahId,
            sizeBytes: message.sizeBytes,
            ayahsCount: message.ayahsCount,
          });
          this.pending.delete(message.requestId);
        })();
        break;
      }

      case 'download-failed': {
        void (async () => {
          const reciterId = pending?.reciterId;
          if (!reciterId) return;

          const ayahsCount =
            (await db.downloadManifest.get([message.surahId, reciterId]))
              ?.ayahsCount ?? 0;
          await putManifestFailed(message.surahId, reciterId, ayahsCount);
          useOfflineStore
            .getState()
            .setDownloadStatus(message.surahId, reciterId, 'failed');
          await useOfflineStore.getState().refreshManifest();
          pending?.reject(
            new Error(message.message ?? `Unduhan gagal (${message.reason})`),
          );
          this.pending.delete(message.requestId);
        })();
        break;
      }

      default:
        break;
    }
  }
}

let singleton: DownloadManager | null = null;

export function getDownloadManager(): DownloadManager {
  if (!singleton) {
    singleton = new DownloadManager();
    singleton.attachServiceWorkerListener();
  }
  return singleton;
}
