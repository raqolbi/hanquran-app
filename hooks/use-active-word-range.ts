'use client';

import { useEffect, useRef, useState } from 'react';

import {
  findActiveWordRange,
  hasWordTimings,
  loadSurahWordTimings,
  type SurahWordTimings,
  type WordRange,
} from '@/services/quran/word-timings';
import { useAudioStore } from '@/stores/audioStore';

interface UseActiveWordRangeInput {
  surahId: number;
  ayahNumber: number;
  reciterId: string;
  /** Pengaturan pengguna `settings.wordHighlight`. */
  enabled: boolean;
}

interface UseActiveWordRangeResult {
  /** Ada data waktu untuk qari ini (dan fitur aktif). */
  available: boolean;
  /** Kata yang sedang dibaca pada ayat `ayahNumber`, atau `null`. */
  range: WordRange | null;
}

/** Batas interpolasi tanpa update posisi dari audio (hindari sorotan "lari"). */
const MAX_EXTRAPOLATION_MS = 600;

function sameRange(a: WordRange | null, b: WordRange | null): boolean {
  return a === b || (!!a && !!b && a.from === b.from && a.to === b.to);
}

/**
 * Sorot kata yang sedang dibaca qari.
 *
 * Posisi audio diambil dari `useAudioStore.currentTime` (diperbarui
 * `timeupdate` web ±4×/detik atau listener audio native), lalu
 * diinterpolasi per frame (`requestAnimationFrame`) memakai `playbackRate`
 * agar perpindahan kata halus di web maupun Android.
 */
export function useActiveWordRange({
  surahId,
  ayahNumber,
  reciterId,
  enabled,
}: UseActiveWordRangeInput): UseActiveWordRangeResult {
  const available = enabled && hasWordTimings(reciterId);
  const [timings, setTimings] = useState<SurahWordTimings | null>(null);
  const [range, setRange] = useState<WordRange | null>(null);

  useEffect(() => {
    if (!available) {
      setTimings(null);
      return;
    }

    let cancelled = false;
    void loadSurahWordTimings(reciterId, surahId).then((result) => {
      if (!cancelled) setTimings(result);
    });
    return () => {
      cancelled = true;
    };
  }, [available, reciterId, surahId]);

  const anchorRef = useRef({ seconds: 0, at: 0 });

  useEffect(() => {
    const segments = timings?.[ayahNumber];
    if (!available || !segments) {
      setRange(null);
      return;
    }

    let frame = 0;

    const tracksThisAyah = () => {
      const track = useAudioStore.getState().currentTrack;
      return (
        !!track &&
        track.surahId === surahId &&
        track.ayahNumber === ayahNumber &&
        track.reciterId === reciterId
      );
    };

    const update = () => {
      const state = useAudioStore.getState();
      if (!tracksThisAyah()) {
        setRange((prev) => (prev === null ? prev : null));
        return;
      }

      let seconds = state.currentTime;
      if (state.isPlaying) {
        const elapsed = Math.min(
          performance.now() - anchorRef.current.at,
          MAX_EXTRAPOLATION_MS,
        );
        seconds = anchorRef.current.seconds + (elapsed / 1000) * state.playbackRate;
      }

      // Diam di awal ayat (belum diputar) → jangan sorot apa pun.
      const next =
        !state.isPlaying && state.currentTime <= 0
          ? null
          : findActiveWordRange(segments, seconds * 1000);
      setRange((prev) => (sameRange(prev, next) ? prev : next));
    };

    const loop = () => {
      update();
      if (useAudioStore.getState().isPlaying) {
        frame = window.requestAnimationFrame(loop);
      } else {
        frame = 0;
      }
    };

    const anchor = (currentTime: number) => {
      anchorRef.current = { seconds: currentTime, at: performance.now() };
    };

    anchor(useAudioStore.getState().currentTime);
    loop();

    const unsubscribe = useAudioStore.subscribe((state, prev) => {
      if (state.currentTime !== prev.currentTime) anchor(state.currentTime);
      if (state.isPlaying !== prev.isPlaying) anchor(state.currentTime);
      if (state.isPlaying && frame === 0) {
        frame = window.requestAnimationFrame(loop);
      } else if (!state.isPlaying) {
        update();
      } else if (state.currentTrack !== prev.currentTrack) {
        update();
      }
    });

    return () => {
      unsubscribe();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [available, timings, surahId, ayahNumber, reciterId]);

  return { available: available && !!timings?.[ayahNumber], range };
}
