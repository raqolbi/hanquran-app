'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import {
  SURAH_DETAIL_MIN_SCROLL_INSET,
  SURAH_DETAIL_READING_COMFORT_GAP,
  SURAH_DETAIL_AUDIO_MIN_HEIGHT,
} from '@/lib/surah-detail-chrome';

interface UseSurahDetailBottomInsetOptions {
  /** Ukur hanya setelah chrome audio benar-benar di DOM. */
  enabled: boolean;
  /** Paksa ukur ulang saat konten chrome berubah (repeat status, dll.). */
  remeasureKey?: string;
}

function measureChromeInset(audioEl: HTMLElement | null): number {
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

  return Math.max(
    obstructionFromBottom + SURAH_DETAIL_READING_COMFORT_GAP,
    SURAH_DETAIL_MIN_SCROLL_INSET,
  );
}

/**
 * Mengukur tinggi chrome bawah (audio + repeat inline) untuk padding scroll aman.
 * Memakai posisi viewport aktual + ResizeObserver.
 */
export function useSurahDetailBottomInset({
  enabled,
  remeasureKey = '',
}: UseSurahDetailBottomInsetOptions) {
  const audioRef = useRef<HTMLDivElement | null>(null);

  const [bottomInset, setBottomInset] = useState(SURAH_DETAIL_MIN_SCROLL_INSET);
  const [audioChromeHeight, setAudioChromeHeight] = useState(
    SURAH_DETAIL_AUDIO_MIN_HEIGHT,
  );

  const measure = useCallback(() => {
    const audioEl = audioRef.current;

    if (audioEl) {
      setAudioChromeHeight(audioEl.offsetHeight);
    }

    setBottomInset(measureChromeInset(audioEl));
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

    if (audioEl) ro.observe(audioEl);

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
    audioChromeHeight,
    audioRef,
  };
}
