/**
 * AudioController — jembatan HTMLAudioElement ↔ useAudioStore.
 *
 * Satu-satunya modul yang memegang referensi elemen audio (docs/15 Bagian 10.1).
 * Leadership lintas tab via `AudioTabSync` + BroadcastChannel `hanquran:audio`.
 */

import {
  AudioPrefetchBuffer,
  injectAudioPrefetchHint,
  removeAudioPrefetchHints,
} from '@/services/audio-prefetch';
import { AudioTabSync } from '@/services/audio-tab-sync';
import { trackAudioPlay } from '@/lib/analytics';
import { useAudioStore } from '@/stores/audioStore';
import type { AudioErrorCode, AudioTrack, PlaybackRate } from '@/types';

export type AudioEndedHandler = () => void;

function mapPlayError(error: unknown): AudioErrorCode {
  if (error instanceof DOMException) {
    if (error.name === 'AbortError') return 'aborted';
    if (error.name === 'NotSupportedError') return 'decode';
  }
  return 'network';
}

function mapMediaError(audio: HTMLAudioElement): AudioErrorCode {
  const code = audio.error?.code;
  if (code === MediaError.MEDIA_ERR_DECODE) return 'decode';
  if (code === MediaError.MEDIA_ERR_ABORTED) return 'aborted';
  return 'network';
}

export class AudioController {
  private readonly audio: HTMLAudioElement;

  private readonly tabSync: AudioTabSync | null;

  private readonly prefetchBuffer: AudioPrefetchBuffer | null;

  private readonly endedHandlers = new Set<AudioEndedHandler>();

  private readonly handleTimeUpdate = (): void => {
    useAudioStore.getState().setCurrentTime(this.audio.currentTime);
  };

  private readonly handleLoadedMetadata = (): void => {
    if (Number.isFinite(this.audio.duration)) {
      useAudioStore.getState().setDuration(this.audio.duration);
    }
  };

  private readonly handleEnded = (): void => {
    useAudioStore.getState().pause();
    useAudioStore.getState().setCurrentTime(0);
    for (const handler of this.endedHandlers) {
      handler();
    }
  };

  private readonly handleError = (): void => {
    useAudioStore.getState().setError(mapMediaError(this.audio));
    useAudioStore.getState().pause();
  };

  private readonly handlePlay = (): void => {
    if (!useAudioStore.getState().isPlaying) {
      useAudioStore.getState().resume();
    }
  };

  private readonly handlePause = (): void => {
    if (useAudioStore.getState().isPlaying) {
      useAudioStore.getState().pause();
    }
  };

  constructor(
    audioElement?: HTMLAudioElement,
    tabSync?: AudioTabSync | null,
    prefetchBuffer?: AudioPrefetchBuffer | null,
  ) {
    this.audio = audioElement ?? new Audio();
    this.audio.preload = 'none';

    if (tabSync !== undefined) {
      this.tabSync = tabSync;
    } else if (typeof BroadcastChannel !== 'undefined') {
      this.tabSync = new AudioTabSync();
    } else {
      this.tabSync = null;
    }

    if (prefetchBuffer !== undefined) {
      this.prefetchBuffer = prefetchBuffer;
    } else if (typeof window !== 'undefined') {
      this.prefetchBuffer = new AudioPrefetchBuffer();
    } else {
      this.prefetchBuffer = null;
    }

    this.tabSync?.setRemoteInterruptHandler(() => {
      this.pauseFromRemote();
    });

    this.attachListeners();
  }

  /** Elemen audio yang dikelola (untuk pengujian / debugging). */
  get element(): HTMLAudioElement {
    return this.audio;
  }

  /** Memutar trek baru atau melanjutkan trek yang sama. */
  async play(track: AudioTrack): Promise<void> {
    const store = useAudioStore.getState();
    const sameUrl =
      this.audio.src === track.url || this.audio.src.endsWith(track.url);

    const isNewTrack = !sameUrl;

    this.tabSync?.notifyClaimPlay(track);

    store.play(track);

    if (isNewTrack) {
      this.audio.src = track.url;
      this.audio.preload = 'metadata';
      store.setCurrentTime(0);
      store.setDuration(0);
      this.tabSync?.notifyTrackChanged(track);
    } else {
      this.audio.preload = 'metadata';
    }

    this.applyPlaybackRate(store.playbackRate);

    try {
      await this.audio.play();
      if (isNewTrack) {
        trackAudioPlay({
          surahId: track.surahId,
          ayahNumber: track.ayahNumber,
          reciterId: track.reciterId,
        });
      }
    } catch (error) {
      const code = mapPlayError(error);
      if (code !== 'aborted') {
        store.setError(code);
      }
      store.pause();
    }
  }

