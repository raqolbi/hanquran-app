/**
 * useRepeatStore — konfigurasi (persisten) + runtime repeat.
 *
 * `config` dipersist di Dexie `settings.repeatConfig`; `runtime` bersifat
 * volatile. Mengacu `docs/15-state-management.md` (Bagian 11).
 */

import { create } from 'zustand';
import { db, defaultSettings } from '@/services/db/db';
import type { RepeatConfig, RepeatRuntime } from '@/types';

const defaultConfig: RepeatConfig = {
  target: 'current_ayah',
  count: 5,
  range: null,
};

const initialRuntime: RepeatRuntime = {
  cycleIndex: 0,
  isActive: false,
  lastBoundary: null,
};

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
  resetRuntime: () => void;
  /** Tandai satu siklus selesai; nonaktif bila mencapai count. */
  tickCycle: () => void;
  setActive: (isActive: boolean) => void;
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
      const current = (await db.settings.get('default')) ?? defaultSettings;
      await db.settings.put({
        ...current,
        id: 'default',
        repeatConfig: next,
        updatedAt: Date.now(),
      });
      // Runtime di-reset & diaktifkan setiap config baru diterapkan.
      set({
        config: next,
        runtime: { ...initialRuntime, isActive: true },
      });
    },

    resetRuntime: () => set({ runtime: initialRuntime }),

    tickCycle: () => {
      const { config, runtime } = get();
      const nextIndex = runtime.cycleIndex + 1;
      const finished =
        Number.isFinite(config.count) && nextIndex >= config.count;
      set({
        runtime: {
          ...runtime,
          cycleIndex: nextIndex,
          isActive: !finished,
        },
      });
    },

    setActive: (isActive) =>
      set((s) => ({ runtime: { ...s.runtime, isActive } })),
  }),
);
