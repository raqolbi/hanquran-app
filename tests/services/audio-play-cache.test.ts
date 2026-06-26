import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fixtureAyahAudioUrl } from '@/tests/fixtures/audio';
import {
  cacheAyahAudioOnPlay,
  isAyahAudioCached,
  maybeCacheAyahOnPlay,
} from '@/services/audio-play-cache';
import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';
import { useOfflineStore } from '@/stores/offlineStore';
import { useUserStore } from '@/stores/userStore';
import { defaultSettings } from '@/services/db/db';

const sampleUrl = fixtureAyahAudioUrl(1, 1);

function mockFetchResponse(size = 256) {
  return new Response(new Blob([new Uint8Array(size)]), {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}

describe('audio-play-cache', () => {
  const cachePut = vi.fn(async () => undefined);
  const cacheMatch = vi.fn(async () => undefined as Response | undefined);
  const refreshManifest = vi.fn(async () => undefined);

  beforeEach(() => {
    cachePut.mockClear();
    cacheMatch.mockClear();
    refreshManifest.mockClear();

    vi.stubGlobal('fetch', vi.fn(async () => mockFetchResponse()));
    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({
        match: cacheMatch,
        put: cachePut,
      })),
    });

    useUserStore.setState({
      settings: { ...defaultSettings, autoDownloadOnPlay: true },
    });
    useOfflineStore.setState({ connectionStatus: 'online' });
    vi.spyOn(useOfflineStore.getState(), 'refreshManifest').mockImplementation(
      refreshManifest,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('isAyahAudioCached', () => {
    it('mengembalikan true jika entri ada di cache', async () => {
      cacheMatch.mockResolvedValueOnce(mockFetchResponse());

      await expect(isAyahAudioCached(sampleUrl)).resolves.toBe(true);
      expect(caches.open).toHaveBeenCalledWith(AUDIO_CACHE_NAME);
    });

    it('mengembalikan false jika entri tidak ada', async () => {
      await expect(isAyahAudioCached(sampleUrl)).resolves.toBe(false);
    });
  });

  describe('cacheAyahAudioOnPlay', () => {
    it('menyimpan file baru ke cache dan refresh ringkasan', async () => {
      await cacheAyahAudioOnPlay(sampleUrl);

      expect(fetch).toHaveBeenCalledWith(sampleUrl, { mode: 'cors' });
      expect(cachePut).toHaveBeenCalledTimes(1);
      expect(refreshManifest).toHaveBeenCalledTimes(1);
    });

    it('tidak fetch ulang jika sudah di cache', async () => {
      cacheMatch.mockResolvedValueOnce(mockFetchResponse());

      await cacheAyahAudioOnPlay(sampleUrl);

      expect(fetch).not.toHaveBeenCalled();
      expect(cachePut).not.toHaveBeenCalled();
    });
  });

  describe('maybeCacheAyahOnPlay', () => {
    it('tidak cache saat pengaturan OFF', () => {
      useUserStore.setState({
        settings: { ...defaultSettings, autoDownloadOnPlay: false },
      });

      maybeCacheAyahOnPlay(sampleUrl);

      expect(fetch).not.toHaveBeenCalled();
    });

    it('tidak cache saat offline', () => {
      useOfflineStore.setState({ connectionStatus: 'offline' });

      maybeCacheAyahOnPlay(sampleUrl);

      expect(fetch).not.toHaveBeenCalled();
    });

    it('memulai cache saat ON dan online', async () => {
      maybeCacheAyahOnPlay(sampleUrl);

      await vi.waitFor(() => {
        expect(cachePut).toHaveBeenCalled();
      });
    });
  });
});
