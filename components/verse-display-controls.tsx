'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface VerseDisplayControlsProps {
  showTranslation: boolean;
  showTransliteration: boolean;
  onToggleTranslation: () => void;
  onToggleTransliteration: () => void;
  onFocusMode: () => void;
  /** Pin baris kontrol saat scroll — default aktif di Surah Detail. */
  sticky?: boolean;
}

interface ReadingToggleProps {
  checked: boolean;
  label: string;
  onClick: () => void;
}

function ReadingToggle({ checked, label, onClick }: ReadingToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className={cn(
        'flex flex-1 min-h-11 short-landscape:min-h-9 items-center justify-center gap-1 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 short-landscape:text-xs short-landscape:py-1.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked
          ? 'border border-primary bg-primary/10 text-foreground'
          : 'border border-border bg-secondary text-foreground hover:border-primary/40',
      )}
    >
      <span aria-hidden className="text-xs leading-none">
        {checked ? '✓' : '○'}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

/**
 * Verse Display Controls — satu baris di bawah header surat.
 * Spesifikasi: `docs/22-verse-display-controls.md`
 */
export function VerseDisplayControls({
  showTranslation,
  showTransliteration,
  onToggleTranslation,
  onToggleTransliteration,
  onFocusMode,
  sticky = true,
}: VerseDisplayControlsProps) {
  const t = useTranslations('surah');

  return (
    <div
      className={cn(
        'max-w-3xl mx-auto px-4 py-3 short-landscape:py-2',
        sticky &&
          'sticky top-[env(safe-area-inset-top,0px)] z-30 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90',
      )}
    >
      <div className="flex items-stretch gap-2 sm:gap-3">
        <ReadingToggle
          checked={showTranslation}
          label={t('translation')}
          onClick={onToggleTranslation}
        />
        <ReadingToggle
          checked={showTransliteration}
          label={t('transliteration')}
          onClick={onToggleTransliteration}
        />
        <button
          type="button"
          onClick={onFocusMode}
          className={cn(
            'flex flex-1 min-h-11 short-landscape:min-h-9 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 short-landscape:text-xs short-landscape:py-1.5',
            'border border-border bg-secondary text-foreground hover:border-primary/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <span aria-hidden className="text-base leading-none">
            🎯
          </span>
          <span className="truncate">{t('focus')}</span>
        </button>
      </div>
    </div>
  );
}
