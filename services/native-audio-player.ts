/**
 * Player audio native Capacitor (MediaPlayer/ExoPlayer) — hanya APK.
 * FGS + notifikasi media lewat showNotification (jangan andalkan Capgo MediaSession
 * startForeground dari background — crash di Android 14+).
 */

import type { PluginListenerHandle } from '@capacitor/core';
import { NativeAudio } from '@capgo/capacitor-native-audio';

import { isNativePlatform } from '@/lib/platform';
import {
  dispatchMediaSessionNextTrack,
  dispatchMediaSessionPreviousTrack,
} from '@/services/media-session';

/** Asset id tunggal — dipakai juga untuk bersihkan notifikasi yatim. */
export const NATIVE_AUDIO_ASSET_ID = 'hanquran-ayah';

const ASSET_ID = NATIVE_AUDIO_ASSET_ID;

export interface NativeAudioTrackMeta {
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
}

export type NativeAudioTimeHandler = (
  currentTime: number,
  duration: number,
) => void;

function pluginErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

function notificationMeta(meta?: NativeAudioTrackMeta) {
  if (!meta) {
    return {
      title: 'HanQuran',
      artist: 'Tilawah',
      album: 'HanQuran',
    };
  }
  return {
    title: meta.title,
    artist: meta.artist,
    album: meta.album ?? 'HanQuran',
    artworkUrl: meta.artworkUrl,
  };
}

export class NativeAudioPlayer {
  private configured = false;

  private loaded = false;

  private duration = 0;

  /** Cegah plugin yang memancarkan `complete` berkali-kali dalam satu sesi play. */
  private completeHandled = false;

  /** Setelah prev/next notifikasi: abaikan `complete` residual dari trek lama. */
  private suppressCompleteUntil = 0;

  private readonly handles: PluginListenerHandle[] = [];

  private onTimeUpdate: NativeAudioTimeHandler | null = null;

  private onDuration: ((duration: number) => void) | null = null;

  private onEnded: (() => void) | null = null;

  private onRemotePlay: (() => void) | null = null;

  private onRemotePause: (() => void) | null = null;

  setHandlers(handlers: {
    onTimeUpdate?: NativeAudioTimeHandler;
    onDuration?: (duration: number) => void;
    onEnded?: () => void;
    onRemotePlay?: () => void;
    onRemotePause?: () => void;
  }): void {
    this.onTimeUpdate = handlers.onTimeUpdate ?? null;
    this.onDuration = handlers.onDuration ?? null;
    this.onEnded = handlers.onEnded ?? null;
    this.onRemotePlay = handlers.onRemotePlay ?? null;
    this.onRemotePause = handlers.onRemotePause ?? null;
  }

  private setDurationIfKnown(duration: number | undefined): void {
    if (
      typeof duration !== 'number' ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return;
    }
    this.duration = duration;
    this.onDuration?.(duration);
  }

  private emitCompleteOnce(): void {
    if (this.completeHandled) return;
    if (Date.now() < this.suppressCompleteUntil) return;
    this.completeHandled = true;
    this.onEnded?.();
  }

  /** Prev/next dari notifikasi: jangan biarkan `complete` sisa memicu advance. */
  private beginRemoteTrackSkip(): void {
    this.completeHandled = true;
    this.suppressCompleteUntil = Date.now() + 800;
  }

  private async ensureConfigured(): Promise<void> {
    if (this.configured) return;

    await NativeAudio.configure({
      // Hindari AUDIOFOCUS_GAIN_TRANSIENT — rawan LOSS saat HOME.
      focus: false,
      background: true,
      backgroundPlayback: true,
      showNotification: true,
    });

    this.handles.push(
      await NativeAudio.addListener('complete', ({ assetId }) => {
        if (assetId !== ASSET_ID) return;
        this.emitCompleteOnce();
      }),
    );

    this.handles.push(
      await NativeAudio.addListener('currentTime', (event) => {
        if (event.assetId !== ASSET_ID) return;
        this.onTimeUpdate?.(event.currentTime, this.duration);
      }),
    );

    this.handles.push(
      await NativeAudio.addListener('playbackState', (event) => {
        if (event.assetId !== ASSET_ID) return;

        this.setDurationIfKnown(event.duration);

        if (event.reason === 'complete') {
          this.emitCompleteOnce();
          return;
        }
        if (event.reason === 'remotePause' || event.reason === 'remoteStop') {
          this.onRemotePause?.();
          return;
        }
        if (event.reason === 'remotePlay') {
          this.onRemotePlay?.();
          return;
        }
        if (
          event.reason === 'remotePrevious' ||
          event.reason === 'remoteRewind'
        ) {
          this.beginRemoteTrackSkip();
          dispatchMediaSessionPreviousTrack();
          return;
        }
        if (
          event.reason === 'remoteNext' ||
          event.reason === 'remoteFastForward'
        ) {
          this.beginRemoteTrackSkip();
          dispatchMediaSessionNextTrack();
          return;
        }
        if (event.reason === 'remoteSeek') {
          // Seek ke ujung lewat scrubber OS tidak boleh jadi "ayat selesai"
          // (advance murotal/repeat). Biarkan posisi; complete alami diabaikan sebentar.
          const duration =
            typeof event.duration === 'number' && event.duration > 0
              ? event.duration
              : this.duration;
          const position =
            typeof event.currentTime === 'number' ? event.currentTime : NaN;
          if (
            Number.isFinite(duration) &&
            Number.isFinite(position) &&
            duration > 0 &&
            position >= duration - 0.35
          ) {
            this.beginRemoteTrackSkip();
          }
        }
      }),
    );

    this.configured = true;
  }

