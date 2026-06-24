import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PwaSplashDismisser } from '@/components/shared/pwa-splash-dismisser';

const splashState = vi.hoisted(() => ({
  isLaunching: true,
}));

vi.mock('@/lib/pwa-splash', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/pwa-splash')>();
  return {
    ...actual,
    isPwaLaunching: () => splashState.isLaunching,
    dismissPwaSplash: vi.fn(),
    computeSplashDismissDelay: () => 0,
  };
});

import { dismissPwaSplash } from '@/lib/pwa-splash';

describe('PwaSplashDismisser', () => {
  beforeEach(() => {
    splashState.isLaunching = true;
    vi.mocked(dismissPwaSplash).mockClear();
    vi.spyOn(window, 'setTimeout').mockImplementation((fn) => {
      if (typeof fn === 'function') {
        fn();
      }
      return 0;
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('memanggil dismiss saat halaman sudah complete', () => {
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: 'complete',
    });

    render(<PwaSplashDismisser />);

    expect(dismissPwaSplash).toHaveBeenCalledTimes(1);
  });

  it('tidak memanggil dismiss saat bukan peluncuran PWA', () => {
    splashState.isLaunching = false;

    render(<PwaSplashDismisser />);

    expect(dismissPwaSplash).not.toHaveBeenCalled();
  });
});
