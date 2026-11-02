'use client';

import { useEffect } from 'react';

import { useUserStore } from '@/stores/userStore';

/**
 * Menyimpan posisi baca terakhir (surat + ayat) ke Dexie `lastRead`.
 *
 * Hanya menyimpan setelah pengguna **benar-benar berinteraksi** dengan surat
 * ini (`engaged`): memutar audio, mengetuk ayat, atau berpindah ayat di Mode
 * Fokus. Sekadar membuka/mengintip surat lain tidak lagi menimpa posisi
 * "Lanjutkan Hafalan" (docs/39 A1).
 */
export function usePersistLastViewed(
  surahId: number,
  ayahNumber: number,
  engaged: boolean,
): void {
  const initialized = useUserStore((s) => s.initialized);
  const setLastViewed = useUserStore((s) => s.setLastViewed);

  useEffect(() => {
    if (!engaged || !initialized || surahId < 1 || ayahNumber < 1) {
      return;
    }

    void setLastViewed(surahId, ayahNumber).catch(() => {
      // Dexie gagal — posisi tetap di memori; tidak perlu mengganggu pengguna.
    });
  }, [engaged, initialized, surahId, ayahNumber, setLastViewed]);
}
