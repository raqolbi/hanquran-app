import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ConnectionIndicator,
  OfflineStatusBadge,
} from '@/components/offline-status-badge';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('OfflineStatusBadge', () => {
  afterEach(() => {
    cleanup();
  });

  it('menampilkan label downloading', () => {
    render(<OfflineStatusBadge status="downloading" />);
    expect(screen.getByRole('status').textContent).toContain('downloading');
  });

  it('menampilkan label offline_ready', () => {
    render(<OfflineStatusBadge status="offline_ready" />);
    expect(screen.getByRole('status').textContent).toContain('offlineReadyLong');
  });
});

describe('ConnectionIndicator', () => {
  afterEach(() => {
    cleanup();
  });

  it('menampilkan status header dengan role status', () => {
    render(<ConnectionIndicator status="offline_ready" variant="header" />);
    expect(screen.getByRole('status').textContent).toContain('offlineReady');
  });

  it('menampilkan status default', () => {
    render(<ConnectionIndicator status="offline" />);
    expect(screen.getByRole('status').textContent).toContain('offline');
  });
});
