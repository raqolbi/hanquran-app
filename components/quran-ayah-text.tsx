'use client';

import { memo, useMemo, useRef, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';

import { useActiveWordRange } from '@/hooks/use-active-word-range';
import { useWordGestures } from '@/hooks/use-word-gestures';
import { splitAyahWords } from '@/lib/quran-words';
import { quranFont } from '@/lib/quran-font';
import { cn } from '@/lib/utils';
import { hasWordTimings, type WordRange } from '@/services/quran/word-timings';
import { useWordLoopStore } from '@/stores/wordLoopStore';

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
  /** Kata/rentang yang sedang diulang (Ulang Kata, docs/38). */
  loopRange?: WordRange | null;
  /**
   * Gestur Ulang Kata: ketuk kata, tekan lama + seret rentang. Bila diisi,
   * tiap kata menjadi tombol.
   */
  wordLoop?: WordLoopHandlers;
}

export interface WordLoopHandlers {
  onTap: (index: number, extend: boolean) => void;
  onRange: (anchor: number, current: number) => void;
}

/**
 * Teks Arab satu ayat dengan font Al-Qur'an dan sorot kata opsional
 * (data quran-align — `services/quran/word-timings.ts`).
 *
 * Gaya sorotan ada di `app/globals.css` (`.quran-word[data-state]`):
 * `active` = kata yang sedang dibaca, `read` = sudah dibaca. Tanpa
 * padding/margin agar tidak ada pergeseran layout saat kata berpindah.
 */
export const QuranAyahText = memo(function QuranAyahText({
  text,
  className,
  style,
  wordMode = false,
  activeRange = null,
  loopRange = null,
  wordLoop,
}: QuranAyahTextProps) {
  const t = useTranslations('wordLoop');
  const words = useMemo(
    () => (wordMode ? splitAyahWords(text) : []),
    [text, wordMode],
  );
  const containerRef = useRef<HTMLParagraphElement>(null);
  const interactive = wordMode && !!wordLoop;
  const selection = useWordGestures(containerRef, {
    enabled: interactive,
    onTap: (index, extend) => wordLoop?.onTap(index, extend),
    onRange: (anchor, current) => wordLoop?.onRange(anchor, current),
  });
  const selectionFrom = selection ? Math.min(selection.anchor, selection.current) : -1;
  const selectionTo = selection ? Math.max(selection.anchor, selection.current) : -1;
  // Satu tab stop per ayat: kata yang diulang, atau kata pertama.
  const rovingIndex = loopRange?.from ?? 0;

  return (
    <p
      ref={containerRef}
      dir="rtl"
      lang="ar"
      className={cn(
        quranFont.className,
        'text-foreground',
        interactive && 'quran-words-interactive',
        className,
      )}
      style={style}
    >
      {wordMode
        ? words.map((word, index) => {
            const state = !activeRange
              ? undefined
              : index >= activeRange.from && index < activeRange.to
                ? 'active'
                : index < activeRange.from
                  ? 'read'
                  : undefined;
            const looping =
              !!loopRange && index >= loopRange.from && index < loopRange.to;
            const selecting = index >= selectionFrom && index <= selectionTo;
            return (
              <span key={index}>
                {index > 0 ? ' ' : null}
                <span
                  data-word-index={index}
                  data-state={state}
                  data-loop={looping ? 'true' : undefined}
                  data-selecting={selecting ? 'true' : undefined}
                  aria-current={state === 'active' ? 'true' : undefined}
                  role={interactive ? 'button' : undefined}
                  tabIndex={interactive ? (index === rovingIndex ? 0 : -1) : undefined}
                  aria-pressed={interactive ? looping : undefined}
                  aria-label={
                    interactive
                      ? `${word} — ${t('wordAriaLabel', { number: index + 1 })}`
                      : undefined
                  }
                  className="quran-word"
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
  extends Omit<QuranAyahTextProps, 'wordMode' | 'activeRange' | 'loopRange'> {
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
  wordLoop,
  ...textProps
}: LiveQuranAyahTextProps) {
  const { available, range } = useActiveWordRange({
    surahId,
    ayahNumber,
    reciterId,
    enabled,
  });
  const loop = useWordLoopStore((s) => s.loop);
  const loopRange =
    loop &&
    loop.surahId === surahId &&
    loop.ayahNumber === ayahNumber &&
    loop.reciterId === reciterId
      ? loop.range
      : null;
  // Ulang Kata hanya butuh qari yang punya data waktu — tidak bergantung
  // pada pengaturan Sorot Kata.
  const loopAvailable = !!wordLoop && hasWordTimings(reciterId);
  // Bantalan potongan bisa menyentuh kata sebelum/sesudah rentang — sorotan
  // tetap di dalam rentang yang diulang agar tidak membingungkan.
  const shownRange =
    range && loopRange
      ? range.from >= loopRange.to
        ? { from: loopRange.to - 1, to: loopRange.to }
        : range.to <= loopRange.from
          ? { from: loopRange.from, to: loopRange.from + 1 }
          : range
      : range;

  return (
    <QuranAyahText
      {...textProps}
      wordMode={available || loopAvailable}
      activeRange={shownRange}
      loopRange={loopRange}
      wordLoop={loopAvailable ? wordLoop : undefined}
    />
  );
}
