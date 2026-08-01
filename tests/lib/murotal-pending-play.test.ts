import { afterEach, describe, expect, it } from 'vitest';

import {
  beginCrossSurahNavigation,
  cancelCrossSurahNavigation,
  clearPendingMurotalPlayForTests,
  consumePendingMurotalPlay,
  isCrossSurahNavigationCurrent,
  setPendingMurotalPlay,
} from '@/lib/murotal-pending-play';

describe('murotal-pending-play', () => {
  afterEach(() => {
    clearPendingMurotalPlayForTests();
  });

  it('cancelCrossSurahNavigation membatalkan token dan pending', () => {
    const token = beginCrossSurahNavigation();
    setPendingMurotalPlay(2, 1);
    expect(isCrossSurahNavigationCurrent(token)).toBe(true);

    cancelCrossSurahNavigation();
    expect(isCrossSurahNavigationCurrent(token)).toBe(false);
    expect(consumePendingMurotalPlay(2)).toBeNull();
  });

  it('mengabaikan konsumsi untuk surat yang berbeda', () => {
    setPendingMurotalPlay(2, 1);
    expect(consumePendingMurotalPlay(3)).toBeNull();
    expect(consumePendingMurotalPlay(2)).toBe(1);
  });

  it('bertahan lewat sessionStorage setelah state modul hilang (hard nav Capacitor)', () => {
    setPendingMurotalPlay(113, 1);
    // Simulasikan heap baru setelah location.replace — hanya storage yang tersisa.
    clearPendingMurotalPlayForTests();
    // clearPending menghapus storage juga — set ulang lalu hapus hanya memori:
    setPendingMurotalPlay(113, 1);
    // Akses internal: consume harus tetap membaca storage jika memory di-null
    // tanpa clear storage. Emulasikan dengan overwrite memory via set+manual:
    // set menulis keduanya; kita consume setelah "reload" dengan hanya storage.
    const raw = sessionStorage.getItem('hanquran:murotal-pending-play');
    expect(raw).toContain('"surahId":113');

    // "reload": buang memory dengan clear lalu restore storage saja
    clearPendingMurotalPlayForTests();
    sessionStorage.setItem(
      'hanquran:murotal-pending-play',
      JSON.stringify({ surahId: 113, ayahNumber: 1 }),
    );
    expect(consumePendingMurotalPlay(113)).toBe(1);
    expect(sessionStorage.getItem('hanquran:murotal-pending-play')).toBeNull();
  });
});
