import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prefetchSurahTranslation } from '@/services/quran';
import { warmTranslationFile } from '@/services/quran/data-loader';

vi.mock('@/services/quran/data-loader', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/services/quran/data-loader')>();
  return { ...actual, warmTranslationFile: vi.fn() };
});

const warm = vi.mocked(warmTranslationFile);

describe('prefetchSurahTranslation', () => {
  beforeEach(() => {
    warm.mockReset();
  });

  it('menjadwalkan pemanasan terjemahan bahasa lain', () => {
    const scheduled: Array<() => void> = [];

    prefetchSurahTranslation('2', 'en', (task) => scheduled.push(task));

    expect(scheduled).toHaveLength(1);
    expect(warm).not.toHaveBeenCalled();

    scheduled[0]();

    expect(warm).toHaveBeenCalledWith(2, 'en');
  });

  it('mengabaikan id surat yang tidak valid', () => {
    const schedule = vi.fn();

    prefetchSurahTranslation('bukan-angka', 'en', schedule);

    expect(schedule).not.toHaveBeenCalled();
    expect(warm).not.toHaveBeenCalled();
  });

  it('tidak melakukan apa pun tanpa window (SSR)', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error — mensimulasikan lingkungan server.
    delete globalThis.window;

    try {
      const schedule = vi.fn();
      prefetchSurahTranslation('2', 'en', schedule);
      expect(schedule).not.toHaveBeenCalled();
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
