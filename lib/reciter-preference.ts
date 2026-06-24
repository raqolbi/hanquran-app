import { getDefaultReciterId, getReciterById } from '@/services/quran';

/** Pastikan ID qari valid; fallback ke default dari `data/reciters.json`. */
export function normalizeReciterId(candidate: string | undefined): string {
  if (candidate && getReciterById(candidate)) {
    return candidate;
  }
  return getDefaultReciterId();
}
