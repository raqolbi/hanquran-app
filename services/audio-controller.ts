/**
 * AudioController — jembatan player ↔ useAudioStore.
 *
 * Satu-satunya modul yang memegang referensi elemen audio (docs/15 Bagian 10.1).
 * Leadership lintas tab via `AudioTabSync` + BroadcastChannel `hanquran:audio`.
 *
 * - Web/PWA: HTMLAudioElement (tidak berubah).
 * - Capacitor Android: NativeAudioPlayer + Media Session FGS (docs/32 §10.1).
 */

import {
  AudioPrefetchBuffer,
  injectAudioPrefetchHint,
  removeAudioPrefetchHints,
} from '@/services/audio-prefetch';
import { AudioTabSync } from '@/services/audio-tab-sync';
import {
  bindMediaSession,
  clearMediaSession,
  setMediaSessionPlaybackState,
  setMediaSessionPositionState,
  syncMediaSessionFromTrack,
} from '@/services/media-session';
import { trackAudioPlay } from '@/lib/analytics';
import {
  markNativeUserInitiatedPause,
  registerNativeBackgroundAudioElement,
  shouldIgnoreNativeMediaPause,
} from '@/lib/native-background-audio';
import { isNativePlatform } from '@/lib/platform';
import { maybeCacheAyahOnPlay } from '@/services/audio-play-cache';
import {
  dismissOrphanNativeAudioSession,
  NativeAudioPlayer,
} from '@/services/native-audio-player';

import { getReciterById } from '@/services/quran/audio-service';
import { getSurahSummary } from '@/services/quran/quran-service';
import { resolveNativePlayablePath } from '@/services/resolve-native-audio-path';
import { resolvePlayableAudioUrl } from '@/services/resolve-playable-audio-url';
import { useAudioStore } from '@/stores/audioStore';
import { useUserStore } from '@/stores/userStore';
import type { AudioErrorCode, AudioTrack, PlaybackRate } from '@/types';

export type AudioEndedHandler = () => void;

