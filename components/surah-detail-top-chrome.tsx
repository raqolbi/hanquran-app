'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SurahDetailTopChromeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Chrome atas Surah Detail — header + Reading Controls. Ikut tergulir; setelah
 * keluar layar, `SurahCompactBar` menempel di atas.
 */
export function SurahDetailTopChrome({
  children,
  className,
}: SurahDetailTopChromeProps) {
  return (
    <div
      data-surah-detail-top-chrome
      className={cn(
        // Tidak sticky: saat digulir digantikan `SurahCompactBar` supaya area baca lebih luas.
        'relative pt-safe',
        // Solid: di WebView Android ayat yang digulir tembus lewat latar transparan.
        'border-b border-border bg-background',
        className,
      )}
    >
      {children}
    </div>
  );
}
