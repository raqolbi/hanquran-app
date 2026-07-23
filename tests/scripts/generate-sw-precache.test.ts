import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd());
const MANIFEST = resolve(ROOT, 'public/sw-precache-manifest.js');
const PLACEHOLDER = `/* Auto-generated oleh scripts/generate-sw-precache.mjs. JANGAN edit manual. */
/* Placeholder default — diisi ulang di akhir \`npm run build\` (generate-sw-precache). */
self.__SW_PRECACHE__ = {
  "buildId": "dev",
  "dataHash": "dev",
  "static": [],
  "data": []
};
`;

describe('scripts/generate-sw-precache.mjs', () => {
  afterAll(() => {
    // Kembalikan placeholder agar repo tidak menyimpan daftar aset lokal.
    writeFileSync(MANIFEST, PLACEHOLDER, 'utf8');
  });

  it('menulis dataHash nyata dan daftar /data/* non-kosong', () => {
    execFileSync(process.execPath, ['scripts/generate-sw-precache.mjs'], {
      cwd: ROOT,
      stdio: 'pipe',
    });

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
  });
});
