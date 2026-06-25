import { INFINITE, type RepeatCount } from '@/lib/repeat-options';

/** Label fraksi progress repeat, mis. `2/5` atau `3/∞`. */
export function formatRepeatProgressLabel(
  current: number,
  total: RepeatCount,
): string {
  const totalLabel = total === INFINITE ? '∞' : String(total);
  return `${current}/${totalLabel}`;
}
