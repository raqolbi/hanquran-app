'use client';

import { useMemo } from 'react';

import {
  fontSizeToTextSize,
  getArabicTextStyle,
  getFocusArabicTextStyle,
  type ArabicTextSize,
} from '@/lib/arabic-text-size';
import { useUserStore } from '@/stores/userStore';

export function useArabicTextSize(): {
  fontSize: number;
  textSize: ArabicTextSize;
  arabicStyle: ReturnType<typeof getArabicTextStyle>;
  focusArabicStyle: ReturnType<typeof getFocusArabicTextStyle>;
} {
  const fontSize = useUserStore((s) => s.settings.fontSize);

  return useMemo(
    () => ({
      fontSize,
      textSize: fontSizeToTextSize(fontSize),
      arabicStyle: getArabicTextStyle(fontSize),
      focusArabicStyle: getFocusArabicTextStyle(fontSize),
    }),
    [fontSize],
  );
}
