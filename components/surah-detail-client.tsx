'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { motion } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AyahCard } from '@/components/ayah-card';
import { AudioPlayer } from '@/components/audio-player';
import { RepeatSelector } from '@/components/repeat-selector';
import { RepeatSettingsDialog } from '@/components/repeat-settings-dialog';
import { StartAyahSync } from '@/components/start-ayah-sync';
import { SurahDetailHeader } from '@/components/surah-detail-header';
import { SurahDetailScrollSpacer } from '@/components/surah-detail-scroll-spacer';
import { SurahDetailTopChrome } from '@/components/surah-detail-top-chrome';
import { SurahOfflineDownload } from '@/components/surah-offline-download';
import { DataLoadErrorFallback } from '@/components/shared/ErrorFallback';
import { VerseDisplayControls } from '@/components/verse-display-controls';
import { useSurahRepeatPlayback } from '@/hooks/use-surah-repeat-playback';
import { useAutoFollowPlayback } from '@/hooks/use-auto-follow-playback';
import { usePersistLastViewed } from '@/hooks/use-persist-last-viewed';
import { useReadingDisplay } from '@/hooks/use-reading-display';
import { usePreferredReciterId } from '@/hooks/use-preferred-reciter';
import { useSurahDetailBottomInset } from '@/hooks/use-surah-detail-bottom-inset';
import { useSurahOfflineReady } from '@/hooks/use-surah-offline-ready';
import { useTrackSurahOpened } from '@/hooks/use-track-surah-opened';
import { useSurah } from '@/hooks/use-surah';
import { clampAyahNumber } from '@/lib/ayah-param';
import { scrollToAyahAfterPaint } from '@/lib/ayah-scroll';
import { parseSurahIdFromPathname, routes } from '@/lib/routes';
import { navigateApp } from '@/lib/navigate';
import type { SurahData } from '@/services/quran';
import { useUserStore } from '@/stores/userStore';
import type { AppLocale } from '@/types';

/**
 * Klien Surah Detail — dipisah dari `app/surah/[id]/page.tsx` agar konten
 * ayat di-SSR/SSG dari server component (docs/35 §4 T1). Halaman iteraktif
 * audio/repeat tetap di sisi klien.
 */
interface SurahDetailClientProps {
  initialSurah: SurahData | null;
}

export default function SurahDetailClient({ initialSurah }: SurahDetailClientProps) {
  const router = useRouter();
  const t = useTranslations('errors');
  const tLoading = useTranslations('loading');
  // Baca id dari URL (bukan params HTML) agar app-shell offline melayani id apa pun.
  const pathname = usePathname();
  const surahId = parseSurahIdFromPathname(pathname);

  const { surah, contentLocale, loading, error, retry } = useSurah(surahId, initialSurah);

  // Konten tetap tampil saat refetch latar — spinner hanya bila belum ada data.
  if (surah) {
    return (
      <SurahDetailView
        surah={surah}
        surahIdParam={surahId}
        contentLocale={contentLocale}
      />
    );
  }

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

  return (
    <DataLoadErrorFallback
      message={t('surahNotFound')}
      onRetry={retry}
      variant="page"
    />
  );
}

