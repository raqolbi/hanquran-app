import { describe, expect, it } from 'vitest';

import { INFINITE } from '@/lib/repeat-options';
import {
  RepeatEngine,
  computeNextOnAyahEnd,
  createInitialRuntime,
  getDisplayCycle,
  getRemainingAyahRepeats,
  getRemainingFullCycles,
  isRepeatCountReached,
  resolveRepeatScope,
  toRepeatConfig,
} from '@/services/repeat-engine';
import type { RepeatConfig } from '@/types';

const rangeConfig: RepeatConfig = {
  target: 'ayah_range',
  count: 2,
  range: { from: 1, to: 3 },
};

const surahConfig: RepeatConfig = {
  target: 'entire_surah',
  count: 1,
  range: null,
};

describe('repeat-engine', () => {
  describe('resolveRepeatScope', () => {
    it('menormalisasi range ayat', () => {
      expect(
        resolveRepeatScope(
          { target: 'ayah_range', count: 5, range: { from: 0, to: 99 } },
          7,
        ),
      ).toEqual({ from: 1, to: 7 });
    });

    it('current_ayah memakai ayat aktif', () => {
      expect(
        resolveRepeatScope(
          { target: 'current_ayah', count: 5, range: null },
          7,
          4,
        ),
      ).toEqual({ from: 4, to: 4 });
    });
  });

  describe('current_ayah', () => {
    const config: RepeatConfig = {
      target: 'current_ayah',
      count: 3,
      range: null,
    };

    it('mengulang ayat yang sama hingga count tercapai', () => {
      let runtime = createInitialRuntime();

      const first = computeNextOnAyahEnd({
        config,
        runtime,
        currentAyah: 2,
        totalAyahs: 7,
      });
      expect(first.action).toEqual({ type: 'replay', ayahNumber: 2 });
      expect(first.runtime.cycleIndex).toBe(1);
      runtime = first.runtime;

      const second = computeNextOnAyahEnd({
        config,
        runtime,
        currentAyah: 2,
        totalAyahs: 7,
      });
      expect(second.action).toEqual({ type: 'replay', ayahNumber: 2 });
      runtime = second.runtime;

      const third = computeNextOnAyahEnd({
        config,
        runtime,
        currentAyah: 2,
        totalAyahs: 7,
      });
      expect(third.action).toEqual({ type: 'stop' });
      expect(third.runtime.isActive).toBe(false);
      expect(third.runtime.cycleIndex).toBe(3);
    });

    it('infinite tidak pernah stop dari count', () => {
      const infiniteConfig: RepeatConfig = {
        target: 'current_ayah',
        count: INFINITE,
        range: null,
      };
      let runtime = createInitialRuntime();

      for (let i = 0; i < 20; i++) {
        const result = computeNextOnAyahEnd({
          config: infiniteConfig,
          runtime,
          currentAyah: 1,
          totalAyahs: 7,
        });
        expect(result.action).toEqual({ type: 'replay', ayahNumber: 1 });
        expect(result.runtime.isActive).toBe(true);
        runtime = result.runtime;
      }
    });
  });

  describe('ayah_range', () => {
    it('menelusuri range lalu mengulang siklus', () => {
      let runtime = createInitialRuntime();

      const steps: Array<{ type: string; ayah?: number }> = [];
      let ayah = 1;

      for (let i = 0; i < 8; i++) {
        const result = computeNextOnAyahEnd({
          config: rangeConfig,
          runtime,
          currentAyah: ayah,
          totalAyahs: 7,
        });
        steps.push(result.action);
        runtime = result.runtime;
        if (result.action.type === 'stop') break;
        ayah = result.action.ayahNumber;
      }

      expect(steps).toEqual([
        { type: 'advance', ayahNumber: 2 },
        { type: 'advance', ayahNumber: 3 },
        { type: 'advance', ayahNumber: 1 },
        { type: 'advance', ayahNumber: 2 },
        { type: 'advance', ayahNumber: 3 },
        { type: 'stop' },
      ]);
      expect(runtime.cycleIndex).toBe(2);
    });
  });

  describe('entire_surah', () => {
    it('satu siklus penuh lalu berhenti bila count = 1', () => {
      let runtime = createInitialRuntime();
      let ayah = 1;

      const actions: string[] = [];
      for (let i = 0; i < 10; i++) {
        const result = computeNextOnAyahEnd({
          config: surahConfig,
          runtime,
          currentAyah: ayah,
          totalAyahs: 3,
        });
        actions.push(result.action.type);
        runtime = result.runtime;
        if (result.action.type === 'stop') break;
        ayah = result.action.ayahNumber;
      }

      expect(actions).toEqual(['advance', 'advance', 'stop']);
      expect(runtime.isActive).toBe(false);
    });
  });

  describe('helpers', () => {
    it('isRepeatCountReached menghormati infinite', () => {
      expect(isRepeatCountReached(INFINITE, 999)).toBe(false);
      expect(isRepeatCountReached(5, 5)).toBe(true);
      expect(isRepeatCountReached(5, 4)).toBe(false);
    });

    it('getDisplayCycle 1-indexed', () => {
      expect(getDisplayCycle({ cycleIndex: 0, isActive: true, lastBoundary: null })).toBe(1);
      expect(getDisplayCycle({ cycleIndex: 2, isActive: true, lastBoundary: null })).toBe(3);
    });

    it('getRemainingAyahRepeats untuk current_ayah', () => {
      const config: RepeatConfig = {
        target: 'current_ayah',
        count: 5,
        range: null,
      };
      const runtime = { cycleIndex: 2, isActive: true, lastBoundary: null };
      expect(getRemainingAyahRepeats(config, runtime)).toBe(3);
    });

    it('getRemainingFullCycles untuk range', () => {
      const runtime = { cycleIndex: 1, isActive: true, lastBoundary: null };
      expect(getRemainingFullCycles(rangeConfig, runtime)).toBe(1);
    });

    it('toRepeatConfig dari dialog settings', () => {
      expect(
        toRepeatConfig({
          repeatCount: 10,
          targetType: 'ayah_range',
          fromAyah: 2,
          toAyah: 5,
        }),
      ).toEqual({
        target: 'ayah_range',
        count: 10,
        range: { from: 2, to: 5 },
      });
    });
  });

  describe('RepeatEngine class', () => {
    it('menyimpan runtime antar pemanggilan', () => {
      const engine = new RepeatEngine({
        config: { target: 'current_ayah', count: 2, range: null },
        totalAyahs: 7,
      });

      const first = engine.onAyahCompleted(5);
      expect(first.action).toEqual({ type: 'replay', ayahNumber: 5 });
      expect(engine.getRuntime().cycleIndex).toBe(1);

      const second = engine.onAyahCompleted(5);
      expect(second.action).toEqual({ type: 'stop' });
      expect(engine.getRuntime().isActive).toBe(false);
    });

    it('applyConfig mereset runtime', () => {
      const engine = new RepeatEngine({
        config: { target: 'current_ayah', count: 5, range: null },
        totalAyahs: 7,
      });
      engine.onAyahCompleted(1);
      engine.applyConfig({ target: 'current_ayah', count: 1, range: null });
      expect(engine.getRuntime()).toEqual(createInitialRuntime(true));
    });
  });

  describe('runtime tidak aktif', () => {
    it('mengembalikan stop', () => {
      const result = computeNextOnAyahEnd({
        config: rangeConfig,
        runtime: { cycleIndex: 0, isActive: false, lastBoundary: null },
        currentAyah: 1,
        totalAyahs: 7,
      });
      expect(result.action).toEqual({ type: 'stop' });
    });
  });
});
