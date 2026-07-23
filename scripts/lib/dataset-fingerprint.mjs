import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * Walk rekursif semua berkas di bawah `dir` (absolut).
 * @param {string} dir
 * @returns {string[]}
 */
export function walkFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walkFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

/**
 * Fingerprint isi dataset (path relatif + konten, urut stabil).
 * Dipakai di precache manifest agar perubahan JSON memicu update SW.
 * @param {string} dataDir absolut ke `public/data`
 * @returns {string} hex 16 karakter
 */
export function fingerprintDataset(dataDir) {
  const files = walkFiles(dataDir).sort((a, b) => a.localeCompare(b));
  const hash = createHash('sha256');

  for (const abs of files) {
    const rel = relative(dataDir, abs).split(sep).join('/');
    hash.update(rel);
    hash.update('\0');
    hash.update(readFileSync(abs));
    hash.update('\0');
  }

  return hash.digest('hex').slice(0, 16);
}
