export {
  trackAudioPlay,
  trackBookmarkCreated,
  trackLastReadUpdated,
  trackRepeatEnabled,
  trackSurahOpened,
  trackMurotalEnabled,
  trackMurotalSurahComplete,
  trackMurotalQuranComplete,
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
  type MurotalEnabledPayload,
  type MurotalSurahCompletePayload,
  type MurotalQuranCompletePayload,
} from '@/lib/analytics/events';
