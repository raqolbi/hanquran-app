'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

import { routes } from '@/lib/routes';

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
  const progress = (ayah / totalAyahs) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 mb-4 sm:mb-6"
    >
      <Link
        href={routes.surah(surahId, ayah)}
        className="block w-full rounded-2xl p-8 sm:p-10 text-left hover:shadow-lg transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D9C6 100%)',
        }}
        aria-label={`Lanjutkan ${surah} ayat ${ayah}`}
      >
        <div className="mb-8">
          <p className="text-xs font-semibold text-[#2D9B8C] uppercase tracking-widest mb-3">Lanjutkan Hafalan</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-2">{surah}</h2>
          <p className="text-lg text-[#5A5A5A]">Ayat {ayah} • {Math.round(progress)}% selesai</p>
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
          <p className="text-xs text-[#5A5A5A] mt-2">{ayah} dari {totalAyahs} ayat sudah dihafal</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-[#2D9B8C]">
            Terus semangat! Kamu hebat.
          </div>
          <div className="text-xl">→</div>
        </div>
      </Link>
    </motion.div>
  );
}
