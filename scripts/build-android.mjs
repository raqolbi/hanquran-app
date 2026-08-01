/**
 * Build static assets untuk Capacitor Android (`out/`).
 *
 * Tidak mengubah jalur PWA: Vercel tetap memakai `npm run build` tanpa
 * HANQURAN_TARGET. Spek: docs/32 §3.4 / §13 A0.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('[build:android] HANQURAN_TARGET=android → next build (static export)');
run('npx', ['next', 'build'], {
  HANQURAN_TARGET: 'android',
  NEXT_PUBLIC_HANQURAN_TARGET: 'android',
});

const outDir = join(ROOT, 'out');
if (!existsSync(outDir)) {
  console.error('[build:android] Gagal: folder out/ tidak ditemukan setelah export.');
  process.exit(1);
}

console.log('[build:android] Selesai. webDir Capacitor = out/');
