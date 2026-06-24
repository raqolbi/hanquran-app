export {
  trackAudioPlay,
  trackBookmarkCreated,
  trackLastReadUpdated,
  trackRepeatEnabled,
  trackSurahOpened,
  isAnalyticsEnabled,
} from '@/lib/analytics/analytics';

export {
  ANALYTICS_EVENTS,
  repeatTargetToAnalyticsMode,
  type AnalyticsEventName,
  type AudioPlayPayload,
  type BookmarkCreatedPayload,
  type LastReadUpdatedPayload,
  type RepeatEnabledMode,
  type RepeatEnabledPayload,
  type SurahOpenedPayload,
} from '@/lib/analytics/events';
