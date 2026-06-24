import { describe, expect, it } from 'vitest';

import {
  DEFAULT_ARABIC_FONT_SIZE_PX,
  fontSizeToTextSize,
  getArabicTextStyle,
  getFocusArabicTextStyle,
  normalizeArabicFontSize,
  textSizeToFontSize,
} from '@/lib/arabic-text-size';

describe('arabic-text-size', () => {
  it('memetakan preset enum ↔ px', () => {
    expect(textSizeToFontSize('small')).toBe(32);
    expect(textSizeToFontSize('medium')).toBe(40);
    expect(textSizeToFontSize('large')).toBe(48);
    expect(fontSizeToTextSize(40)).toBe('medium');
  });

  it('menormalisasi nilai legacy ke preset terdekat', () => {
    expect(normalizeArabicFontSize(28)).toBe(32);
    expect(normalizeArabicFontSize(36)).toBe(32);
    expect(normalizeArabicFontSize(44)).toBe(40);
    expect(normalizeArabicFontSize(999)).toBe(48);
  });

  it('memberi gaya Arab untuk Surah Detail dan Focus', () => {
    expect(getArabicTextStyle(40)).toEqual({ fontSize: 40, lineHeight: 1.9 });
    expect(getFocusArabicTextStyle(40).fontSize).toContain('clamp');
    expect(getArabicTextStyle(DEFAULT_ARABIC_FONT_SIZE_PX).fontSize).toBe(40);
  });
});
