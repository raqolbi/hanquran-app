/**
 * Generate daftar precache Service Worker (offline-first).
 *
 * Dijalankan otomatis sebagai `postbuild`. Memindai:
 *   - `.next/static/**`  → URL `/_next/static/*` (chunk JS/CSS/font ber-hash)
 *   - `public/data/**`   → URL `/data/*` (dataset Qur'an)
 *   - aset publik wajib  → offline.html, manifest.json, ikon, branding
 *
 * Hasil ditulis ke `public/sw-precache-manifest.js` yang di-`importScripts`
 * oleh `public/sw.js` saat event `install`. Spesifikasi: `docs/30` §6.1, §6.3.
 */

import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function toUrl(absPath, baseDir, urlPrefix) {
  const rel = relative(baseDir, absPath).split(sep).join('/');
  return `${urlPrefix}/${rel}`;
}

function readBuildId() {
  const file = join(ROOT, '.next', 'BUILD_ID');
  try {
    return readFileSync(file, 'utf8').trim();
  } catch {
    return String(Date.now());
  }
}

// 1. Aset Next.js ber-hash → /_next/static/*
const nextStaticDir = join(ROOT, '.next', 'static');
const nextStatic = walk(nextStaticDir).map((p) =>
  toUrl(p, nextStaticDir, '/_next/static'),
);

// 2. Aset publik wajib (di luar /data).
const publicDir = join(ROOT, 'public');
const REQUIRED_PUBLIC = ['offline.html', 'manifest.json'];
const PUBLIC_ASSET_DIRS = ['icons', 'branding'];

const publicAssets = [];
for (const name of REQUIRED_PUBLIC) {
  if (existsSync(join(publicDir, name))) publicAssets.push(`/${name}`);
}
for (const dir of PUBLIC_ASSET_DIRS) {
  const abs = join(publicDir, dir);
  for (const p of walk(abs)) {
    publicAssets.push(toUrl(p, publicDir, ''));
  }
}

// 3. Dataset Qur'an → /data/*
const dataDir = join(publicDir, 'data');
const dataUrls = walk(dataDir).map((p) => toUrl(p, publicDir, ''));

const manifest = {
  buildId: readBuildId(),
  static: [...nextStatic, ...publicAssets].sort(),
  data: dataUrls.sort(),
};

const banner =
  '/* Auto-generated oleh scripts/generate-sw-precache.mjs. JANGAN edit manual. */\n';
const body = `self.__SW_PRECACHE__ = ${JSON.stringify(manifest, null, 2)};\n`;

const outFile = join(publicDir, 'sw-precache-manifest.js');
writeFileSync(outFile, banner + body, 'utf8');

console.log(
  `[sw-precache] buildId=${manifest.buildId} static=${manifest.static.length} data=${manifest.data.length} → public/sw-precache-manifest.js`,
);
