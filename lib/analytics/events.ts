import type { RepeatTarget } from '@/types';

/** Nama event terpusat — jangan gunakan magic string di luar modul ini. */
export const ANALYTICS_EVENTS = {
  SURAH_OPENED: 'surah_opened',
  AUDIO_PLAY: 'audio_play',
  BOOKMARK_CREATED: 'bookmark_created',
  LAST_READ_UPDATED: 'last_read_updated',
  REPEAT_ENABLED: 'repeat_enabled',
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export interface SurahOpenedPayload {
  surahId: number;
  surahName: string;
}

export interface AudioPlayPayload {
  surahId: number;
  ayahNumber: number;
  reciterId?: string;
}

export interface BookmarkCreatedPayload {
  surahId: number;
  ayahNumber: number;
}

export interface LastReadUpdatedPayload {
  surahId: number;
  ayahNumber: number;
}

export type RepeatEnabledMode = 'ayah' | 'range';

export interface RepeatEnabledPayload {
  mode: RepeatEnabledMode;
}

export function repeatTargetToAnalyticsMode(
  target: RepeatTarget,
): RepeatEnabledMode {
  return target === 'ayah_range' ? 'range' : 'ayah';
}
