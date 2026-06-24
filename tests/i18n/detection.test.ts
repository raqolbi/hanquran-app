import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { detectAppLocale } from '@/i18n/detection';

describe('detectAppLocale', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.stubGlobal('navigator', {
      language: 'en-US',
      languages: ['en-US'],
    });
  });

  afterEach(() => {
    vi.stubGlobal('navigator', originalNavigator);
    vi.unstubAllGlobals();
  });

  it('mengembalikan id untuk locale browser Indonesia', () => {
    vi.stubGlobal('navigator', {
      language: 'id-ID',
      languages: ['id-ID', 'en-US'],
    });
    expect(detectAppLocale()).toBe('id');
  });

  it('mengembalikan id untuk timezone Indonesia', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      locale: 'en-US',
      calendar: 'gregory',
      numberingSystem: 'latn',
      timeZone: 'Asia/Jakarta',
    } as Intl.ResolvedDateTimeFormatOptions);

    expect(detectAppLocale()).toBe('id');
  });

  it('mengembalikan en untuk locale non-Indonesia', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      locale: 'en-US',
      calendar: 'gregory',
      numberingSystem: 'latn',
      timeZone: 'Europe/London',
    } as Intl.ResolvedDateTimeFormatOptions);

    expect(detectAppLocale()).toBe('en');
  });
});
