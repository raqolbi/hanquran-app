import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useThreadsGate } from '@/hooks/use-threads-gate';
import {
  THREADS_GATE_CONTINUE_DELAY_MS,
  clearThreadsGateCompletion,
  completeThreadsGate,
} from '@/lib/threads-gate';
import { APP_AUTHOR_THREADS_URL } from '@/lib/app-about';

describe('useThreadsGate', () => {
  beforeEach(() => {
    clearThreadsGateCompletion();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-17T00:00:00.000Z'));
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    clearThreadsGateCompletion();
    vi.unstubAllGlobals();
  });

  it('menampilkan overlay saat flag kosong', () => {
    const { result } = renderHook(() => useThreadsGate());

    expect(result.current.status).toBe('pending');
    expect(result.current.showOverlay).toBe(true);
    expect(result.current.isContinueEnabled).toBe(false);
    expect(result.current.threadsUrl).toBe(APP_AUTHOR_THREADS_URL);
  });

  it('menyembunyikan overlay jika flag sudah completed', () => {
    completeThreadsGate();

    const { result } = renderHook(() => useThreadsGate());

    expect(result.current.status).toBe('completed');
    expect(result.current.showOverlay).toBe(false);
  });

  it('masuk waiting saat Threads diketuk dan Lanjut masih disabled sebelum 5 detik', () => {
    const { result } = renderHook(() => useThreadsGate());

    act(() => {
      result.current.openThreads();
    });

    expect(result.current.status).toBe('waiting');
    expect(result.current.isContinueEnabled).toBe(false);

    act(() => {
      vi.advanceTimersByTime(THREADS_GATE_CONTINUE_DELAY_MS - 100);
    });

    expect(result.current.status).toBe('waiting');
    expect(result.current.isContinueEnabled).toBe(false);
  });

  it('menyalakan Lanjut setelah 5 detik wall-clock', () => {
    const { result } = renderHook(() => useThreadsGate());

    act(() => {
      result.current.openThreads();
    });

    act(() => {
      vi.advanceTimersByTime(THREADS_GATE_CONTINUE_DELAY_MS);
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.isContinueEnabled).toBe(true);
  });

  it('tidak me-reset deadline jika Threads diketuk lagi', () => {
    const { result } = renderHook(() => useThreadsGate());

    act(() => {
      result.current.openThreads();
    });

    act(() => {
      vi.advanceTimersByTime(2_000);
      result.current.openThreads();
      vi.advanceTimersByTime(3_000);
    });

    expect(result.current.status).toBe('ready');
  });

  it('menyalakan Lanjut dari visibilitychange meski setTimeout belum jalan', () => {
    const { result } = renderHook(() => useThreadsGate());

    act(() => {
      result.current.openThreads();
    });

    act(() => {
      vi.setSystemTime(new Date('2026-08-17T00:00:05.000Z'));
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.isContinueEnabled).toBe(true);
  });

  it('mengabaikan Lanjut sebelum ready', () => {
    const { result } = renderHook(() => useThreadsGate());

    act(() => {
      result.current.openThreads();
      result.current.continueToApp();
    });

    expect(result.current.status).toBe('waiting');
    expect(result.current.showOverlay).toBe(true);
  });

  it('menyimpan flag dan menutup overlay saat Lanjut setelah ready', () => {
    const { result } = renderHook(() => useThreadsGate());

    act(() => {
      result.current.openThreads();
    });
    act(() => {
      vi.advanceTimersByTime(THREADS_GATE_CONTINUE_DELAY_MS);
    });
    act(() => {
      result.current.continueToApp();
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.showOverlay).toBe(false);
    expect(window.localStorage.getItem('hanquran:threads-gate-completed')).toBeTruthy();
  });

  it('menandai hint jika Threads diketuk saat offline', () => {
    vi.stubGlobal('navigator', { onLine: false });

    const { result } = renderHook(() => useThreadsGate());

    act(() => {
      result.current.openThreads();
    });
    act(() => {
      vi.advanceTimersByTime(THREADS_GATE_CONTINUE_DELAY_MS);
    });

    expect(result.current.showOpenFailedHint).toBe(true);
  });
});
