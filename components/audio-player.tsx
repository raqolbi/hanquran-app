'use client';

import { forwardRef, type MouseEvent, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useAudio } from '@/hooks/use-audio';
import { usePreferredReciterId } from '@/hooks/use-preferred-reciter';
import { SURAH_DETAIL_AUDIO_MIN_HEIGHT } from '@/lib/surah-detail-chrome';

interface AudioPlayerProps {
  surahId: number;
  currentAyah: number;
  reciterId?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  /** Override play/pause — dipakai saat integrasi RepeatEngine. */
  onTogglePlay?: () => void;
  isPreviousDisabled?: boolean;
  isNextDisabled?: boolean;
  /** Kontrol tambahan di baris transport (mis. repeat inline). */
  toolbarStart?: ReactNode;
}

export const AudioPlayer = forwardRef<HTMLDivElement, AudioPlayerProps>(
  function AudioPlayer(
    {
      surahId,
      currentAyah,
      reciterId: reciterIdProp,
      onPrevious,
      onNext,
      onTogglePlay,
      toolbarStart,
      isPreviousDisabled = false,
      isNextDisabled = false,
    },
    ref,
  ) {
    const preferredReciterId = usePreferredReciterId();
    const reciterId = reciterIdProp ?? preferredReciterId;
    const t = useTranslations('surah');
    const tCommon = useTranslations('common');
    const { isPlaying, progress, duration, toggleAyah, seek, isCurrentAyah } =
      useAudio();

    const showAsPlaying =
      isPlaying && isCurrentAyah(surahId, currentAyah);

    const handlePlayPause = () => {
      if (onTogglePlay) {
        onTogglePlay();
        return;
      }
      void toggleAyah({ surahId, ayahNumber: currentAyah, reciterId });
    };

    const handleProgressClick = (event: MouseEvent<HTMLDivElement>) => {
      if (!duration || duration <= 0) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      seek(ratio * duration);
    };

    return (
      <motion.div
        ref={ref}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white shadow-lg pb-[env(safe-area-inset-bottom)] short-landscape:shadow-md"
        style={{ minHeight: SURAH_DETAIL_AUDIO_MIN_HEIGHT }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pt-3 pb-2 short-landscape:gap-1.5 short-landscape:pt-2 short-landscape:pb-1">
          <div
            role="slider"
            aria-label={t('audioProgress')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            tabIndex={0}
            onClick={handleProgressClick}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') seek(Math.min(duration, duration * (progress / 100) + 5));
              if (event.key === 'ArrowLeft') seek(Math.max(0, duration * (progress / 100) - 5));
            }}
            className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-border short-landscape:h-1"
          >
            <motion.div
              className="pointer-events-none h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 py-0.5 sm:gap-3">
            {toolbarStart}
            <div className="flex shrink-0 items-center justify-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={onPrevious}
                disabled={isPreviousDisabled}
                className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-secondary sm:p-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                aria-label={t('previousAyah')}
              >
                <SkipBack className="size-[18px] sm:size-5" />
              </button>

              <button
                type="button"
                onClick={handlePlayPause}
                className="rounded-full bg-primary p-2.5 text-white transition-colors hover:bg-primary/90 sm:p-3"
                aria-label={showAsPlaying ? tCommon('pause') : tCommon('play')}
              >
                {showAsPlaying ? (
                  <Pause className="size-5 fill-white sm:size-6" />
                ) : (
                  <Play className="size-5 fill-white sm:size-6" />
                )}
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={isNextDisabled}
                className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-secondary sm:p-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                aria-label={t('nextAyah')}
              >
                <SkipForward className="size-[18px] sm:size-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);

AudioPlayer.displayName = 'AudioPlayer';
