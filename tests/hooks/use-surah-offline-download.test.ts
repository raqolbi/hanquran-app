import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import 'fake-indexeddb/auto';

import { db } from '@/services/db/db';
import { useOfflineStore } from '@/stores/offlineStore';
import { useSurahOfflineDownload } from '@/hooks/use-surah-offline-download';

const downloadSurah = vi.fn();

vi.mock('@/services/download-manager', () => ({
  getDownloadManager: () => ({
    downloadSurah,
  }),
}));

describe('useSurahOfflineDownload', () => {
  beforeEach(async () => {
    await db.downloadManifest.clear();
    downloadSurah.mockReset();
    useOfflineStore.setState({ downloadStatuses: {} });
    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({
        keys: vi.fn(async () => []),
      })),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('menghidrasi status ready dari Dexie manifest', async () => {
    await db.downloadManifest.put({
      surahId: 1,
      status: 'ready',
      sizeBytes: 1024,
      ayahsCount: 7,
      cachedAt: Date.now(),
      version: 'v1',
    });

    renderHook(() =>
      useSurahOfflineDownload({
        surahId: 1,
        ayahCount: 7,
        reciterId: 'Alafasy_128kbps',
      }),
    );

    await waitFor(() => {
      expect(useOfflineStore.getState().downloadStatuses[1]).toBe('ready');
    });
  });

  it('memanggil downloadSurah saat saveOffline', async () => {
    downloadSurah.mockResolvedValue({
      surahId: 2,
      sizeBytes: 2048,
      ayahsCount: 4,
    });

    const { result } = renderHook(() =>
      useSurahOfflineDownload({
        surahId: 2,
        ayahCount: 4,
        reciterId: 'Alafasy_128kbps',
      }),
    );

    await act(async () => {
      await result.current.saveOffline();
    });

    expect(downloadSurah).toHaveBeenCalledWith(
      {
        surahId: 2,
        reciterId: 'Alafasy_128kbps',
        ayahCount: 4,
      },
      expect.any(Function),
    );
    expect(result.current.isOfflineReady).toBe(false);
  });
});
