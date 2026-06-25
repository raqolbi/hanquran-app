'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { useAudio, useAudioOnEnded } from '@/hooks/use-audio';
import type { PlayAyahParams } from '@/hooks/use-audio';
import type { RepeatSettingsConfig } from '@/components/repeat-settings-dialog';
import {
  REPEAT_OPTIONS,
  type RepeatCount,
} from '@/lib/repeat-options';
import {
  computeNextOnAyahEnd,
  getDisplayCycle,
  shouldBeginRepeatSession,
  toRepeatConfig,
} from '@/services/repeat-engine';
import { getRepeatTabSync } from '@/services/repeat-tab-sync';
import { setMediaSessionTrackNavigation } from '@/services/media-session';
import { useAudioStore } from '@/stores/audioStore';
import { useRepeatStore } from '@/stores/repeatStore';
import type { RepeatStatusProps } from '@/components/repeat-status';

function toRepeatCountValue(count: number): RepeatCount {
  const match = REPEAT_OPTIONS.find((option) => option.value === count);
  return (match?.value ?? 5) as RepeatCount;
}

export interface UseSurahRepeatPlaybackParams {
  surahId: number;
  activeAyah: number;
  totalAyahs: number;
  reciterId: string;
  surahName: string;
  setActiveAyah: (ayah: number) => void;
}

export function useSurahRepeatPlayback({
  surahId,
  activeAyah,
  totalAyahs,
  reciterId,
  surahName,
  setActiveAyah,
}: UseSurahRepeatPlaybackParams) {
  const config = useRepeatStore((s) => s.config);
  const runtime = useRepeatStore((s) => s.runtime);
  const applyConfig = useRepeatStore((s) => s.applyConfig);
  const patchConfig = useRepeatStore((s) => s.patchConfig);
  const setRuntime = useRepeatStore((s) => s.setRuntime);
  const beginSession = useRepeatStore((s) => s.beginSession);

  const { isPlaying, playAyah, pause, toggleAyah, prefetchNextAyah, progress } =
    useAudio();
  const currentTrack = useAudioStore((s) => s.currentTrack);

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

  const handleAyahEnded = useCallback(() => {
    const state = useRepeatStore.getState();
    const result = computeNextOnAyahEnd({
      config: state.config,
      runtime: state.runtime,
      currentAyah: activeAyah,
      totalAyahs,
    });

    setRuntime(result.runtime);
    getRepeatTabSync()?.notifyCycleTick(result.runtime);

    switch (result.action.type) {
      case 'replay':
        void playAyah(playParams(result.action.ayahNumber));
        break;
      case 'advance':
        setActiveAyah(result.action.ayahNumber);
        void playAyah(playParams(result.action.ayahNumber));
        break;
      case 'stop':
        pause();
        break;
      default:
        break;
    }
  }, [activeAyah, totalAyahs, setRuntime, playAyah, playParams, pause, setActiveAyah]);

  useAudioOnEnded(handleAyahEnded);

  const togglePlayback = useCallback(async () => {
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

  useEffect(() => {
    return setMediaSessionTrackNavigation({
      onPreviousTrack: () => {
        if (activeAyah > 1) {
          navigateAyah(activeAyah - 1);
        }
      },
      onNextTrack: () => {
        if (activeAyah < totalAyahs) {
          navigateAyah(activeAyah + 1);
        }
      },
    });
  }, [activeAyah, totalAyahs, navigateAyah]);

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

  const showRepeatStatus = runtime.isActive && isPlaying;

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
    prefetchNextAyah: prefetchCurrentNext,
    pause,
    repeatCount: toRepeatCountValue(config.count),
    repeatTarget: config.target,
    rangeFrom: config.range?.from,
    rangeTo: config.range?.to,
    repeatStatusProps,
    showRepeatStatus,
    handleCountChange,
    handleApplyRepeatSettings,
  };
}
