import { describe, expect, it } from 'vitest';

import { INFINITE } from '@/lib/repeat-options';
import { formatRepeatProgressLabel } from '@/lib/repeat-progress';

describe('formatRepeatProgressLabel', () => {
  it('memformat fraksi repeat terbatas', () => {
    expect(formatRepeatProgressLabel(2, 5)).toBe('2/5');
  });

  it('memformat repeat infinite', () => {
    expect(formatRepeatProgressLabel(7, INFINITE)).toBe('7/∞');
  });
});
