export type RepeatTarget = 'current_ayah' | 'ayah_range' | 'entire_surah';

export const INFINITE = Number.POSITIVE_INFINITY;

export type RepeatCount = 1 | 5 | 10 | 25 | 50 | typeof INFINITE;

export interface RepeatOption {
  value: RepeatCount;
  emoji: string;
  label: string;
}

export const REPEAT_OPTIONS: RepeatOption[] = [
  { value: 1, emoji: '🐣', label: '1x' },
  { value: 5, emoji: '🐥', label: '5x' },
  { value: 10, emoji: '🐤', label: '10x' },
  { value: 25, emoji: '🦜', label: '25x' },
  { value: 50, emoji: '🦅', label: '50x' },
  { value: INFINITE, emoji: '♾️', label: 'Infinite' },
];

export function getRepeatOption(value: number): RepeatOption {
  return (
    REPEAT_OPTIONS.find((opt) => opt.value === value) ?? REPEAT_OPTIONS[1]
  );
}

export function formatRepeatCount(value: number): string {
  return value === INFINITE ? '∞' : `${value}x`;
}
