import { describe, expect, it } from 'vitest';

import {
  TOTAL_SURAHS,
  resolveMurotalAfterAyahEnd,
} from '@/services/murotal-resolver';

describe('murotal-resolver', () => {
  it('melanjutkan ke ayat berikutnya dalam surat yang sama', () => {
    expect(
      resolveMurotalAfterAyahEnd({
        surahId: 2,
        currentAyah: 3,
        totalAyahs: 286,
      }),
    ).toEqual({ type: 'advance_ayah', ayahNumber: 4 });
  });

  it('melanjutkan ke surat berikutnya dari ayat terakhir', () => {
    expect(
      resolveMurotalAfterAyahEnd({
        surahId: 1,
        currentAyah: 7,
        totalAyahs: 7,
      }),
    ).toEqual({ type: 'advance_surah', surahId: 2, ayahNumber: 1 });
  });

  it('berhenti di akhir Al-Qur\'an', () => {
    expect(
      resolveMurotalAfterAyahEnd({
        surahId: TOTAL_SURAHS,
        currentAyah: 6,
        totalAyahs: 6,
      }),
    ).toEqual({ type: 'stop', reason: 'quran_complete' });
  });

  it('menghormati totalAyahs kustom', () => {
    expect(
      resolveMurotalAfterAyahEnd({
        surahId: 5,
        currentAyah: 10,
        totalAyahs: 10,
      }),
    ).toEqual({ type: 'advance_surah', surahId: 6, ayahNumber: 1 });
  });
});
