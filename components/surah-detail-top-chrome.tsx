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
        'sticky top-[env(safe-area-inset-top,0px)] z-30',
        'border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90',
        className,
      )}
    >
      {children}
    </div>
  );
}
