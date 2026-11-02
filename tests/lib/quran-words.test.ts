import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { splitAyahWords } from '@/lib/quran-words';
// @ts-expect-error — modul .mjs tanpa deklarasi tipe
import { countAyahWords } from '@/scripts/build-word-timings.mjs';

const ROOT = resolve(process.cwd());
const QURAN_DIR = join(ROOT, 'public/data/quran');
const TIMINGS_DIR = join(ROOT, 'public/data/word-timings/v1');

describe('splitAyahWords', () => {
  it('memisah kata dan menggabungkan tanda waqaf ke kata sebelumnya', () => {
    const words = splitAyahWords('ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ');
    expect(words).toEqual([
      'ذَٰلِكَ',
      'ٱلْكِتَٰبُ',
      'لَا',
      'رَيْبَ ۛ',
      'فِيهِ ۛ',
      'هُدًى',
      'لِّلْمُتَّقِينَ',
    ]);
  });

  it('jumlah kata sama dengan aturan skrip pembangun data untuk seluruh dataset', () => {
    for (const file of readdirSync(QURAN_DIR)) {
      const surah = JSON.parse(readFileSync(join(QURAN_DIR, file), 'utf8'));
      for (const verse of surah.verses) {
        expect(splitAyahWords(verse.text).length).toBe(countAyahWords(verse.text));
      }
    }
  });

  it('indeks kata di data waktu tidak pernah melebihi jumlah kata ayat', { timeout: 30000 }, () => {
    const wordCounts = new Map<string, number>();
    for (const file of readdirSync(QURAN_DIR)) {
      const surah = JSON.parse(readFileSync(join(QURAN_DIR, file), 'utf8'));
      for (const verse of surah.verses) {
        wordCounts.set(`${surah.id}:${verse.ayah}`, splitAyahWords(verse.text).length);
      }
    }

    const problems: string[] = [];
    for (const reciter of readdirSync(TIMINGS_DIR)) {
      for (const file of readdirSync(join(TIMINGS_DIR, reciter))) {
        const data = JSON.parse(readFileSync(join(TIMINGS_DIR, reciter, file), 'utf8'));
        for (const [ayah, segments] of Object.entries(
          data.ayahs as Record<string, [number, number, number, number][]>,
        )) {
          const count = wordCounts.get(`${data.surah}:${ayah}`)!;
          let previousStart = -1;
          for (const [from, to, start, end] of segments) {
            // Urut menurut waktu mulai — syarat pencarian biner di klien.
            if (from < 0 || to > count || end < start || start < previousStart) {
              problems.push(`${reciter} ${data.surah}:${ayah} [${from},${to},${start},${end}]`);
            }
            previousStart = start;
          }
        }
      }
    }
    expect(problems).toEqual([]);
  });
});
