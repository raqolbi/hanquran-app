/**
 * RepeatEngine — logika pengulangan audio (pure functions).
 *
 * Spesifikasi: `docs/15-state-management.md` (Bagian 11), `docs/12-component-spec.md` (#14).
 *
 * Aturan:
 * - `current_ayah`: setiap selesai play = satu hitungan; berhenti setelah `count` kali.
 * - `ayah_range` / `entire_surah`: satu siklus = seluruh ayat dalam scope; `count` = jumlah siklus penuh.
 */

import { INFINITE } from '@/lib/repeat-options';
import type { RepeatConfig, RepeatRuntime } from '@/types';

export type RepeatEngineAction =
  | { type: 'replay'; ayahNumber: number }
  | { type: 'advance'; ayahNumber: number }
  | { type: 'stop' };

export interface RepeatEngineContext {
  config: RepeatConfig;
  runtime: RepeatRuntime;
  currentAyah: number;
  totalAyahs: number;
}

export interface RepeatEngineResult {
  action: RepeatEngineAction;
  runtime: RepeatRuntime;
}

export function createInitialRuntime(isActive = true): RepeatRuntime {
  return {
    cycleIndex: 0,
    isActive,
    lastBoundary: null,
  };
}

/** Normalisasi batas ayat untuk target range / seluruh surat. */
export function resolveRepeatScope(
  config: RepeatConfig,
  totalAyahs: number,
  currentAyah = 1,
): { from: number; to: number } {
  if (totalAyahs < 1) {
    return { from: 1, to: 1 };
  }

  switch (config.target) {
    case 'entire_surah':
      return { from: 1, to: totalAyahs };
    case 'ayah_range': {
      const rawFrom = config.range?.from ?? 1;
      const rawTo = config.range?.to ?? totalAyahs;
      const from = Math.max(1, Math.min(rawFrom, totalAyahs));
      const to = Math.max(from, Math.min(rawTo, totalAyahs));
      return { from, to };
    }
    case 'current_ayah':
    default: {
      const ayah = Math.max(1, Math.min(currentAyah, totalAyahs));
      return { from: ayah, to: ayah };
    }
  }
}

export function isRepeatCountReached(count: number, completedUnits: number): boolean {
  if (count === INFINITE || !Number.isFinite(count)) {
    return false;
  }
  return completedUnits >= count;
}

/**
 * Hitung aksi berikutnya setelah satu ayat selesai diputar.
 */
export function computeNextOnAyahEnd(
  context: RepeatEngineContext,
): RepeatEngineResult {
  const { config, runtime, currentAyah, totalAyahs } = context;

  if (!runtime.isActive) {
    return {
      action: { type: 'stop' },
      runtime,
    };
  }

  if (config.target === 'current_ayah') {
    return handleCurrentAyahEnd(config, runtime, currentAyah, totalAyahs);
  }

  return handleScopedAyahEnd(config, runtime, currentAyah, totalAyahs);
}

function handleCurrentAyahEnd(
  config: RepeatConfig,
  runtime: RepeatRuntime,
  currentAyah: number,
  totalAyahs: number,
): RepeatEngineResult {
  const scope = resolveRepeatScope(config, totalAyahs, currentAyah);
  const ayah = scope.from;
  const nextCycleIndex = runtime.cycleIndex + 1;

  if (isRepeatCountReached(config.count, nextCycleIndex)) {
    return {
      action: { type: 'stop' },
      runtime: {
        cycleIndex: nextCycleIndex,
        isActive: false,
        lastBoundary: ayah,
      },
    };
  }

  return {
    action: { type: 'replay', ayahNumber: ayah },
    runtime: {
      cycleIndex: nextCycleIndex,
      isActive: true,
      lastBoundary: ayah,
    },
  };
}

function handleScopedAyahEnd(
  config: RepeatConfig,
  runtime: RepeatRuntime,
  currentAyah: number,
  totalAyahs: number,
): RepeatEngineResult {
  const scope = resolveRepeatScope(config, totalAyahs, currentAyah);
  const clampedAyah = Math.max(scope.from, Math.min(currentAyah, scope.to));

  if (clampedAyah < scope.to) {
    return {
      action: { type: 'advance', ayahNumber: clampedAyah + 1 },
      runtime: {
        ...runtime,
        lastBoundary: clampedAyah,
      },
    };
  }

  const nextCycleIndex = runtime.cycleIndex + 1;

  if (isRepeatCountReached(config.count, nextCycleIndex)) {
    return {
      action: { type: 'stop' },
      runtime: {
        cycleIndex: nextCycleIndex,
        isActive: false,
        lastBoundary: clampedAyah,
      },
    };
  }

  return {
    action: { type: 'advance', ayahNumber: scope.from },
    runtime: {
      cycleIndex: nextCycleIndex,
      isActive: true,
      lastBoundary: clampedAyah,
    },
  };
}

/** Siklus tampilan UI (1-indexed). */
export function getDisplayCycle(runtime: RepeatRuntime): number {
  return runtime.cycleIndex + 1;
}

/** Sisa pengulangan untuk target `current_ayah`. */
export function getRemainingAyahRepeats(
  config: RepeatConfig,
  runtime: RepeatRuntime,
): number | typeof INFINITE {
  if (config.target !== 'current_ayah') {
    return 0;
  }
  if (config.count === INFINITE || !Number.isFinite(config.count)) {
    return INFINITE;
  }
  return Math.max(0, config.count - runtime.cycleIndex);
}

/** Sisa siklus penuh untuk target range / surat. */
export function getRemainingFullCycles(
  config: RepeatConfig,
  runtime: RepeatRuntime,
): number | typeof INFINITE {
  if (config.target === 'current_ayah') {
    return 0;
  }
  if (config.count === INFINITE || !Number.isFinite(config.count)) {
    return INFINITE;
  }
  return Math.max(0, config.count - runtime.cycleIndex);
}

/** Konversi dari form `RepeatSettingsDialog` ke `RepeatConfig`. */
export function toRepeatConfig(input: {
  repeatCount: number;
  targetType: RepeatConfig['target'];
  fromAyah?: number;
  toAyah?: number;
}): RepeatConfig {
  return {
    target: input.targetType,
    count: input.repeatCount,
    range:
      input.targetType === 'ayah_range' &&
      input.fromAyah !== undefined &&
      input.toAyah !== undefined
        ? { from: input.fromAyah, to: input.toAyah }
        : null,
  };
}

/**
 * Wrapper stateful — menyimpan config + runtime untuk integrasi berikutnya.
 */
export class RepeatEngine {
  private config: RepeatConfig;

  private runtime: RepeatRuntime;

  private readonly totalAyahs: number;

  constructor(params: {
    config: RepeatConfig;
    totalAyahs: number;
    runtime?: RepeatRuntime;
  }) {
    this.config = params.config;
    this.totalAyahs = params.totalAyahs;
    this.runtime = params.runtime ?? createInitialRuntime(true);
  }

  getConfig(): RepeatConfig {
    return this.config;
  }

  getRuntime(): RepeatRuntime {
    return this.runtime;
  }

  applyConfig(config: RepeatConfig): void {
    this.config = config;
    this.runtime = createInitialRuntime(true);
  }

  onAyahCompleted(currentAyah: number): RepeatEngineResult {
    const result = computeNextOnAyahEnd({
      config: this.config,
      runtime: this.runtime,
      currentAyah,
      totalAyahs: this.totalAyahs,
    });
    this.runtime = result.runtime;
    return result;
  }
}
