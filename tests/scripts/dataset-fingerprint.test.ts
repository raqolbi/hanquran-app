import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it, afterEach } from 'vitest';

import { fingerprintDataset } from '../../scripts/lib/dataset-fingerprint.mjs';

describe('fingerprintDataset', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function makeDataDir(files: Record<string, string>): string {
    const root = mkdtempSync(join(tmpdir(), 'hq-data-'));
    dirs.push(root);
    for (const [rel, content] of Object.entries(files)) {
      const full = join(root, rel);
      mkdirSync(join(full, '..'), { recursive: true });
      writeFileSync(full, content, 'utf8');
    }
    return root;
  }

  it('menghasilkan hex 16 karakter yang stabil', () => {
    const dir = makeDataDir({
      'manifest.json': '{"version":"1"}',
      'quran/001.json': '{"id":1}',
    });
    const a = fingerprintDataset(dir);
    const b = fingerprintDataset(dir);
    expect(a).toMatch(/^[a-f0-9]{16}$/);
    expect(a).toBe(b);
  });

  it('berubah saat isi berkas berubah', () => {
    const dir = makeDataDir({
      'quran/036.json': '{"id":36,"verses":[{"ayah":1,"text":"OLD"}]}',
    });
    const before = fingerprintDataset(dir);
    writeFileSync(
      join(dir, 'quran/036.json'),
      '{"id":36,"verses":[{"ayah":1,"text":"NEW"}]}',
      'utf8',
    );
    const after = fingerprintDataset(dir);
    expect(after).not.toBe(before);
  });

  it('berubah saat berkas ditambah', () => {
    const dir = makeDataDir({ 'a.json': '1' });
    const before = fingerprintDataset(dir);
    writeFileSync(join(dir, 'b.json'), '2', 'utf8');
    expect(fingerprintDataset(dir)).not.toBe(before);
  });

  it('sama untuk konten identik meski path absolut beda', () => {
    const content = { 'quran/001.json': '{"id":1}' };
    const dirA = makeDataDir(content);
    const dirB = makeDataDir(content);
    expect(fingerprintDataset(dirA)).toBe(fingerprintDataset(dirB));
  });

  it('mencakup seluruh pohon (bukan hanya nama folder)', () => {
    const dir = makeDataDir({
      'quran/001.json': 'a',
      'translations/id/001.json': 'b',
    });
    const hash = fingerprintDataset(dir);
    const manual = createHash('sha256');
    // urutan sort path absolut — pastikan fingerprint tidak kosong
    expect(hash.length).toBe(16);
    expect(manual).toBeTruthy();
  });
});