  private async unloadQuiet(): Promise<void> {
    try {
      await NativeAudio.stop({ assetId: ASSET_ID });
    } catch {
      // ignore
    }
    try {
      await NativeAudio.unload({ assetId: ASSET_ID });
    } catch {
      // ignore
    }
    this.loaded = false;
    this.duration = 0;
    // Jangan reset completeHandled di sini — event `complete` tertunda dari trek
    // lama bisa menembak lagi dan membatalkan replay/advance.
  }

  private async preloadAsset(
    assetPath: string,
    meta?: NativeAudioTrackMeta,
  ): Promise<void> {
    const options = {
      assetId: ASSET_ID,
      assetPath,
      isUrl: true as const,
      volume: 1.0,
      notificationMetadata: notificationMeta(meta),
    };

    try {
      await NativeAudio.preload(options);
    } catch (error) {
      // Asset sisa dari sesi sebelumnya — buang lalu coba lagi.
      if (/already exists/i.test(pluginErrorMessage(error))) {
        await this.unloadQuiet();
        await NativeAudio.preload(options);
      } else {
        throw error;
      }
    }
  }

  private refreshDurationAsync(): void {
    void NativeAudio.getDuration({ assetId: ASSET_ID })
      .then(({ duration }) => {
        this.setDurationIfKnown(duration);
      })
      .catch(() => {
        // Abaikan — duration bisa datang lewat playbackState.
      });
  }

  async play(
    assetPath: string,
    playbackRate: number,
    meta?: NativeAudioTrackMeta,
  ): Promise<void> {
    await this.ensureConfigured();
    // Tetap suppress complete sampai native play benar-benar start.
    this.completeHandled = true;
    await this.unloadQuiet();

    await this.preloadAsset(assetPath, meta);
    this.loaded = true;

    await this.applyRate(playbackRate);
    await NativeAudio.play({ assetId: ASSET_ID });
    this.completeHandled = false;
    this.refreshDurationAsync();
  }

  /**
   * Putar ulang dari detik 0. Prefer full `play()` dari pemanggil setelah ended —
   * ExoPlayer sering tidak andal di STATE_ENDED dengan seek+play saja.
   */
  async restart(playbackRate: number): Promise<void> {
    await this.ensureConfigured();
    if (!this.loaded) {
      throw new Error('Native audio asset not loaded');
    }

    this.completeHandled = true;
    try {
      await NativeAudio.stop({ assetId: ASSET_ID });
    } catch {
      // ignore
    }
    try {
      await NativeAudio.setCurrentTime({ assetId: ASSET_ID, time: 0 });
    } catch {
      // ignore
    }
    await this.applyRate(playbackRate);
    try {
      await NativeAudio.play({ assetId: ASSET_ID });
    } catch {
      await NativeAudio.resume({ assetId: ASSET_ID });
    }
    this.completeHandled = false;
    this.refreshDurationAsync();
  }

  async pause(): Promise<void> {
    if (!this.loaded) return;
    try {
      await NativeAudio.pause({ assetId: ASSET_ID });
    } catch {
      // ignore
    }
  }

  async resume(): Promise<void> {
    if (!this.loaded) return;
    this.completeHandled = false;
    await NativeAudio.resume({ assetId: ASSET_ID });
  }

  /** Akhiri sesi: stop + unload (plugin clear notifikasi FGS). */
  async stopSession(): Promise<void> {
    await this.unloadQuiet();
    this.completeHandled = true;
  }

  async seek(seconds: number): Promise<void> {
    if (!this.loaded || !Number.isFinite(seconds)) return;
    const clamped =
      this.duration > 0
        ? Math.min(Math.max(seconds, 0), this.duration)
        : Math.max(seconds, 0);
    await NativeAudio.setCurrentTime({ assetId: ASSET_ID, time: clamped });
  }

  async applyRate(rate: number): Promise<void> {
    if (!this.loaded || !Number.isFinite(rate) || rate <= 0) return;
    try {
      await NativeAudio.setRate({ assetId: ASSET_ID, rate });
    } catch {
      try {
        await NativeAudio.setRate({
          assetId: ASSET_ID,
          rate: Math.min(Math.max(rate, 0.1), 1),
        });
      } catch {
        // ignore
      }
    }
  }

  getDuration(): number {
    return this.duration;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  async getCurrentTime(): Promise<number> {
    if (!this.loaded) return 0;
    try {
      const { currentTime } = await NativeAudio.getCurrentTime({
        assetId: ASSET_ID,
      });
      return currentTime;
    } catch {
      return 0;
    }
  }

  async destroy(): Promise<void> {
    await this.unloadQuiet();
    for (const handle of this.handles) {
      try {
        await handle.remove();
      } catch {
        // ignore
      }
    }
    this.handles.length = 0;
    this.configured = false;
    this.onTimeUpdate = null;
    this.onDuration = null;
    this.onEnded = null;
    this.onRemotePlay = null;
    this.onRemotePause = null;
  }
}

/**
 * Bersihkan FGS/notifikasi yatim tanpa membuat AudioController
 * (mis. setelah hard nav ke Beranda).
 */
export async function dismissOrphanNativeAudioSession(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await NativeAudio.stop({ assetId: ASSET_ID });
  } catch {
    // ignore
  }
  try {
    await NativeAudio.unload({ assetId: ASSET_ID });
  } catch {
    // ignore
  }
}
