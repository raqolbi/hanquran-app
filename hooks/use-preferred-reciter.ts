'use client';

import { useUserStore } from '@/stores/userStore';
import { getDefaultReciterId } from '@/services/quran';
import { normalizeReciterId } from '@/lib/reciter-preference';

/**
 * ID qari pilihan pengguna dari Pengaturan (persisten di Dexie).
 * Fallback ke qari default bila belum diinisialisasi atau ID tidak valid.
 */
export function usePreferredReciterId(): string {
  const initialized = useUserStore((s) => s.initialized);
  const reciterId = useUserStore((s) => s.settings.reciterId);

  if (!initialized) {
    return getDefaultReciterId();
  }

  return normalizeReciterId(reciterId);
}
