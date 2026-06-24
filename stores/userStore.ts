/**
 * useUserStore — preferensi pengguna (persisten di Dexie).
 *
 * Persistensi memakai Dexie LANGSUNG dari action store (bukan persist
 * middleware) sesuai `docs/15-state-management.md` (Bagian 6.1).
 * Tabel Dexie: `settings`, `favorites`, `lastRead`.
 */

import { create } from 'zustand';
import { db, defaultSettings } from '@/services/db/db';
import type { SettingsRecord, LastReadRecord } from '@/types';

interface UserState {
  favorites: number[];
  settings: SettingsRecord;
  lastViewed: { surahId: number; ayahNumber: number } | null;
  initialized: boolean;
}

interface UserActions {
  /** Baca seluruh data persisten dari Dexie saat app start. */
  init: () => Promise<void>;
  toggleFavorite: (surahId: number) => Promise<void>;
  isFavorite: (surahId: number) => boolean;
  updateSettings: (patch: Partial<Omit<SettingsRecord, 'id'>>) => Promise<void>;
  setLastViewed: (surahId: number, ayahNumber: number) => Promise<void>;
}

export const useUserStore = create<UserState & UserActions>()((set, get) => ({
  favorites: [],
  settings: defaultSettings,
  lastViewed: null,
  initialized: false,

  init: async () => {
    const [settings, favorites, lastRead] = await Promise.all([
      db.settings.get('default'),
      db.favorites.orderBy('createdAt').toArray(),
      db.lastRead.get('last-read'),
    ]);
    set({
      settings: settings ?? defaultSettings,
      favorites: favorites.map((f) => f.surahId),
      lastViewed: lastRead
        ? { surahId: lastRead.surahId, ayahNumber: lastRead.ayahNumber }
        : null,
      initialized: true,
    });
  },

  toggleFavorite: async (surahId) => {
    const favorites = get().favorites;
    if (favorites.includes(surahId)) {
      // Optimistic update + recovery (docs/15 Bagian 13.4).
      set({ favorites: favorites.filter((id) => id !== surahId) });
      try {
        await db.favorites.delete(surahId);
      } catch (err) {
        set({ favorites });
        throw err;
      }
    } else {
      set({ favorites: [...favorites, surahId] });
      try {
        await db.favorites.put({ surahId, createdAt: Date.now() });
      } catch (err) {
        set({ favorites });
        throw err;
      }
    }
  },

  isFavorite: (surahId) => get().favorites.includes(surahId),

  updateSettings: async (patch) => {
    const next: SettingsRecord = {
      ...get().settings,
      ...patch,
      id: 'default',
      updatedAt: Date.now(),
    };
    await db.settings.put(next);
    set({ settings: next });
  },

  setLastViewed: async (surahId, ayahNumber) => {
    const record: LastReadRecord = {
      id: 'last-read',
      surahId,
      ayahNumber,
      updatedAt: Date.now(),
    };
    await db.lastRead.put(record);
    set({ lastViewed: { surahId, ayahNumber } });
  },
}));
