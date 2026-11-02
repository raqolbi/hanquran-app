'use client';

import { memo, useMemo, type CSSProperties } from 'react';

import { useActiveWordRange } from '@/hooks/use-active-word-range';
import { splitAyahWords } from '@/lib/quran-words';
import { quranFont } from '@/lib/quran-font';
import { cn } from '@/lib/utils';
import type { WordRange } from '@/services/quran/word-timings';

interface QuranAyahTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  /**
   * `true` → render per kata (siap disorot). `false` → satu string utuh
   * (paling ringan; dipakai untuk ayat yang tidak aktif).
   */
  wordMode?: boolean;
  /** Kata yang sedang dibaca (`from` inklusif, `to` eksklusif). */
  activeRange?: WordRange | null;
}

/**
 * Teks Arab satu ayat dengan font Al-Qur'an dan sorot kata opsional
 * (data quran-align — `services/quran/word-timings.ts`).
 *
 * Sorotan hanya mengubah warna latar/teks (tanpa padding/margin) agar tidak
 * ada pergeseran layout saat kata berpindah.
 */
export const QuranAyahText = memo(function QuranAyahText({
  text,
  className,
  style,
  wordMode = false,
  activeRange = null,
}: QuranAyahTextProps) {
  const words = useMemo(
    () => (wordMode ? splitAyahWords(text) : []),
    [text, wordMode],
  );

  return (
    <p
      dir="rtl"
      lang="ar"
      className={cn(quranFont.className, 'text-foreground', className)}
      style={style}
    >
      {wordMode
        ? words.map((word, index) => {
            const active =
              !!activeRange &&
              index >= activeRange.from &&
              index < activeRange.to;
            return (
              <span key={index}>
                {index > 0 ? ' ' : null}
                <span
                  data-word-index={index}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'rounded-md transition-colors duration-150 [box-decoration-break:clone]',
                    active && 'bg-emerald-200/80 text-emerald-900',
                  )}
                >
                  {word}
                </span>
              </span>
            );
          })
        : text}
    </p>
  );
});

interface LiveQuranAyahTextProps
  extends Omit<QuranAyahTextProps, 'wordMode' | 'activeRange'> {
  surahId: number;
  ayahNumber: number;
  reciterId: string;
  /** Pengaturan `settings.wordHighlight`. */
  enabled: boolean;
}

/**
 * Varian yang mengikuti audio: hanya dipakai untuk ayat AKTIF, sehingga
 * pembaruan per kata hanya me-render ulang satu ayat (bukan seluruh daftar).
 */
export function LiveQuranAyahText({
  surahId,
  ayahNumber,
  reciterId,
  enabled,
  ...textProps
}: LiveQuranAyahTextProps) {
  const { available, range } = useActiveWordRange({
    surahId,
    ayahNumber,
    reciterId,
    enabled,
  });

  return (
    <QuranAyahText {...textProps} wordMode={available} activeRange={range} />
  );
}
