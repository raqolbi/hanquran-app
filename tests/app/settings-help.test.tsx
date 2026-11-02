// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import messages from '@/messages/id.json';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));

import HelpPage from '@/app/settings/help/page';

describe('Halaman Cara Pakai', () => {
  it('menampilkan seluruh bagian petunjuk', () => {
    render(
      <NextIntlClientProvider locale="id" messages={messages}>
        <HelpPage />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Cara Pakai' })).toBeTruthy();
    for (const title of ['Pengulangan', 'Ulang Kata', 'Sorot Kata', 'Kecepatan Putar', 'Mode Murotal', 'Mode Fokus', 'Lanjutkan Hafalan', 'Offline', 'Pintasan Keyboard']) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeTruthy();
    }
  });
});
