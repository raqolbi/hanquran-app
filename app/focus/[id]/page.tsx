'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { AyahWordHighlight } from '@/components/ayah-word-highlight';
import { FocusModePlayer } from '@/components/focus-mode-player';
import { RepeatStatus } from '@/components/repeat-status';
import {
  RepeatSettingsDialog,
  type RepeatSettingsConfig,
} from '@/components/repeat-settings-dialog';
import {
  INFINITE,
  getRepeatOption,
  type RepeatCount,
  type RepeatTarget,
} from '@/lib/repeat-options';
import { routes } from '@/lib/routes';
import { useSurah } from '@/hooks/use-surah';

interface FocusModePageProps {
  params: Promise<{ id: string }>;
}

const WORD_INTERVAL_MS = 700;

export default function FocusModePage({ params }: FocusModePageProps) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const startAyah = parseInt(searchParams.get('ayah') ?? '1', 10);

  const { surah, loading, error } = useSurah(resolvedParams.id);
  const totalAyahs = surah?.ayahs.length ?? 0;

  const [activeAyah, setActiveAyah] = useState(startAyah);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [repeatCount, setRepeatCount] = useState<RepeatCount>(5);
  const [repeatTarget, setRepeatTarget] =
    useState<RepeatTarget>('current_ayah');
  const [rangeFrom, setRangeFrom] = useState<number | undefined>(undefined);
  const [rangeTo, setRangeTo] = useState<number | undefined>(undefined);
  const [currentCycle, setCurrentCycle] = useState(1);

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (surah) {
      setActiveAyah(Math.min(Math.max(startAyah, 1), surah.ayahs.length));
    }
  }, [surah, startAyah]);

  const currentAyah = useMemo(
    () => surah?.ayahs.find((a) => a.number === activeAyah) ?? surah?.ayahs[0],
    [surah, activeAyah],
  );
  const words = useMemo(
    () => (currentAyah ? currentAyah.arabic.trim().split(/\s+/) : []),
    [currentAyah],
  );

  const handleAyahCompleted = () => {
    if (!surah) return;

    if (repeatTarget === 'current_ayah') {
      setCurrentCycle((c) => {
        const next = c + 1;
        if (repeatCount !== INFINITE && next > repeatCount) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
      return;
    }

    if (repeatTarget === 'ayah_range') {
      const from = rangeFrom ?? 1;
      const to = rangeTo ?? surah.ayahs.length;
      setActiveAyah((current) => {
        if (current >= to) {
          setCurrentCycle((c) => {
            const next = c + 1;
            if (repeatCount !== INFINITE && next > repeatCount) {
              setIsPlaying(false);
              return 1;
            }
            return next;
          });
          return from;
        }
        return current + 1;
      });
      return;
    }

    setActiveAyah((current) => {
      if (current >= surah.ayahs.length) {
        setCurrentCycle((c) => {
          const next = c + 1;
          if (repeatCount !== INFINITE && next > repeatCount) {
            setIsPlaying(false);
            return 1;
          }
          return next;
        });
        return 1;
      }
      return current + 1;
    });
  };

  useEffect(() => {
    setActiveWordIndex(0);
  }, [activeAyah]);

  useEffect(() => {
    if (!isPlaying || words.length === 0) return;
    const id = setInterval(() => {
      setActiveWordIndex((prev) => {
        if (prev + 1 >= words.length) {
          queueMicrotask(handleAyahCompleted);
          return 0;
        }
        return prev + 1;
      });
    }, WORD_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, words.length, repeatTarget, repeatCount, rangeFrom, rangeTo, surah]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat Mode Fokus...</p>
      </div>
    );
  }

  if (error || !surah || !currentAyah) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center px-4">
        <p className="text-destructive text-center">{error ?? 'Surat tidak ditemukan.'}</p>
      </div>
    );
  }

  const repeatOption = getRepeatOption(repeatCount);

  const progressPercent =
    words.length > 1 ? (activeWordIndex / (words.length - 1)) * 100 : 0;

  const handleExit = () => {
    router.push(routes.surah(resolvedParams.id, activeAyah));
  };

  const handlePrevAyah = () => {
    setActiveAyah((a) => Math.max(1, a - 1));
    setCurrentCycle(1);
  };

  const handleNextAyah = () => {
    setActiveAyah((a) => Math.min(totalAyahs, a + 1));
    setCurrentCycle(1);
  };

  const handleApplyRepeat = (config: RepeatSettingsConfig) => {
    setRepeatCount(config.repeatCount);
    setRepeatTarget(config.targetType);
    setRangeFrom(config.fromAyah);
    setRangeTo(config.toAyah);
    setCurrentCycle(1);
  };

  return (
    <div className="relative min-h-dvh flex flex-col bg-background">
      {/* Subtle emerald tint overlay - non-interactive */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-emerald-50/40"
      />

      {/* Top Bar */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6"
      >
        <button
          type="button"
          onClick={handleExit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white/80 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Keluar dari Mode Fokus"
        >
          <X size={16} />
          <span>Keluar</span>
        </button>

        <p className="text-sm font-semibold text-foreground">
          Ayat {activeAyah} / {totalAyahs}
        </p>
      </motion.header>

      {/* Arabic Text - dominant area */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAyah}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-3xl text-center"
          >
            <p
              dir="rtl"
              className="font-serif text-foreground"
              style={{
                fontSize: 'clamp(3rem, 7vw, 3.5rem)',
                lineHeight: 1.9,
              }}
            >
              {words.map((word, index) => (
                <AyahWordHighlight
                  key={`${activeAyah}-${index}`}
                  word={word}
                  isActive={index === activeWordIndex && isPlaying}
                />
              ))}
            </p>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Controls */}
      <motion.footer
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
        className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-6 sm:px-8 sm:pb-10"
      >
        {/* Progress + Play/Pause only (per wireframe) */}
        <FocusModePlayer
          isPlaying={isPlaying}
          progress={progressPercent}
          onPlayPause={() => setIsPlaying((v) => !v)}
        />

        {/* Repeat Label + Chip */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-foreground">Repeat</span>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 h-10 text-sm font-medium transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isPlaying
                ? 'border-transparent bg-primary text-white'
                : 'border-border bg-white text-foreground hover:border-primary/40',
            )}
            aria-label="Buka Pengaturan Repeat"
          >
            <span className="text-base leading-none">{repeatOption.emoji}</span>
            <span>{repeatOption.label}</span>
            <ChevronDown size={16} className="opacity-70" />
          </button>
        </div>

        {/* Repeat Status - 3 variants (current_ayah, ayah_range, entire_surah) */}
        <div className="mt-4">
          <RepeatStatus
            targetType={repeatTarget}
            repeatCount={repeatCount}
            currentCycle={currentCycle}
            activeAyah={activeAyah}
            totalAyahs={totalAyahs}
            rangeFrom={rangeFrom}
            rangeTo={rangeTo}
            surahName={surah.englishName}
          />
        </div>

        {/* Tombol Ayat Sebelum / Ayat Berikut */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handlePrevAyah}
            disabled={activeAyah <= 1}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft size={16} />
            Ayat Sebelum
          </button>
          <button
            type="button"
            onClick={handleNextAyah}
            disabled={activeAyah >= totalAyahs}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ayat Berikut
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.footer>

      {/* Repeat Settings Dialog (shared with Surah Detail) */}
      <RepeatSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        repeatCount={repeatCount}
        targetType={repeatTarget}
        fromAyah={rangeFrom}
        toAyah={rangeTo}
        currentAyah={activeAyah}
        totalAyahs={totalAyahs}
        surahName={surah.englishName}
        onApply={handleApplyRepeat}
      />
    </div>
  );
}
