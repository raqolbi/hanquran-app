// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SurahCard } from '@/components/surah-card';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, prefetch: _p, ...rest }: Record<string, unknown>) => (
    <a href={href as string} {...rest}>
      {children as React.ReactNode}
    </a>
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

describe('SurahCard', () => {
  afterEach(() => cleanup());

  it('tombol favorit tidak bersarang di dalam tautan (HTML valid)', () => {
    render(<SurahCard {...baseProps} />);
    const button = screen.getByRole('button');
    expect(button.closest('a')).toBeNull();
    expect(screen.getByRole('link').querySelector('button')).toBeNull();
  });

  it('tidak menambah tab stop ekstra pada pembungkus kartu', () => {
    const { container } = render(<SurahCard {...baseProps} />);
    // Hanya elemen yang memang interaktif (tautan & tombol) yang boleh fokus.
    const extra = [...container.querySelectorAll('[tabindex="0"]')].filter(
      (el) => el.tagName !== 'A' && el.tagName !== 'BUTTON',
    );
    expect(extra.length).toBe(0);
  });

  it('memanggil onToggleFavorite dan label mengikuti status', () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <SurahCard {...baseProps} onToggleFavorite={onToggle} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('addFavorite');

    rerender(<SurahCard {...baseProps} isFavorited onToggleFavorite={onToggle} />);
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('removeFavorite');
  });
});
