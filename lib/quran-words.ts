/**
 * Pemecah teks ayat menjadi kata untuk sorot kata (word highlight).
 *
 * Aturan HARUS sama dengan `countAyahWords` di
 * `scripts/build-word-timings.mjs` — indeks kata di data waktu (quran-align)
 * dihitung dengan aturan ini:
 *   - teks dipisah spasi;
 *   - token yang hanya berisi tanda (waqaf ۛ ۚ ۖ, tanda kecil, tatweel)
 *     bukan kata — digabung ke kata sebelumnya agar tetap tampil.
 */

const MARK_ONLY = /^[ؐ-ؚۖ-ۭـٰ]+$/u;

export function splitAyahWords(text: string): string[] {
  const words: string[] = [];

  for (const token of text.split(/\s+/u)) {
    if (!token) continue;
    if (MARK_ONLY.test(token) && words.length > 0) {
      words[words.length - 1] = `${words[words.length - 1]} ${token}`;
      continue;
    }
    words.push(token);
  }

  return words;
}
