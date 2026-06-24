import { describe, expect, it } from 'vitest';

import { getTranslationLanguage } from '@/lib/translation-language';

describe('translation-language', () => {
  it('memetakan appLocale ke folder terjemahan ayat', () => {
    expect(getTranslationLanguage('id')).toBe('id');
    expect(getTranslationLanguage('en')).toBe('en');
  });
});
