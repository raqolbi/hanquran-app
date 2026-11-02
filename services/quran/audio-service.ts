import recitersData from '@/data/reciters.json';

import type { Reciter } from './app-types';
import { AYAH_AUDIO_BASE_URL } from './audio-config';
import { formatAyahCode } from './paths';

const reciters: Reciter[] = recitersData;

export function getReciters(): Reciter[] {
  return reciters;
}

/**
 * Qari default pengguna baru. Dipilih karena didukung sorot kata
 * (`docs/37`) dan termasuk qari paling dikenal. Pengguna lama tetap
 * memakai qari yang tersimpan di Dexie.
 */
export const DEFAULT_RECITER_ID = 'Alafasy_128kbps';

export function getDefaultReciterId(): string {
  return reciters.some((reciter) => reciter.id === DEFAULT_RECITER_ID)
    ? DEFAULT_RECITER_ID
    : (reciters[0]?.id ?? DEFAULT_RECITER_ID);
}

export function getReciterById(id: string): Reciter | undefined {
  return reciters.find((reciter) => reciter.id === id);
}

/** Bangun URL audio tilawah untuk satu ayat. */
export function buildAyahAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number,
): string {
  const fileName = `${formatAyahCode(surahNumber, ayahNumber)}.mp3`;
  return `${AYAH_AUDIO_BASE_URL}/${reciterId}/${fileName}`;
}

/** URL ayat berikutnya untuk prefetch (null jika sudah ayat terakhir). */
export function getNextAyahPrefetchUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number,
  totalAyahs: number,
): string | null {
  if (ayahNumber >= totalAyahs) return null;
  return buildAyahAudioUrl(reciterId, surahNumber, ayahNumber + 1);
}
