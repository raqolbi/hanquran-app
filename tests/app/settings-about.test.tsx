import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AboutPage from '@/app/settings/about/page';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: vi.fn() }),
}));

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, string>) => {
    if (values?.version) {
      return `${namespace}.${key}:${values.version}`;
    }
    return namespace ? `${namespace}.${key}` : key;
  },
}));

describe('AboutPage', () => {
  afterEach(() => {
    cleanup();
    push.mockClear();
  });

  it('menampilkan judul halaman dan versi aplikasi', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'about.title' }),
    ).toBeTruthy();
    expect(screen.getByText(/about\.app\.version/)).toBeTruthy();
  });

  it('menampilkan tautan repository eksternal', () => {
    render(<AboutPage />);

    const githubLink = screen.getByRole('link', {
      name: /about\.repository\.github/,
    });
    expect(githubLink.getAttribute('href')).toBe(
      'https://github.com/raqolbi/hanquran-app',
    );
    expect(githubLink.getAttribute('rel')).toContain('noopener');
  });

  it('menampilkan kategori credits sumber data', () => {
    render(<AboutPage />);

    expect(screen.getByText('about.credits.dataSources.title')).toBeTruthy();
    expect(
      screen.getByText('about.credits.dataSources.quranText.label'),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', {
        name: /about\.credits\.dataSources\.quranText\.source/,
      }),
    ).toBeTruthy();
    expect(
      screen.getByText('about.credits.dataSources.audioMurottal.source'),
    ).toBeTruthy();
  });
});
