'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { routes } from '@/lib/routes';
import { useSurahList } from '@/hooks/use-surah-list';
import { useUserStore } from '@/stores/userStore';

interface ContinueReadingProps {
  surahId: number;
  surah: string;
  ayah: number;
  totalAyahs: number;
}

export function ContinueReading({
  surahId,
  surah,
  ayah,
  totalAyahs,
}: ContinueReadingProps) {
  const t = useTranslations('home');
  const progress = (ayah / totalAyahs) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full"
    >
      <Link
        href={routes.surah(surahId, ayah)}
        className="block w-full rounded-2xl p-8 sm:p-10 text-left hover:shadow-lg transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D9C6 100%)',
        }}
        aria-label={t('continueReadingAria', { surah, ayah })}
      >
        <div className="mb-8">
          <p className="text-xs font-semibold text-[#2D9B8C] uppercase tracking-widest mb-3">
            {t('continueMemorization')}
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-2">{surah}</h2>
          <p className="text-lg text-[#5A5A5A]">
            {t('ayahProgress', { ayah, percent: Math.round(progress) })}
          </p>
        </div>

        <div className="mb-6">
          <div className="w-full bg-[#D4C4B0] rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #2D9B8C 0%, #1FB8A8 100%)',
              }}
            />
          </div>
          <p className="text-xs text-[#5A5A5A] mt-2">
            {t('memorizedProgress', { current: ayah, total: totalAyahs })}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-[#2D9B8C]">
            {t('encouragement')}
          </div>
          <div className="text-xl">→</div>
        </div>
      </Link>
    </motion.div>
  );
}

/** Kartu Lanjutkan Hafalan — hanya tampil jika `lastRead` tersedia di Dexie. */
export function ContinueReadingSection() {
  const lastViewed = useUserStore((s) => s.lastViewed);
  const initialized = useUserStore((s) => s.initialized);
  const { surahs } = useSurahList();

  if (!initialized || !lastViewed) {
    return null;
  }

  const surah = surahs.find((item) => item.number === lastViewed.surahId);
  if (!surah) {
    return null;
  }

  return (
    <ContinueReading
      surahId={lastViewed.surahId}
      surah={surah.englishName}
      ayah={lastViewed.ayahNumber}
      totalAyahs={surah.ayahCount}
    />
  );
}
