import { describe, expect, it } from 'vitest';

import { generateSurahStaticParams } from '@/lib/surah-static-params';
import {
  HANQURAN_TARGET_ANDROID,
  isAndroidBuild,
  isNativePlatform,
  isWebPlatform,
} from '@/lib/platform';

describe('generateSurahStaticParams', () => {
  it('menghasilkan 114 id surat', () => {
    const params = generateSurahStaticParams();
    expect(params).toHaveLength(114);
    expect(params[0]).toEqual({ id: '1' });
    expect(params[113]).toEqual({ id: '114' });
  });
});

describe('platform helpers', () => {
  it('isAndroidBuild mengikuti NEXT_PUBLIC_HANQURAN_TARGET / HANQURAN_TARGET', () => {
    const previousPublic = process.env.NEXT_PUBLIC_HANQURAN_TARGET;
    const previous = process.env.HANQURAN_TARGET;
    delete process.env.NEXT_PUBLIC_HANQURAN_TARGET;
    delete process.env.HANQURAN_TARGET;
    expect(isAndroidBuild()).toBe(false);

    process.env.NEXT_PUBLIC_HANQURAN_TARGET = HANQURAN_TARGET_ANDROID;
    expect(isAndroidBuild()).toBe(true);

    delete process.env.NEXT_PUBLIC_HANQURAN_TARGET;
    process.env.HANQURAN_TARGET = HANQURAN_TARGET_ANDROID;
    expect(isAndroidBuild()).toBe(true);

    if (previousPublic === undefined) {
      delete process.env.NEXT_PUBLIC_HANQURAN_TARGET;
    } else {
      process.env.NEXT_PUBLIC_HANQURAN_TARGET = previousPublic;
    }
    if (previous === undefined) {
      delete process.env.HANQURAN_TARGET;
    } else {
      process.env.HANQURAN_TARGET = previous;
    }
  });

  it('isNativePlatform false di lingkungan jsdom tanpa Capacitor', () => {
    expect(isNativePlatform()).toBe(false);
    expect(isWebPlatform()).toBe(true);
  });
});
