'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { routes } from '@/lib/routes';

interface SurahCardProps {
  number: number;
  arabicName: string;
  englishName: string;
  meaning: string;
  ayahCount: number;
  type: 'Meccan' | 'Medinan';
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

export function SurahCard({
  number,
  arabicName,
  englishName,
  meaning,
  ayahCount,
  type,
  isFavorited = false,
  onToggleFavorite,
}: SurahCardProps) {
  const t = useTranslations('common');

  return (
    <Link href={routes.surah(number)}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="w-full text-left p-5 rounded-xl bg-white border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/10">
            <span className="text-xl font-bold text-primary">{number}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground">{englishName}</h3>
            <span className="text-sm text-muted-foreground">{arabicName}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{meaning}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground font-medium">
              {ayahCount} {t('ayahs')}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
              {type === 'Meccan' ? t('meccan') : t('medinan')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
            aria-label={isFavorited ? t('removeFavorite') : t('addFavorite')}
          >
            <Heart
              size={20}
              className={`transition-all ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-foreground'
              }`}
            />
          </motion.button>
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        </div>
      </motion.div>
    </Link>
  );
}
