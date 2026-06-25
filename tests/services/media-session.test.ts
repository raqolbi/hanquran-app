import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bindMediaSession,
  clearMediaSession,
  isMediaSessionSupported,
  resetMediaSessionBindings,
  setMediaSessionPlaybackState,
  setMediaSessionTrackNavigation,
  syncMediaSessionFromTrack,
  updateMediaSessionMetadata,
} from '@/services/media-session';
import { useUserStore } from '@/stores/userStore';
import type { AudioTrack } from '@/types';

const sampleTrack: AudioTrack = {
  surahId: 1,
  ayahNumber: 3,
  reciterId: 'Alafasy_128kbps',
  url: 'https://example.com/001003.mp3',
  surahName: 'Al-Fatihah',
  reciterName: 'Mishary Rashid Alafasy',
};

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
    invoke(action: string): void {
      actionHandlers.get(action)?.();
    },
    actionHandlers,
  };
}

describe('media-session', () => {
  let mockSession: ReturnType<typeof createMockMediaSession>;

  beforeEach(() => {
    mockSession = createMockMediaSession();

    class MockMediaMetadata {
      title?: string;
      artist?: string;
      album?: string;
      artwork?: MediaImage[];

      constructor(init: MediaMetadataInit) {
        this.title = init.title;
        this.artist = init.artist;
        this.album = init.album;
        this.artwork = init.artwork;
      }
    }

    vi.stubGlobal('MediaMetadata', MockMediaMetadata);
    vi.stubGlobal('navigator', {
      mediaSession: mockSession,
    });

    useUserStore.setState((state) => ({
      ...state,
      settings: { ...state.settings, appLocale: 'id' },
    }));
    resetMediaSessionBindings();
  });

  afterEach(() => {
    clearMediaSession();
    vi.unstubAllGlobals();
    resetMediaSessionBindings();
  });

  it('mendeteksi dukungan Media Session', () => {
    expect(isMediaSessionSupported()).toBe(true);
  });

  it('no-op saat Media Session tidak tersedia', () => {
    vi.stubGlobal('navigator', {});
    resetMediaSessionBindings();

    const onPlay = vi.fn();
    bindMediaSession({ onPlay, onPause: vi.fn() });
    updateMediaSessionMetadata({
      surahId: 1,
      surahName: 'Al-Fatihah',
      ayahNumber: 1,
      reciterName: 'Qari',
    });
    setMediaSessionPlaybackState('playing');

    expect(onPlay).not.toHaveBeenCalled();
    expect(isMediaSessionSupported()).toBe(false);
  });

  it('mengatur metadata dengan judul terlokalisasi', () => {
    updateMediaSessionMetadata({
      surahId: 1,
      surahName: 'Al-Fatihah',
      ayahNumber: 3,
      reciterName: 'Mishary Rashid Alafasy',
    });

    expect(mockSession.metadata?.title).toBe('Al-Fatihah — Ayat 3');
    expect(mockSession.metadata?.artist).toBe('Mishary Rashid Alafasy');
    expect(mockSession.metadata?.album).toBe('HanQuran');
    expect(mockSession.metadata?.artwork?.[0]?.src).toContain('/icons/icon-512.png');
  });

  it('memakai label Verse untuk locale en', () => {
    useUserStore.setState((state) => ({
      ...state,
      settings: { ...state.settings, appLocale: 'en' },
    }));

    updateMediaSessionMetadata({
      surahId: 1,
      surahName: 'Al-Fatihah',
      ayahNumber: 2,
      reciterName: 'Mishary Rashid Alafasy',
    });

    expect(mockSession.metadata?.title).toBe('Al-Fatihah — Verse 2');
  });

  it('handler play dan pause memanggil callback', () => {
    const onPlay = vi.fn();
    const onPause = vi.fn();

    bindMediaSession({ onPlay, onPause });

    mockSession.invoke('play');
    mockSession.invoke('pause');

    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('handler previoustrack dan nexttrack dari navigasi ayat', () => {
    const onPreviousTrack = vi.fn();
    const onNextTrack = vi.fn();

    bindMediaSession({ onPlay: vi.fn(), onPause: vi.fn() });
    setMediaSessionTrackNavigation({ onPreviousTrack, onNextTrack });

    mockSession.invoke('previoustrack');
    mockSession.invoke('nexttrack');

    expect(onPreviousTrack).toHaveBeenCalledTimes(1);
    expect(onNextTrack).toHaveBeenCalledTimes(1);
  });

  it('syncMediaSessionFromTrack memperbarui metadata dan playbackState', async () => {
    await syncMediaSessionFromTrack(sampleTrack, 'playing');

    expect(mockSession.metadata?.title).toBe('Al-Fatihah — Ayat 3');
    expect(mockSession.playbackState).toBe('playing');
  });

  it('clearMediaSession mereset metadata dan handlers', () => {
    bindMediaSession({ onPlay: vi.fn(), onPause: vi.fn() });
    setMediaSessionPlaybackState('playing');
    updateMediaSessionMetadata({
      surahId: 1,
      surahName: 'Al-Fatihah',
      ayahNumber: 1,
      reciterName: 'Qari',
    });

    clearMediaSession();

    expect(mockSession.metadata).toBeNull();
    expect(mockSession.playbackState).toBe('none');
    expect(mockSession.actionHandlers.get('play')).toBeNull();
  });
});
