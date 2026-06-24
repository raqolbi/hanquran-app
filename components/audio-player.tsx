'use client';

import { forwardRef, type MouseEvent } from 'react';
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
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white shadow-lg pb-[env(safe-area-inset-bottom)]"
        style={{ minHeight: SURAH_DETAIL_AUDIO_MIN_HEIGHT }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pt-3 pb-2">
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
            className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-border"
          >
            <motion.div
              className="pointer-events-none h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-6 py-1">
            <button
              type="button"
              onClick={onPrevious}
              className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary"
              aria-label={t('previousAyah')}
            >
              <SkipBack size={20} />
            </button>

            <button
              type="button"
              onClick={handlePlayPause}
              className="rounded-full bg-primary p-3 text-white transition-colors hover:bg-primary/90"
              aria-label={showAsPlaying ? tCommon('pause') : tCommon('play')}
            >
              {showAsPlaying ? (
                <Pause size={24} fill="white" />
              ) : (
                <Play size={24} fill="white" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary"
              aria-label={t('nextAyah')}
            >
              <SkipForward size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  },
);

AudioPlayer.displayName = 'AudioPlayer';
