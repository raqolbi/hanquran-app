import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useAudioPlaybackGate } from '@/hooks/use-audio-playback-gate';
import { useOfflineStore } from '@/stores/offlineStore';
import { fixtureAyahAudioUrl } from '@/tests/fixtures/audio';
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
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('memblokir pemutaran saat offline tanpa unduhan', async () => {
    useOfflineStore.setState({
      connectionStatus: 'offline',
      downloadStatuses: { '1:Alafasy_128kbps': 'idle' },
    });

    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({
        match: vi.fn(async () => undefined),
      })),
    });

    const { result } = renderHook(() =>
      useAudioPlaybackGate(1, 'Alafasy_128kbps', 1),
    );

    await waitFor(() => {
      expect(result.current.isPlaybackBlocked).toBe(true);
    });
  });

  it('menampilkan toast saat notifyIfPlaybackBlocked dipanggil', async () => {
    const showAppToast = vi.spyOn(appToast, 'showAppToast');

    useOfflineStore.setState({
      connectionStatus: 'offline',
      downloadStatuses: { '2:Alafasy_128kbps': 'idle' },
    });

    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({
        match: vi.fn(async () => undefined),
      })),
    });

    const { result } = renderHook(() =>
      useAudioPlaybackGate(2, 'Alafasy_128kbps', 1),
    );

    await waitFor(() => {
      expect(result.current.isPlaybackBlocked).toBe(true);
    });

    let blocked = false;
    act(() => {
      blocked = result.current.notifyIfPlaybackBlocked();
    });

    expect(blocked).toBe(true);
    expect(showAppToast).toHaveBeenCalledWith('offlineUnavailableToast');
  });

  it('tidak memblokir saat offline dan audio surat siap', () => {
    useOfflineStore.setState({
      connectionStatus: 'offline',
      downloadStatuses: { '1:Alafasy_128kbps': 'ready' },
    });

    const { result } = renderHook(() =>
      useAudioPlaybackGate(1, 'Alafasy_128kbps', 1),
    );

    expect(result.current.isPlaybackBlocked).toBe(false);
    expect(result.current.notifyIfPlaybackBlocked()).toBe(false);
  });

  it('tidak memblokir saat offline jika ayat tercache via auto download', async () => {
    const url = fixtureAyahAudioUrl(1, 5);

    useOfflineStore.setState({
      connectionStatus: 'offline',
      downloadStatuses: { '1:Alafasy_128kbps': 'idle' },
    });

    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({
        match: vi.fn(async (requestUrl: string) =>
          requestUrl === url ? new Response(new Blob()) : undefined,
        ),
      })),
    });

    const { result } = renderHook(() =>
      useAudioPlaybackGate(1, 'Alafasy_128kbps', 5),
    );

    await waitFor(() => {
      expect(result.current.isPlaybackBlocked).toBe(false);
    });
  });
});
