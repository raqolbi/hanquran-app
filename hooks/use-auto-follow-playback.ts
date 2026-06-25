'use client';

import { useEffect, useRef } from 'react';

import {
  AUTO_FOLLOW_SCROLL_RESUME_MS,
  getAutoFollowProgrammaticScrollClearDelay,
  getAutoFollowResumeTimestamp,
  getAyahElementId,
  getReadableViewport,
  measureSurahDetailTopInset,
  scrollAyahIntoReadableZone,
  shouldAutoFollowScroll,
} from '@/lib/auto-follow-playback';

interface UseAutoFollowPlaybackOptions {
  activeAyah: number;
  isPlaying: boolean;
  enabled: boolean;
  smoothAnimation: boolean;
  bottomInset: number;
}

/**
 * Menggulir layar agar ayat aktif tetap terlihat saat playback.
 * Spesifikasi: `docs/28-playback-settings.md`.
 */
export function useAutoFollowPlayback({
  activeAyah,
  isPlaying,
  enabled,
  smoothAnimation,
  bottomInset,
}: UseAutoFollowPlaybackOptions): void {
  const suspendedUntilRef = useRef(0);
  const isAutoScrollingRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const suspendAutoFollow = () => {
      if (isAutoScrollingRef.current) {
        return;
      }

      suspendedUntilRef.current = getAutoFollowResumeTimestamp();

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }

      resumeTimerRef.current = setTimeout(() => {
        suspendedUntilRef.current = 0;
        resumeTimerRef.current = null;
      }, AUTO_FOLLOW_SCROLL_RESUME_MS);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const scrollKeys = new Set([
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
      ]);

      if (scrollKeys.has(event.key)) {
        suspendAutoFollow();
      }
    };

    window.addEventListener('scroll', suspendAutoFollow, { passive: true });
    window.addEventListener('wheel', suspendAutoFollow, { passive: true });
    window.addEventListener('touchmove', suspendAutoFollow, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('scroll', suspendAutoFollow);
      window.removeEventListener('wheel', suspendAutoFollow);
      window.removeEventListener('touchmove', suspendAutoFollow);
      window.removeEventListener('keydown', onKeyDown);

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled || !isPlaying) {
      return;
    }

    const element = document.getElementById(getAyahElementId(activeAyah));
    const topInset = measureSurahDetailTopInset();
    const viewport = getReadableViewport(
      window.innerHeight,
      bottomInset,
      topInset,
    );

    if (
      !shouldAutoFollowScroll({
        enabled,
        isPlaying,
        suspendedUntil: suspendedUntilRef.current,
        element,
        viewport,
      })
    ) {
      return;
    }

    suspendedUntilRef.current = 0;
    isAutoScrollingRef.current = true;
    scrollAyahIntoReadableZone(element!, viewport, smoothAnimation);

    const clearFlagDelay =
      getAutoFollowProgrammaticScrollClearDelay(smoothAnimation);
    const timer = window.setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, clearFlagDelay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    activeAyah,
    bottomInset,
    enabled,
    isPlaying,
    smoothAnimation,
  ]);
}
