import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useSurahOfflineReady } from '@/hooks/use-surah-offline-ready';
import { useOfflineStore } from '@/stores/offlineStore';
import { isSurahAudioFullyCached } from '@/services/surah-audio-cache';

vi.mock('@/services/surah-audio-cache', () => ({
  isSurahAudioFullyCached: vi.fn(async () => false),
}));

describe('useSurahOfflineReady', () => {
  afterEach(() => {
    useOfflineStore.setState({
      connectionStatus: 'online',
      downloadStatuses: {},
      manifestSummary: { surahsCached: 0, totalSizeBytes: 0 },
      audioCacheRevision: 0,
    });
    vi.mocked(isSurahAudioFullyCached).mockReset();
    vi.mocked(isSurahAudioFullyCached).mockResolvedValue(false);
  });

  it('memperbarui status saat audioCacheRevision bertambah', async () => {
    vi.mocked(isSurahAudioFullyCached)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useSurahOfflineReady(1, 'Alafasy_128kbps', 7),
    );

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    act(() => {
      useOfflineStore.getState().notifyAudioCacheUpdated();
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('langsung true saat manifest ready', () => {
    useOfflineStore.setState({
      downloadStatuses: { '1:Alafasy_128kbps': 'ready' },
    });

    const { result } = renderHook(() =>
      useSurahOfflineReady(1, 'Alafasy_128kbps', 7),
    );

    expect(result.current).toBe(true);
  });
});
