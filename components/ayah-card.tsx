'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { useArabicTextSize } from '@/hooks/use-arabic-text-size';
import { getAyahElementId } from '@/lib/auto-follow-playback';
import {
  SURAH_DETAIL_MIN_SCROLL_INSET,
  SURAH_DETAIL_READING_CONTROLS_HEIGHT,
} from '@/lib/surah-detail-chrome';

interface AyahCardProps {
  number: number;
  arabic: string;
  transliteration?: string;
  translation?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  showTransliteration?: boolean;
  showTranslation?: boolean;
  onClick?: () => void;
}

export function AyahCard({
  number,
  arabic,
  transliteration,
  translation,
  isActive = false,
  isCompleted = false,
  showTransliteration = false,
  showTranslation = false,
  onClick,
}: AyahCardProps) {
  const t = useTranslations('surah');
  const { arabicStyle } = useArabicTextSize();

  return (
    <motion.div
      id={getAyahElementId(number)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      style={{
        scrollMarginTop: SURAH_DETAIL_READING_CONTROLS_HEIGHT,
        scrollMarginBottom: SURAH_DETAIL_MIN_SCROLL_INSET,
      }}
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
        isActive
          ? 'border-primary bg-emerald-50'
          : isCompleted
          ? 'border-border bg-emerald-50'
          : 'border-border bg-white hover:border-primary/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        {isActive && (
          <div className="text-lg">▶</div>
        )}
        {isCompleted && !isActive && (
          <div className="text-lg text-primary">✓</div>
        )}
        <span className="text-sm font-medium text-muted-foreground">
          {t('ayahLabel', { number })}
        </span>
      </div>

      <div className="space-y-4">
        <p
          className="font-serif text-foreground leading-relaxed text-center"
          style={arabicStyle}
          dir="rtl"
        >
          {arabic}
        </p>

        {showTransliteration && transliteration && (
          <p className="text-center text-sm italic text-muted-foreground leading-relaxed">
            {transliteration}
          </p>
        )}

        {showTranslation && translation && (
          <div
            className={
              showTransliteration && transliteration
                ? 'border-t border-border pt-4'
                : undefined
            }
          >
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              {translation}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
