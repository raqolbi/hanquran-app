import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThreadsGate } from '@/components/shared/threads-gate';
import { APP_AUTHOR_THREADS_URL } from '@/lib/app-about';

vi.mock('@/components/shared/Logo', () => ({
  Logo: () => <span data-testid="threads-gate-logo" />,
}));

const gateState = vi.hoisted(() => ({
  showOverlay: true,
  isContinueEnabled: false,
  showOpenFailedHint: false,
  threadsUrl: 'https://www.threads.com/@qolcore',
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

  it('menampilkan overlay dengan tautan Threads resmi (teks bilingual)', () => {
    render(<ThreadsGate />);

    expect(screen.getByRole('dialog')).toBeTruthy();
    // Kedua bahasa dirender; CSS memilih sesuai `<html data-app-locale>`.
    expect(screen.getByText('Dukung HanQuran')).toBeTruthy();
    expect(screen.getByText('Support HanQuran')).toBeTruthy();
    const threadsLink = screen.getByRole('link', { name: /Buka Threads/ });
    expect(threadsLink.getAttribute('href')).toBe(APP_AUTHOR_THREADS_URL);
    expect(threadsLink.getAttribute('target')).toBe('_blank');
    expect(screen.getByRole('button', { name: /Lanjut/ })).toBeTruthy();
  });

  it('menonaktifkan Lanjut sebelum delay selesai', () => {
    render(<ThreadsGate />);

    const continueButton = screen.getByRole('button', { name: /Lanjut/ });
    expect(continueButton).toHaveProperty('disabled', true);

    continueButton.click();
    expect(gateState.continueToApp).not.toHaveBeenCalled();
  });

  it('memanggil openThreads saat tautan diketuk', () => {
    render(<ThreadsGate />);

    screen.getByRole('link', { name: /Buka Threads/ }).click();
    expect(gateState.openThreads).toHaveBeenCalledTimes(1);
  });

  it('memanggil continueToApp saat Lanjut aktif diketuk', () => {
    gateState.isContinueEnabled = true;

    render(<ThreadsGate />);

    screen.getByRole('button', { name: /Lanjut/ }).click();
    expect(gateState.continueToApp).toHaveBeenCalledTimes(1);
  });

  it('menyembunyikan overlay jika sudah completed', () => {
    gateState.showOverlay = false;

    render(<ThreadsGate />);

    expect(screen.queryByText('Dukung HanQuran')).toBeNull();
  });

  it('membuat konten di belakang overlay inert dan memulihkannya', () => {
    const background = document.createElement('main');
    background.textContent = 'konten';
    document.body.appendChild(background);

    const { unmount } = render(<ThreadsGate />);
    expect(background.inert).toBe(true);

    unmount();
    expect(background.inert).toBe(false);
    background.remove();
  });

  it('Tab berputar di dalam overlay', () => {
    gateState.isContinueEnabled = true;
    render(<ThreadsGate />);
    const link = screen.getByRole('link', { name: /Buka Threads/ });
    const button = screen.getByRole('button', { name: /Lanjut/ });
    const dialog = screen.getByRole('dialog');

    button.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(link);

    link.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(button);
  });
});
