import { describe, expect, it } from 'vitest';

import {
  getAlternateTranslationLanguage,
  getTranslationLanguage,
} from '@/lib/translation-language';

describe('translation-language', () => {
  it('memetakan appLocale ke folder terjemahan ayat', () => {
    expect(getTranslationLanguage('id')).toBe('id');
    expect(getTranslationLanguage('en')).toBe('en');
  });

  it('memberi bahasa alternatif untuk prefetch', () => {
    expect(getAlternateTranslationLanguage('id')).toBe('en');
    expect(getAlternateTranslationLanguage('en')).toBe('id');
    expect(getAlternateTranslationLanguage('fr')).toBe('id');
  });
});
