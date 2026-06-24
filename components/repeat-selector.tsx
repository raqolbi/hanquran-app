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

interface RepeatSelectorProps {
  count: RepeatCount;
  isActive?: boolean;
  statusProps?: RepeatStatusProps;
  onOpenSettings?: () => void;
  onCountChange?: (count: RepeatCount) => void;
  /** Tinggi chrome bawah (audio player) untuk menghindari overlap menu. */
  bottomChromeHeight?: number;
}

export function RepeatSelector({
  count,
  isActive = false,
  statusProps,
  onOpenSettings,
  onCountChange,
  bottomChromeHeight = SURAH_DETAIL_AUDIO_MIN_HEIGHT,
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {tCommon('repeat')}
        </span>
        <button
          type="button"
          onClick={onOpenSettings}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={t('settingsAriaLabel')}
        >
          <Settings size={18} />
        </button>
      </div>

      <Select
        value={repeatCountToSelectValue(count)}
        onValueChange={(value) => {
          if (value == null) return;
          onCountChange?.(selectValueToRepeatCount(String(value)));
        }}
      >
        <SelectTrigger aria-label={tCommon('repeat')}>
          <SelectValue>
            <span className="flex items-center gap-2">
              <span className="text-lg" aria-hidden>
                {currentOption.emoji}
              </span>
              <span>{currentLabel}</span>
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

      {isActive && statusProps && <RepeatStatus {...statusProps} />}
    </div>
  );
}
