import { describe, expect, it } from 'vitest';

import { normalizeReciterId } from '@/lib/reciter-preference';
import { getDefaultReciterId } from '@/services/quran';

describe('lib/reciter-preference', () => {
  it('mengembalikan ID valid apa adanya', () => {
    expect(normalizeReciterId('Husary_128kbps')).toBe('Husary_128kbps');
  });

  it('fallback ke default untuk ID tidak dikenal', () => {
    expect(normalizeReciterId('unknown-qari')).toBe(getDefaultReciterId());
    expect(normalizeReciterId(undefined)).toBe(getDefaultReciterId());
  });
});
