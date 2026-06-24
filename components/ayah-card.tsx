'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
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
          className="text-4xl font-serif text-foreground leading-relaxed text-center"
          style={{ lineHeight: 1.9 }}
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