  pause(): void {
    this.tabSync?.notifyPause();
    this.pauseFromRemote();
  }

  async resume(): Promise<void> {
    const store = useAudioStore.getState();
    if (!store.currentTrack) return;

    this.tabSync?.notifyClaimPlay(store.currentTrack);

    store.resume();

    try {
      await this.audio.play();
    } catch (error) {
      const code = mapPlayError(error);
      if (code !== 'aborted') {
        store.setError(code);
      }
      store.pause();
    }
  }

  async toggle(track: AudioTrack): Promise<void> {
    const { isPlaying, currentTrack } = useAudioStore.getState();
    const isSameTrack =
      currentTrack?.surahId === track.surahId &&
      currentTrack?.ayahNumber === track.ayahNumber &&
      currentTrack?.url === track.url;

    if (isPlaying && isSameTrack) {
      this.pause();
      return;
    }

    await this.play(track);
  }

  seek(seconds: number): void {
    if (!Number.isFinite(seconds)) return;

    const duration = this.audio.duration;
    const clamped =
      Number.isFinite(duration) && duration > 0
        ? Math.min(Math.max(seconds, 0), duration)
        : Math.max(seconds, 0);

    this.audio.currentTime = clamped;
    useAudioStore.getState().setCurrentTime(clamped);
    this.tabSync?.notifySeek(clamped);
  }

  /** Prefetch URL audio (hint browser + buffer tersembunyi). */
  prefetch(urls: string[]): void {
    const nextUrl = urls.find(Boolean);
    if (!nextUrl) return;

    injectAudioPrefetchHint(nextUrl);
    this.prefetchBuffer?.load(nextUrl);
  }

  setPlaybackRate(rate: PlaybackRate): void {
    this.applyPlaybackRate(rate);
    useAudioStore.getState().setPlaybackRate(rate);
  }

  /** Langganan event ayat selesai (untuk RepeatEngine / navigasi ayat). */
  onEnded(handler: AudioEndedHandler): () => void {
    this.endedHandlers.add(handler);
    return () => {
      this.endedHandlers.delete(handler);
    };
  }

  destroy(): void {
    this.detachListeners();
    this.endedHandlers.clear();
    this.tabSync?.destroy();
    this.prefetchBuffer?.destroy();
    removeAudioPrefetchHints();
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    useAudioStore.getState().reset();
  }

  /** Jeda dari tab lain — tanpa broadcast balik. */
  private pauseFromRemote(): void {
    this.audio.pause();
    useAudioStore.getState().pause();
  }

  private applyPlaybackRate(rate: PlaybackRate): void {
    this.audio.playbackRate = rate;
  }

  private attachListeners(): void {
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.addEventListener('loadedmetadata', this.handleLoadedMetadata);
    this.audio.addEventListener('ended', this.handleEnded);
    this.audio.addEventListener('error', this.handleError);
    this.audio.addEventListener('play', this.handlePlay);
    this.audio.addEventListener('pause', this.handlePause);
  }

  private detachListeners(): void {
    this.audio.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.removeEventListener('loadedmetadata', this.handleLoadedMetadata);
    this.audio.removeEventListener('ended', this.handleEnded);
    this.audio.removeEventListener('error', this.handleError);
    this.audio.removeEventListener('play', this.handlePlay);
    this.audio.removeEventListener('pause', this.handlePause);
  }
}

let singleton: AudioController | null = null;

/** Instance tunggal untuk sesi browser. */
export function getAudioController(): AudioController | null {
  if (typeof window === 'undefined') return null;

  if (!singleton) {
    singleton = new AudioController();
  }

  return singleton;
}

/** Hanya untuk pengujian — reset singleton. */
export function resetAudioController(): void {
  singleton?.destroy();
  singleton = null;
}
