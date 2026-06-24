import recitersData from '@/data/reciters.json';

import type { Reciter } from './app-types';
import { EVERY_AYAH_BASE_URL } from './audio-config';
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

/** Bangun URL audio EveryAyah untuk satu ayat. */
export function buildAyahAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number,
): string {
  const fileName = `${formatAyahCode(surahNumber, ayahNumber)}.mp3`;
  return `${EVERY_AYAH_BASE_URL}/${reciterId}/${fileName}`;
}
