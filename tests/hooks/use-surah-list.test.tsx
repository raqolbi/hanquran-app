import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSurahList } from '@/hooks/use-surah-list';
import { getSurahList } from '@/services/quran';
import { useUserStore } from '@/stores/userStore';
import type { SurahSummary } from '@/services/quran';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/services/quran', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/quran')>();
  return { ...actual, getSurahList: vi.fn() };
});

const seed: SurahSummary[] = [
  {
    number: 1,
    arabicName: 'الفاتحة',
    englishName: 'Al-Faatiha',
    meaning: 'Pembukaan',
    ayahCount: 7,
    type: 'Meccan',
  },
];

function setLocale(appLocale: 'id' | 'en') {
  useUserStore.setState((state) => ({
    settings: { ...state.settings, appLocale },
  }));
}

describe('useSurahList — seed SSR beranda (docs/36 §3)', () => {
  beforeEach(() => {
    setLocale('id');
    vi.mocked(getSurahList).mockReset();
    vi.mocked(getSurahList).mockResolvedValue(seed);
  });

  afterEach(() => {
    setLocale('id');
  });

  it('memakai seed tanpa fetch saat locale id', () => {
    const { result } = renderHook(() => useSurahList(seed));

    expect(getSurahList).not.toHaveBeenCalled();
    expect(result.current.surahs).toBe(seed);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetch bila tidak ada seed', async () => {
    const { result } = renderHook(() => useSurahList());

    await waitFor(() => {
      expect(result.current.surahs).toBe(seed);
    });

    expect(getSurahList).toHaveBeenCalledWith('id');
    expect(result.current.loading).toBe(false);
  });

  it('fetch locale non-id walau seed tersedia', async () => {
    setLocale('en');

    const { result } = renderHook(() => useSurahList(seed));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getSurahList).toHaveBeenCalledWith('en');
  });

  it('retry memaksa fetch ulang', async () => {
    const { result } = renderHook(() => useSurahList(seed));

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(getSurahList).toHaveBeenCalledWith('id');
    });
  });
});
