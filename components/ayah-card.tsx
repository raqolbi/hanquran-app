'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { useArabicTextSize } from '@/hooks/use-arabic-text-size';
import { getAyahElementId } from '@/lib/auto-follow-playback';
import {
  SURAH_DETAIL_MIN_SCROLL_INSET,
  SURAH_DETAIL_READING_CONTROLS_HEIGHT,
} from '@/lib/surah-detail-chrome';
import type { AppLocale } from '@/types';
import {
  LiveQuranAyahText,
  QuranAyahText,
  type WordLoopHandlers,
} from '@/components/quran-ayah-text';

interface AyahCardProps {
  number: number;
  arabic: string;
  transliteration?: string;
  translation?: string;
  /** Bahasa teks terjemahan — dipakai CSS pra-paint (docs/21 F8). */
  translationLocale?: AppLocale;
  isActive?: boolean;
  isCompleted?: boolean;
  /**
   * Sorot kata saat tilawah (data quran-align). Hanya berlaku saat
   * `isActive`; ayat lain dirender sebagai teks utuh.
   */
  wordTiming?: { surahId: number; reciterId: string; enabled: boolean };
  /** Gestur Ulang Kata — hanya untuk ayat aktif (docs/38). */
  wordLoop?: WordLoopHandlers;
  showTransliteration?: boolean;
  showTranslation?: boolean;
  onClick?: () => void;
}

export function AyahCard({
  number,
  arabic,
  transliteration,
  translation,
  translationLocale,
  isActive = false,
  isCompleted = false,
  wordTiming,
  showTransliteration = false,
  showTranslation = false,
  wordLoop,
  onClick,
}: AyahCardProps) {
  // Ayat aktif tidak perlu dipilih lagi — dan kata di dalamnya bisa menjadi
  // tombol (Ulang Kata), jadi kartu tidak boleh ikut ber-role tombol.
  const selectable = !!onClick && !isActive;
  const t = useTranslations('surah');
  const { arabicStyle } = useArabicTextSize();

  return (
    <motion.div
      id={getAyahElementId(number)}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      // Bisa dipilih dengan keyboard (Tab lalu Enter/Spasi), sama seperti ketuk.
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      aria-current={isActive ? 'true' : undefined}
      onKeyDown={
        selectable
          ? (event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={{
        scrollMarginTop: SURAH_DETAIL_READING_CONTROLS_HEIGHT,
        scrollMarginBottom: SURAH_DETAIL_MIN_SCROLL_INSET,
      }}
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isActive
          ? 'border-primary bg-emerald-50'
          : isCompleted
          ? 'border-border bg-emerald-50'
          : 'border-border bg-white hover:border-primary/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        {isActive && (
          // Penanda ayat aktif — sengaja bukan ikon ▶ agar tidak dikira tombol putar.
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/20"
          />
        )}
        {isCompleted && !isActive && (
          <div className="text-lg text-primary" aria-hidden="true">✓</div>
        )}
        <span className="text-sm font-medium text-muted-foreground">
          {t('ayahLabel', { number })}
        </span>
      </div>

      <div className="space-y-4">
        {isActive && wordTiming ? (
          <LiveQuranAyahText
            text={arabic}
            className="leading-relaxed text-center"
            style={arabicStyle}
            surahId={wordTiming.surahId}
            ayahNumber={number}
            reciterId={wordTiming.reciterId}
            enabled={wordTiming.enabled}
            wordLoop={wordLoop}
          />
        ) : (
          <QuranAyahText
            text={arabic}
            className="leading-relaxed text-center"
            style={arabicStyle}
          />
        )}

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
            <p
              data-content-locale={translationLocale}
              className="text-sm text-muted-foreground leading-relaxed text-center"
            >
              {translation}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
