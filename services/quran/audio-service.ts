import recitersData from '@/data/reciters.json';

import type { Reciter } from './app-types';
import { AYAH_AUDIO_BASE_URL } from './audio-config';
import { formatAyahCode } from './paths';

const reciters: Reciter[] = recitersData;

export function getReciters(): Reciter[] {
  return reciters;
}

export function getDefaultReciterId(): string {
  return reciters[0]?.id ?? 'Alafasy_128kbps';
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
