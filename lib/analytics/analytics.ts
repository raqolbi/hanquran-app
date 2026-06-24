import { track } from '@vercel/analytics';

import {
  ANALYTICS_EVENTS,
  type AnalyticsEventName,
  type AudioPlayPayload,
  type BookmarkCreatedPayload,
  type LastReadUpdatedPayload,
  type RepeatEnabledPayload,
  type SurahOpenedPayload,
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
