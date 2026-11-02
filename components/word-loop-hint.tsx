'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { NativeAwareLink } from '@/components/native-aware-link';
import { markHintSeen, useHintSeen } from '@/lib/onboarding-hints';
import { routes } from '@/lib/routes';
import { useAudioStore } from '@/stores/audioStore';
import { useWordLoopStore } from '@/stores/wordLoopStore';

/** Jeda setelah audio mulai — biarkan pengguna mendengar dulu. */
const SHOW_DELAY_MS = 1500;

interface WordLoopHintProps {
  surahId: number;
  /** Ulang Kata tersedia (qari punya data waktu kata). */
  available: boolean;
  /** Tinggi kontrol audio — petunjuk mengambang di atasnya. */
  bottomOffset: number;
}

/**
 * Petunjuk sekali tampil untuk Ulang Kata (gestur yang tidak terlihat):
 * muncul saat pertama kali audio diputar dengan qari yang mendukung, tidak
 * menghalangi tilawah, hilang setelah "Mengerti" atau begitu Ulang Kata
 * dipakai.
 */
export function WordLoopHint({ surahId, available, bottomOffset }: WordLoopHintProps) {
  const t = useTranslations('wordLoop');
  const seen = useHintSeen('word-loop');
  const playingHere = useAudioStore(
    (s) => s.isPlaying && s.currentTrack?.surahId === surahId,
  );
  const loopActive = useWordLoopStore((s) => s.loop !== null);
  const [ready, setReady] = useState(false);

  const eligible = available && !seen && !loopActive;

  // Sudah memakai Ulang Kata → petunjuk tidak perlu lagi.
  useEffect(() => {
    if (loopActive) markHintSeen('word-loop');
  }, [loopActive]);

  useEffect(() => {
    if (!eligible || !playingHere || ready) return;
    const timer = setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [eligible, playingHere, ready]);

  const visible = eligible && ready;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="word-loop-hint"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4"
          style={{ bottom: `calc(${bottomOffset}px + 0.75rem)` }}
        >
          <div
            role="note"
            aria-live="polite"
            className="pointer-events-auto w-full max-w-md rounded-2xl border border-emerald-200 bg-white/95 p-3 text-sm shadow-lg backdrop-blur-sm"
          >
            <div className="flex gap-2.5">
              <Lightbulb size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-500" />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold text-foreground">{t('hintTitle')}</p>
                <p className="leading-snug text-muted-foreground">{t('hintBody')}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <NativeAwareLink
                href={routes.settingsHelp()}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('hintHelpLink')}
              </NativeAwareLink>
              <button
                type="button"
                onClick={() => markHintSeen('word-loop')}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t('hintDismiss')}
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
