import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const platformMock = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => false),
}));

vi.mock('@/lib/platform', () => ({
  isNativePlatform: () => platformMock.isNativePlatform(),
}));

vi.mock('@/hooks/use-is-client', () => ({
  useIsClient: () => true,
}));

import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { clearInstallBannerDismissal } from '@/lib/install-prompt';

describe('useInstallPrompt native guard', () => {
  beforeEach(() => {
    platformMock.isNativePlatform.mockReturnValue(false);
    clearInstallBannerDismissal();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('menyembunyikan banner di Capacitor native', async () => {
    platformMock.isNativePlatform.mockReturnValue(true);

    const { result } = renderHook(() => useInstallPrompt());

    await waitFor(() => {
      expect(result.current.showBanner).toBe(false);
    });
  });
});
