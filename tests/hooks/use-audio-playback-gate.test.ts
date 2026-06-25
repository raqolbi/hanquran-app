import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAudioPlaybackGate } from '@/hooks/use-audio-playback-gate';
import { useOfflineStore } from '@/stores/offlineStore';
import * as appToast from '@/lib/app-toast';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('useAudioPlaybackGate', () => {
  afterEach(() => {
    useOfflineStore.setState({
      connectionStatus: 'online',
      downloadStatuses: {},
    });
    vi.restoreAllMocks();
  });

  it('memblokir pemutaran saat offline tanpa unduhan', () => {
    useOfflineStore.setState({
      connectionStatus: 'offline',
      downloadStatuses: { '1:Alafasy_128kbps': 'idle' },
    });

    const { result } = renderHook(() =>
      useAudioPlaybackGate(1, 'Alafasy_128kbps'),
    );

    expect(result.current.isPlaybackBlocked).toBe(true);
  });

  it('menampilkan toast saat notifyIfPlaybackBlocked dipanggil', () => {
    const showAppToast = vi.spyOn(appToast, 'showAppToast');

    useOfflineStore.setState({
      connectionStatus: 'offline',
      downloadStatuses: { '2:Alafasy_128kbps': 'idle' },
    });

    const { result } = renderHook(() =>
      useAudioPlaybackGate(2, 'Alafasy_128kbps'),
    );

    let blocked = false;
    act(() => {
      blocked = result.current.notifyIfPlaybackBlocked();
    });

    expect(blocked).toBe(true);
    expect(showAppToast).toHaveBeenCalledWith('offlineUnavailableToast');
  });

  it('tidak memblokir saat offline dan audio siap', () => {
    useOfflineStore.setState({
      connectionStatus: 'offline',
      downloadStatuses: { '1:Alafasy_128kbps': 'ready' },
    });

    const { result } = renderHook(() =>
      useAudioPlaybackGate(1, 'Alafasy_128kbps'),
    );

    expect(result.current.isPlaybackBlocked).toBe(false);
    expect(result.current.notifyIfPlaybackBlocked()).toBe(false);
  });
});
