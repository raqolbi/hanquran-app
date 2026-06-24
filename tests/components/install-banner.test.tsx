import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstallBanner } from '@/components/shared/install-banner';
import { clearInstallBannerDismissal } from '@/lib/install-prompt';

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

    expect(screen.getByText('installTitle')).toBeTruthy();
    expect(screen.getByText('installAction')).toBeTruthy();
  });

  it('menyembunyikan diri saat showBanner false', () => {
    installPromptState.showBanner = false;

    render(<InstallBanner />);

    expect(screen.queryByText('installTitle')).toBeNull();
  });

  it('memanggil dismissBanner saat tombol tutup diklik', () => {
    render(<InstallBanner />);

    screen.getByLabelText('installDismiss').click();
    expect(installPromptState.dismissBanner).toHaveBeenCalledTimes(1);
  });
});
