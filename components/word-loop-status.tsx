'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Repeat2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { stopWordLoop } from '@/services/word-loop-engine';
import { useWordLoopStore } from '@/stores/wordLoopStore';

interface WordLoopStatusProps {
  surahId: number;
  /** Tinggi kontrol audio di bawah layar — chip mengambang di atasnya. */
  bottomOffset: number;
}

/**
 * Chip status Ulang Kata (docs/38 §3.4): "Mengulang kata 3–5 · 7×" +
 * tombol Berhenti. Esc juga menghentikan. Pengumuman mulai/berhenti lewat
 * `aria-live` terpisah supaya hitungan pengulangan tidak dibacakan terus.
 */
export function WordLoopStatus({ surahId, bottomOffset }: WordLoopStatusProps) {
  const t = useTranslations('wordLoop');
  const loop = useWordLoopStore((s) => s.loop);
  const visible = !!loop && loop.surahId === surahId;

  const from = loop ? loop.range.from + 1 : 0;
  const to = loop ? loop.range.to : 0;
  const label = loop
    ? from === to
      ? t('statusSingle', { word: from })
      : t('statusRange', { from, to })
    : '';

  // Diumumkan saat rentang berganti / berhenti — bukan tiap pengulangan.
  // (Pola "sesuaikan state saat render" — tanpa efek.)
  const announceKey = visible ? label : '';
  const [lastAnnounceKey, setLastAnnounceKey] = useState(announceKey);
  const [announcement, setAnnouncement] = useState('');
  if (announceKey !== lastAnnounceKey) {
    setLastAnnounceKey(announceKey);
    setAnnouncement(announceKey || t('stopped'));
  }

  // Kata yang diulang tidak boleh tertutup chip (mis. dimulai dengan ketukan,
  // saat auto follow sedang ditangguhkan karena sentuhan).
  const chipRef = useRef<HTMLDivElement>(null);
  const rangeKey = loop ? `${loop.ayahNumber}:${loop.range.from}-${loop.range.to}` : '';
  useEffect(() => {
    if (!visible) return;
    const frame = window.requestAnimationFrame(() => {
      const chip = chipRef.current?.getBoundingClientRect();
      if (!chip) return;
      let bottom = 0;
      document.querySelectorAll<HTMLElement>('[data-loop="true"]').forEach((word) => {
        bottom = Math.max(bottom, word.getBoundingClientRect().bottom);
      });
      const overlap = bottom - (chip.top - 12);
      if (bottom > 0 && overlap > 0) {
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        window.scrollBy({ top: overlap + 8, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [visible, rangeKey]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      // Esc milik dialog/menu yang sedang terbuka (gerbang tersembunyi tetap di DOM).
      const overlayOpen = [
        ...document.querySelectorAll<HTMLElement>(
          '[role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"]',
        ),
      ].some((el) =>
        typeof el.checkVisibility === 'function'
          ? el.checkVisibility()
          : el.offsetParent !== null,
      );
      if (overlayOpen) return;
      stopWordLoop('user');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible]);

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <AnimatePresence>
        {visible && loop ? (
          <motion.div
            key="word-loop-status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4"
            style={{ bottom: `calc(${bottomOffset}px + 0.75rem)` }}
          >
            <div
              ref={chipRef}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50/95 py-1.5 pl-3 pr-1.5 text-sm text-amber-950 shadow-md backdrop-blur-sm"
            >
              <Repeat2 size={16} aria-hidden="true" className="shrink-0 text-amber-600" />
              <span className="font-medium">{label}</span>
              {loop.cycles > 0 || loop.phase !== 'playing' ? (
                <span className="tabular-nums text-amber-800/80">
                  {[
                    loop.cycles > 0 ? t('cycles', { count: loop.cycles }) : null,
                    loop.phase === 'gap'
                      ? t('phaseGap')
                      : loop.phase === 'paused'
                        ? t('phasePaused')
                        : null,
                  ]
                    .filter(Boolean)
                    .map((part) => `· ${part}`)
                    .join(' ')}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => stopWordLoop('user')}
                className="ml-1 inline-flex min-h-8 items-center gap-1 rounded-full bg-white px-3 text-xs font-semibold text-amber-900 shadow-sm ring-1 ring-amber-300 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                aria-label={t('stopAriaLabel')}
              >
                <X size={14} aria-hidden="true" />
                {t('stop')}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
