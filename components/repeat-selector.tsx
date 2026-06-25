'use client';

import { Settings } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import {
  REPEAT_OPTIONS,
  INFINITE,
  getRepeatOption,
  type RepeatCount,
} from '@/lib/repeat-options';
import {
  getRepeatMenuCollisionPadding,
  repeatCountToSelectValue,
  selectValueToRepeatCount,
} from '@/lib/repeat-select';
import { SURAH_DETAIL_AUDIO_MIN_HEIGHT } from '@/lib/surah-detail-chrome';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RepeatStatus, type RepeatStatusProps } from './repeat-status';
import { RepeatProgressBadge } from './repeat-progress-badge';

interface RepeatSelectorProps {
  count: RepeatCount;
  isActive?: boolean;
  statusProps?: RepeatStatusProps;
  onOpenSettings?: () => void;
  onCountChange?: (count: RepeatCount) => void;
  /** Tinggi chrome bawah (audio player) untuk menghindari overlap menu. */
  bottomChromeHeight?: number;
  /** `inline` — satu baris di dalam audio player (landscape HP). */
  variant?: 'panel' | 'inline';
}

export function RepeatSelector({
  count,
  isActive = false,
  statusProps,
  onOpenSettings,
  onCountChange,
  bottomChromeHeight = SURAH_DETAIL_AUDIO_MIN_HEIGHT,
  variant = 'panel',
}: RepeatSelectorProps) {
  const t = useTranslations('repeat');
  const tCommon = useTranslations('common');

  const currentOption = getRepeatOption(count);

  const repeatOptions = useMemo(
    () =>
      REPEAT_OPTIONS.map((option) => ({
        ...option,
        label:
          option.value === INFINITE ? t('infinite') : option.label,
      })),
    [t],
  );

  const currentLabel =
    count === INFINITE ? t('infinite') : currentOption.label;

  const collisionPadding = useMemo(
    () => getRepeatMenuCollisionPadding(bottomChromeHeight),
    [bottomChromeHeight],
  );

  const selectControl = (
    <Select
      value={repeatCountToSelectValue(count)}
      onValueChange={(value) => {
        if (value == null) return;
        onCountChange?.(selectValueToRepeatCount(String(value)));
      }}
    >
      <SelectTrigger
        aria-label={tCommon('repeat')}
        className={cn(
          variant === 'inline' &&
            'h-9 w-auto min-w-[5.5rem] shrink-0 px-2 text-xs',
        )}
      >
        <SelectValue>
          <span className="flex items-center gap-1.5">
            <span
              className={cn('leading-none', variant === 'inline' ? 'text-base' : 'text-lg')}
              aria-hidden
            >
              {currentOption.emoji}
            </span>
            <span className={variant === 'inline' ? 'font-medium' : undefined}>
              {currentLabel}
            </span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        side="top"
        sideOffset={8}
        collisionPadding={collisionPadding}
        className="max-h-[min(18rem,calc(100dvh-8rem))] overflow-y-auto"
      >
        {repeatOptions.map((option) => {
          const isSelected = count === option.value;
          return (
            <SelectItem
              key={repeatCountToSelectValue(option.value)}
              value={repeatCountToSelectValue(option.value)}
              className={cn(
                'min-h-11 py-2.5',
                isSelected &&
                  'bg-primary text-white data-[highlighted]:bg-primary/90 data-[highlighted]:text-white [&_svg]:text-white',
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg" aria-hidden>
                  {option.emoji}
                </span>
                {option.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  const settingsButton = (
    <button
      type="button"
      onClick={onOpenSettings}
      className={cn(
        'rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
        variant === 'inline' ? 'shrink-0 p-2' : 'p-1.5',
      )}
      aria-label={t('settingsAriaLabel')}
    >
      <Settings size={variant === 'inline' ? 16 : 18} />
    </button>
  );

  if (variant === 'inline') {
    return (
      <div className="flex shrink-0 items-center gap-1">
        {selectControl}
        {isActive && statusProps ? (
          <RepeatProgressBadge
            current={statusProps.currentCycle}
            total={statusProps.repeatCount}
          />
        ) : null}
        {settingsButton}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {tCommon('repeat')}
        </span>
        {settingsButton}
      </div>

      {selectControl}

      {isActive && statusProps && <RepeatStatus {...statusProps} />}
    </div>
  );
}
