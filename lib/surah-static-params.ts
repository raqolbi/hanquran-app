import { SURAH_AYAH_COUNTS } from '@/lib/surah-ayah-counts';

/** Params statis untuk `/surah/[id]` dan `/focus/[id]` (1..114). */
export function generateSurahStaticParams(): { id: string }[] {
  return SURAH_AYAH_COUNTS.map((_, index) => ({ id: String(index + 1) }));
}
