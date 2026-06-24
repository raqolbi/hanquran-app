'use client';

import { useCallback, useEffect, useMemo } from 'react';

import {
  getAudioController,
  type AudioEndedHandler,
} from '@/services/audio-controller';
import { usePreferredReciterId } from '@/hooks/use-preferred-reciter';
import {
  buildAyahAudioUrl,
  getNextAyahPrefetchUrl,
} from '@/services/quran';
import { useAudioStore } from '@/stores/audioStore';
import type { AudioTrack, PlaybackRate } from '@/types';

export interface PlayAyahParams {
  surahId: number;
  ayahNumber: number;
  reciterId?: string;
  /** Jumlah ayat surat — dipakai untuk prefetch ayat berikutnya. */
  totalAyahs?: number;
}

function prefetchNextAyahUrl(
  params: PlayAyahParams,
  fallbackReciterId: string,
): void {
  if (!params.totalAyahs) return;

  const reciterId = params.reciterId ?? fallbackReciterId;
  const url = getNextAyahPrefetchUrl(
    reciterId,
    params.surahId,
    params.ayahNumber,
    params.totalAyahs,
  );

  if (url) {
    getAudioController()?.prefetch([url]);
  }
}

function buildTrack(
  {
    surahId,
    ayahNumber,
    reciterId,
  }: PlayAyahParams,
  fallbackReciterId: string,
): AudioTrack {
  const resolvedReciterId = reciterId ?? fallbackReciterId;
  return {
    surahId,
    ayahNumber,
    reciterId: resolvedReciterId,
    url: buildAyahAudioUrl(resolvedReciterId, surahId, ayahNumber),
  };
}

/**
 * Hook pemutaran audio — state dari `useAudioStore`, perintah via `AudioController`.
 * Spesifikasi: `docs/15-state-management.md` (Bagian 10).
 */
export function useAudio() {
  const preferredReciterId = usePreferredReciterId();
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const playbackRate = useAudioStore((s) => s.playbackRate);
  const error = useAudioStore((s) => s.error);

  useEffect(() => {
    getAudioController();
  }, []);

  const progress = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  const play = useCallback(
    async (track: AudioTrack) => {
      await getAudioController()?.play(track);
    },
    [],
  );

  const playAyah = useCallback(
    async (params: PlayAyahParams) => {
      await getAudioController()?.play(buildTrack(params, preferredReciterId));
      prefetchNextAyahUrl(params, preferredReciterId);
    },
    [preferredReciterId],
  );

  const pause = useCallback(() => {
    getAudioController()?.pause();
  }, []);

  const resume = useCallback(async () => {
    await getAudioController()?.resume();
  }, []);

  const toggle = useCallback(async (track: AudioTrack) => {
    await getAudioController()?.toggle(track);
  }, []);

  const toggleAyah = useCallback(
    async (params: PlayAyahParams) => {
      await getAudioController()?.toggle(buildTrack(params, preferredReciterId));
      prefetchNextAyahUrl(params, preferredReciterId);
    },
    [preferredReciterId],
  );

  const prefetchNextAyah = useCallback(
    (params: PlayAyahParams & { totalAyahs: number }) => {
      prefetchNextAyahUrl(params, preferredReciterId);
    },
    [preferredReciterId],
  );

  const seek = useCallback((seconds: number) => {
    getAudioController()?.seek(seconds);
  }, []);

  const setPlaybackRate = useCallback((rate: PlaybackRate) => {
    getAudioController()?.setPlaybackRate(rate);
  }, []);

  const onEnded = useCallback((handler: AudioEndedHandler) => {
    const controller = getAudioController();
    if (!controller) return () => {};
    return controller.onEnded(handler);
  }, []);

  const isCurrentAyah = useCallback(
    (surahId: number, ayahNumber: number) =>
      currentTrack?.surahId === surahId &&
      currentTrack?.ayahNumber === ayahNumber,
    [currentTrack],
  );

  return {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    playbackRate,
    progress,
    error,
    play,
    playAyah,
    pause,
    resume,
    toggle,
    toggleAyah,
    prefetchNextAyah,
    seek,
    setPlaybackRate,
    onEnded,
    isCurrentAyah,
  };
}

/**
 * Langganan event ayat selesai — wrapper `useEffect` untuk `onEnded`.
 */
export function useAudioOnEnded(handler: AudioEndedHandler): void {
  const { onEnded } = useAudio();

  useEffect(() => onEnded(handler), [handler, onEnded]);
}
