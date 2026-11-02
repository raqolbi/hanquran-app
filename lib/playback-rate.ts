import type { PlaybackRate } from '@/types';

/** Pilihan kecepatan putar, urut dari paling lambat. */
export const PLAYBACK_RATES: readonly PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5];

export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 1;

export function isPlaybackRate(value: unknown): value is PlaybackRate {
  return typeof value === 'number' && (PLAYBACK_RATES as readonly number[]).includes(value);
}

/** Label tampilan: `0.5×`, `1×`, `1.25×` — angka desimal mengikuti locale. */
export function formatPlaybackRate(rate: PlaybackRate, locale: string): string {
  return `${rate.toLocaleString(locale, { maximumFractionDigits: 2 })}×`;
}
