'use client';

import { useEffect } from 'react';

import { useUserStore } from '@/stores/userStore';

/**
 * Menyimpan posisi baca terakhir (surat + ayat) ke Dexie `lastRead`.
 * Dipanggil dari Surah Detail & Focus Mode saat ayat aktif berubah.
 */
export function usePersistLastViewed(
  surahId: number,
  ayahNumber: number,
): void {
  const initialized = useUserStore((s) => s.initialized);
  const setLastViewed = useUserStore((s) => s.setLastViewed);

  useEffect(() => {
    if (!initialized || surahId < 1 || ayahNumber < 1) {
      return;
    }

    void setLastViewed(surahId, ayahNumber);
  }, [initialized, surahId, ayahNumber, setLastViewed]);
}
