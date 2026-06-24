import { describe, expect, it } from 'vitest';

import { INFINITE } from '@/lib/repeat-options';
import {
  REPEAT_MENU_ESTIMATED_HEIGHT,
  getRepeatMenuCollisionPadding,
  repeatCountToSelectValue,
  selectValueToRepeatCount,
  shouldPreferRepeatMenuTop,
} from '@/lib/repeat-select';

describe('lib/repeat-select', () => {
  it('mengonversi repeat count ke nilai select dan kembali', () => {
    expect(repeatCountToSelectValue(5)).toBe('5');
    expect(repeatCountToSelectValue(INFINITE)).toBe('infinite');
    expect(selectValueToRepeatCount('10')).toBe(10);
    expect(selectValueToRepeatCount('infinite')).toBe(INFINITE);
  });

  it('collision padding menyertakan tinggi audio chrome', () => {
    expect(getRepeatMenuCollisionPadding(96)).toEqual({
      top: 8,
      bottom: 104,
      left: 8,
      right: 8,
    });
  });

  describe('shouldPreferRepeatMenuTop — viewport mobile', () => {
    const bottomChrome = 96;
    const menuHeight = REPEAT_MENU_ESTIMATED_HEIGHT;

    it('360px: panel dekat audio → buka ke atas', () => {
      const trigger = { top: 520, bottom: 564 };
      expect(shouldPreferRepeatMenuTop(trigger, 740, menuHeight, bottomChrome)).toBe(
        true,
      );
    });

    it('390px: panel dekat audio → buka ke atas', () => {
      const trigger = { top: 548, bottom: 592 };
      expect(shouldPreferRepeatMenuTop(trigger, 780, menuHeight, bottomChrome)).toBe(
        true,
      );
    });

    it('414px: panel dekat audio → buka ke atas', () => {
      const trigger = { top: 572, bottom: 616 };
      expect(shouldPreferRepeatMenuTop(trigger, 820, menuHeight, bottomChrome)).toBe(
        true,
      );
    });

    it('tablet: ruang atas cukup → tetap prefer atas saat bawah sempit', () => {
      const trigger = { top: 640, bottom: 684 };
      expect(
        shouldPreferRepeatMenuTop(trigger, 1024, menuHeight, bottomChrome),
      ).toBe(true);
    });

    it('desktop: ruang bawah cukup → buka ke bawah', () => {
      const trigger = { top: 200, bottom: 244 };
      expect(
        shouldPreferRepeatMenuTop(trigger, 900, menuHeight, bottomChrome),
      ).toBe(false);
    });
  });
});
