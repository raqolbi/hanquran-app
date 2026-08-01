/**
 * Adapter Media Session native Capacitor (APK only).
 * PWA/browser tidak memakai modul ini — docs/32 §10.1.
 */

import { MediaSession } from '@capgo/capacitor-media-session';
import type {
  MediaSessionAction,
  MediaSessionPlaybackState,
} from '@capgo/capacitor-media-session';

import type {
  MediaSessionHandlers,
  MediaSessionMetadataInput,
  MediaSessionPositionState,
  MediaSessionTrackNavigationHandlers,
} from '@/services/media-session';

const DEFAULT_ALBUM = 'HanQuran';

let nativeHandlers: MediaSessionHandlers | null = null;
let nativeTrackNav: MediaSessionTrackNavigationHandlers = {};
let actionHandlersBound = false;

function formatTitle(
  surahName: string,
  ayahNumber: number,
  locale: string,
): string {
  const label = locale === 'en' ? 'Verse' : 'Ayat';
  return `${surahName} — ${label} ${ayahNumber}`;
}

async function bindNativeActionHandlers(): Promise<void> {
  if (actionHandlersBound) {
    return;
  }
  actionHandlersBound = true;

  await MediaSession.setActionHandler({ action: 'play' }, () => {
    void nativeHandlers?.onPlay();
  });
  await MediaSession.setActionHandler({ action: 'pause' }, () => {
    nativeHandlers?.onPause();
  });
  await MediaSession.setActionHandler({ action: 'seekto' }, (details) => {
    if (details.seekTime == null || !Number.isFinite(details.seekTime)) return;
    nativeHandlers?.onSeekTo?.(details.seekTime);
  });
  await MediaSession.setActionHandler({ action: 'previoustrack' }, () => {
    nativeTrackNav.onPreviousTrack?.();
  });
  await MediaSession.setActionHandler({ action: 'nexttrack' }, () => {
    nativeTrackNav.onNextTrack?.();
  });
}

export async function bindNativeMediaSession(
  handlers: MediaSessionHandlers,
): Promise<void> {
  nativeHandlers = handlers;
  await bindNativeActionHandlers();
}

export function setNativeMediaSessionTrackNavigation(
  handlers: MediaSessionTrackNavigationHandlers,
): void {
  nativeTrackNav = handlers;
}

export async function updateNativeMediaSessionMetadata(
  input: MediaSessionMetadataInput & { locale: string },
): Promise<void> {
  await bindNativeActionHandlers();

  const artworkSrc =
    input.artworkUrl ??
    (typeof window !== 'undefined'
      ? new URL('/icons/icon-512.png', window.location.origin).href
      : '/icons/icon-512.png');

  await MediaSession.setMetadata({
    title: formatTitle(input.surahName, input.ayahNumber, input.locale),
    artist: input.reciterName,
    album: DEFAULT_ALBUM,
    artwork: [
      {
        src: artworkSrc,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  });
}

export async function setNativeMediaSessionPlaybackState(
  state: MediaSessionPlaybackState,
): Promise<void> {
  await MediaSession.setPlaybackState({ playbackState: state });
}

export async function setNativeMediaSessionPositionState(
  state: MediaSessionPositionState,
): Promise<void> {
  const { duration, position, playbackRate = 1 } = state;
  if (!Number.isFinite(duration) || duration <= 0) return;
  if (!Number.isFinite(position) || position < 0 || position > duration) return;
  if (!Number.isFinite(playbackRate) || playbackRate <= 0) return;

  try {
    await MediaSession.setPositionState({
      duration,
      position,
      playbackRate,
    });
  } catch {
    // Abaikan nilai di luar rentang / plugin belum siap.
  }
}

export async function clearNativeMediaSession(): Promise<void> {
  try {
    await MediaSession.setPlaybackState({ playbackState: 'none' });
    await MediaSession.setMetadata({
      title: '',
      artist: '',
      album: '',
      artwork: [],
    });
  } catch {
    // ignore
  }
  nativeHandlers = null;
  nativeTrackNav = {};
}

/** Untuk pengujian. */
export function resetNativeMediaSessionBindings(): void {
  nativeHandlers = null;
  nativeTrackNav = {};
  actionHandlersBound = false;
}

export type { MediaSessionAction };
