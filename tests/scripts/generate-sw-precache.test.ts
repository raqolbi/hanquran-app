import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd());
const SOURCE_MANIFEST = resolve(ROOT, 'public/sw-precache-manifest.js');
const TMP_DIR = mkdtempSync(join(tmpdir(), 'sw-precache-'));
const MANIFEST = join(TMP_DIR, 'sw-precache-manifest.js');

describe('scripts/generate-sw-precache.mjs', () => {
  afterAll(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
  });

  it('menulis dataHash nyata dan daftar /data/* non-kosong', () => {
    // File di public/ di-generate saat build (gitignore) — bisa belum ada.
    const before = existsSync(SOURCE_MANIFEST) ? readFileSync(SOURCE_MANIFEST, 'utf8') : null;
    execFileSync(process.execPath, ['scripts/generate-sw-precache.mjs', MANIFEST], {
      cwd: ROOT,
      stdio: 'pipe',
    });
    // Berkas di public/ tidak boleh tersentuh.
    expect(existsSync(SOURCE_MANIFEST) ? readFileSync(SOURCE_MANIFEST, 'utf8') : null).toBe(before);

    const source = readFileSync(MANIFEST, 'utf8');
    const match = source.match(/self\.__SW_PRECACHE__ = (\{[\s\S]*\});/);
    expect(match).toBeTruthy();
    const manifest = JSON.parse(match![1]) as {
      dataHash: string;
      data: string[];
    };

    expect(manifest.dataHash).not.toBe('dev');
    expect(manifest.dataHash).toMatch(/^[a-f0-9]{16}$/);
    expect(manifest.data.length).toBeGreaterThan(100);
    expect(manifest.data).toContain('/data/quran/036.json');
    expect(manifest.data).toContain('/data/manifest.json');
    // Data waktu per kata dimuat saat dipakai, bukan saat install SW.
    expect(manifest.data.some((url) => url.startsWith('/data/word-timings/'))).toBe(false);
  });
});
