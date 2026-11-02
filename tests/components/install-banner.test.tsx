// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstallBanner } from '@/components/shared/install-banner';
import { clearInstallBannerDismissal } from '@/lib/install-prompt';
import { getLocalePair } from '@/lib/locale-text';

const TITLE = getLocalePair('pwa', 'installTitle');
const ACTION = getLocalePair('pwa', 'installAction');

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const installPromptState = vi.hoisted(() => ({
  showBanner: true,
  canNativePrompt: true,
  isIosHint: false,
  promptInstall: vi.fn(async () => 'accepted' as const),
  dismissBanner: vi.fn(),
}));

vi.mock('@/hooks/use-install-prompt', () => ({
  useInstallPrompt: () => installPromptState,
}));

describe('InstallBanner', () => {
  beforeEach(() => {
    installPromptState.showBanner = true;
    installPromptState.canNativePrompt = true;
    installPromptState.isIosHint = false;
    clearInstallBannerDismissal();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('menampilkan tombol instal saat native prompt tersedia', () => {
    render(<InstallBanner />);

    // Kedua bahasa ada di DOM; CSS memilih lewat `data-app-locale`.
    expect(screen.getByText(TITLE.id)).toBeTruthy();
    expect(screen.getByText(TITLE.en)).toBeTruthy();
    expect(screen.getByText(ACTION.id)).toBeTruthy();
    expect(screen.getByText(ACTION.en)).toBeTruthy();
  });

  it('menyembunyikan diri saat showBanner false', () => {
    installPromptState.showBanner = false;

    render(<InstallBanner />);

    expect(screen.queryByText(TITLE.id)).toBeNull();
    expect(screen.queryByText(TITLE.en)).toBeNull();
  });

  it('memanggil dismissBanner saat tombol tutup diklik', () => {
    render(<InstallBanner />);

    screen.getByLabelText('installDismiss').click();
    expect(installPromptState.dismissBanner).toHaveBeenCalledTimes(1);
  });
});
