import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAutoFollowPlayback } from '@/hooks/use-auto-follow-playback';
import { AUTO_FOLLOW_SCROLL_RESUME_MS } from '@/lib/auto-follow-playback';

function mountTopChrome(bottom = 248) {
  const chrome = document.createElement('div');
  chrome.setAttribute('data-surah-detail-top-chrome', '');
  chrome.getBoundingClientRect = () =>
    ({
      top: 0,
      bottom,
      left: 0,
      right: 0,
      width: 0,
      height: bottom,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
  document.body.appendChild(chrome);
}

function createOffscreenAyah(id: string, top = 900, bottom = 1000) {
  const element = document.createElement('div');
  element.id = id;
  element.getBoundingClientRect = () =>
    ({
      top,
      bottom,
      left: 0,
      right: 0,
      width: 0,
      height: bottom - top,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
  document.body.appendChild(element);
  return element;
}

describe('useAutoFollowPlayback', () => {
  const scrollTo = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    scrollTo.mockReset();
    vi.stubGlobal('scrollTo', scrollTo);
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    });
    mountTopChrome();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('memanggil window.scrollTo saat ayat aktif di luar viewport dan sedang diputar', () => {
    createOffscreenAyah('ayah-2');

    renderHook(() =>
      useAutoFollowPlayback({
        activeAyah: 2,
        isPlaying: true,
        enabled: true,
        smoothAnimation: true,
        bottomInset: 200,
      }),
    );

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    );
  });

  it('scroll presisi ke atas saat wrap dari ayat terakhir ke ayat pertama', () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 4200,
    });
    createOffscreenAyah('ayah-1', -1800, -1600);

    renderHook(() =>
      useAutoFollowPlayback({
        activeAyah: 1,
        isPlaying: true,
        enabled: true,
        smoothAnimation: true,
        bottomInset: 200,
      }),
    );

    expect(scrollTo).toHaveBeenCalledWith({
      top: 2076,
      behavior: 'smooth',
    });
  });

  it('tidak scroll saat fitur dimatikan', () => {
    createOffscreenAyah('ayah-1');

    renderHook(() =>
      useAutoFollowPlayback({
        activeAyah: 1,
        isPlaying: true,
        enabled: false,
        smoothAnimation: true,
        bottomInset: 200,
      }),
    );

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('menangguhkan auto follow setelah scroll manual pengguna', () => {
    createOffscreenAyah('ayah-3');
    createOffscreenAyah('ayah-4');
    createOffscreenAyah('ayah-5');

    const { rerender } = renderHook(
      ({ activeAyah }) =>
        useAutoFollowPlayback({
          activeAyah,
          isPlaying: true,
          enabled: true,
          smoothAnimation: false,
          bottomInset: 200,
        }),
      { initialProps: { activeAyah: 3 } },
    );

    act(() => {
      vi.runOnlyPendingTimers();
    });

    const callsAfterFirst = scrollTo.mock.calls.length;

    act(() => {
      window.dispatchEvent(new Event('wheel'));
    });

    rerender({ activeAyah: 4 });
    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(scrollTo.mock.calls.length).toBe(callsAfterFirst);

    act(() => {
      vi.advanceTimersByTime(AUTO_FOLLOW_SCROLL_RESUME_MS);
    });

    rerender({ activeAyah: 5 });
    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(scrollTo.mock.calls.length).toBeGreaterThan(callsAfterFirst);
  });
});
