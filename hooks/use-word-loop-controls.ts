'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';

import type { WordLoopHandlers } from '@/components/quran-ayah-text';
import { buildTrack } from '@/hooks/use-audio';
import { showAppToast } from '@/lib/app-toast';
import { isWordInRange, normalizeWordRange, resolveWordClip } from '@/services/quran/word-clip';
import {
  hasWordTimings,
  loadSurahWordTimings,
  type WordRange,
} from '@/services/quran/word-timings';
import { startWordLoop, stopWordLoop } from '@/services/word-loop-engine';
import { useWordLoopStore } from '@/stores/wordLoopStore';

interface UseWordLoopControlsInput {
  surahId: number;
  surahName: string;
  /** Ayat aktif — hanya kata di ayat ini yang bisa diketuk. */
  activeAyah: number;
  reciterId: string;
  /** Cek offline/izin putar (useAudioPlaybackGate) — `true` = diblokir. */
  notifyIfPlaybackBlocked: () => boolean;
}

/**
 * Penghubung UI ↔ mesin Ulang Kata (docs/38 §3): ketuk kata, Shift+ketuk,
 * dan rentang hasil seret. Juga menghentikan mode saat ayat aktif/qari
 * berganti atau halaman ditinggalkan.
 */
export function useWordLoopControls({
  surahId,
  surahName,
  activeAyah,
  reciterId,
  notifyIfPlaybackBlocked,
}: UseWordLoopControlsInput): WordLoopHandlers | undefined {
  const t = useTranslations('wordLoop');
  /** Kata pertama yang diketuk — titik tetap untuk Shift+ketuk. */
  const anchorRef = useRef<number | null>(null);
  const available = hasWordTimings(reciterId);

  const startRange = useCallback(
    async (range: WordRange) => {
      if (notifyIfPlaybackBlocked()) return;

      const timings = await loadSurahWordTimings(reciterId, surahId);
      const clip = resolveWordClip(timings?.[activeAyah], range);
      if (!clip) {
        showAppToast(t(timings ? 'unavailableAyah' : 'loadFailed'));
        return;
      }

      const ok = await startWordLoop({
        track: buildTrack({ surahId, ayahNumber: activeAyah, reciterId, surahName }, reciterId),
        clip,
      });
      if (!ok) showAppToast(t('playFailed'));
    },
    [notifyIfPlaybackBlocked, reciterId, surahId, activeAyah, surahName, t],
  );

  const onTap = useCallback(
    (index: number, extend: boolean) => {
      const loop = useWordLoopStore.getState().loop;
      const sameAyah =
        !!loop && loop.surahId === surahId && loop.ayahNumber === activeAyah;

      if (extend && sameAyah && anchorRef.current !== null) {
        const range = normalizeWordRange(anchorRef.current, index);
        if (range) void startRange(range);
        return;
      }

      if (sameAyah && isWordInRange(loop.range, index)) {
        anchorRef.current = null;
        stopWordLoop('user');
        return;
      }

      anchorRef.current = index;
      void startRange({ from: index, to: index + 1 });
    },
    [surahId, activeAyah, startRange],
  );

  const onRange = useCallback(
    (anchor: number, current: number) => {
      const range = normalizeWordRange(anchor, current);
      if (!range) return;
      anchorRef.current = Math.min(anchor, current);
      void startRange(range);
    },
    [startRange],
  );

  // Pindah ayat / ganti qari → hentikan (docs/38 §4.4).
  useEffect(() => {
    const loop = useWordLoopStore.getState().loop;
    if (
      loop &&
      (loop.surahId !== surahId ||
        loop.ayahNumber !== activeAyah ||
        loop.reciterId !== reciterId)
    ) {
      anchorRef.current = null;
      stopWordLoop('navigation');
    }
  }, [surahId, activeAyah, reciterId]);

  // Tinggalkan halaman → hentikan.
  useEffect(() => () => stopWordLoop('navigation'), []);

  return useMemo(
    () => (available ? { onTap, onRange } : undefined),
    [available, onTap, onRange],
  );
}
