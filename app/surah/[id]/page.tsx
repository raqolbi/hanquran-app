'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SurahDetailHeader } from '@/components/surah-detail-header';
import { ActionBar } from '@/components/action-bar';
import { AyahCard } from '@/components/ayah-card';
import { AudioPlayer } from '@/components/audio-player';
import { RepeatSelector } from '@/components/repeat-selector';
import {
  RepeatSettingsDialog,
  type RepeatSettingsConfig,
} from '@/components/repeat-settings-dialog';
import {
  type RepeatCount,
  type RepeatTarget,
} from '@/lib/repeat-options';
import { routes } from '@/lib/routes';
import { useSurah } from '@/hooks/use-surah';
import { useAyahAudioUrl } from '@/hooks/use-ayah-audio';
import { getDefaultReciterId } from '@/services/quran';

interface SurahDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SurahDetailPage({ params }: SurahDetailPageProps) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const startAyah = parseInt(searchParams.get('ayah') || '1', 10);

  const { surah, loading, error } = useSurah(resolvedParams.id);
  const [activeAyah, setActiveAyah] = useState(startAyah);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatCount, setRepeatCount] = useState<RepeatCount>(5);
  const [completedAyahs, setCompletedAyahs] = useState<number[]>([]);
  const [repeatTarget, setRepeatTarget] = useState<RepeatTarget>('current_ayah');
  const [rangeFrom, setRangeFrom] = useState<number | undefined>(undefined);
  const [rangeTo, setRangeTo] = useState<number | undefined>(undefined);
  const [repeatSettingsOpen, setRepeatSettingsOpen] = useState(false);

  const reciterId = getDefaultReciterId();
  const audioUrl = useAyahAudioUrl(
    reciterId,
    surah?.number ?? Number.parseInt(resolvedParams.id, 10),
    activeAyah,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat surat...</p>
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-destructive text-center">{error ?? 'Surat tidak ditemukan.'}</p>
      </div>
    );
  }

  const repeatStatusProps = {
    targetType: repeatTarget,
    repeatCount,
    currentCycle: 1,
    activeAyah,
    totalAyahs: surah.ayahs.length,
    rangeFrom,
    rangeTo,
    surahName: surah.englishName,
  };

  const handleApplyRepeatSettings = (config: RepeatSettingsConfig) => {
    setRepeatCount(config.repeatCount);
    setRepeatTarget(config.targetType);
    setRangeFrom(config.fromAyah);
    setRangeTo(config.toAyah);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <SurahDetailHeader
        surahName={surah.englishName}
        arabicName={surah.arabicName}
        ayahCount={surah.ayahs.length}
        type={surah.type}
        isFavorited={isFavorited}
        isOfflineReady={true}
        onToggleFavorite={() => setIsFavorited(!isFavorited)}
      />

      <ActionBar
        showTranslation={showTranslation}
        onToggleTranslation={() => setShowTranslation(!showTranslation)}
        onFocusMode={() =>
          router.push(routes.focus(resolvedParams.id, activeAyah))
        }
      />

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
              translation={ayah.translation}
              isActive={activeAyah === ayah.number}
              isCompleted={completedAyahs.includes(ayah.number)}
              showTranslation={showTranslation}
              onClick={() => setActiveAyah(ayah.number)}
            />
          ))}
        </motion.div>
      </div>

      <AudioPlayer
        surahName={surah.englishName}
        currentAyah={activeAyah}
        totalAyahs={surah.ayahs.length}
        isPlaying={isPlaying}
        repeatCount={repeatCount}
        audioUrl={audioUrl}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onPrevious={() =>
          setActiveAyah((prev) => (prev > 1 ? prev - 1 : surah.ayahs.length))
        }
        onNext={() =>
          setActiveAyah((prev) => (prev < surah.ayahs.length ? prev + 1 : 1))
        }
        onRepeatCountChange={setRepeatCount}
        onOpenRepeatSettings={() => setRepeatSettingsOpen(true)}
      />

      <div className="fixed bottom-28 right-4 w-48">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-border rounded-lg p-4 shadow-lg"
        >
          <RepeatSelector
            count={repeatCount}
            isActive={isPlaying}
            statusProps={repeatStatusProps}
            onCountChange={setRepeatCount}
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
