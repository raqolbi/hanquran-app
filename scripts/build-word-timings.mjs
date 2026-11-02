#!/usr/bin/env node
/**
 * Bangun data waktu per kata (word timings) dari rilis quran-align.
 *
 * Sumber: https://github.com/cpfair/quran-align — rilis `release-2016-11-24`
 * (`quran-align-data-2016-11-24.zip`, SHA-256
 * 5eeb045d8a7895208c94d2d7ec243567f8f550728835411527c4ffa1e789c9b7).
 * Lisensi data: CC BY 4.0 (Collin Fair) — atribusi wajib, lihat layar Tentang.
 *
 * Pemakaian:
 *   curl -L -o /tmp/qa.zip https://github.com/cpfair/quran-align/releases/download/release-2016-11-24/quran-align-data-2016-11-24.zip
 *   unzip -o /tmp/qa.zip -d /tmp/quran-align
 *   node scripts/build-word-timings.mjs /tmp/quran-align
 *
 * Keluaran (di-commit, bukan dibangun ulang tiap build):
 *   public/data/word-timings/v1/{reciterId}/{NNN}.json
 *   data/word-timing-reciters.json
 *
 * "Kata" = token teks ayat dipisah spasi, tanda waqaf/tanda kecil yang berdiri
 * sendiri digabung ke kata sebelumnya — aturan yang sama dengan
 * `lib/quran-words.ts` (`splitAyahWords`). Ayat yang indeks katanya melebihi
 * jumlah kata dataset dibuang (tidak disorot) agar sorotan tidak salah tempat.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DATA_VERSION = 'v1';
const OUT_DIR = join(ROOT, 'public', 'data', 'word-timings', DATA_VERSION);
const RECITER_INDEX = join(ROOT, 'data', 'word-timing-reciters.json');
const QURAN_DIR = join(ROOT, 'public', 'data', 'quran');

/**
 * Qari aplikasi (`data/reciters.json`) → file quran-align.
 * Hanya pasangan yang rekamannya terverifikasi sama (durasi file EveryAyah
 * cocok dengan akhir segmen terakhir). Husary 128 kbps memakai data 64 kbps:
 * rekaman sama, selisih durasi file ±34 ms (di bawah galat data ±73 ms).
 */
const RECITER_SOURCES = {
  Alafasy_128kbps: 'Alafasy_128kbps.json',
  Husary_128kbps: 'Husary_64kbps.json',
  Minshawy_Mujawwad_192kbps: 'Minshawy_Mujawwad_192kbps.json',
};

/** Token yang hanya berisi tanda (waqaf, tanda kecil, tatweel) — bukan kata. */
const MARK_ONLY = /^[ؐ-ؚۖ-ۭـٰ]+$/u;

export function countAyahWords(text) {
  return text
    .split(/\s+/u)
    .filter((token) => token.length > 0 && !MARK_ONLY.test(token)).length;
}

function loadWordCounts() {
  const counts = new Map();
  for (const file of readdirSync(QURAN_DIR).filter((f) => f.endsWith('.json'))) {
    const surah = JSON.parse(readFileSync(join(QURAN_DIR, file), 'utf8'));
    for (const verse of surah.verses) {
      counts.set(`${surah.id}:${verse.ayah}`, countAyahWords(verse.text));
    }
  }
  return counts;
}

function main() {
  const srcDir = process.argv[2];
  if (!srcDir || !existsSync(srcDir)) {
    console.error('Pakai: node scripts/build-word-timings.mjs <folder-hasil-unzip-quran-align>');
    process.exit(1);
  }

  const wordCounts = loadWordCounts();
  rmSync(OUT_DIR, { recursive: true, force: true });

  const reciters = [];
  for (const [reciterId, sourceFile] of Object.entries(RECITER_SOURCES)) {
    const rows = JSON.parse(readFileSync(join(srcDir, sourceFile), 'utf8'));
    const bySurah = new Map();
    let kept = 0;
    let dropped = 0;

    for (const row of rows) {
      const segments = Array.isArray(row.segments) ? row.segments : [];
      const wordCount = wordCounts.get(`${row.surah}:${row.ayah}`);
      const maxIndex = segments.reduce((max, s) => Math.max(max, s[1]), 0);
      if (!wordCount || segments.length === 0 || maxIndex > wordCount) {
        dropped += 1;
        continue;
      }
      if (!bySurah.has(row.surah)) bySurah.set(row.surah, {});
      // Rapikan sedikit data mentah (<0,1% segmen): urutkan menurut waktu
      // mulai (pencarian biner di klien) dan pastikan selesai ≥ mulai.
      bySurah.get(row.surah)[row.ayah] = segments
        .map(([from, to, start, end]) => [from, to, start, Math.max(start, end)])
        .sort((a, b) => a[2] - b[2]);
      kept += 1;
    }

    const dir = join(OUT_DIR, reciterId);
    mkdirSync(dir, { recursive: true });
    for (const [surah, ayahs] of bySurah) {
      const payload = { surah, reciterId, ayahs };
      writeFileSync(
        join(dir, `${String(surah).padStart(3, '0')}.json`),
        `${JSON.stringify(payload)}\n`,
      );
    }

    reciters.push({ reciterId, source: sourceFile.replace(/\.json$/, '') });
    console.log(`[word-timings] ${reciterId} ← ${sourceFile}: ${kept} ayat, ${dropped} dibuang`);
  }

  const index = {
    version: DATA_VERSION,
    source: 'https://github.com/cpfair/quran-align (release-2016-11-24)',
    license: 'CC BY 4.0 — Collin Fair',
    reciters,
  };
  writeFileSync(RECITER_INDEX, `${JSON.stringify(index, null, 2)}\n`);
  console.log(`[word-timings] indeks → ${RECITER_INDEX}`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  main();
}
