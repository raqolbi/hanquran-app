import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAudio } from '@/hooks/use-audio';
import { getAudioController, resetAudioController } from '@/services/audio-controller';
import { useAudioStore } from '@/stores/audioStore';
import { fixtureAyahAudioUrl } from '@/tests/fixtures/audio';

const prefetchSpy = vi.fn();

vi.mock('@/hooks/use-preferred-reciter', () => ({
  usePreferredReciterId: () => 'Alafasy_128kbps',
}));

vi.mock('@/services/quran', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/quran')>();
  return {
    ...actual,
    getDefaultReciterId: () => 'Alafasy_128kbps',
    buildAyahAudioUrl: (reciterId: string, surah: number, ayah: number) =>
      fixtureAyahAudioUrl(surah, ayah, reciterId),
  };
});

describe('useAudio', () => {
  beforeEach(() => {
    resetAudioController();
    useAudioStore.getState().reset();
    prefetchSpy.mockReset();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const controller = getAudioController();
    if (controller) {
      vi.spyOn(controller, 'prefetch').mockImplementation(prefetchSpy);
    }
  });

  it('mengekspos state store dan memutar via playAyah', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playAyah({ surahId: 1, ayahNumber: 2 });
    });

    await waitFor(() => {
      expect(result.current.isPlaying).toBe(true);
    });

    expect(result.current.currentTrack?.surahId).toBe(1);
    expect(result.current.currentTrack?.ayahNumber).toBe(2);
    expect(result.current.isCurrentAyah(1, 2)).toBe(true);
    expect(result.current.isCurrentAyah(1, 3)).toBe(false);
  });

  it('pause menghentikan pemutaran', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playAyah({ surahId: 1, ayahNumber: 1 });
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('toggleAyah mempause trek yang sama', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.toggleAyah({ surahId: 2, ayahNumber: 5 });
    });

    await act(async () => {
      await result.current.toggleAyah({ surahId: 2, ayahNumber: 5 });
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('seek memperbarui currentTime', async () => {
    const { result } = renderHook(() => useAudio());
    const controller = getAudioController();
    Object.defineProperty(controller!.element, 'duration', {
      value: 60,
      configurable: true,
    });

    await act(async () => {
      await result.current.playAyah({ surahId: 1, ayahNumber: 1 });
    });

    act(() => {
      result.current.seek(15);
    });

    expect(result.current.currentTime).toBe(15);
  });

  it('resume melanjutkan setelah pause', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playAyah({ surahId: 1, ayahNumber: 3 });
    });

    act(() => {
      result.current.pause();
    });
    expect(result.current.isPlaying).toBe(false);

    await act(async () => {
      await result.current.resume();
    });

    await waitFor(() => {
      expect(result.current.isPlaying).toBe(true);
    });
  });

  it('playAyah memprefetch ayat berikutnya bila totalAyahs diketahui', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playAyah({
        surahId: 1,
        ayahNumber: 1,
        totalAyahs: 7,
      });
    });

    expect(prefetchSpy).toHaveBeenCalledWith([fixtureAyahAudioUrl(1, 2)]);
  });

  it('prefetchNextAyah memuat URL ayat berikutnya', () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.prefetchNextAyah({
        surahId: 1,
        ayahNumber: 3,
        totalAyahs: 7,
      });
    });

    expect(prefetchSpy).toHaveBeenCalledWith([fixtureAyahAudioUrl(1, 4)]);
  });
});
