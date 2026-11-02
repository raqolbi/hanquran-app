'use client';

import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { NativeAwareLink } from '@/components/native-aware-link';
import { LocaleText } from '@/components/shared/locale-text';
import { isAndroidBuild, isNativePlatform } from '@/lib/platform';
import { COMMON_LABEL_PAIRS, type LocalePair } from '@/lib/locale-text';
import { routes } from '@/lib/routes';

export interface SurahCardProps {
  number: number;
  arabicName: string;
  englishName: string;
  meaning: string;
  /** Arti `id` + `en` untuk paint pertama (docs/21 F8). */
  meaningTranslations?: LocalePair;
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
  meaningTranslations,
  ayahCount,
  type,
  isFavorited = false,
  onToggleFavorite,
}: SurahCardProps) {
  const t = useTranslations('common');
  const href = routes.surah(number);
  // Build Android meng-inline NEXT_PUBLIC_HANQURAN_TARGET=android.
  const useHardNav = isAndroidBuild() || isNativePlatform();
  const meaningPair =
    meaningTranslations ?? ({ id: meaning, en: meaning } satisfies LocalePair);

  // Struktur: tautan & tombol favorit adalah SAUDARA, bukan bersarang.
  // `<button>` di dalam `<a>` adalah HTML tidak valid (konten interaktif
  // bersarang), membuat urutan Tab ganda, dan bisa memicu hydration mismatch.
  return (
    <motion.div
      whileHover={useHardNav ? undefined : { scale: 1.02, y: -4 }}
      whileTap={useHardNav ? undefined : { scale: 0.98 }}
      // Cegah motion menambah `tabIndex=0` (fokus sudah ada di tautan).
      tabIndex={-1}
      className="relative rounded-xl bg-white border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-ring"
    >
      <NativeAwareLink
        href={href}
        prefetch={false}
        className="block w-full text-left p-5 pr-24 rounded-xl cursor-pointer focus-visible:outline-none"
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
            <p className="text-sm text-muted-foreground mb-2">
              <LocaleText pair={meaningPair} />
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground font-medium">
                {ayahCount} <LocaleText pair={COMMON_LABEL_PAIRS.ayahs} />
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                <LocaleText
                  pair={
                    type === 'Meccan'
                      ? COMMON_LABEL_PAIRS.meccan
                      : COMMON_LABEL_PAIRS.medinan
                  }
                />
              </span>
            </div>
          </div>
        </div>
        <svg
          aria-hidden="true"
          className="absolute right-5 top-6 w-5 h-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </NativeAwareLink>

      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite?.();
        }}
        className="absolute right-11 top-5 p-1.5 hover:bg-secondary rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={isFavorited ? t('removeFavorite') : t('addFavorite')}
      >
        <Heart
          size={20}
          aria-hidden="true"
          className={`transition-all ${
            isFavorited
              ? 'fill-red-500 text-red-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        />
      </motion.button>
    </motion.div>
  );
}
