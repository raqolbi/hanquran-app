'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { AudioPlayer } from '@/components/audio-player';
import { RepeatSelector } from '@/components/repeat-selector';
import { RepeatSettingsDialog } from '@/components/repeat-settings-dialog';
import { routes } from '@/lib/routes';
import { useArabicTextSize } from '@/hooks/use-arabic-text-size';
import { usePreferredReciterId } from '@/hooks/use-preferred-reciter';
import { useSurah } from '@/hooks/use-surah';
import { useReadingDisplay } from '@/hooks/use-reading-display';
import { useSurahDetailBottomInset } from '@/hooks/use-surah-detail-bottom-inset';
import { useSurahRepeatPlayback } from '@/hooks/use-surah-repeat-playback';
import { usePersistLastViewed } from '@/hooks/use-persist-last-viewed';
import { useTrackSurahOpened } from '@/hooks/use-track-surah-opened';
import { DataLoadErrorFallback } from '@/components/shared/ErrorFallback';
import type { SurahData } from '@/services/quran';

interface FocusModePageProps {
  params: Promise<{ id: string }>;
}

interface FocusModeLoadedProps {
  surah: SurahData;
  surahIdParam: string;
  startAyah: number;
}

function FocusModeLoaded({
  surah,
  surahIdParam,
  startAyah,
}: FocusModeLoadedProps) {
  const tFocus = useTranslations('focus');
  const router = useRouter();
  const { showTranslation, showTransliteration } = useReadingDisplay();
  const { focusArabicStyle } = useArabicTextSize();
  const reciterId = usePreferredReciterId();

  const [activeAyah, setActiveAyah] = useState(
    Math.min(Math.max(startAyah, 1), surah.ayahs.length),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  const totalAyahs = surah.ayahs.length;

  usePersistLastViewed(surah.number, activeAyah);
  useTrackSurahOpened(surah);

  const {
    isActiveAyahPlaying,
    togglePlayback,
    navigateAyah,
    prefetchNextAyah,
    repeatCount,
    repeatStatusProps,
    showRepeatStatus,
    handleCountChange,
    handleApplyRepeatSettings,
  } = useSurahRepeatPlayback({
    surahId: surah.number,
    activeAyah,
    totalAyahs,
    reciterId,
    surahName: surah.englishName,
    setActiveAyah,
  });

  const { bottomInset, audioChromeHeight, audioRef } = useSurahDetailBottomInset({
    enabled: true,
    remeasureKey: `${isActiveAyahPlaying}-${showTranslation}-${showTransliteration}`,
  });

  useEffect(() => {
    setActiveAyah(Math.min(Math.max(startAyah, 1), surah.ayahs.length));
  }, [startAyah, surah.ayahs.length]);

  const currentAyah = useMemo(
    () => surah.ayahs.find((a) => a.number === activeAyah) ?? surah.ayahs[0],
    [surah.ayahs, activeAyah],
  );

  useEffect(() => {
    prefetchNextAyah();
  }, [activeAyah, prefetchNextAyah]);

  const handleExit = () => {
    router.push(routes.surah(surahIdParam, activeAyah));
  };

  const handlePrevAyah = () => {
    if (activeAyah <= 1) return;
    navigateAyah(activeAyah - 1);
  };

  const handleNextAyah = () => {
    if (activeAyah >= totalAyahs) return;
    navigateAyah(activeAyah + 1);
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

      <main
        className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-8"
        style={{ paddingBottom: bottomInset }}
      >
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
              style={focusArabicStyle}
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

      <AudioPlayer
        ref={audioRef}
        surahId={surah.number}
        currentAyah={activeAyah}
        reciterId={reciterId}
        onTogglePlay={() => void togglePlayback()}
        onPrevious={handlePrevAyah}
        onNext={handleNextAyah}
        isPreviousDisabled={activeAyah <= 1}
        isNextDisabled={activeAyah >= totalAyahs}
        toolbarStart={
          <RepeatSelector
            variant="inline"
            count={repeatCount}
            isActive={showRepeatStatus}
            statusProps={repeatStatusProps}
            bottomChromeHeight={audioChromeHeight}
            onCountChange={handleCountChange}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        }
      />

      <RepeatSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        repeatCount={repeatStatusProps.repeatCount}
        targetType={repeatStatusProps.targetType}
        fromAyah={repeatStatusProps.rangeFrom}
        toAyah={repeatStatusProps.rangeTo}
        currentAyah={activeAyah}
        totalAyahs={totalAyahs}
        surahName={surah.englishName}
        onApply={handleApplyRepeatSettings}
      />
    </div>
  );
}

export default function FocusModePage({ params }: FocusModePageProps) {
  const t = useTranslations('errors');
  const tLoading = useTranslations('loading');
  const resolvedParams = React.use(params);
  const searchParams = useSearchParams();
  const startAyah = parseInt(searchParams.get('ayah') ?? '1', 10);

  const { surah, loading, error, retry } = useSurah(resolvedParams.id);

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

  if (!surah) {
    return (
      <DataLoadErrorFallback
        message={t('surahNotFound')}
        onRetry={retry}
        variant="page"
      />
    );
  }

  return (
    <FocusModeLoaded
      surah={surah}
      surahIdParam={resolvedParams.id}
      startAyah={startAyah}
    />
  );
}
