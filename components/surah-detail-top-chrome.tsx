'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SurahDetailTopChromeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Chrome atas Surah Detail — header + Reading Controls dalam satu blok sticky.
 */
export function SurahDetailTopChrome({
  children,
  className,
}: SurahDetailTopChromeProps) {
  return (
    <div
      data-surah-detail-top-chrome
      className={cn(
        'sticky top-0 z-30 pt-safe',
        // Solid: di WebView Android ayat yang digulir tembus lewat latar transparan.
        'border-b border-border bg-background',
        'short-landscape:static short-landscape:z-auto',
        className,
      )}
    >
      {children}
    </div>
  );
}
