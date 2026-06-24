/**
 * useRepeatStore — konfigurasi (persisten) + runtime repeat.
 *
 * `config` dipersist di Dexie `settings.repeatConfig`; `runtime` bersifat
 * volatile. Mengacu `docs/15-state-management.md` (Bagian 11).
 */

import { create } from 'zustand';
import { db, defaultSettings } from '@/services/db/db';
import { createInitialRuntime } from '@/services/repeat-engine';
import { getRepeatTabSync } from '@/services/repeat-tab-sync';
import type { RepeatConfig, RepeatRuntime } from '@/types';

const defaultConfig: RepeatConfig = {
  target: 'current_ayah',
  count: 5,
  range: null,
};

const initialRuntime: RepeatRuntime = createInitialRuntime(false);

interface RepeatState {
  config: RepeatConfig;
  runtime: RepeatRuntime;
  initialized: boolean;
}

interface RepeatActions {
  /** Baca config repeat dari Dexie `settings` saat app start. */
  init: () => Promise<void>;
  /** Terapkan config baru: tulis ke Dexie lalu reset runtime. */
  applyConfig: (next: RepeatConfig) => Promise<void>;
  /** Perbarui sebagian config (mis. count dari selector) dan persist. */
  patchConfig: (patch: Partial<RepeatConfig>) => Promise<void>;
  resetRuntime: () => void;
  setRuntime: (runtime: RepeatRuntime) => void;
  setActive: (isActive: boolean) => void;
  /** Mulai sesi repeat baru saat user menekan play. */
  beginSession: () => void;
}

async function persistRepeatConfig(next: RepeatConfig): Promise<void> {
  const current = (await db.settings.get('default')) ?? defaultSettings;
  await db.settings.put({
    ...current,
    id: 'default',
    repeatConfig: next,
    updatedAt: Date.now(),
  });
}

export const useRepeatStore = create<RepeatState & RepeatActions>()(
  (set, get) => ({
    config: defaultConfig,
    runtime: initialRuntime,
    initialized: false,

    init: async () => {
      const settings = await db.settings.get('default');
      set({
        config: settings?.repeatConfig ?? defaultConfig,
        initialized: true,
      });
    },

    applyConfig: async (next) => {
      await persistRepeatConfig(next);
      const runtime = createInitialRuntime(true);
      set({
        config: next,
        runtime,
      });
      getRepeatTabSync()?.notifyConfigChanged(next, runtime);
    },

    patchConfig: async (patch) => {
      const next = { ...get().config, ...patch };
      await persistRepeatConfig(next);
      const keepActive = get().runtime.isActive;
      const runtime = createInitialRuntime(keepActive);
      set({
        config: next,
        runtime,
      });
      getRepeatTabSync()?.notifyConfigChanged(next, runtime);
    },

    resetRuntime: () => set({ runtime: createInitialRuntime(false) }),

    setRuntime: (runtime) => set({ runtime }),

    setActive: (isActive) =>
      set((s) => ({ runtime: { ...s.runtime, isActive } })),

    beginSession: () =>
      set({ runtime: createInitialRuntime(true) }),
  }),
);
