import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSurah } from '@/hooks/use-surah';
import { getSurah } from '@/services/quran';
import { useUserStore } from '@/stores/userStore';
import type { SurahData } from '@/services/quran';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/services/quran', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/quran')>();
  return { ...actual, getSurah: vi.fn() };
});

const seed = {
  number: 2,
  englishName: 'Al-Baqara',
  arabicName: 'البقرة',
  meaning: 'Sapi Betina',
  ayahCount: 286,
  type: 'Medinan',
  ayahs: [],
} as unknown as SurahData;

function setLocale(appLocale: 'id' | 'en') {
  useUserStore.setState((state) => ({
    settings: { ...state.settings, appLocale },
  }));
}

describe('useSurah — seed SSR (docs/35 §9 H2)', () => {
  beforeEach(() => {
    setLocale('id');
    vi.mocked(getSurah).mockReset();
    vi.mocked(getSurah).mockResolvedValue(seed);
  });

  afterEach(() => {
    setLocale('id');
  });

  it('memakai seed tanpa fetch bila cocok & locale id', () => {
    const { result } = renderHook(() => useSurah('2', seed));

    expect(getSurah).not.toHaveBeenCalled();
    expect(result.current.surah).toBe(seed);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetch bila seed tidak cocok dengan id URL (app-shell offline)', async () => {
    const { result } = renderHook(() => useSurah('3', seed));

    expect(result.current.surah).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(getSurah).toHaveBeenCalledWith('3', 'id', 'id');

    await waitFor(() => {
      expect(result.current.surah).toBe(seed);
    });
  });

  it('fetch terjemahan non-id walau seed cocok', async () => {
    setLocale('en');

    const { result } = renderHook(() => useSurah('2', seed));

    expect(getSurah).toHaveBeenCalledWith('2', 'en', 'en');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('retry memaksa fetch ulang', async () => {
    const { result } = renderHook(() => useSurah('2', seed));

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(getSurah).toHaveBeenCalledWith('2', 'id', 'id');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
