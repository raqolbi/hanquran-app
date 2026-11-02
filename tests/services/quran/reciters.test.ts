import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import wordTimingIndex from '@/data/word-timing-reciters.json';
import { getDefaultReciterId, getReciters } from '@/services/quran/audio-service';
import { hasWordTimings } from '@/services/quran/word-timings';

const TIMINGS_DIR = resolve(process.cwd(), 'public/data/word-timings/v1');

describe('daftar qari', () => {
  it('qari default pengguna baru adalah Alafasy (didukung sorot kata)', () => {
    expect(getDefaultReciterId()).toBe('Alafasy_128kbps');
    expect(hasWordTimings(getDefaultReciterId())).toBe(true);
  });

  it('id qari unik dan setiap qari punya nama', () => {
    const ids = getReciters().map((reciter) => reciter.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const reciter of getReciters()) {
      expect(reciter.name.length).toBeGreaterThan(0);
    }
  });

  it('setiap qari bersorot kata ada di daftar qari dan punya 114 file data', () => {
    const ids = new Set(getReciters().map((reciter) => reciter.id));
    for (const { reciterId } of wordTimingIndex.reciters) {
      expect(ids.has(reciterId)).toBe(true);
      const dir = join(TIMINGS_DIR, reciterId);
      expect(existsSync(dir)).toBe(true);
      expect(readdirSync(dir)).toHaveLength(114);
    }
  });

  it('hanya qari tanpa data quran-align yang tidak mendukung sorot kata', () => {
    const unsupported = getReciters()
      .filter((reciter) => !hasWordTimings(reciter.id))
      .map((reciter) => reciter.id);
    expect(unsupported).toEqual([
      'Abdullaah_3awwaad_Al-Juhaynee_128kbps',
      'warsh/warsh_ibrahim_aldosary_128kbps',
    ]);
  });
});
