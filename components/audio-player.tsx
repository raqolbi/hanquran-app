'use client';

import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatRepeatCount } from '@/lib/repeat-options';

interface AudioPlayerProps {
  surahName: string;
  currentAyah: number;
  totalAyahs: number;
  isPlaying?: boolean;
  repeatCount?: number;
  audioUrl?: string;
  onPlayPause?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onRepeatCountChange?: (count: number) => void;
  onOpenRepeatSettings?: () => void;
}

export function AudioPlayer({
  surahName,
  currentAyah,
  totalAyahs,
  isPlaying = false,
  repeatCount = 5,
  audioUrl,
  onPlayPause,
  onPrevious,
  onNext,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
      setProgress(0);
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      void audio.play().catch(() => {
        // Autoplay policy atau jaringan — UI tetap responsif.
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg"
      style={{ height: 96 }}
    >
      <audio ref={audioRef} preload="none" className="hidden" />

      <div className="max-w-3xl mx-auto px-4 py-4 h-full flex flex-col justify-between">
        <div className="space-y-2">
          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={onPrevious}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground"
            aria-label="Ayat sebelumnya"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={onPlayPause}
            className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            aria-label={isPlaying ? 'Jeda' : 'Putar'}
          >
            {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
          </button>

          <button
            onClick={onNext}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground"
            aria-label="Ayat berikutnya"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs font-medium text-muted-foreground">
            {currentAyah > totalAyahs
              ? 'Selesai'
              : `Ayat ${currentAyah} • ${formatRepeatCount(repeatCount)} tersisa`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
