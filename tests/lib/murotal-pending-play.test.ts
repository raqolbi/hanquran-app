import { describe, expect, it } from 'vitest';

import {
  clearPendingMurotalPlayForTests,
  consumePendingMurotalPlay,
  setPendingMurotalPlay,
} from '@/lib/murotal-pending-play';

describe('murotal-pending-play', () => {
  it('menyimpan dan mengonsumsi intent pemutaran per surat', () => {
    clearPendingMurotalPlayForTests();

    setPendingMurotalPlay(2, 1);
    expect(consumePendingMurotalPlay(2)).toBe(1);
    expect(consumePendingMurotalPlay(2)).toBeNull();
  });

  it('mengabaikan konsumsi untuk surat yang berbeda', () => {
    clearPendingMurotalPlayForTests();

    setPendingMurotalPlay(2, 1);
    expect(consumePendingMurotalPlay(3)).toBeNull();
    expect(consumePendingMurotalPlay(2)).toBe(1);
  });
});
