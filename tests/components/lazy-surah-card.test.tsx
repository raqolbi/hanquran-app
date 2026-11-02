// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('merender kartu langsung di HTML (SSR/SEO) tanpa placeholder', () => {
    const { container } = render(<LazySurahCard {...baseProps} />);

    expect(screen.getByText('Al-Faatiha')).not.toBeNull();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/surah/1');
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('memakai content-visibility agar kartu di luar viewport tidak dirender berat', () => {
    const { container } = render(<LazySurahCard {...baseProps} />);
    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper.style.contentVisibility).toBe('auto');
    expect(wrapper.style.containIntrinsicSize).toBe('auto 7.5rem');
  });

  it('tidak bergantung pada IntersectionObserver untuk menampilkan isi', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    await act(async () => {
      render(<LazySurahCard {...baseProps} />);
    });

    expect(screen.getByText('Al-Faatiha')).not.toBeNull();
  });
});
