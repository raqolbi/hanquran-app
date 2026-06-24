'use client';

import { motion } from 'motion/react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FocusModePlayerProps {
  isPlaying: boolean;
  progress: number;
  onPlayPause: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isPreviousDisabled?: boolean;
  isNextDisabled?: boolean;
}

/**
 * Player Mode Fokus — baris kontrol selaras `AudioPlayer` (§9 / §16).
 */
export function FocusModePlayer({
  isPlaying,
  progress,
  onPlayPause,
  onPrevious,
  onNext,
  isPreviousDisabled = false,
  isNextDisabled = false,
}: FocusModePlayerProps) {
  const t = useTranslations('common');
  const tSurah = useTranslations('surah');

  return (
    <div className="flex flex-col gap-3">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-center gap-6 py-1">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          aria-label={tSurah('previousAyah')}
        >
          <SkipBack size={20} />
        </button>

        <button
          type="button"
          onClick={onPlayPause}
          className="rounded-full bg-primary p-3 text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={isPlaying ? t('pause') : t('play')}
        >
          {isPlaying ? (
            <Pause size={24} fill="white" />
          ) : (
            <Play size={24} fill="white" />
          )}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          aria-label={tSurah('nextAyah')}
        >
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
}
