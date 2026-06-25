/**
 * Setup Dexie (IndexedDB) — persistensi data pengguna HanQuran.
 *
 * Konten Quran TIDAK disimpan di Dexie. Sumber kebenaran konten:
 * `public/data/*` via `services/quran/` — lihat `docs/23-static-dataset-architecture.md`.
 *
 * Schema: `docs/06-database-schema.md` (v2 — data pengguna saja).
 *
 * Aturan akses (lihat `docs/15-state-management.md`):
 *   UI → Store (Zustand) → Dexie (file ini)
 * Komponen TIDAK boleh mengimpor file ini secara langsung.
 */

import Dexie, { type Table } from 'dexie';
import type {
  FavoriteRecord,
  LastReadRecord,
  SettingsRecord,
  DownloadManifestRecord,
  BookmarkRecord,
  MemorizationProgressRecord,
  MurajaahSessionRecord,
  StatisticsRecord,
  NoteRecord,
} from '@/types';
import { getDefaultReciterId } from '@/services/quran';
import { applyMigrations } from './migrations';

export const DB_NAME = 'hanquran-db';

export class HanQuranDB extends Dexie {
  favorites!: Table<FavoriteRecord, number>;
  lastRead!: Table<LastReadRecord, string>;
  settings!: Table<SettingsRecord, string>;
  downloadManifest!: Table<DownloadManifestRecord, [number, string]>;

  // Growth Phase (schema tersedia, belum diisi di MVP)
  bookmarks!: Table<BookmarkRecord, string>;
  memorization_progress!: Table<MemorizationProgressRecord, number>;
  murajaah_sessions!: Table<MurajaahSessionRecord, string>;
  statistics!: Table<StatisticsRecord, string>;
  notes!: Table<NoteRecord, string>;

  constructor() {
    super(DB_NAME);
    applyMigrations(this);
  }
}

/** Instance Dexie tunggal — hanya diakses dari Zustand store actions. */
export const db = new HanQuranDB();

/** Nilai default record `settings` saat belum ada di Dexie. */
export const defaultSettings: SettingsRecord = {
  id: 'default',
  appLocale: 'id',
  fontSize: 40,
  translationVisible: false,
  transliterationVisible: false,
  contrastMode: 'default',
  smoothAnimation: true,
  autoFollowPlayback: true,
  murotalEnabled: false,
  reciterId: getDefaultReciterId(),
  translationResourceId: 33, // Terjemahan Kemenag (Indonesia)
  updatedAt: 0,
};