export { dismissOrphanNativeAudioSession };

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

  private readonly nativePlayer: NativeAudioPlayer | null;

  private readonly tabSync: AudioTabSync | null;

  private readonly prefetchBuffer: AudioPrefetchBuffer | null;

  private readonly endedHandlers = new Set<AudioEndedHandler>();

  /** URL logika trek (CDN), bukan blob: / file://. */
  private activeTrackUrl: string | null = null;

  private revokeObjectUrl: (() => void) | null = null;

  private readonly handleTimeUpdate = (): void => {
    useAudioStore.getState().setCurrentTime(this.audio.currentTime);
    this.syncMediaSessionPosition();
  };

  private readonly handleLoadedMetadata = (): void => {
    if (Number.isFinite(this.audio.duration)) {
      useAudioStore.getState().setDuration(this.audio.duration);
    }
    this.syncMediaSessionPosition();
  };

  private readonly handleEnded = (): void => {
    useAudioStore.getState().pause();
    useAudioStore.getState().setCurrentTime(0);
    this.syncMediaSessionPlaybackState('paused');
    for (const handler of this.endedHandlers) {
      handler();
    }
    // Murotal/replay sering memanggil play() sinkron di handler di atas.
    // Jika benar-benar berhenti: sembunyikan notifikasi (jangan sisakan Play yatim).
    if (this.nativePlayer) {
      queueMicrotask(() => {
        const store = useAudioStore.getState();
        if (!store.isPlaying) {
          this.stopPlayback();
        }
      });
    }
  };

  private readonly handleError = (): void => {
    useAudioStore.getState().setError(mapMediaError(this.audio));
    useAudioStore.getState().pause();
    this.syncMediaSessionPlaybackState('paused');
  };

  private readonly handlePlay = (): void => {
    if (!useAudioStore.getState().isPlaying) {
      useAudioStore.getState().resume();
    }
  };

  private readonly handlePause = (): void => {
    if (shouldIgnoreNativeMediaPause()) {
      void this.audio.play().catch(() => {
        // Jika resume gagal, biarkan state apa adanya.
      });
      return;
    }
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

    const useNative = isNativePlatform() && audioElement === undefined;
    this.nativePlayer = useNative ? new NativeAudioPlayer() : null;

    if (this.nativePlayer) {
      this.nativePlayer.setHandlers({
        onTimeUpdate: (currentTime, duration) => {
          useAudioStore.getState().setCurrentTime(currentTime);
          if (duration > 0) {
            useAudioStore.getState().setDuration(duration);
          }
          this.syncMediaSessionPosition();
        },
        onDuration: (duration) => {
          useAudioStore.getState().setDuration(duration);
          this.syncMediaSessionPosition();
        },
        onEnded: () => {
          this.handleEnded();
        },
        onRemotePlay: () => {
          void this.resumeFromMediaSession();
        },
        onRemotePause: () => {
          // Native sudah pause; sync store tanpa mark "user pause" HTML.
          this.pauseFromRemote();
        },
      });
    } else if (isNativePlatform()) {
      registerNativeBackgroundAudioElement(() => this.audio);
    }

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

    bindMediaSession({
      onPlay: () => this.handleMediaSessionPlay(),
      onPause: () => this.pause(),
      onSeekTo: (seekTime) => this.seek(seekTime),
    });

    if (!this.nativePlayer) {
      this.attachListeners();
    }
  }

  private handleMediaSessionPlay(): void {
    void this.resumeFromMediaSession();
  }

  private async resumeFromMediaSession(): Promise<void> {
    const store = useAudioStore.getState();
    const track = store.currentTrack;
    if (!track) return;

    if (this.nativePlayer) {
      // Plugin native sudah memanggil resume() sebelum emit remotePlay.
      // Drive dari JS lewat play() agar STATE_ENDED / posisi ~0 di-reload
      // penuh (resume ExoPlayer setelah ended sering diam).
      if (store.isPlaying) {
        try {
          await this.nativePlayer.resume();
        } catch {
          // ignore
        }
        return;
      }
      await this.play(track);
      return;
    }

    if (store.isPlaying) return;
    await this.resume();
  }

  private syncMediaSessionForTrack(
    track: AudioTrack,
    playbackState: 'playing' | 'paused' | 'none',
  ): void {
    void syncMediaSessionFromTrack(track, playbackState);
  }

  private syncMediaSessionPlaybackState(
    playbackState: 'playing' | 'paused' | 'none',
  ): void {
    const track = useAudioStore.getState().currentTrack;
    if (!track) {
      if (playbackState === 'none') {
        clearMediaSession();
      } else {
        setMediaSessionPlaybackState(playbackState);
      }
      return;
    }

    if (playbackState === 'paused') {
      setMediaSessionPlaybackState('paused');
      this.syncMediaSessionPosition();
      return;
    }

    this.syncMediaSessionForTrack(track, playbackState);
  }

  private syncMediaSessionPosition(): void {
    if (!useAudioStore.getState().currentTrack) return;

    const duration = this.nativePlayer
      ? this.nativePlayer.getDuration() || useAudioStore.getState().duration
      : this.audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const position = Math.min(
      Math.max(
        this.nativePlayer
          ? useAudioStore.getState().currentTime
          : this.audio.currentTime,
        0,
      ),
      duration,
    );

    setMediaSessionPositionState({
      duration,
      position,
      playbackRate: useAudioStore.getState().playbackRate,
    });
  }

  /** Elemen audio yang dikelola (untuk pengujian / debugging). */
  get element(): HTMLAudioElement {
    return this.audio;
  }

  /** Memutar trek baru atau melanjutkan trek yang sama. */
  async play(track: AudioTrack): Promise<void> {
    const store = useAudioStore.getState();
    const sameUrl = this.activeTrackUrl === track.url;

    const isNewTrack = !sameUrl;

    this.tabSync?.notifyClaimPlay(track);

    store.play(track);

    if (this.nativePlayer) {
      await this.playNative(track, isNewTrack);
      return;
    }

    if (isNewTrack) {
      this.revokeObjectUrl?.();
      this.revokeObjectUrl = null;

      const resolved = await resolvePlayableAudioUrl(track.url);
      this.revokeObjectUrl = resolved.revoke;
      this.activeTrackUrl = track.url;
      this.audio.src = resolved.src;
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
        maybeCacheAyahOnPlay(track.url);
      }
      this.syncMediaSessionForTrack(track, 'playing');
      this.syncMediaSessionPosition();
    } catch (error) {
      const code = mapPlayError(error);
      if (code !== 'aborted') {
        store.setError(code);
      }
      store.pause();
      this.syncMediaSessionForTrack(track, 'paused');
    }
  }

  private async buildNativeTrackMeta(track: AudioTrack): Promise<{
    title: string;
    artist: string;
    album: string;
  }> {
    const locale = useUserStore.getState().settings.appLocale ?? 'id';
    const surahName =
      track.surahName ??
      (await getSurahSummary(String(track.surahId), locale).catch(() => null))
        ?.englishName ??
      `Surah ${track.surahId}`;
    const reciterName =
      track.reciterName ??
      getReciterById(track.reciterId)?.name ??
      track.reciterId;
    const ayahLabel = locale === 'en' ? 'Verse' : 'Ayat';

    return {
      title: `${surahName} — ${ayahLabel} ${track.ayahNumber}`,
      artist: reciterName,
      album: 'HanQuran',
    };
  }

  private async playNative(track: AudioTrack, isNewTrack: boolean): Promise<void> {
    const store = useAudioStore.getState();
    const player = this.nativePlayer;
    if (!player) return;

    try {
      if (isNewTrack) {
        const resolved = await resolveNativePlayablePath(track.url);
        this.activeTrackUrl = track.url;
        store.setCurrentTime(0);
        store.setDuration(0);
        this.tabSync?.notifyTrackChanged(track);

        await player.play(
          resolved.assetPath,
          store.playbackRate,
          await this.buildNativeTrackMeta(track),
        );
      } else if (!player.isLoaded() || store.currentTime <= 0.05) {
        // Setelah ended: selalu reload penuh. ExoPlayer STATE_ENDED sering gagal
        // dengan seek(0)+play / restart saja.
        const resolved = await resolveNativePlayablePath(track.url);
        await player.play(
          resolved.assetPath,
          store.playbackRate,
          await this.buildNativeTrackMeta(track),
        );
      } else {
        await player.resume();
        await player.applyRate(store.playbackRate);
      }

      if (isNewTrack) {
        trackAudioPlay({
          surahId: track.surahId,
          ayahNumber: track.ayahNumber,
          reciterId: track.reciterId,
        });
        maybeCacheAyahOnPlay(track.url);
      }

      const duration = player.getDuration();
      if (duration > 0) {
        store.setDuration(duration);
      }

      this.syncMediaSessionForTrack(track, 'playing');
      this.syncMediaSessionPosition();
    } catch (error) {
      const code = mapPlayError(error);
      if (code !== 'aborted') {
        store.setError(code);
      }
      store.pause();
      this.syncMediaSessionForTrack(track, 'paused');
    }
  }

  pause(): void {
    markNativeUserInitiatedPause();
    this.tabSync?.notifyPause();
    this.pauseFromRemote();
  }

  /**
   * Akhiri sesi tilawah: stop native (clear notifikasi) + reset store.
   * Beda dari `pause()` — pause mid-track tetap menampilkan kontrol notifikasi.
   */
  stopPlayback(): void {
    this.tabSync?.notifyPause();
    this.activeTrackUrl = null;
    this.revokeObjectUrl?.();
    this.revokeObjectUrl = null;

    if (this.nativePlayer) {
      void this.nativePlayer.stopSession();
    } else {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }

    useAudioStore.getState().reset();
    clearMediaSession();
  }

  async resume(): Promise<void> {
    const store = useAudioStore.getState();
    if (!store.currentTrack) return;

    this.tabSync?.notifyClaimPlay(store.currentTrack);

    store.resume();

    try {
      if (this.nativePlayer) {
        await this.nativePlayer.resume();
        await this.nativePlayer.applyRate(store.playbackRate);
      } else {
        await this.audio.play();
      }
      this.syncMediaSessionPlaybackState('playing');
      this.syncMediaSessionPosition();
    } catch (error) {
      const code = mapPlayError(error);
      if (code !== 'aborted') {
        store.setError(code);
      }
      store.pause();
      this.syncMediaSessionPlaybackState('paused');
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

    if (this.nativePlayer) {
      const duration =
        this.nativePlayer.getDuration() || useAudioStore.getState().duration;
      const clamped =
        Number.isFinite(duration) && duration > 0
          ? Math.min(Math.max(seconds, 0), duration)
          : Math.max(seconds, 0);
      void this.nativePlayer.seek(clamped);
      useAudioStore.getState().setCurrentTime(clamped);
      this.tabSync?.notifySeek(clamped);
      this.syncMediaSessionPosition();
      return;
    }

    const duration = this.audio.duration;
    const clamped =
      Number.isFinite(duration) && duration > 0
        ? Math.min(Math.max(seconds, 0), duration)
        : Math.max(seconds, 0);

    this.audio.currentTime = clamped;
    useAudioStore.getState().setCurrentTime(clamped);
    this.tabSync?.notifySeek(clamped);
    this.syncMediaSessionPosition();
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
    this.syncMediaSessionPosition();
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
    void this.nativePlayer?.destroy();
    this.revokeObjectUrl?.();
    this.revokeObjectUrl = null;
    this.activeTrackUrl = null;
    clearMediaSession();
    useAudioStore.getState().reset();
  }

  /** Jeda dari tab lain — tanpa broadcast balik. */
  private pauseFromRemote(): void {
    if (this.nativePlayer) {
      void this.nativePlayer.pause();
    } else {
      this.audio.pause();
    }
    useAudioStore.getState().pause();
    this.syncMediaSessionPlaybackState('paused');
  }

  private applyPlaybackRate(rate: PlaybackRate): void {
    if (this.nativePlayer) {
      void this.nativePlayer.applyRate(rate);
      return;
    }
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

/** Instance tunggal untuk sesi browser — null jika belum pernah dibuat. */
export function peekAudioController(): AudioController | null {
  return singleton;
}

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
