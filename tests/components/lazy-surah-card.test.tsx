import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { LazySurahCard } from '@/components/lazy-surah-card';

vi.mock('@/components/surah-card', () => ({
  SurahCard: ({ englishName }: { englishName: string }) => (
    <a href="/surah/1">{englishName}</a>
  ),
}));

const baseProps = {
  number: 1,
  arabicName: 'الفاتحة',
  englishName: 'Al-Faatiha',
  meaning: 'Pembukaan',
  ayahCount: 7,
  type: 'Meccan' as const,
};

describe('LazySurahCard', () => {
  let observerCallback: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    observerCallback = null;

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('menampilkan placeholder sebelum kartu terlihat', () => {
    const { container } = render(<LazySurahCard {...baseProps} />);

    expect(screen.queryByText('Al-Faatiha')).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('merender SurahCard setelah memasuki viewport', async () => {
    render(<LazySurahCard {...baseProps} />);

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByRole('link').getAttribute('href')).toBe('/surah/1');
    expect(screen.getByText('Al-Faatiha')).not.toBeNull();
  });
});
