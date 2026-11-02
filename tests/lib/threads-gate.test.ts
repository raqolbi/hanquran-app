// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

import {
  THREADS_GATE_COMPLETED_ATTRIBUTE,
  THREADS_GATE_CONTINUE_DELAY_MS,
  THREADS_GATE_STORAGE_KEY,
  buildThreadsGateInitScript,
  clearThreadsGateCompletion,
  completeThreadsGate,
  isThreadsGateCompleted,
  isThreadsGateContinueReady,
} from '@/lib/threads-gate';

describe('lib/threads-gate', () => {
  afterEach(() => {
    clearThreadsGateCompletion();
    document.documentElement.removeAttribute(THREADS_GATE_COMPLETED_ATTRIBUTE);
  });

  it('menganggap belum completed jika flag kosong', () => {
    expect(isThreadsGateCompleted()).toBe(false);
  });

  it('menyimpan dan membaca flag completed tanpa TTL', () => {
    const now = 1_700_000_000_000;

    completeThreadsGate(now);
    expect(isThreadsGateCompleted()).toBe(true);
  });

  it('menganggap belum completed jika JSON rusak', () => {
    window.localStorage.setItem('hanquran:threads-gate-completed', '{');
    expect(isThreadsGateCompleted()).toBe(false);

    window.localStorage.setItem(
      'hanquran:threads-gate-completed',
      JSON.stringify({ completedAt: 'kemarin' }),
    );
    expect(isThreadsGateCompleted()).toBe(false);
  });

  it('menyalakan Lanjut setelah delay wall-clock 5 detik', () => {
    const clickedAt = 1_000;

    expect(isThreadsGateContinueReady(clickedAt, clickedAt + 4_900)).toBe(
      false,
    );
    expect(
      isThreadsGateContinueReady(
        clickedAt,
        clickedAt + THREADS_GATE_CONTINUE_DELAY_MS,
      ),
    ).toBe(true);
  });
});

describe('buildThreadsGateInitScript', () => {
  const runScript = () => {
    new Function(buildThreadsGateInitScript())();
  };

  afterEach(() => {
    clearThreadsGateCompletion();
    document.documentElement.removeAttribute(THREADS_GATE_COMPLETED_ATTRIBUTE);
  });

  it('menandai <html> sebelum paint bila gate sudah selesai', () => {
    completeThreadsGate(1_700_000_000_000);

    runScript();

    expect(
      document.documentElement.getAttribute(THREADS_GATE_COMPLETED_ATTRIBUTE),
    ).toBe('true');
  });

  it('tidak menandai apa pun bila flag kosong atau rusak', () => {
    runScript();
    expect(
      document.documentElement.hasAttribute(THREADS_GATE_COMPLETED_ATTRIBUTE),
    ).toBe(false);

    window.localStorage.setItem(THREADS_GATE_STORAGE_KEY, '{');
    runScript();
    expect(
      document.documentElement.hasAttribute(THREADS_GATE_COMPLETED_ATTRIBUTE),
    ).toBe(false);

    window.localStorage.setItem(
      THREADS_GATE_STORAGE_KEY,
      JSON.stringify({ completedAt: 'kemarin' }),
    );
    runScript();
    expect(
      document.documentElement.hasAttribute(THREADS_GATE_COMPLETED_ATTRIBUTE),
    ).toBe(false);
  });

  it('hanya membaca localStorage, tidak menulis', () => {
    completeThreadsGate();
    const before = window.localStorage.getItem(THREADS_GATE_STORAGE_KEY);

    runScript();

    expect(window.localStorage.getItem(THREADS_GATE_STORAGE_KEY)).toBe(before);
  });
});

describe('completeThreadsGate — storage diblokir', () => {
  it('tidak melempar error dan mengembalikan false', async () => {
    const { completeThreadsGate: complete } = await import('@/lib/threads-gate');
    const { vi } = await import('vitest');
    const spy = vi
      .spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
      .mockImplementation(() => {
        throw new DOMException('blocked', 'SecurityError');
      });
    try {
      expect(() => complete()).not.toThrow();
      expect(complete()).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });
});
