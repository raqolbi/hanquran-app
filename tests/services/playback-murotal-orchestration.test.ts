import { describe, expect, it } from 'vitest';

import { computeNextOnAyahEnd, createInitialRuntime } from '@/services/repeat-engine';
import { resolveMurotalAfterAyahEnd } from '@/services/murotal-resolver';
import type { RepeatConfig } from '@/types';

/**
 * Simulasi alur hook: RepeatEngine dulu, lalu MurotalResolver jika `stop`.
 */
function simulateAyahEndWithMurotal(params: {
  config: RepeatConfig;
  runtime: ReturnType<typeof createInitialRuntime>;
  currentAyah: number;
  totalAyahs: number;
  surahId: number;
  murotalEnabled: boolean;
}) {
  const repeat = computeNextOnAyahEnd({
    config: params.config,
    runtime: params.runtime,
    currentAyah: params.currentAyah,
    totalAyahs: params.totalAyahs,
  });

  if (
    repeat.action.type === 'replay' ||
    repeat.action.type === 'advance'
  ) {
    return { phase: 'repeat' as const, repeat };
  }

  if (!params.murotalEnabled) {
    return { phase: 'pause' as const, repeat };
  }

  return {
    phase: 'murotal' as const,
    repeat,
    murotal: resolveMurotalAfterAyahEnd({
      surahId: params.surahId,
      currentAyah: params.currentAyah,
      totalAyahs: params.totalAyahs,
    }),
  };
}

describe('orkestrasi repeat + murotal', () => {
  const currentAyahConfig: RepeatConfig = {
    target: 'current_ayah',
    count: 3,
    range: null,
  };

  it('repeat 3× selesai lalu murotal lanjut ke ayat berikutnya', () => {
    let runtime = createInitialRuntime(true);

    for (let i = 0; i < 2; i += 1) {
      const step = simulateAyahEndWithMurotal({
        config: currentAyahConfig,
        runtime,
        currentAyah: 3,
        totalAyahs: 7,
        surahId: 2,
        murotalEnabled: true,
      });
      expect(step.phase).toBe('repeat');
      expect(step.repeat?.action).toEqual({ type: 'replay', ayahNumber: 3 });
      runtime = step.repeat!.runtime;
    }

    const finalStep = simulateAyahEndWithMurotal({
      config: currentAyahConfig,
      runtime,
      currentAyah: 3,
      totalAyahs: 7,
      surahId: 2,
      murotalEnabled: true,
    });

    expect(finalStep.phase).toBe('murotal');
    expect(finalStep.murotal).toEqual({ type: 'advance_ayah', ayahNumber: 4 });
  });

  it('tanpa murotal, repeat selesai lalu pause', () => {
    let runtime = createInitialRuntime(true);

    for (let i = 0; i < 3; i += 1) {
      const step = simulateAyahEndWithMurotal({
        config: currentAyahConfig,
        runtime,
        currentAyah: 3,
        totalAyahs: 7,
        surahId: 2,
        murotalEnabled: false,
      });
      if (i < 2) {
        expect(step.phase).toBe('repeat');
        runtime = step.repeat!.runtime;
      } else {
        expect(step.phase).toBe('pause');
      }
    }
  });

  it('ayat terakhir surat dengan murotal lanjut ke surat berikutnya', () => {
    const step = simulateAyahEndWithMurotal({
      config: { target: 'current_ayah', count: 1, range: null },
      runtime: createInitialRuntime(true),
      currentAyah: 7,
      totalAyahs: 7,
      surahId: 1,
      murotalEnabled: true,
    });

    expect(step.phase).toBe('murotal');
    expect(step.murotal).toEqual({
      type: 'advance_surah',
      surahId: 2,
      ayahNumber: 1,
    });
  });
});
