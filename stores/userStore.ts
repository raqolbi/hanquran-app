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
import {
  applyAppLocaleToDocument,
  writeCachedAppLocale,
} from '@/lib/app-locale';
import { normalizeArabicFontSize } from '@/lib/arabic-text-size';
import { normalizeReciterId } from '@/lib/reciter-preference';
import type { SettingsRecord, LastReadRecord } from '@/types';

interface UserState {
  favorites: number[];
  settings: SettingsRecord;
  lastViewed: { surahId: number; ayahNumber: number } | null;
  initialized: boolean;
  /**
   * `false` bila IndexedDB/Dexie tidak dapat dibuka (mode privat, diblokir,
   * rusak) — **degraded mode** (docs/15 §12.5). Perubahan tetap berlaku di
   * memori selama sesi, tetapi tidak disimpan; Pengaturan menampilkan
   * pemberitahuan.
   */
  persistenceAvailable: boolean;
}

interface UserActions {
  /** Baca seluruh data persisten dari Dexie saat app start. */
  init: () => Promise<void>;
  toggleFavorite: (surahId: number, options?: { ayahNumber?: number }) => Promise<void>;
  isFavorite: (surahId: number) => boolean;
  updateSettings: (patch: Partial<Omit<SettingsRecord, 'id'>>) => Promise<void>;
  setLastViewed: (surahId: number, ayahNumber: number) => Promise<void>;
}

/**
 * Lengkapi field yang belum ada pada record `settings` lama.
 *
 * Sebelumnya memakai rantai `else if`, sehingga hanya SATU field hilang yang
 * diperbaiki per init — pengguna lama yang kehilangan beberapa field
 * (mis. `transliterationVisible` + `autoFollowPlayback`) tetap punya
 * `undefined` dan fitur default-ON ikut mati.
 */
function normalizeStoredSettings(stored: SettingsRecord): {
  settings: SettingsRecord;
  changed: boolean;
} {
  const legacy = stored as SettingsRecord & { qariId?: number };
  let changed = false;
  const next: SettingsRecord & { qariId?: number } = { ...legacy };

  // Pengguna lama tanpa `appLocale` sudah memakai UI bahasa Indonesia.
  if (!next.appLocale) {
    next.appLocale = 'id';
    changed = true;
  }

  const defaultableKeys = [
    'transliterationVisible',
    'autoFollowPlayback',
    'murotalEnabled',
    'autoDownloadOnPlay',
    'wordHighlight',
  ] as const;
  for (const key of defaultableKeys) {
    if (next[key] === undefined) {
      next[key] = defaultSettings[key];
      changed = true;
    }
  }

  const reciterId = normalizeReciterId(next.reciterId);
  if (reciterId !== next.reciterId) {
    next.reciterId = reciterId;
    changed = true;
  }
  if ('qariId' in next) {
    delete next.qariId;
    changed = true;
  }

  const fontSize = normalizeArabicFontSize(next.fontSize);
  if (fontSize !== next.fontSize) {
    next.fontSize = fontSize;
    changed = true;
  }

  if (changed) {
    next.updatedAt = Date.now();
  }

  return { settings: next, changed };
}

export const useUserStore = create<UserState & UserActions>()((set, get) => ({
  favorites: [],
  settings: defaultSettings,
  lastViewed: null,
  initialized: false,
  persistenceAvailable: true,

  init: async () => {
    try {
      const [storedSettings, favorites, lastRead] = await Promise.all([
        db.settings.get('default'),
        db.favorites.orderBy('createdAt').toArray(),
        db.lastRead.get('last-read'),
      ]);

      let settings: SettingsRecord;
      if (!storedSettings) {
        settings = {
          ...defaultSettings,
          appLocale: detectAppLocale(),
          updatedAt: Date.now(),
        };
        await db.settings.put(settings);
      } else {
        const { settings: normalized, changed } =
          normalizeStoredSettings(storedSettings);
        settings = normalized;
        if (changed) {
          await db.settings.put(settings);
        }
      }

      set({
        settings,
        favorites: favorites.map((f) => f.surahId),
        lastViewed: lastRead
          ? { surahId: lastRead.surahId, ayahNumber: lastRead.ayahNumber }
          : null,
        initialized: true,
      });

      // Segarkan cache pra-paint agar paint berikutnya memakai locale Dexie
      // (docs/21 §5.6). Menutup kasus cache basi / pengguna lama tanpa cache.
      writeCachedAppLocale(settings.appLocale);
      // Terapkan atribut sebelum React render ulang, agar cache basi tidak
      // menghasilkan satu frame campuran bahasa.
      applyAppLocaleToDocument(settings.appLocale);
    } catch (err) {
      // IndexedDB tidak tersedia / rusak: jalan dengan default di memori
      // agar UI tidak macet di status "belum siap" tanpa pesan.
      console.error('[HanQuran] Gagal membaca data pengguna dari Dexie:', err);
      set({ initialized: true, persistenceAvailable: false });
    }
  },

  toggleFavorite: async (surahId, options) => {
    const favorites = get().favorites;
    if (!get().persistenceAvailable) {
      // Degraded mode: tetap berfungsi di memori untuk sesi ini.
      set({
        favorites: favorites.includes(surahId)
          ? favorites.filter((id) => id !== surahId)
          : [...favorites, surahId],
      });
      return;
    }
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
    if (get().persistenceAvailable) {
      await db.settings.put(next);
    }

    if (normalizedPatch.appLocale !== undefined) {
      // Terapkan ke `<html>` sebelum `set`, agar teks bilingual dan teks
      // `next-intl` berganti dalam frame yang sama (docs/21 §5.6).
      applyAppLocaleToDocument(next.appLocale);
      writeCachedAppLocale(next.appLocale);
    }

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
    if (get().persistenceAvailable) {
      await db.lastRead.put(record);
    }
    set({ lastViewed: { surahId, ayahNumber } });
    trackLastReadUpdated({ surahId, ayahNumber });
  },
}));
