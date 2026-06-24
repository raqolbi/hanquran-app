/**
 * Setup Dexie (IndexedDB) — fondasi seluruh persistensi HanQuran V1.
 *
 * Sumber kebenaran schema: `docs/06-database-schema.md` (Bagian 7).
 * Schema v1 mendefinisikan 13 tabel: 9 tabel aktif MVP + 5 tabel Growth Phase
 * (tabel Growth sudah didefinisikan sejak v1 agar migrasi V2 bersih, tetapi
 * belum diisi data pada MVP).
 *
 * Aturan akses (lihat `docs/15-state-management.md`):
 *   UI → Store (Zustand) → Repository → Dexie (file ini) → public/data/*
 * Komponen TIDAK boleh mengimpor file ini secara langsung.
 */

import Dexie, { type Table } from 'dexie';
import type {
  SurahRecord,
  AyahRecord,
  TranslationRecord,
  WordTimingRecord,
  ReciterRecord,
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
import { applyMigrations } from './migrations';

export const DB_NAME = 'hanquran-db';

export class HanQuranDB extends Dexie {
  // --- Tabel aktif MVP ---
  surahs!: Table<SurahRecord, number>;
  ayahs!: Table<AyahRecord, string>;
  translations!: Table<TranslationRecord, string>;
  wordTimings!: Table<WordTimingRecord, string>;
  reciters!: Table<ReciterRecord, number>;
  favorites!: Table<FavoriteRecord, number>;
  lastRead!: Table<LastReadRecord, string>;
  settings!: Table<SettingsRecord, string>;
  downloadManifest!: Table<DownloadManifestRecord, number>;

  // --- Tabel Growth Phase (schema tersedia, belum diisi di MVP) ---
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

/** Instance Dexie tunggal yang dipakai seluruh Repository & Store. */
export const db = new HanQuranDB();

/** Nilai default record `settings` saat belum ada di Dexie. */
export const defaultSettings: SettingsRecord = {
  id: 'default',
  fontSize: 28,
  translationVisible: false,
  contrastMode: 'default',
  smoothAnimation: true,
  qariId: 7, // Mishary Rashid Alafasy (default, lihat data/reciters.json)
  translationResourceId: 33, // Terjemahan Kemenag (Indonesia)
  updatedAt: 0,
};
