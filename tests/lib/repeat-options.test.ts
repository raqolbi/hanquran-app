import { describe, expect, it } from 'vitest';

import { getRepeatOption, INFINITE, REPEAT_OPTIONS } from '@/lib/repeat-options';

describe('repeat-options', () => {
  it('pilihan jumlah ulang urut, termasuk 3×', () => {
    expect(REPEAT_OPTIONS.map((o) => o.value)).toEqual([1, 3, 5, 10, 25, 50, INFINITE]);
  });

  it('nilai tak dikenal kembali ke 5×', () => {
    expect(getRepeatOption(3).label).toBe('3x');
    expect(getRepeatOption(7).value).toBe(5);
  });
});
