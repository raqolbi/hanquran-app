/**
 * Tipe domain HanQuran — record Dexie (data pengguna) & state runtime.
 * Tipe konten Quran: `services/quran/app-types.ts` (sumber: `public/data/*`).
 */

export type AppLocale = 'id' | 'en';

export interface SettingsRecord {
  id: 'default';
  appLocale: AppLocale;
  fontSize: number;
  translationVisible: boolean;
  transliterationVisible: boolean;
  contrastMode: 'default' | 'high';
  smoothAnimation: boolean;
  /** Slug qari dari `data/reciters.json` (mis. `Alafasy_128kbps`). */
  reciterId: string;
  /** Konfigurasi repeat hafalan — persisten di Dexie. */
  repeatConfig?: RepeatConfig;
  translationResourceId: number;
  updatedAt: number;
}

export interface FavoriteRecord {
  surahId: number;
  createdAt: number;
}

export interface LastReadRecord {
  id: string;
  surahId: number;
  ayahNumber: number;
  updatedAt: number;
}

export interface DownloadManifestRecord {
  surahId: number;
  /** Slug qari pada CDN — bagian dari primary key bersama `surahId`. */
  reciterId: string;
  status: 'downloading' | 'ready' | 'failed';
  sizeBytes: number;
  ayahsCount: number;
  cachedAt: number;
  version: string;
}

export interface BookmarkRecord {
  id: string;
  surahId: number;
  ayahNumber: number;
  note?: string;
  createdAt: number;
}

export interface MemorizationProgressRecord {
  surahId: number;
  percentComplete: number;
  lastSessionAt: number;
}

export interface MurajaahSessionRecord {
  id: string;
  surahId: number;
  completedAt: number;
}

export interface StatisticsRecord {
  date: string;
  ayahsReviewed: number;
}

export interface NoteRecord {
  id: string;
  surahId: number;
  ayahNumber: number;
  content: string;
  updatedAt: number;
}

export type RepeatTarget = 'current_ayah' | 'ayah_range' | 'entire_surah';

export interface RepeatConfig {
  target: RepeatTarget;
  count: number;
  range: { from: number; to: number } | null;
}

export interface RepeatRuntime {
  cycleIndex: number;
  isActive: boolean;
  lastBoundary: number | null;
}

export type ConnectionStatus =
  | 'online'
  | 'offline'
  | 'offline_ready'
  | 'downloading'
  | 'download_failed';

export type DownloadStatus = 'idle' | 'downloading' | 'ready' | 'failed';

export interface ManifestSummary {
  surahsCached: number;
  totalSizeBytes: number;
}

export type OfflineBadgeVariant = ConnectionStatus;

export interface AudioTrack {
  surahId: number;
  ayahNumber: number;
  reciterId: string;
  url: string;
}

export type PlaybackRate = 0.75 | 1 | 1.25 | 1.5;

export type AudioErrorCode = 'network' | 'decode' | 'aborted' | 'unknown';

export interface AudioState {
  isPlaying: boolean;
  currentTrack: AudioTrack | null;
  currentTime: number;
  duration: number;
  playbackRate: PlaybackRate;
  error: AudioErrorCode | null;
}
