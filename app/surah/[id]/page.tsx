'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SurahDetailHeader } from '@/components/surah-detail-header';
import { SurahOfflineDownload } from '@/components/surah-offline-download';
import { SurahDetailTopChrome } from '@/components/surah-detail-top-chrome';
import { VerseDisplayControls } from '@/components/verse-display-controls';
import { AyahCard } from '@/components/ayah-card';
import { AudioPlayer } from '@/components/audio-player';
import { SurahDetailScrollSpacer } from '@/components/surah-detail-scroll-spacer';
import { RepeatSelector } from '@/components/repeat-selector';
import { RepeatSettingsDialog } from '@/components/repeat-settings-dialog';
import { routes } from '@/lib/routes';
import { useSurah } from '@/hooks/use-surah';
import { useReadingDisplay } from '@/hooks/use-reading-display';
import { useSurahDetailBottomInset } from '@/hooks/use-surah-detail-bottom-inset';
import { useSurahRepeatPlayback } from '@/hooks/use-surah-repeat-playback';
import { usePersistLastViewed } from '@/hooks/use-persist-last-viewed';
import { usePreferredReciterId } from '@/hooks/use-preferred-reciter';
import { downloadManifestKey } from '@/services/download-manifest-key';
import { useOfflineStore } from '@/stores/offlineStore';
import { useUserStore } from '@/stores/userStore';
import { DataLoadErrorFallback } from '@/components/shared/ErrorFallback';
import type { SurahData } from '@/services/quran';

interface SurahDetailPageProps {
  params: Promise<{ id: string }>;
}

interface SurahDetailLoadedProps {
  surah: SurahData;
  surahIdParam: string;
  startAyah: number;
}

function SurahDetailLoaded({
  surah,
  surahIdParam,
  startAyah,
}: SurahDetailLoadedProps) {
  const router = useRouter();
  const {
    showTranslation,
    showTransliteration,
    toggleTranslation,
    toggleTransliteration,
  } = useReadingDisplay();
  const [activeAyah, setActiveAyah] = useState(startAyah);
  const [completedAyahs, setCompletedAyahs] = useState<number[]>([]);
  const [repeatSettingsOpen, setRepeatSettingsOpen] = useState(false);
  const isFavorited = useUserStore((s) => s.favorites.includes(surah.number));
  const toggleFavorite = useUserStore((s) => s.toggleFavorite);

  usePersistLastViewed(surah.number, activeAyah);

  const reciterId = usePreferredReciterId();
  const isOfflineReady =
    useOfflineStore(
      (s) => s.downloadStatuses[downloadManifestKey(surah.number, reciterId)],
    ) === 'ready';

  const {
    isPlaying,
    togglePlayback,
    navigateAyah,
    prefetchNextAyah,
    repeatCount,
    repeatTarget,
    rangeFrom,
    rangeTo,
    repeatStatusProps,
    showRepeatStatus,
    handleCountChange,
    handleApplyRepeatSettings,
    pause,
  } = useSurahRepeatPlayback({
    surahId: surah.number,
    activeAyah,
    totalAyahs: surah.ayahs.length,
    reciterId,
    surahName: surah.englishName,
    setActiveAyah,
  });

  const { bottomInset, repeatPanelBottom, audioChromeHeight, audioRef, repeatRef } =
    useSurahDetailBottomInset({
      enabled: true,
      remeasureKey: `${isPlaying}-${showTranslation}-${showTransliteration}`,
    });

  useEffect(() => {
    prefetchNextAyah();
  }, [prefetchNextAyah]);

  return (
    <div className="min-h-screen bg-background">
      <SurahDetailTopChrome>
        <SurahDetailHeader
          surahName={surah.englishName}
          arabicName={surah.arabicName}
          ayahCount={surah.ayahs.length}
          type={surah.type}
          isFavorited={isFavorited}
          isOfflineReady={isOfflineReady}
          onToggleFavorite={() => void toggleFavorite(surah.number)}
        />

        <div className="max-w-3xl mx-auto px-4 pb-4">
          <SurahOfflineDownload
            surahId={surah.number}
            ayahCount={surah.ayahs.length}
            reciterId={reciterId}
          />
        </div>

        <VerseDisplayControls
          sticky={false}
          showTranslation={showTranslation}
          showTransliteration={showTransliteration}
          onToggleTranslation={toggleTranslation}
          onToggleTransliteration={toggleTransliteration}
          onFocusMode={() =>
            router.push(routes.focus(surahIdParam, activeAyah))
          }
        />
      </SurahDetailTopChrome>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {surah.ayahs.map((ayah) => (
            <AyahCard
              key={ayah.number}
              number={ayah.number}
              arabic={ayah.arabic}
              transliteration={ayah.transliteration}
              translation={ayah.translation}
              isActive={activeAyah === ayah.number}
              isCompleted={completedAyahs.includes(ayah.number)}
              showTransliteration={showTransliteration}
              showTranslation={showTranslation}
              onClick={() => {
                if (ayah.number !== activeAyah && isPlaying) {
                  pause();
                }
                setActiveAyah(ayah.number);
              }}
            />
          ))}
          <SurahDetailScrollSpacer height={bottomInset} />
        </motion.div>
      </div>

      <AudioPlayer
        ref={audioRef}
        surahId={surah.number}
        currentAyah={activeAyah}
        reciterId={reciterId}
        onTogglePlay={() => void togglePlayback()}
        onPrevious={() =>
          navigateAyah(
            activeAyah > 1 ? activeAyah - 1 : surah.ayahs.length,
          )
        }
        onNext={() =>
          navigateAyah(
            activeAyah < surah.ayahs.length ? activeAyah + 1 : 1,
          )
        }
      />

      <div
        ref={repeatRef}
        className="fixed right-4 z-40 w-48 max-w-[calc(100vw-2rem)]"
        style={{ bottom: repeatPanelBottom }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-border rounded-lg p-4 shadow-lg"
        >
          <RepeatSelector
            count={repeatCount}
            isActive={showRepeatStatus}
            statusProps={repeatStatusProps}
            bottomChromeHeight={audioChromeHeight}
            onCountChange={handleCountChange}
            onOpenSettings={() => setRepeatSettingsOpen(true)}
          />
        </motion.div>
      </div>

      <RepeatSettingsDialog
        open={repeatSettingsOpen}
        onOpenChange={setRepeatSettingsOpen}
        repeatCount={repeatCount}
        targetType={repeatTarget}
        fromAyah={rangeFrom}
        toAyah={rangeTo}
        currentAyah={activeAyah}
        totalAyahs={surah.ayahs.length}
        surahName={surah.englishName}
        onApply={handleApplyRepeatSettings}
      />
    </div>
  );
}

export default function SurahDetailPage({ params }: SurahDetailPageProps) {
  const t = useTranslations('errors');
  const tLoading = useTranslations('loading');
  const resolvedParams = React.use(params);
  const searchParams = useSearchParams();
  const startAyah = parseInt(searchParams.get('ayah') || '1', 10);

  const { surah, loading, error, retry } = useSurah(resolvedParams.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{tLoading('surah')}</p>
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
    <SurahDetailLoaded
      surah={surah}
      surahIdParam={resolvedParams.id}
      startAyah={startAyah}
    />
  );
}
