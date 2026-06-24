import type { CSSProperties } from 'react';

export type ArabicTextSize = 'small' | 'medium' | 'large';

export const ARABIC_TEXT_SIZE_PX: Record<ArabicTextSize, number> = {
  small: 32,
  medium: 40,
  large: 48,
};

export const DEFAULT_ARABIC_TEXT_SIZE: ArabicTextSize = 'medium';

export const DEFAULT_ARABIC_FONT_SIZE_PX =
  ARABIC_TEXT_SIZE_PX[DEFAULT_ARABIC_TEXT_SIZE];

const FOCUS_ARABIC_FONT_SIZE_CLAMP: Record<ArabicTextSize, string> = {
  small: 'clamp(2rem, 5vw, 2.75rem)',
  medium: 'clamp(3rem, 7vw, 3.5rem)',
  large: 'clamp(3.5rem, 8vw, 4.5rem)',
};

const PRESET_PX = Object.values(ARABIC_TEXT_SIZE_PX);

/** Snap nilai legacy ke preset terdekat (32 / 40 / 48 px). */
export function normalizeArabicFontSize(fontSize: number): number {
  let best = DEFAULT_ARABIC_FONT_SIZE_PX;
  let bestDiff = Infinity;

  for (const px of PRESET_PX) {
    const diff = Math.abs(px - fontSize);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = px;
    }
  }

  return best;
}

export function fontSizeToTextSize(fontSize: number): ArabicTextSize {
  const normalized = normalizeArabicFontSize(fontSize);
  const entry = (
    Object.entries(ARABIC_TEXT_SIZE_PX) as [ArabicTextSize, number][]
  ).find(([, px]) => px === normalized);

  return entry?.[0] ?? DEFAULT_ARABIC_TEXT_SIZE;
}

export function textSizeToFontSize(size: ArabicTextSize): number {
  return ARABIC_TEXT_SIZE_PX[size];
}

export function getArabicTextStyle(fontSize: number): CSSProperties {
  return {
    fontSize: normalizeArabicFontSize(fontSize),
    lineHeight: 1.9,
  };
}

export function getFocusArabicTextStyle(fontSize: number): CSSProperties {
  const size = fontSizeToTextSize(fontSize);
  return {
    fontSize: FOCUS_ARABIC_FONT_SIZE_CLAMP[size],
    lineHeight: 1.9,
  };
}
