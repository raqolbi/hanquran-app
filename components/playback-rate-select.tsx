'use client';

import { useEffect, useMemo } from 'react';
import { Gauge } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPlaybackRate, isPlaybackRate, PLAYBACK_RATES } from '@/lib/playback-rate';
import { getRepeatMenuCollisionPadding } from '@/lib/repeat-select';
import { cn } from '@/lib/utils';
import { getAudioController } from '@/services/audio-controller';
import { useAudioStore } from '@/stores/audioStore';
import { useUserStore } from '@/stores/userStore';

interface PlaybackRateSelectProps {
  /** Tinggi chrome bawah (audio player) agar menu tidak tertutup. */
  bottomChromeHeight: number;
}

/**
 * Pilihan kecepatan putar (0.5× – 1.5×) di baris kontrol audio.
 * Disimpan di `settings.playbackRate` (Dexie) dan diterapkan ke
 * `AudioController` — berlaku juga untuk sorot kata & Ulang Kata.
 */
export function PlaybackRateSelect({ bottomChromeHeight }: PlaybackRateSelectProps) {
  const t = useTranslations('audio');
  const locale = useLocale();
  const initialized = useUserStore((s) => s.initialized);
  const savedRate = useUserStore((s) => s.settings.playbackRate);
  const updateSettings = useUserStore((s) => s.updateSettings);
  const rate = isPlaybackRate(savedRate) ? savedRate : 1;

  // Terapkan kecepatan tersimpan ke pemutar (saat app dibuka / berubah di tab ini).
  useEffect(() => {
    if (!initialized) return;
    if (useAudioStore.getState().playbackRate !== rate) {
      getAudioController()?.setPlaybackRate(rate);
    }
  }, [initialized, rate]);

  const collisionPadding = useMemo(
    () => getRepeatMenuCollisionPadding(bottomChromeHeight),
    [bottomChromeHeight],
  );
  const label = formatPlaybackRate(rate, locale);

  return (
    <Select
      value={String(rate)}
      onValueChange={(value) => {
        const next = Number(value);
        if (!isPlaybackRate(next)) return;
        getAudioController()?.setPlaybackRate(next);
        void updateSettings({ playbackRate: next });
      }}
    >
      <SelectTrigger
        aria-label={t('playbackRateAriaLabel', { rate: label })}
        className={cn(
          'h-7 w-auto shrink-0 gap-1 rounded-md px-1.5 text-xs short-landscape:h-6 [&>span:last-child]:hidden',
          rate !== 1 && 'border-primary/50 bg-emerald-50 text-primary',
        )}
      >
        <SelectValue>
          <span className="flex items-center gap-1 tabular-nums">
            <Gauge size={13} aria-hidden="true" />
            <span className="font-medium">{label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent side="top" sideOffset={8} collisionPadding={collisionPadding}>
        {PLAYBACK_RATES.map((option) => {
          const selected = option === rate;
          return (
            <SelectItem
              key={option}
              value={String(option)}
              className={cn(
                'min-h-11 py-2.5 tabular-nums',
                selected &&
                  'bg-primary text-white data-[highlighted]:bg-primary/90 data-[highlighted]:text-white [&_svg]:text-white',
              )}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span className="font-medium">{formatPlaybackRate(option, locale)}</span>
                <span className={cn('text-xs', selected ? 'text-white/80' : 'text-muted-foreground')}>
                  {option === 0.5
                    ? t('playbackRateVerySlow')
                    : option === 0.75
                      ? t('playbackRateSlow')
                      : option === 1
                        ? t('playbackRateNormal')
                        : option === 1.25
                          ? t('playbackRateFast')
                          : t('playbackRateVeryFast')}
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