function SurahDetailView({
  surah,
  surahIdParam,
  contentLocale,
}: {
  surah: SurahData;
  surahIdParam: string;
  contentLocale: AppLocale | null;
}) {
  const router = useRouter();
  const tPlayback = useTranslations('settings.playback');
  const {
    showTranslation,
    showTransliteration,
    toggleTranslation,
    toggleTransliteration,
  } = useReadingDisplay();
  const [activeAyah, setActiveAyah] = useState(1);
  const [completedAyahs, setCompletedAyahs] = useState<number[]>([]);
  const [repeatSettingsOpen, setRepeatSettingsOpen] = useState(false);
  const [quranCompleteNotice, setQuranCompleteNotice] = useState(false);

  const isFavorited = useUserStore((s) => s.favorites.includes(surah.number));
  const toggleFavorite = useUserStore((s) => s.toggleFavorite);
  const autoFollowPlayback = useUserStore((s) => s.settings.autoFollowPlayback);
  const smoothAnimation = useUserStore((s) => s.settings.smoothAnimation);
  const wordHighlight = useUserStore((s) => s.settings.wordHighlight);

  // Posisi baca disimpan hanya setelah ada interaksi (docs/39 A1).
  const [engaged, setEngaged] = useState(false);
  usePersistLastViewed(surah.number, activeAyah, engaged);
  useTrackSurahOpened(surah);

  const reciterId = usePreferredReciterId();
  const isOfflineReady = useSurahOfflineReady(
    surah.number,
    reciterId,
    surah.ayahs.length,
  );

  const {
    isPlaying,
    togglePlayback,
    goToPreviousTrack,
    goToNextTrack,
    isPreviousDisabled,
    isNextDisabled,
    prefetchNextAyah,
    repeatCount,
    repeatTarget,
    rangeFrom,
    rangeTo,
    repeatStatusProps,
    showRepeatProgress,
    handleCountChange,
    handleApplyRepeatSettings,
    pause,
    isPlaybackBlocked,
    notifyIfPlaybackBlocked,
  } = useSurahRepeatPlayback({
    surahId: surah.number,
    routeMode: 'surah',
    activeAyah,
    totalAyahs: surah.ayahs.length,
    reciterId,
    surahName: surah.englishName,
    setActiveAyah,
    onQuranComplete: () => setQuranCompleteNotice(true),
  });

  const { bottomInset, audioChromeHeight, audioRef } =
    useSurahDetailBottomInset({
      enabled: true,
      remeasureKey: `${isPlaying}-${showTranslation}-${showTransliteration}`,
    });

  useEffect(() => {
    if (isPlaying) setEngaged(true);
  }, [isPlaying]);

  useAutoFollowPlayback({
    activeAyah,
    isPlaying,
    enabled: autoFollowPlayback,
    smoothAnimation,
    bottomInset,
  });

  // Inset audio dipakai saat deep link `?ayah` perlu di-scroll; simpan di ref
  // agar callback tetap stabil (tidak memicu sync ulang tiap pengukuran).
  const bottomInsetRef = useRef(bottomInset);
  bottomInsetRef.current = bottomInset;

  const handleStartAyahChange = useCallback(
    (ayah: number) => {
      const clamped = clampAyahNumber(ayah, surah.ayahs.length);
      setActiveAyah(clamped);
      scrollToAyahAfterPaint(clamped, bottomInsetRef.current);
    },
    [surah.number, surah.ayahs.length],
  );

  useEffect(() => {
    prefetchNextAyah();
  }, [prefetchNextAyah]);

  return (
    <div className="min-h-screen bg-background">
      {/* Leaf + Suspense: konten surat di luar boundary tetap di-prerender. */}
      <Suspense fallback={null}>
        <StartAyahSync onChange={handleStartAyahChange} />
      </Suspense>
      <SurahDetailTopChrome>
        <SurahDetailHeader
          surahName={surah.englishName}
          arabicName={surah.arabicName}
          ayahCount={surah.ayahs.length}
          type={surah.type}
          isFavorited={isFavorited}
          isOfflineReady={isOfflineReady}
          onToggleFavorite={() =>
            void toggleFavorite(surah.number, { ayahNumber: activeAyah })
          }
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
            navigateApp(routes.focus(surahIdParam, activeAyah), (href) =>
              router.push(href),
            )
          }
        />
      </SurahDetailTopChrome>

      <div className="max-w-3xl mx-auto px-4 py-6 short-landscape:py-3">
        <motion.div
          initial={false}
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
              translationLocale={contentLocale ?? undefined}
              isActive={activeAyah === ayah.number}
              wordTiming={{
                surahId: surah.number,
                reciterId,
                enabled: wordHighlight,
              }}
              isCompleted={completedAyahs.includes(ayah.number)}
              showTransliteration={showTransliteration}
              showTranslation={showTranslation}
              onClick={() => {
                if (ayah.number !== activeAyah && isPlaying) {
                  pause();
                }
                setEngaged(true);
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
        onPrevious={goToPreviousTrack}
        onNext={goToNextTrack}
        isPreviousDisabled={isPreviousDisabled}
        isNextDisabled={isNextDisabled}
        isPlaybackBlocked={isPlaybackBlocked}
        onPlaybackBlocked={notifyIfPlaybackBlocked}
        toolbarStart={
          <RepeatSelector
            variant="inline"
            count={repeatCount}
            isActive={showRepeatProgress}
            statusProps={repeatStatusProps}
            bottomChromeHeight={audioChromeHeight}
            onCountChange={handleCountChange}
            onOpenSettings={() => setRepeatSettingsOpen(true)}
          />
        }
      />

      {quranCompleteNotice ? (
        <p
          role="status"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] left-4 right-4 z-40 mx-auto max-w-2xl rounded-lg border border-border bg-background/95 px-4 py-3 text-center text-sm text-foreground shadow-md"
        >
          {tPlayback('quranComplete')}
        </p>
      ) : null}

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
