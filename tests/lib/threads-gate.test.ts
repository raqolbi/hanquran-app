import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  THREADS_GATE_CONTINUE_DELAY_MS,
  clearThreadsGateCompletion,
  completeThreadsGate,
  isThreadsGateCompleted,
  isThreadsGateContinueReady,
} from '@/lib/threads-gate';

describe('lib/threads-gate', () => {
  afterEach(() => {
    clearThreadsGateCompletion();
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
