import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  computeSplashDismissDelay,
  dismissPwaSplash,
  isPwaLaunching,
  markPwaLaunching,
  PWA_SPLASH_MIN_MS,
} from '@/lib/pwa-splash';

vi.mock('@/lib/install-prompt', () => ({
  isAppInstalled: vi.fn(() => true),
}));

import { isAppInstalled } from '@/lib/install-prompt';

describe('pwa-splash', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    vi.mocked(isAppInstalled).mockReturnValue(true);
  });

  afterEach(() => {
    document.documentElement.className = '';
  });

  it('menandai html saat aplikasi terinstall', () => {
    markPwaLaunching();
    expect(document.documentElement.classList.contains('pwa-launching')).toBe(
      true,
    );
  });

  it('tidak menandai html di browser biasa', () => {
    vi.mocked(isAppInstalled).mockReturnValue(false);
    markPwaLaunching();
    expect(document.documentElement.classList.contains('pwa-launching')).toBe(
      false,
    );
  });

  it('mendeteksi status peluncuran PWA', () => {
    document.documentElement.classList.add('pwa-launching');
    expect(isPwaLaunching()).toBe(true);
  });

  it('menghitung delay dismiss minimum', () => {
    expect(computeSplashDismissDelay(100, PWA_SPLASH_MIN_MS)).toBe(400);
    expect(computeSplashDismissDelay(600, PWA_SPLASH_MIN_MS)).toBe(0);
  });

  it('menghapus kelas peluncuran setelah dismiss', () => {
    vi.useFakeTimers();
    document.documentElement.classList.add('pwa-launching');

    dismissPwaSplash();
    expect(
      document.documentElement.classList.contains('pwa-splash-dismissed'),
    ).toBe(true);

    vi.advanceTimersByTime(220);
    expect(document.documentElement.classList.contains('pwa-launching')).toBe(
      false,
    );
    expect(
      document.documentElement.classList.contains('pwa-splash-dismissed'),
    ).toBe(false);

    vi.useRealTimers();
  });
});
