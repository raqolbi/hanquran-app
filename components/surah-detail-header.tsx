'use client';

import { motion } from 'motion/react';
import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { routes } from '@/lib/routes';

interface SurahDetailHeaderProps {
  surahName: string;
  arabicName: string;
  ayahCount: number;
  type: 'Meccan' | 'Medinan';
  isFavorited?: boolean;
  isOfflineReady?: boolean;
  onToggleFavorite?: () => void;
}

export function SurahDetailHeader({
  surahName,
  arabicName,
  ayahCount,
  type,
  isFavorited = false,
  isOfflineReady = false,
  onToggleFavorite,
}: SurahDetailHeaderProps) {
  const t = useTranslations('common');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-background"
    >
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center short-landscape:hidden">
        <Link
          href={routes.home()}
          className="p-2 hover:bg-secondary rounded-lg transition-colors -ml-2"
          aria-label={t('backToSurahList')}
        >
          <ArrowLeft size={20} className="text-foreground" />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 border-t border-border short-landscape:py-2 short-landscape:border-t-0">
        <div className="flex items-start justify-between mb-4 short-landscape:mb-0 short-landscape:items-center short-landscape:gap-2">
          <Link
            href={routes.home()}
            className="hidden short-landscape:flex p-2 hover:bg-secondary rounded-lg transition-colors shrink-0"
            aria-label={t('backToSurahList')}
          >
            <ArrowLeft size={18} className="text-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground short-landscape:text-lg short-landscape:truncate">
              {surahName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 short-landscape:mt-0 short-landscape:text-xs short-landscape:truncate">
              {arabicName}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onToggleFavorite}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label={isFavorited ? t('removeFavorite') : t('addFavorite')}
          >
            <Heart
              size={24}
              className={`${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              }`}
            />
          </motion.button>
        </div>

        <div className="flex items-center gap-4 flex-wrap short-landscape:gap-2 short-landscape:mt-1">
          <span className="text-sm text-muted-foreground">
            {ayahCount} {t('ayahs')}
          </span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {type === 'Meccan' ? t('meccan') : t('medinan')}
          </span>
          {isOfflineReady && (
            <>
              <span className="text-sm text-muted-foreground">•</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-foreground font-medium">{t('offlineReady')}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
