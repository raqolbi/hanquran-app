'use client';

import { cn } from '@/lib/utils';

interface AyahWordHighlightProps {
  word: string;
  isActive: boolean;
  onClick?: () => void;
}

/**
 * Word-level highlight for the active Arabic token.
 *
 * **Post-MVP:** Komponen disiapkan untuk integrasi word timing + audio.
 * MVP V1 tidak mengaktifkan highlight — lihat `docs/24-focus-mode-mvp-scope.md`.
 *
 * Visual contract (spec §10 and high-fidelity §6):
 *   default     → transparent background, primary text
 *   highlighted → #D1FAE5 background (emerald-100), #065F46 text (emerald-800)
 *
 * Transition: 200ms fade via color-only CSS transitions. No blink, pulse, or flash.
 */
export function AyahWordHighlight({
  word,
  isActive,
  onClick,
}: AyahWordHighlightProps) {
  const interactive = Boolean(onClick);

  return (
    <span
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        'inline-block rounded-md px-1.5 py-0.5 mx-0.5',
        'transition-colors duration-200 ease-out',
        interactive && 'cursor-pointer',
        isActive
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-transparent text-foreground',
      )}
    >
      {word}
    </span>
  );
}
