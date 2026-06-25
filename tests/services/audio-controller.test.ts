import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MockBroadcastChannel } from '@/tests/helpers/mock-broadcast-channel';
import { fixtureAyahAudioUrl } from '@/tests/fixtures/audio';
import {
  AudioController,
  getAudioController,
  resetAudioController,
} from '@/services/audio-controller';
import { AudioPrefetchBuffer } from '@/services/audio-prefetch';
import { AudioTabSync } from '@/services/audio-tab-sync';
import {
  clearMediaSession,
  resetMediaSessionBindings,
} from '@/services/media-session';
import { useAudioStore } from '@/stores/audioStore';

const sampleTrack = {
  surahId: 1,
  ayahNumber: 1,
  reciterId: 'Alafasy_128kbps',
  url: fixtureAyahAudioUrl(1, 1),
  surahName: 'Al-Fatihah',
  reciterName: 'Mishary Rashid Alafasy',
};

const otherTrack = {
  surahId: 1,
  ayahNumber: 2,
  reciterId: 'Alafasy_128kbps',
  url: fixtureAyahAudioUrl(1, 2),
};

function createController(audio?: HTMLAudioElement): {
  controller: AudioController;
  audio: HTMLAudioElement;
} {
  const element = audio ?? document.createElement('audio');
  vi.spyOn(element, 'play').mockResolvedValue(undefined);
  vi.spyOn(element, 'pause').mockImplementation(() => {});
  return { controller: new AudioController(element, null, null), audio: element };
}

function createMockMediaSession() {
  const actionHandlers = new Map<string, (() => void) | null>();
  let metadata: MediaMetadata | null = null;
  let playbackState: MediaSessionPlaybackState = 'none';

  return {
    get metadata() {
      return metadata;
    },
    set metadata(value: MediaMetadata | null) {
      metadata = value;
    },
    get playbackState() {
      return playbackState;
    },
    set playbackState(value: MediaSessionPlaybackState) {
      playbackState = value;
    },
    setActionHandler(
      action: string,
      handler: (() => void) | null,
    ): void {
      actionHandlers.set(action, handler);
    },
  };
}

