/** Pesan client → Service Worker. */
export type DownloadClientMessage =
  | {
      type: 'prefetch-surah';
      requestId: string;
      surahId: number;
      urls: string[];
    }
  | { type: 'PING' };

/** Pesan Service Worker → client. */
export type DownloadWorkerMessage =
  | {
      type: 'download-progress';
      requestId: string;
      surahId: number;
      completed: number;
      total: number;
    }
  | {
      type: 'download-complete';
      requestId: string;
      surahId: number;
      sizeBytes: number;
      ayahsCount: number;
    }
  | {
      type: 'download-failed';
      requestId: string;
      surahId: number;
      reason: 'network' | 'quota-exceeded' | 'unknown';
      message?: string;
    }
  | { type: 'PONG'; version: string };

export interface DownloadSurahParams {
  surahId: number;
  reciterId: string;
  ayahCount: number;
}

export interface DownloadSurahResult {
  surahId: number;
  sizeBytes: number;
  ayahsCount: number;
}

export type DownloadProgressHandler = (progress: {
  surahId: number;
  completed: number;
  total: number;
}) => void;
