'use client';

import { motion } from 'motion/react';
import { Pause, Play } from 'lucide-react';

interface FocusModePlayerProps {
  isPlaying: boolean;
  progress: number;
  onPlayPause: () => void;
}

/**
 * Spec §16 + wireframe §8: player Focus Mode hanya berisi progress bar dan
 * tombol Play/Pause. Navigasi antar-ayat berada di komponen terpisah
 * (Tombol Ayat Sebelum / Ayat Berikut).
 */
export function FocusModePlayer({
  isPlaying,
  progress,
  onPlayPause,
}: FocusModePlayerProps) {
  return (
    <div>
      {/* Progress */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      </div>

      {/* Play / Pause */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onPlayPause}
          className="rounded-full bg-primary p-4 text-white shadow-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={isPlaying ? 'Jeda' : 'Putar'}
        >
          {isPlaying ? (
            <Pause size={26} fill="white" />
          ) : (
            <Play size={26} fill="white" />
          )}
        </button>
      </div>
    </div>
  );
}
