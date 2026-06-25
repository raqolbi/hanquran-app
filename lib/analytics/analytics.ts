import { track } from '@vercel/analytics';

import {
  ANALYTICS_EVENTS,
  type AnalyticsEventName,
  type AudioPlayPayload,
  type BookmarkCreatedPayload,
  type LastReadUpdatedPayload,
  type RepeatEnabledPayload,
  type SurahOpenedPayload,
  type MurotalEnabledPayload,
  type MurotalSurahCompletePayload,
  type MurotalQuranCompletePayload,
} from '@/lib/analytics/events';

type AnalyticsPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

export function isAnalyticsEnabled(): boolean {
  return (
    typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
  );
}

function sendEvent(
  name: AnalyticsEventName,
  payload: AnalyticsPayload,
): void {
  if (!isAnalyticsEnabled()) {
    return;
  }

  track(name, payload);
}

export function trackSurahOpened(payload: SurahOpenedPayload): void {
  sendEvent(ANALYTICS_EVENTS.SURAH_OPENED, payload);
}

export function trackAudioPlay(payload: AudioPlayPayload): void {
  sendEvent(ANALYTICS_EVENTS.AUDIO_PLAY, payload);
}

export function trackBookmarkCreated(payload: BookmarkCreatedPayload): void {
  sendEvent(ANALYTICS_EVENTS.BOOKMARK_CREATED, payload);
}

export function trackLastReadUpdated(payload: LastReadUpdatedPayload): void {
  sendEvent(ANALYTICS_EVENTS.LAST_READ_UPDATED, payload);
}

export function trackRepeatEnabled(payload: RepeatEnabledPayload): void {
  sendEvent(ANALYTICS_EVENTS.REPEAT_ENABLED, payload);
}

export function trackMurotalEnabled(payload: MurotalEnabledPayload): void {
  sendEvent(ANALYTICS_EVENTS.MUROTAL_ENABLED, payload);
}

export function trackMurotalSurahComplete(
  payload: MurotalSurahCompletePayload,
): void {
  sendEvent(ANALYTICS_EVENTS.MUROTAL_SURAH_COMPLETE, payload);
}

export function trackMurotalQuranComplete(
  payload: MurotalQuranCompletePayload,
): void {
  sendEvent(ANALYTICS_EVENTS.MUROTAL_QURAN_COMPLETE, payload);
}
