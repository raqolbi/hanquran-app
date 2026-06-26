'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useAudio, useAudioOnEnded } from '@/hooks/use-audio';
import { useAudioPlaybackGate } from '@/hooks/use-audio-playback-gate';
import { showAppToast } from '@/lib/app-toast';
import { canPlayAyahOffline } from '@/lib/can-play-ayah-offline';
import { downloadManifestKey } from '@/services/download-manifest-key';
import { useOfflineStore } from '@/stores/offlineStore';
import type { PlayAyahParams } from '@/hooks/use-audio';
import type { RepeatSettingsConfig } from '@/components/repeat-settings-dialog';
import {
  REPEAT_OPTIONS,
  type RepeatCount,
} from '@/lib/repeat-options';
import {
  consumePendingMurotalPlay,
  setPendingMurotalPlay,
} from '@/lib/murotal-pending-play';
import { routes } from '@/lib/routes';
import {
  trackMurotalQuranComplete,
  trackMurotalSurahComplete,
} from '@/lib/analytics';
import {
  computeNextOnAyahEnd,
  getDisplayCycle,
  shouldBeginRepeatSession,
  toRepeatConfig,
} from '@/services/repeat-engine';
import { resolveMurotalAfterAyahEnd } from '@/services/murotal-resolver';
import {
  isPlaybackTrackDisabled,
  resolvePlaybackTrackStep,
  type PlaybackTrackStep,
} from '@/services/playback-track-navigation';
import { getRepeatTabSync } from '@/services/repeat-tab-sync';
import { setMediaSessionTrackNavigation } from '@/services/media-session';
import { useAudioStore } from '@/stores/audioStore';
import { useRepeatStore } from '@/stores/repeatStore';
import { useUserStore } from '@/stores/userStore';
import type { RepeatStatusProps } from '@/components/repeat-status';

function toRepeatCountValue(count: number): RepeatCount {
  const match = REPEAT_OPTIONS.find((option) => option.value === count);
  return (match?.value ?? 5) as RepeatCount;
}

export type PlaybackRouteMode = 'surah' | 'focus';

export interface UseSurahRepeatPlaybackParams {
  surahId: number;
  routeMode: PlaybackRouteMode;
  activeAyah: number;
  totalAyahs: number;
  reciterId: string;
  surahName: string;
  setActiveAyah: (ayah: number) => void;
  onQuranComplete?: () => void;
}

