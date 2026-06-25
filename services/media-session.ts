/**
 * Media Session API — metadata lock screen & kontrol OS.
 * Spesifikasi: docs/27-media-session-api-spec.md
 */

import { getReciterById, getSurahSummary } from '@/services/quran';
import { useUserStore } from '@/stores/userStore';
import type { AppLocale, AudioTrack } from '@/types';

export interface MediaSessionMetadataInput {
  surahId: number;
  surahName: string;
  ayahNumber: number;
  reciterName: string;
  artworkUrl?: string;
}

export interface MediaSessionHandlers {
  onPlay: () => void | Promise<void>;
  onPause: () => void;
}

export interface MediaSessionTrackNavigationHandlers {
  onPreviousTrack?: () => void;
  onNextTrack?: () => void;
}

const DEFAULT_ALBUM = 'HanQuran';
const DEFAULT_ARTWORK_PATH = '/icons/icon-512.png';

type MediaSessionPlaybackState = 'playing' | 'paused' | 'none';

let boundHandlers: MediaSessionHandlers | null = null;
let trackNavigationHandlers: MediaSessionTrackNavigationHandlers = {};
let playPauseHandlersBound = false;

function getMediaSession(): MediaSession | null {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return null;
  }
  return navigator.mediaSession;
}

export function isMediaSessionSupported(): boolean {
  return getMediaSession() !== null;
}

function resolveArtworkUrl(explicit?: string): string {
  if (explicit) return explicit;
  if (typeof window !== 'undefined') {
    return new URL(DEFAULT_ARTWORK_PATH, window.location.origin).href;
  }
  return DEFAULT_ARTWORK_PATH;
}

function formatTitle(
  surahName: string,
  ayahNumber: number,
  locale: AppLocale,
): string {
  const label = locale === 'en' ? 'Verse' : 'Ayat';
  return `${surahName} — ${label} ${ayahNumber}`;
}

function applyPlayPauseHandlers(): void {
  const session = getMediaSession();
  if (!session || !boundHandlers) return;

  session.setActionHandler('play', () => {
    void boundHandlers?.onPlay();
  });
  session.setActionHandler('pause', () => {
    boundHandlers?.onPause();
  });
  playPauseHandlersBound = true;
}

function applyTrackNavigationHandlers(): void {
  const session = getMediaSession();
  if (!session) return;

  if (trackNavigationHandlers.onPreviousTrack) {
    session.setActionHandler('previoustrack', () => {
      trackNavigationHandlers.onPreviousTrack?.();
    });
  } else {
    session.setActionHandler('previoustrack', null);
  }

  if (trackNavigationHandlers.onNextTrack) {
    session.setActionHandler('nexttrack', () => {
      trackNavigationHandlers.onNextTrack?.();
    });
  } else {
    session.setActionHandler('nexttrack', null);
  }
}

export function bindMediaSession(handlers: MediaSessionHandlers): void {
  if (!isMediaSessionSupported()) return;

  boundHandlers = handlers;

  if (!playPauseHandlersBound) {
    applyPlayPauseHandlers();
  }

  applyTrackNavigationHandlers();
}

export function setMediaSessionTrackNavigation(
  handlers: MediaSessionTrackNavigationHandlers,
): () => void {
  trackNavigationHandlers = handlers;

  if (boundHandlers) {
    applyTrackNavigationHandlers();
  }

  return () => {
    trackNavigationHandlers = {};
    if (boundHandlers) {
      applyTrackNavigationHandlers();
    }
  };
}

export function updateMediaSessionMetadata(input: MediaSessionMetadataInput): void {
  const session = getMediaSession();
  if (!session || typeof MediaMetadata === 'undefined') return;

  const locale = useUserStore.getState().settings.appLocale ?? 'id';

  session.metadata = new MediaMetadata({
    title: formatTitle(input.surahName, input.ayahNumber, locale),
    artist: input.reciterName,
    album: DEFAULT_ALBUM,
    artwork: [
      {
        src: resolveArtworkUrl(input.artworkUrl),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  });
}

export function setMediaSessionPlaybackState(
  state: MediaSessionPlaybackState,
): void {
  const session = getMediaSession();
  if (!session) return;
  session.playbackState = state;
}

export function clearMediaSession(): void {
  const session = getMediaSession();
  if (!session) return;

  session.metadata = null;
  session.playbackState = 'none';
  session.setActionHandler('play', null);
  session.setActionHandler('pause', null);
  session.setActionHandler('previoustrack', null);
  session.setActionHandler('nexttrack', null);
  playPauseHandlersBound = false;
  boundHandlers = null;
  trackNavigationHandlers = {};
}

/** Hanya untuk pengujian — reset state binding internal. */
export function resetMediaSessionBindings(): void {
  playPauseHandlersBound = false;
  boundHandlers = null;
  trackNavigationHandlers = {};
}

async function resolveSurahName(track: AudioTrack): Promise<string> {
  if (track.surahName) return track.surahName;

  try {
    const locale = useUserStore.getState().settings.appLocale ?? 'id';
    const summary = await getSurahSummary(String(track.surahId), locale);
    return summary.englishName;
  } catch {
    return `Surah ${track.surahId}`;
  }
}

function resolveReciterName(track: AudioTrack): string {
  return (
    track.reciterName ??
    getReciterById(track.reciterId)?.name ??
    track.reciterId
  );
}

export async function syncMediaSessionFromTrack(
  track: AudioTrack,
  playbackState: MediaSessionPlaybackState,
): Promise<void> {
  if (!isMediaSessionSupported()) return;

  if (playbackState === 'none') {
    clearMediaSession();
    return;
  }

  const surahName = await resolveSurahName(track);

  updateMediaSessionMetadata({
    surahId: track.surahId,
    surahName,
    ayahNumber: track.ayahNumber,
    reciterName: resolveReciterName(track),
  });
  setMediaSessionPlaybackState(playbackState);
}
