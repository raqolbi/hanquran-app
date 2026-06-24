import { INFINITE, type RepeatCount } from '@/lib/repeat-options';

/** Nilai string untuk komponen Select (INFINITY tidak serializable). */
export function repeatCountToSelectValue(count: RepeatCount): string {
  return count === INFINITE ? 'infinite' : String(count);
}

export function selectValueToRepeatCount(value: string): RepeatCount {
  if (value === 'infinite') return INFINITE;
  return Number(value) as RepeatCount;
}

/** Padding tabrakan untuk menu repeat — menjaga jarak dari audio player sticky. */
export function getRepeatMenuCollisionPadding(bottomChromeHeight: number) {
  return {
    top: 8,
    bottom: bottomChromeHeight + 8,
    left: 8,
    right: 8,
  } as const;
}

/**
 * Menentukan apakah menu repeat sebaiknya dibuka ke atas.
 * Dipakai untuk dokumentasi & pengujian; Select base-ui juga melakukan flip otomatis.
 */
export function shouldPreferRepeatMenuTop(
  triggerRect: { top: number; bottom: number },
  viewportHeight: number,
  menuHeight: number,
  bottomChromeHeight: number,
): boolean {
  const spaceBelow =
    viewportHeight - triggerRect.bottom - bottomChromeHeight;
  const spaceAbove = triggerRect.top;

  if (spaceBelow < menuHeight) return true;
  if (spaceAbove < menuHeight && spaceBelow >= menuHeight) return false;
  return spaceBelow < spaceAbove;
}

/** Perkiraan tinggi menu repeat (6 opsi × 44px tap target). */
export const REPEAT_MENU_ESTIMATED_HEIGHT = 6 * 44;
