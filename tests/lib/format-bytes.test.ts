import { describe, expect, it } from 'vitest';

import { formatMegabytes } from '@/lib/format-bytes';

describe('formatMegabytes', () => {
  it('mengembalikan 0 untuk byte kosong', () => {
    expect(formatMegabytes(0)).toBe('0');
  });

  it('memformat byte ke MB', () => {
    expect(formatMegabytes(2 * 1024 * 1024)).toBe('2.0');
  });
});
