/**
 * useUserStore — preferensi pengguna (persisten di Dexie).
 *
 * Persistensi memakai Dexie LANGSUNG dari action store (bukan persist
 * middleware) sesuai `docs/15-state-management.md` (Bagian 6.1).
 * Tabel Dexie: `settings`, `favorites`, `lastRead`.
 */

import { create } from 'zustand';
import { db, defaultSettings } from '@/services/db/db';
import { detectAppLocale } from '@/i18n/detection';
import { trackBookmarkCreated, trackLastReadUpdated } from '@/lib/analytics';
import { normalizeArabicFontSize } from '@/lib/arabic-text-size';
import { normalizeReciterId } from '@/lib/reciter-preference';
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
  toggleFavorite: (surahId: number, options?: { ayahNumber?: number }) => Promise<void>;
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
    const [storedSettings, favorites, lastRead] = await Promise.all([
      db.settings.get('default'),
      db.favorites.orderBy('createdAt').toArray(),
      db.lastRead.get('last-read'),
    ]);

    let settings = storedSettings ?? null;

    if (!settings) {
      settings = {
        ...defaultSettings,
        appLocale: detectAppLocale(),
        updatedAt: Date.now(),
      };
      await db.settings.put(settings);
    } else if (!settings.appLocale) {
      settings = {
        ...settings,
        appLocale: 'id',
        updatedAt: Date.now(),
      };
      await db.settings.put(settings);
    } else if (settings.transliterationVisible === undefined) {
      settings = {
        ...settings,
        transliterationVisible: false,
        updatedAt: Date.now(),
      };
      await db.settings.put(settings);
    }

    const legacySettings = settings as SettingsRecord & { qariId?: number };
    if (!settings.reciterId) {
      settings = {
        ...settings,
        reciterId: normalizeReciterId(undefined),
        updatedAt: Date.now(),
      };
      delete legacySettings.qariId;
      await db.settings.put(settings);
    } else {
      const normalized = normalizeReciterId(settings.reciterId);
      if (normalized !== settings.reciterId) {
        settings = {
          ...settings,
          reciterId: normalized,
          updatedAt: Date.now(),
        };
        await db.settings.put(settings);
      }
    }

    const normalizedFontSize = normalizeArabicFontSize(settings.fontSize);
    if (normalizedFontSize !== settings.fontSize) {
      settings = {
        ...settings,
        fontSize: normalizedFontSize,
        updatedAt: Date.now(),
      };
      await db.settings.put(settings);
    }

    set({
      settings,
      favorites: favorites.map((f) => f.surahId),
      lastViewed: lastRead
        ? { surahId: lastRead.surahId, ayahNumber: lastRead.ayahNumber }
        : null,
      initialized: true,
    });
  },

  toggleFavorite: async (surahId, options) => {
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
        trackBookmarkCreated({
          surahId,
          ayahNumber: options?.ayahNumber ?? 1,
        });
      } catch (err) {
        set({ favorites });
        throw err;
      }
    }
  },

  isFavorite: (surahId) => get().favorites.includes(surahId),

  updateSettings: async (patch) => {
    const normalizedPatch = { ...patch };
    if (normalizedPatch.fontSize !== undefined) {
      normalizedPatch.fontSize = normalizeArabicFontSize(
        normalizedPatch.fontSize,
      );
    }

    const next: SettingsRecord = {
      ...get().settings,
      ...normalizedPatch,
      id: 'default',
      updatedAt: Date.now(),
    };
    await db.settings.put(next);
    set({ settings: next });
  },

  setLastViewed: async (surahId, ayahNumber) => {
    const current = get().lastViewed;
    if (
      current?.surahId === surahId &&
      current?.ayahNumber === ayahNumber
    ) {
      return;
    }

    const record: LastReadRecord = {
      id: 'last-read',
      surahId,
      ayahNumber,
      updatedAt: Date.now(),
    };
    await db.lastRead.put(record);
    set({ lastViewed: { surahId, ayahNumber } });
    trackLastReadUpdated({ surahId, ayahNumber });
  },
}));
