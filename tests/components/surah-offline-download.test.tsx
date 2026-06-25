import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SurahOfflineDownload } from '@/components/surah-offline-download';

const mockUseSurahOfflineDownload = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, number>) => {
    if (key === 'offlineDownloadProgress' && values) {
      return `${values.completed}/${values.total}`;
    }
    return key;
  },
}));

vi.mock('@/hooks/use-surah-offline-download', () => ({
  useSurahOfflineDownload: (...args: unknown[]) =>
    mockUseSurahOfflineDownload(...args),
}));

describe('SurahOfflineDownload', () => {
  afterEach(() => {
    cleanup();
    mockUseSurahOfflineDownload.mockReset();
  });

  it('menyembunyikan aksi saat audio sudah tersimpan', () => {
    mockUseSurahOfflineDownload.mockReturnValue({
      saveOffline: vi.fn(),
      isOfflineReady: true,
      isDownloading: false,
      canSave: false,
      showDownloadUi: false,
      badgeStatus: null,
      progress: null,
      errorMessage: null,
      downloadStatus: 'ready',
    });

    const { container } = render(
      <SurahOfflineDownload surahId={1} ayahCount={7} reciterId="Qari" />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('menampilkan tombol Simpan Offline', () => {
    mockUseSurahOfflineDownload.mockReturnValue({
      saveOffline: vi.fn(),
      isOfflineReady: false,
      isDownloading: false,
      canSave: true,
      showDownloadUi: true,
      badgeStatus: null,
      progress: null,
      errorMessage: null,
      downloadStatus: 'idle',
    });

    render(
      <SurahOfflineDownload surahId={1} ayahCount={7} reciterId="Qari" />,
    );

    expect(screen.getByRole('button', { name: 'saveOfflineAriaLabel' }).textContent).toContain(
      'saveOffline',
    );
  });

  it('menampilkan progres unduhan', () => {
    mockUseSurahOfflineDownload.mockReturnValue({
      saveOffline: vi.fn(),
      isOfflineReady: false,
      isDownloading: true,
      canSave: false,
      showDownloadUi: true,
      badgeStatus: 'downloading',
      progress: { completed: 2, total: 7 },
      errorMessage: null,
      downloadStatus: 'downloading',
    });

    render(
      <SurahOfflineDownload surahId={1} ayahCount={7} reciterId="Qari" />,
    );

    expect(screen.getByText('2/7')).toBeTruthy();
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('menyembunyikan aksi saat offline', () => {
    mockUseSurahOfflineDownload.mockReturnValue({
      saveOffline: vi.fn(),
      isOfflineReady: false,
      isDownloading: false,
      canSave: false,
      showDownloadUi: false,
      badgeStatus: null,
      progress: null,
      errorMessage: null,
      downloadStatus: 'idle',
    });

    const { container } = render(
      <SurahOfflineDownload surahId={1} ayahCount={7} reciterId="Qari" />,
    );

    expect(container.firstChild).toBeNull();
  });
});
