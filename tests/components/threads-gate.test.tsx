import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThreadsGate } from '@/components/shared/threads-gate';
import { APP_AUTHOR_THREADS_URL } from '@/lib/app-about';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

vi.mock('@/components/shared/Logo', () => ({
  Logo: () => <span data-testid="threads-gate-logo" />,
}));

const gateState = vi.hoisted(() => ({
  showOverlay: true,
  isContinueEnabled: false,
  showOpenFailedHint: false,
  threadsUrl: 'https://www.threads.com/@cenybug',
  openThreads: vi.fn(),
  continueToApp: vi.fn(),
}));

vi.mock('@/hooks/use-threads-gate', () => ({
  useThreadsGate: () => gateState,
}));

describe('ThreadsGate', () => {
  beforeEach(() => {
    gateState.showOverlay = true;
    gateState.isContinueEnabled = false;
    gateState.showOpenFailedHint = false;
    gateState.threadsUrl = APP_AUTHOR_THREADS_URL;
    gateState.openThreads.mockClear();
    gateState.continueToApp.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('menampilkan overlay dengan tautan Threads resmi', () => {
    render(<ThreadsGate />);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('threadsGate.title')).toBeTruthy();
    const threadsLink = screen.getByRole('link', {
      name: /threadsGate\.openThreads/,
    });
    expect(threadsLink.getAttribute('href')).toBe(APP_AUTHOR_THREADS_URL);
    expect(threadsLink.getAttribute('target')).toBe('_blank');
    expect(screen.getByRole('button', { name: 'threadsGate.continue' })).toBeTruthy();
  });

  it('menonaktifkan Lanjut sebelum delay selesai', () => {
    render(<ThreadsGate />);

    const continueButton = screen.getByRole('button', {
      name: 'threadsGate.continue',
    });
    expect(continueButton).toHaveProperty('disabled', true);

    continueButton.click();
    expect(gateState.continueToApp).not.toHaveBeenCalled();
  });

  it('memanggil openThreads saat tautan diketuk', () => {
    render(<ThreadsGate />);

    screen.getByRole('link', { name: /threadsGate\.openThreads/ }).click();
    expect(gateState.openThreads).toHaveBeenCalledTimes(1);
  });

  it('memanggil continueToApp saat Lanjut aktif diketuk', () => {
    gateState.isContinueEnabled = true;

    render(<ThreadsGate />);

    screen.getByRole('button', { name: 'threadsGate.continue' }).click();
    expect(gateState.continueToApp).toHaveBeenCalledTimes(1);
  });

  it('menyembunyikan overlay jika sudah completed', () => {
    gateState.showOverlay = false;

    render(<ThreadsGate />);

    expect(screen.queryByText('threadsGate.title')).toBeNull();
  });
});
