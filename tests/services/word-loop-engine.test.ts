// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAudioStore } from '@/stores/audioStore';
import { useUserStore } from '@/stores/userStore';
import { isWordLoopActive, useWordLoopStore } from '@/stores/wordLoopStore';
import type { AudioTrack } from '@/types';

/** Controller tiruan: posisi diatur manual oleh test. */
const fake = vi.hoisted(() => {
  const state = {
    position: 0,
    duration: 10,
    endedHandlers: new Set<() => void>(),
    calls: [] as string[],
  };
  return state;
});

vi.mock('@/services/audio-controller', () => {
  const controller = {
    getPosition: () => fake.position,
    getDuration: () => fake.duration,
    seek: (seconds: number) => {
      fake.calls.push(`seek:${seconds}`);
      fake.position = seconds;
    },
    play: async (track: AudioTrack) => {
      fake.calls.push('play');
      useAudioStore.getState().play(track);
    },
    pause: () => {
      fake.calls.push('pause');
      useAudioStore.getState().pause();
    },
    onEnded: (handler: () => void) => {
      fake.endedHandlers.add(handler);
      return () => fake.endedHandlers.delete(handler);
    },
  };
  return { getAudioController: () => controller };
});

vi.mock('@/lib/analytics', () => ({
  trackWordLoopStarted: vi.fn(),
  trackWordLoopStopped: vi.fn(),
}));

import {
  resetWordLoopEngine,
  startWordLoop,
  stopWordLoop,
  toggleWordLoopPause,
} from '@/services/word-loop-engine';

const track: AudioTrack = {
  surahId: 1,
  ayahNumber: 2,
  reciterId: 'Alafasy_128kbps',
  url: 'https://everyayah.com/data/Alafasy_128kbps/001002.mp3',
};
const clip = { range: { from: 1, to: 3 }, startMs: 1000, endMs: 2000 };

/** Jalankan frame rAF yang tertunda. */
async function frames(count = 1) {
  for (let i = 0; i < count; i += 1) {
    await vi.advanceTimersByTimeAsync(20);
  }
}

describe('word-loop-engine', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    fake.position = 0;
    fake.duration = 10;
    fake.calls = [];
    fake.endedHandlers.clear();
    useAudioStore.getState().reset();
    useUserStore.setState((s) => ({ settings: { ...s.settings, wordLoopGapMs: 1000 } }));
  });

  afterEach(() => {
    resetWordLoopEngine();
    vi.useRealTimers();
  });

  it('mulai: putar trek, lompat ke awal potongan', async () => {
    expect(await startWordLoop({ track, clip })).toBe(true);
    expect(fake.calls).toEqual(['play', 'seek:1']);
    expect(useWordLoopStore.getState().loop).toMatchObject({
      ayahNumber: 2,
      range: { from: 1, to: 3 },
      phase: 'playing',
      cycles: 0,
    });
    expect(isWordLoopActive()).toBe(true);
  });

  it('akhir potongan → jeda menirukan → ulang dari awal', async () => {
    await startWordLoop({ track, clip });
    fake.calls = [];
    fake.position = 1.5;
    await frames();
    expect(useWordLoopStore.getState().loop?.phase).toBe('playing');

    fake.position = 2.0;
    await frames();
    expect(fake.calls).toEqual(['pause']);
    expect(useWordLoopStore.getState().loop).toMatchObject({ phase: 'gap', cycles: 1 });
    expect(useAudioStore.getState().isPlaying).toBe(false);

    await vi.advanceTimersByTimeAsync(1000);
    expect(fake.calls).toEqual(['pause', 'seek:1', 'play']);
    expect(useWordLoopStore.getState().loop?.phase).toBe('playing');
    expect(useAudioStore.getState().isPlaying).toBe(true);
  });

  it('jeda 0 → langsung seek tanpa pause', async () => {
    useUserStore.setState((s) => ({ settings: { ...s.settings, wordLoopGapMs: 0 } }));
    await startWordLoop({ track, clip });
    fake.calls = [];
    fake.position = 2.1;
    await frames();
    expect(fake.calls).toEqual(['seek:1']);
    expect(useWordLoopStore.getState().loop).toMatchObject({ phase: 'playing', cycles: 1 });
  });

  it('akhir potongan dijaga sebelum akhir file', async () => {
    fake.duration = 1.9;
    await startWordLoop({ track, clip });
    fake.position = 1.83;
    await frames();
    expect(useWordLoopStore.getState().loop?.phase).toBe('gap');
  });

  it('jeda pengguna → paused; play lagi → lanjut, mode tetap aktif', async () => {
    await startWordLoop({ track, clip });
    fake.position = 1.4;
    toggleWordLoopPause();
    expect(useWordLoopStore.getState().loop?.phase).toBe('paused');
    toggleWordLoopPause();
    await Promise.resolve();
    expect(useWordLoopStore.getState().loop?.phase).toBe('playing');
    expect(fake.position).toBe(1.4); // masih di dalam potongan → tidak seek
  });

  it('play saat jeda menirukan → kembali ke awal potongan', async () => {
    await startWordLoop({ track, clip });
    fake.position = 2.05;
    await frames();
    expect(useWordLoopStore.getState().loop?.phase).toBe('gap');
    toggleWordLoopPause();
    await Promise.resolve();
    expect(fake.position).toBe(1);
    expect(useWordLoopStore.getState().loop?.phase).toBe('playing');
    await vi.advanceTimersByTimeAsync(1000);
    expect(useWordLoopStore.getState().loop?.cycles).toBe(1); // timer jeda dibatalkan
  });

  it('trek lain diputar (⏭, Murotal) → berhenti tanpa menjeda', async () => {
    await startWordLoop({ track, clip });
    useAudioStore.getState().play({ ...track, ayahNumber: 3, url: 'x/001003.mp3' });
    expect(useWordLoopStore.getState().loop).toBeNull();
    expect(useAudioStore.getState().isPlaying).toBe(true);
  });

  it('stop oleh pengguna → audio dijeda', async () => {
    await startWordLoop({ track, clip });
    stopWordLoop('user');
    expect(useWordLoopStore.getState().loop).toBeNull();
    expect(useAudioStore.getState().isPlaying).toBe(false);
  });

  it('cadangan ended → putar ulang segera dan hitung siklus', async () => {
    await startWordLoop({ track, clip });
    fake.calls = [];
    useAudioStore.getState().pause();
    // pause dari pengguna? tidak — simulasikan ended dari controller
    useWordLoopStore.getState().patch({ phase: 'playing' });
    for (const handler of fake.endedHandlers) handler();
    await Promise.resolve();
    await Promise.resolve();
    expect(fake.calls[0]).toBe('play');
    expect(useWordLoopStore.getState().loop?.cycles).toBe(1);
  });
});