describe('AudioController', () => {
  let mockSession: ReturnType<typeof createMockMediaSession>;

  beforeEach(() => {
    MockBroadcastChannel.reset();
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
    resetAudioController();
    useAudioStore.getState().reset();

    mockSession = createMockMediaSession();
    class MockMediaMetadata {
      title?: string;
      artist?: string;
      album?: string;

      constructor(init: MediaMetadataInit) {
        this.title = init.title;
        this.artist = init.artist;
        this.album = init.album;
      }
    }
    vi.stubGlobal('MediaMetadata', MockMediaMetadata);
    vi.stubGlobal('navigator', { mediaSession: mockSession });
    resetMediaSessionBindings();
  });

  afterEach(() => {
    clearMediaSession();
    resetMediaSessionBindings();
    vi.unstubAllGlobals();
  });

  describe('play', () => {
    it('mengatur trek dan memperbarui store', async () => {
      const { controller, audio } = createController();

      await controller.play(sampleTrack);

      const state = useAudioStore.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentTrack).toEqual(sampleTrack);
      expect(state.error).toBeNull();
      expect(audio.src).toContain('001001.mp3');
      expect(audio.play).toHaveBeenCalled();
      expect(mockSession.playbackState).toBe('playing');
      expect(mockSession.metadata?.title).toBe('Al-Fatihah — Ayat 1');
    });

    it('tidak mengganti src saat memutar trek yang sama', async () => {
      const { controller, audio } = createController();
      await controller.play(sampleTrack);
      const srcAfterFirst = audio.src;

      await controller.play(sampleTrack);

      expect(audio.src).toBe(srcAfterFirst);
      expect(audio.play).toHaveBeenCalledTimes(2);
    });

    it('menyetel error network saat play gagal', async () => {
      const { controller, audio } = createController();
      vi.mocked(audio.play).mockRejectedValueOnce(new Error('network'));

      await controller.play(sampleTrack);

      expect(useAudioStore.getState().error).toBe('network');
      expect(useAudioStore.getState().isPlaying).toBe(false);
    });

    it('tidak menyetel error untuk AbortError', async () => {
      const { controller, audio } = createController();
      vi.mocked(audio.play).mockRejectedValueOnce(
        new DOMException('aborted', 'AbortError'),
      );

      await controller.play(sampleTrack);

      expect(useAudioStore.getState().error).toBeNull();
      expect(useAudioStore.getState().isPlaying).toBe(false);
    });

    it('menyetel error decode untuk NotSupportedError', async () => {
      const { controller, audio } = createController();
      vi.mocked(audio.play).mockRejectedValueOnce(
        new DOMException('unsupported', 'NotSupportedError'),
      );

      await controller.play(sampleTrack);

      expect(useAudioStore.getState().error).toBe('decode');
    });
  });

  describe('pause', () => {
    it('menghentikan pemutaran dan store', async () => {
      const { controller, audio } = createController();
      await controller.play(sampleTrack);

      controller.pause();

      expect(useAudioStore.getState().isPlaying).toBe(false);
      expect(audio.pause).toHaveBeenCalled();
      expect(mockSession.playbackState).toBe('paused');
    });
  });

  describe('resume', () => {
    it('melanjutkan trek saat ini', async () => {
      const { controller, audio } = createController();
      await controller.play(sampleTrack);
      controller.pause();

      await controller.resume();

      expect(useAudioStore.getState().isPlaying).toBe(true);
      expect(audio.play).toHaveBeenCalledTimes(2);
    });

    it('tidak melakukan apa-apa tanpa currentTrack', async () => {
      const { controller, audio } = createController();

      await controller.resume();

      expect(audio.play).not.toHaveBeenCalled();
      expect(useAudioStore.getState().isPlaying).toBe(false);
    });
  });

  describe('seek', () => {
    it('memperbarui currentTime elemen dan store', async () => {
      const { controller, audio } = createController();
      Object.defineProperty(audio, 'duration', { value: 30, configurable: true });
      await controller.play(sampleTrack);

      controller.seek(12.5);

      expect(audio.currentTime).toBe(12.5);
      expect(useAudioStore.getState().currentTime).toBe(12.5);
    });

    it('membatasi seek ke 0', async () => {
      const { controller, audio } = createController();
      Object.defineProperty(audio, 'duration', { value: 30, configurable: true });
      await controller.play(sampleTrack);

      controller.seek(-5);

      expect(audio.currentTime).toBe(0);
    });

    it('membatasi seek ke duration', async () => {
      const { controller, audio } = createController();
      Object.defineProperty(audio, 'duration', { value: 30, configurable: true });
      await controller.play(sampleTrack);

      controller.seek(99);

      expect(audio.currentTime).toBe(30);
    });

    it('mengabaikan seek tidak valid', async () => {
      const { controller, audio } = createController();
      await controller.play(sampleTrack);
      audio.currentTime = 5;

      controller.seek(Number.NaN);

      expect(audio.currentTime).toBe(5);
    });
  });

  describe('toggle', () => {
    it('mempause trek yang sedang diputar', async () => {
      const { controller } = createController();
      await controller.play(sampleTrack);

      await controller.toggle(sampleTrack);

      expect(useAudioStore.getState().isPlaying).toBe(false);
    });

    it('memutar trek berbeda saat trek lain sedang jalan', async () => {
      const { controller, audio } = createController();
      await controller.play(sampleTrack);

      await controller.toggle(otherTrack);

      expect(useAudioStore.getState().isPlaying).toBe(true);
      expect(useAudioStore.getState().currentTrack).toEqual(otherTrack);
      expect(audio.src).toContain('001002.mp3');
    });
  });

  describe('event listeners', () => {
    it('timeupdate memperbarui currentTime di store', async () => {
      const { controller, audio } = createController();
      await controller.play(sampleTrack);
      audio.currentTime = 7.25;

      audio.dispatchEvent(new Event('timeupdate'));

      expect(useAudioStore.getState().currentTime).toBe(7.25);
    });

    it('loadedmetadata memperbarui duration', async () => {
      const { controller, audio } = createController();
      Object.defineProperty(audio, 'duration', { value: 42.5, configurable: true });
      await controller.play(sampleTrack);

      audio.dispatchEvent(new Event('loadedmetadata'));

      expect(useAudioStore.getState().duration).toBe(42.5);
    });

    it('error media memperbarui store dan pause', async () => {
      const { controller, audio } = createController();
      await controller.play(sampleTrack);
      Object.defineProperty(audio, 'error', {
        value: { code: MediaError.MEDIA_ERR_DECODE },
        configurable: true,
      });

      audio.dispatchEvent(new Event('error'));

      expect(useAudioStore.getState().error).toBe('decode');
      expect(useAudioStore.getState().isPlaying).toBe(false);
    });

    it('onEnded dipanggil saat audio selesai', async () => {
      const { controller, audio } = createController();
      const onEnded = vi.fn();
      controller.onEnded(onEnded);

      await controller.play(sampleTrack);
      audio.dispatchEvent(new Event('ended'));

      expect(onEnded).toHaveBeenCalledTimes(1);
      expect(useAudioStore.getState().isPlaying).toBe(false);
      expect(useAudioStore.getState().currentTime).toBe(0);
    });
  });

  describe('setPlaybackRate', () => {
    it('diterapkan ke elemen audio dan store', () => {
      const { controller, audio } = createController();

      controller.setPlaybackRate(1.25);

      expect(audio.playbackRate).toBe(1.25);
      expect(useAudioStore.getState().playbackRate).toBe(1.25);
    });
  });

  describe('singleton', () => {
    it('getAudioController mengembalikan instance tunggal', () => {
      resetAudioController();
      const first = getAudioController();
      const second = getAudioController();
      expect(first).not.toBeNull();
      expect(first).toBe(second);
    });
  });

  describe('lintas tab', () => {
    it('claim-play dari tab lain mempause elemen audio lokal', async () => {
      const audioA = document.createElement('audio');
      vi.spyOn(audioA, 'pause').mockImplementation(() => {});

      const syncA = new AudioTabSync();
      const syncB = new AudioTabSync();
      const controllerA = new AudioController(audioA, syncA, null);
      vi.spyOn(audioA, 'play').mockResolvedValue(undefined);

      const nowSpy = vi.spyOn(Date, 'now');
      nowSpy.mockReturnValueOnce(1000);
      await controllerA.play(sampleTrack);

      nowSpy.mockReturnValueOnce(2000);
      syncB.notifyClaimPlay(otherTrack);

      expect(audioA.pause).toHaveBeenCalled();
      expect(useAudioStore.getState().isPlaying).toBe(false);

      nowSpy.mockRestore();
      controllerA.destroy();
      syncA.destroy();
      syncB.destroy();
    });
  });

  describe('prefetch', () => {
    it('memuat hint prefetch dan buffer untuk URL berikutnya', () => {
      const prefetchAudio = document.createElement('audio');
      const loadSpy = vi.spyOn(prefetchAudio, 'load').mockImplementation(() => {});
      const buffer = new AudioPrefetchBuffer(prefetchAudio);
      const prefetchController = new AudioController(
        document.createElement('audio'),
        null,
        buffer,
      );

      prefetchController.prefetch([otherTrack.url]);

      const link = document.head.querySelector(
        'link[data-hanquran-audio-prefetch]',
      );
      expect(link?.getAttribute('href')).toBe(otherTrack.url);
      expect(loadSpy).toHaveBeenCalled();
      expect(buffer.currentUrl).toBe(otherTrack.url);

      prefetchController.destroy();
    });
  });

  describe('destroy', () => {
    it('mereset store', async () => {
      const { controller } = createController();
      await controller.play(sampleTrack);

      controller.destroy();

      expect(useAudioStore.getState()).toMatchObject({
        isPlaying: false,
        currentTrack: null,
        currentTime: 0,
        duration: 0,
        error: null,
      });
      expect(mockSession.metadata).toBeNull();
      expect(mockSession.playbackState).toBe('none');
    });
  });
});
