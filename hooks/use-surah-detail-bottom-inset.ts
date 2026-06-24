'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import {
  SURAH_DETAIL_MIN_SCROLL_INSET,
  SURAH_DETAIL_READING_COMFORT_GAP,
  SURAH_DETAIL_REPEAT_ABOVE_AUDIO_GAP,
  SURAH_DETAIL_AUDIO_MIN_HEIGHT,
} from '@/lib/surah-detail-chrome';

interface UseSurahDetailBottomInsetOptions {
  /** Ukur hanya setelah chrome (audio + repeat) benar-benar di DOM. */
  enabled: boolean;
  /** Paksa ukur ulang saat konten chrome berubah (repeat status, dll.). */
  remeasureKey?: string;
}

function measureChromeInset(
  audioEl: HTMLElement | null,
  repeatEl: HTMLElement | null,
): number {
  if (typeof window === 'undefined') {
    return SURAH_DETAIL_MIN_SCROLL_INSET;
  }

  let obstructionFromBottom = SURAH_DETAIL_AUDIO_MIN_HEIGHT;

  if (audioEl) {
    const audioRect = audioEl.getBoundingClientRect();
    obstructionFromBottom = Math.max(
      obstructionFromBottom,
      window.innerHeight - audioRect.top,
    );
  }

  if (repeatEl) {
    const repeatRect = repeatEl.getBoundingClientRect();
    obstructionFromBottom = Math.max(
      obstructionFromBottom,
      window.innerHeight - repeatRect.top,
    );
  }

  return Math.max(
    obstructionFromBottom + SURAH_DETAIL_READING_COMFORT_GAP,
    SURAH_DETAIL_MIN_SCROLL_INSET,
  );
}

/**
 * Mengukur tinggi chrome bawah (audio + repeat) untuk padding scroll aman.
 * Memakai posisi viewport aktual + ResizeObserver.
 */
export function useSurahDetailBottomInset({
  enabled,
  remeasureKey = '',
}: UseSurahDetailBottomInsetOptions) {
  const audioRef = useRef<HTMLDivElement | null>(null);
  const repeatRef = useRef<HTMLDivElement | null>(null);

  const [bottomInset, setBottomInset] = useState(SURAH_DETAIL_MIN_SCROLL_INSET);
  const [repeatPanelBottom, setRepeatPanelBottom] = useState(
    SURAH_DETAIL_AUDIO_MIN_HEIGHT + SURAH_DETAIL_REPEAT_ABOVE_AUDIO_GAP,
  );
  const [audioChromeHeight, setAudioChromeHeight] = useState(
    SURAH_DETAIL_AUDIO_MIN_HEIGHT,
  );

  const measure = useCallback(() => {
    const audioEl = audioRef.current;
    const repeatEl = repeatRef.current;

    if (audioEl) {
      const audioHeight = audioEl.offsetHeight;
      setAudioChromeHeight(audioHeight);
      setRepeatPanelBottom(
        audioHeight + SURAH_DETAIL_REPEAT_ABOVE_AUDIO_GAP,
      );
    }

    setBottomInset(measureChromeInset(audioEl, repeatEl));
  }, []);

  useLayoutEffect(() => {
    if (!enabled) return;

    measure();

    const raf = requestAnimationFrame(() => {
      measure();
    });

    const ro = new ResizeObserver(() => {
      measure();
    });

    const audioEl = audioRef.current;
    const repeatEl = repeatRef.current;

    if (audioEl) ro.observe(audioEl);
    if (repeatEl) ro.observe(repeatEl);

    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, [enabled, remeasureKey, measure]);

  return {
    bottomInset,
    repeatPanelBottom,
    audioChromeHeight,
    audioRef,
    repeatRef,
  };
}
