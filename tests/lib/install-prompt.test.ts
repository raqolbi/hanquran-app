import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearInstallBannerDismissal,
  dismissInstallBanner,
  isAppInstalled,
  isInstallBannerDismissed,
  isIosSafariInstallable,
} from '@/lib/install-prompt';

describe('lib/install-prompt', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearInstallBannerDismissal();
  });

  it('mendeteksi aplikasi terinstall dari display-mode standalone', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    expect(isAppInstalled()).toBe(true);
  });

  it('menyimpan dan membaca penutupan banner selama TTL', () => {
    const now = 1_700_000_000_000;

    expect(isInstallBannerDismissed(now)).toBe(false);

    dismissInstallBanner(now);
    expect(isInstallBannerDismissed(now + 1_000)).toBe(true);
    expect(isInstallBannerDismissed(now + 8 * 24 * 60 * 60 * 1000)).toBe(false);
  });

  it('mengenali Safari iOS yang belum terinstall', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      standalone: false,
    });
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    expect(isIosSafariInstallable()).toBe(true);
  });
});
