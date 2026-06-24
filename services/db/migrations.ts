/**
 * Definisi versi & migrasi schema Dexie.
 *
 * Sumber kebenaran: `docs/06-database-schema.md` (Bagian 7 & 9).
 *
 * Aturan migrasi:
 *   - Naikkan `db.version(N)` saat menambah tabel, mengubah primary key,
 *     menambah index penting, atau mengubah struktur record yang tidak
 *     backward-compatible.
 *   - Setiap `version()` mendefinisikan SELURUH tabel (bukan hanya yang berubah).
 */

import type Dexie from 'dexie';

/**
 * Schema v1: 13 store name (9 aktif MVP + 5 Growth Phase).
 *
 * Format string index Dexie: kolom pertama = primary key, sisanya = index.
 * `[a+b]` = compound index. `&` = unique, `*` = multi-entry (tidak dipakai v1).
 */
export const SCHEMA_V1 = {
  surahs: 'id, nameLatin, revelationPlace, cachedAt',
  ayahs: 'id, surahId, [surahId+ayahNumber], cachedAt',
  translations:
    'id, surahId, [surahId+ayahNumber], [resourceId+surahId], cachedAt',
  wordTimings: 'id, [surahId+ayahNumber], cachedAt',
  reciters: 'id, nameLatin, cachedAt',
  favorites: 'surahId, createdAt',
  lastRead: 'id',
  settings: 'id',
  downloadManifest: 'surahId, status, cachedAt',

  // Growth Phase (schema tersedia sejak v1 untuk migrasi bersih)
  bookmarks: 'id, surahId, createdAt',
  memorization_progress: 'surahId, percentComplete, lastSessionAt',
  murajaah_sessions: 'id, surahId, completedAt',
  statistics: 'date',
  notes: 'id, surahId, updatedAt',
} as const;

/**
 * Terapkan seluruh versi schema ke instance Dexie.
 * Dipanggil dari constructor `HanQuranDB`.
 */
export function applyMigrations(db: Dexie): void {
  db.version(1).stores(SCHEMA_V1);

  // Versi berikutnya ditambahkan di sini, contoh:
  // db.version(2).stores({ ...SCHEMA_V1, /* perubahan */ }).upgrade(tx => { ... });
}