export function useSurahRepeatPlayback({
  surahId,
  routeMode,
  activeAyah,
  totalAyahs,
  reciterId,
  surahName,
  setActiveAyah,
  onQuranComplete,
}: UseSurahRepeatPlaybackParams) {
  const router = useRouter();
  const config = useRepeatStore((s) => s.config);
  const runtime = useRepeatStore((s) => s.runtime);
  const applyConfig = useRepeatStore((s) => s.applyConfig);
  const patchConfig = useRepeatStore((s) => s.patchConfig);
  const setRuntime = useRepeatStore((s) => s.setRuntime);
  const resetRuntime = useRepeatStore((s) => s.resetRuntime);
  const beginSession = useRepeatStore((s) => s.beginSession);

  const { isPlaying, playAyah, pause, toggleAyah, prefetchNextAyah, progress } =
    useAudio();
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const murotalEnabled = useUserStore((s) => s.settings.murotalEnabled);

  const tAudio = useTranslations('audio');
  const { isPlaybackBlocked, notifyIfPlaybackBlocked } = useAudioPlaybackGate(
    surahId,
    reciterId,
    activeAyah,
  );

  const pendingPlayConsumedRef = useRef<number | null>(null);

  /**
   * Saat offline, audio ayat tujuan hanya bisa diputar jika surat sudah `ready`
   * atau file ayat ada di cache (auto download saat play).
   */
  const ensureAyahPlayable = useCallback(
    async (targetSurahId: number, targetAyahNumber: number): Promise<boolean> => {
      const connectionStatus = useOfflineStore.getState().connectionStatus;
      const manifestKey = downloadManifestKey(targetSurahId, reciterId);
      const downloadStatus =
        useOfflineStore.getState().downloadStatuses[manifestKey];

      return canPlayAyahOffline(
        connectionStatus,
        downloadStatus,
        reciterId,
        targetSurahId,
        targetAyahNumber,
      );
    },
    [reciterId],
  );

  const isActiveAyahPlaying = useMemo(
    () =>
      isPlaying &&
      currentTrack?.surahId === surahId &&
      currentTrack?.ayahNumber === activeAyah,
    [isPlaying, currentTrack, surahId, activeAyah],
  );

  const audioProgress = isActiveAyahPlaying ? progress : 0;

  const playParams = useCallback(
    (ayahNumber: number): PlayAyahParams => ({
      surahId,
      ayahNumber,
      reciterId,
      totalAyahs,
      surahName,
    }),
    [surahId, reciterId, totalAyahs, surahName],
  );

  const advanceMurotal = useCallback(
    (murotal: ReturnType<typeof resolveMurotalAfterAyahEnd>) => {
      resetRuntime();

      switch (murotal.type) {
        case 'advance_ayah':
          setActiveAyah(murotal.ayahNumber);
          void playAyah(playParams(murotal.ayahNumber));
          break;
        case 'advance_surah': {
          void (async () => {
            // Lintas surat saat offline: berhenti jika audio surat berikutnya
            // belum tersedia offline (docs/30 §5).
            if (!(await ensureAyahPlayable(murotal.surahId, murotal.ayahNumber))) {
              pause();
              showAppToast(tAudio('offlineUnavailableToast'));
              return;
            }

            trackMurotalSurahComplete({
              surahId,
              nextSurahId: murotal.surahId,
            });
            void useUserStore
              .getState()
              .setLastViewed(murotal.surahId, murotal.ayahNumber);
            setPendingMurotalPlay(murotal.surahId, murotal.ayahNumber);
            const href =
              routeMode === 'surah'
                ? routes.surah(murotal.surahId, murotal.ayahNumber)
                : routes.focus(murotal.surahId, murotal.ayahNumber);
            router.replace(href);
          })();
          break;
        }
        case 'stop':
          if (murotal.reason === 'quran_complete') {
            trackMurotalQuranComplete({ surahId });
            onQuranComplete?.();
          }
          pause();
          break;
        default:
          break;
      }
    },
    [
      resetRuntime,
      setActiveAyah,
      playAyah,
      playParams,
      surahId,
      routeMode,
      router,
      onQuranComplete,
      pause,
      ensureAyahPlayable,
      tAudio,
    ],
  );

  const handleAyahEnded = useCallback(() => {
    const state = useRepeatStore.getState();
    const murotalEnabled = useUserStore.getState().settings.murotalEnabled;

    const result = computeNextOnAyahEnd({
      config: state.config,
      runtime: state.runtime,
      currentAyah: activeAyah,
      totalAyahs,
    });

    setRuntime(result.runtime);
    getRepeatTabSync()?.notifyCycleTick(result.runtime);

    if (
      result.action.type === 'replay' ||
      result.action.type === 'advance'
    ) {
      switch (result.action.type) {
        case 'replay':
          void playAyah(playParams(result.action.ayahNumber));
          break;
        case 'advance':
          setActiveAyah(result.action.ayahNumber);
          void playAyah(playParams(result.action.ayahNumber));
          break;
        default:
          break;
      }
      return;
    }

    if (!murotalEnabled) {
      pause();
      return;
    }

    const murotal = resolveMurotalAfterAyahEnd({
      surahId,
      currentAyah: activeAyah,
      totalAyahs,
    });
    advanceMurotal(murotal);
  }, [
    activeAyah,
    totalAyahs,
    surahId,
    setRuntime,
    playAyah,
    playParams,
    pause,
    setActiveAyah,
    advanceMurotal,
  ]);

  useAudioOnEnded(handleAyahEnded);

  useEffect(() => {
    if (pendingPlayConsumedRef.current === surahId) {
      return;
    }

    const pendingAyah = consumePendingMurotalPlay(surahId);
    if (pendingAyah === null) {
      return;
    }

    pendingPlayConsumedRef.current = surahId;
    setActiveAyah(pendingAyah);
    void playAyah(playParams(pendingAyah));
  }, [surahId, setActiveAyah, playAyah, playParams]);

  const togglePlayback = useCallback(async () => {
    if (notifyIfPlaybackBlocked()) {
      return;
    }

    const track = useAudioStore.getState().currentTrack;
    const currentTrackMatchesAyah =
      track?.surahId === surahId && track?.ayahNumber === activeAyah;
    const { isActive: runtimeIsActive } = useRepeatStore.getState().runtime;

    if (
      shouldBeginRepeatSession({
        isPlaying,
        currentTrackMatchesAyah,
        runtimeIsActive,
      })
    ) {
      beginSession();
    }

    await toggleAyah(playParams(activeAyah));
  }, [
    isPlaying,
    surahId,
    activeAyah,
    beginSession,
    toggleAyah,
    playParams,
    notifyIfPlaybackBlocked,
  ]);

  const navigateAyah = useCallback(
    (nextAyah: number) => {
      setActiveAyah(nextAyah);
      if (isPlaying) {
        void playAyah(playParams(nextAyah));
      }
    },
    [isPlaying, playAyah, playParams, setActiveAyah],
  );

  const trackNavParams = useMemo(
    () => ({
      surahId,
      currentAyah: activeAyah,
      totalAyahs,
      murotalEnabled,
    }),
    [surahId, activeAyah, totalAyahs, murotalEnabled],
  );

  const isPreviousDisabled = useMemo(
    () => isPlaybackTrackDisabled('previous', trackNavParams),
    [trackNavParams],
  );

  const isNextDisabled = useMemo(
    () => isPlaybackTrackDisabled('next', trackNavParams),
    [trackNavParams],
  );

  const applyPlaybackTrackStep = useCallback(
    (step: PlaybackTrackStep) => {
      if (step.type === 'none') {
        return;
      }

      resetRuntime();

      if (step.type === 'same_surah') {
        navigateAyah(step.ayahNumber);
        return;
      }

      const href =
        routeMode === 'surah'
          ? routes.surah(step.surahId, step.ayahNumber)
          : routes.focus(step.surahId, step.ayahNumber);

      // Berpindah surat untuk dibaca selalu boleh (teks tersedia offline).
      // Hanya saat sedang memutar audio kita cek ketersediaan offline.
      if (!isPlaying) {
        void useUserStore
          .getState()
          .setLastViewed(step.surahId, step.ayahNumber);
        router.replace(href);
        return;
      }

      void (async () => {
        if (!(await ensureAyahPlayable(step.surahId, step.ayahNumber))) {
          pause();
          showAppToast(tAudio('offlineUnavailableToast'));
          return;
        }
        void useUserStore
          .getState()
          .setLastViewed(step.surahId, step.ayahNumber);
        setPendingMurotalPlay(step.surahId, step.ayahNumber);
        router.replace(href);
      })();
    },
    [
      resetRuntime,
      navigateAyah,
      isPlaying,
      routeMode,
      router,
      pause,
      ensureAyahPlayable,
      tAudio,
    ],
  );

  const goToPreviousTrack = useCallback(() => {
    applyPlaybackTrackStep(
      resolvePlaybackTrackStep('previous', trackNavParams),
    );
  }, [applyPlaybackTrackStep, trackNavParams]);

  const goToNextTrack = useCallback(() => {
    applyPlaybackTrackStep(resolvePlaybackTrackStep('next', trackNavParams));
  }, [applyPlaybackTrackStep, trackNavParams]);

  useEffect(() => {
    return setMediaSessionTrackNavigation({
      onPreviousTrack: goToPreviousTrack,
      onNextTrack: goToNextTrack,
    });
  }, [goToPreviousTrack, goToNextTrack]);

  const handleCountChange = useCallback(
    (count: RepeatCount) => {
      void patchConfig({ count });
    },
    [patchConfig],
  );

  const handleApplyRepeatSettings = useCallback(
    (settings: RepeatSettingsConfig) => {
      void applyConfig(
        toRepeatConfig({
          repeatCount: settings.repeatCount,
          targetType: settings.targetType,
          fromAyah: settings.fromAyah,
          toAyah: settings.toAyah,
        }),
      );
    },
    [applyConfig],
  );

  const repeatStatusProps: RepeatStatusProps = useMemo(
    () => ({
      targetType: config.target,
      repeatCount: toRepeatCountValue(config.count),
      currentCycle: getDisplayCycle(runtime),
      activeAyah,
      totalAyahs,
      rangeFrom: config.range?.from,
      rangeTo: config.range?.to,
      surahName,
    }),
    [config, runtime, activeAyah, totalAyahs, surahName],
  );

  const showRepeatProgress = runtime.isActive;

  const prefetchCurrentNext = useCallback(
    () =>
      prefetchNextAyah({
        surahId,
        ayahNumber: activeAyah,
        reciterId,
        totalAyahs,
      }),
    [prefetchNextAyah, surahId, activeAyah, reciterId, totalAyahs],
  );

  return {
    isPlaying,
    isActiveAyahPlaying,
    audioProgress,
    togglePlayback,
    navigateAyah,
    goToPreviousTrack,
    goToNextTrack,
    isPreviousDisabled,
    isNextDisabled,
    prefetchNextAyah: prefetchCurrentNext,
    pause,
    repeatCount: toRepeatCountValue(config.count),
    repeatTarget: config.target,
    rangeFrom: config.range?.from,
    rangeTo: config.range?.to,
    repeatStatusProps,
    showRepeatProgress,
    handleCountChange,
    handleApplyRepeatSettings,
    isPlaybackBlocked,
    notifyIfPlaybackBlocked,
  };
}
