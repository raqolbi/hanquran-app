'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ChevronDown,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
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
import { useAudio } from '@/hooks/use-audio';
import { usePreferredReciterId } from '@/hooks/use-preferred-reciter';
import { useSurah } from '@/hooks/use-surah';
import { useReadingDisplay } from '@/hooks/use-reading-display';
import { DataLoadErrorFallback } from '@/components/shared/ErrorFallback';

interface FocusModePageProps {
  params: Promise<{ id: string }>;
}

export default function FocusModePage({ params }: FocusModePageProps) {
  const t = useTranslations('errors');
  const tLoading = useTranslations('loading');
  const tFocus = useTranslations('focus');
  const tRepeat = useTranslations('repeat');
  const tCommon = useTranslations('common');
  const resolvedParams = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const startAyah = parseInt(searchParams.get('ayah') ?? '1', 10);

  const { surah, loading, error, retry } = useSurah(resolvedParams.id);
  const { showTranslation, showTransliteration } = useReadingDisplay();
  const reciterId = usePreferredReciterId();
  const {
    isPlaying,
    progress,
    toggleAyah,
    playAyah,
    isCurrentAyah,
    prefetchNextAyah,
  } = useAudio();
  const totalAyahs = surah?.ayahs.length ?? 0;

  const [activeAyah, setActiveAyah] = useState(startAyah);
  const [repeatCount, setRepeatCount] = useState<RepeatCount>(5);
  const [repeatTarget, setRepeatTarget] =
    useState<RepeatTarget>('current_ayah');
  const [rangeFrom, setRangeFrom] = useState<number | undefined>(undefined);
  const [rangeTo, setRangeTo] = useState<number | undefined>(undefined);
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

  const showAsPlaying =
    Boolean(surah) && isPlaying && isCurrentAyah(surah.number, activeAyah);

  const audioProgress =
    surah && isCurrentAyah(surah.number, activeAyah) ? progress : 0;

  useEffect(() => {
    if (!surah) return;
    prefetchNextAyah({
      surahId: surah.number,
      ayahNumber: activeAyah,
      reciterId,
      totalAyahs: surah.ayahs.length,
    });
  }, [surah, activeAyah, reciterId, prefetchNextAyah]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{tLoading('focusMode')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <DataLoadErrorFallback message={error} onRetry={retry} variant="page" />
    );
  }

  if (!surah || !currentAyah) {
    return (
      <DataLoadErrorFallback
        message={t('surahNotFound')}
        onRetry={retry}
        variant="page"
      />
    );
  }

  const repeatOption = getRepeatOption(repeatCount);
  const repeatLabel =
    repeatCount === INFINITE ? tRepeat('infinite') : repeatOption.label;

  const handleExit = () => {
    router.push(routes.surah(resolvedParams.id, activeAyah));
  };

  const handlePrevAyah = () => {
    if (activeAyah <= 1) return;
    const next = activeAyah - 1;
    setActiveAyah(next);
    if (showAsPlaying) {
      void playAyah({
        surahId: surah.number,
        ayahNumber: next,
        reciterId,
        totalAyahs: surah.ayahs.length,
      });
    }
  };

  const handleNextAyah = () => {
    if (activeAyah >= totalAyahs) return;
    const next = activeAyah + 1;
    setActiveAyah(next);
    if (showAsPlaying) {
      void playAyah({
        surahId: surah.number,
        ayahNumber: next,
        reciterId,
        totalAyahs: surah.ayahs.length,
      });
    }
  };

  const handleTogglePlay = () => {
    void toggleAyah({
      surahId: surah.number,
      ayahNumber: activeAyah,
      reciterId,
      totalAyahs: surah.ayahs.length,
    });
  };

  const handleApplyRepeat = (config: RepeatSettingsConfig) => {
    setRepeatCount(config.repeatCount);
    setRepeatTarget(config.targetType);
    setRangeFrom(config.fromAyah);
    setRangeTo(config.toAyah);
  };

  return (
    <div className="relative min-h-dvh flex flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-emerald-50/40"
      />

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
          aria-label={tFocus('exitAriaLabel')}
        >
          <X size={16} />
          <span>{tFocus('exit')}</span>
        </button>

        <p className="text-sm font-semibold text-foreground">
          {tFocus('ayahCounter', { current: activeAyah, total: totalAyahs })}
        </p>
      </motion.header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAyah}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-3xl text-center space-y-6"
          >
            <p
              dir="rtl"
              className="font-serif text-foreground"
              style={{
                fontSize: 'clamp(3rem, 7vw, 3.5rem)',
                lineHeight: 1.9,
              }}
            >
              {currentAyah.arabic}
            </p>

            {showTransliteration && currentAyah.transliteration && (
              <p className="text-base sm:text-lg italic text-muted-foreground leading-relaxed px-2">
                {currentAyah.transliteration}
              </p>
            )}

            {showTranslation && currentAyah.translation && (
              <p
                className={cn(
                  'text-sm sm:text-base text-muted-foreground leading-relaxed px-2',
                  showTransliteration &&
                    currentAyah.transliteration &&
                    'border-t border-border/60 pt-4',
                )}
              >
                {currentAyah.translation}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.footer
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
        className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-6 sm:px-8 sm:pb-10"
      >
        <FocusModePlayer
          isPlaying={showAsPlaying}
          progress={audioProgress}
          onPlayPause={handleTogglePlay}
          onPrevious={handlePrevAyah}
          onNext={handleNextAyah}
          isPreviousDisabled={activeAyah <= 1}
          isNextDisabled={activeAyah >= totalAyahs}
        />

        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-foreground">{tCommon('repeat')}</span>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 h-10 text-sm font-medium transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              showAsPlaying
                ? 'border-transparent bg-primary text-white'
                : 'border-border bg-white text-foreground hover:border-primary/40',
            )}
            aria-label={tFocus('openRepeatSettings')}
          >
            <span className="text-base leading-none">{repeatOption.emoji}</span>
            <span>{repeatLabel}</span>
            <ChevronDown size={16} className="opacity-70" />
          </button>
          <p className="text-xs text-muted-foreground text-center px-4">
            {tFocus('repeatAutoSurahDetailHint')}
          </p>
        </div>

        <div className="mt-4">
          <RepeatStatus
            targetType={repeatTarget}
            repeatCount={repeatCount}
            currentCycle={1}
            activeAyah={activeAyah}
            totalAyahs={totalAyahs}
            rangeFrom={rangeFrom}
            rangeTo={rangeTo}
            surahName={surah.englishName}
          />
        </div>

      </motion.footer>

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
