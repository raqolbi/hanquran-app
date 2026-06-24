/**
 * useAudioStore — runtime state pemutaran audio.
 *
 * Seluruh state di sini bersifat runtime (TIDAK dipersist) sesuai
 * `docs/15-state-management.md` (Bagian 2.1 & 6.2). Jembatan ke
 * `HTMLAudioElement` ditangani `services/audio-controller.ts` (Phase 2).
 */

import { create } from 'zustand';
import type { AudioState, AudioTrack, PlaybackRate, AudioErrorCode } from '@/types';

interface AudioActions {
  play: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: PlaybackRate) => void;
  setError: (error: AudioErrorCode | null) => void;
  reset: () => void;
}

const initialState: AudioState = {
  isPlaying: false,
  currentTrack: null,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  error: null,
};

export const useAudioStore = create<AudioState & AudioActions>()((set) => ({
  ...initialState,

  play: (track) => set({ currentTrack: track, isPlaying: true, error: null }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
