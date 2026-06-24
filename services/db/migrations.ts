/**
 * Definisi versi & migrasi schema Dexie.
 *
 * Sumber kebenaran: `docs/06-database-schema.md` (Bagian 7 & 9).
 *
 * Aturan migrasi:
 *   - Naikkan `db.version(N)` saat menambah tabel, mengubah primary key,
 *     menambah index penting, atau mengubah struktur record yang tidak
 *     backward-compatible.
 *   - Dexie tidak mendukung perubahan primary key in-place — gunakan backup
 *     tabel sementara + hapus + buat ulang (v3 → v4 → v5).
 *   - Setiap `version()` mendefinisikan SELURUH tabel (bukan hanya yang berubah).
 */

import type Dexie from 'dexie';

import { DOWNLOAD_MANIFEST_VERSION } from '@/services/audio-cache-constants';
import { getDefaultReciterId } from '@/services/quran';

/** Tabel sementara saat migrasi primary key `downloadManifest` v2 → v3. */
export const DOWNLOAD_MANIFEST_LEGACY_TABLE = 'downloadManifestLegacy';

/**
 * Schema v1: termasuk tabel konten Quran (usang — tidak pernah dipakai runtime).
 *
 * Schema v2: hanya data pengguna + manifest offline. Konten Quran dari
 * `public/data/*` via `services/quran/` — lihat `docs/23-static-dataset-architecture.md`.
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
  bookmarks: 'id, surahId, createdAt',
  memorization_progress: 'surahId, percentComplete, lastSessionAt',
  murajaah_sessions: 'id, surahId, completedAt',
  statistics: 'date',
  notes: 'id, surahId, updatedAt',
} as const;

/** Schema v2 — MVP: Dexie hanya untuk data pengguna, bukan konten Quran. */
export const SCHEMA_V2 = {
  favorites: 'surahId, createdAt',
  lastRead: 'id',
  settings: 'id',
  downloadManifest: 'surahId, status, cachedAt',
  bookmarks: 'id, surahId, createdAt',
  memorization_progress: 'surahId, percentComplete, lastSessionAt',
  murajaah_sessions: 'id, surahId, completedAt',
  statistics: 'date',
  notes: 'id, surahId, updatedAt',
} as const;

/** Schema v5 — manifest unduhan per pasangan surat + qari. */
export const SCHEMA_V3 = {
  favorites: 'surahId, createdAt',
  lastRead: 'id',
  settings: 'id',
  downloadManifest: '[surahId+reciterId], surahId, reciterId, status, cachedAt',
  bookmarks: 'id, surahId, createdAt',
  memorization_progress: 'surahId, percentComplete, lastSessionAt',
  murajaah_sessions: 'id, surahId, completedAt',
  statistics: 'date',
  notes: 'id, surahId, updatedAt',
} as const;

async function migrateLegacyManifestRows(
  tx: Dexie.Transaction,
): Promise<void> {
  const legacy = await tx.table(DOWNLOAD_MANIFEST_LEGACY_TABLE).toArray();
  if (legacy.length === 0) return;

  const fallbackReciterId = getDefaultReciterId();

  for (const record of legacy) {
    const reciterId =
      typeof record.reciterId === 'string' && record.reciterId.length > 0
        ? record.reciterId
        : fallbackReciterId;

    await tx.table('downloadManifest').put({
      surahId: record.surahId,
      reciterId,
      status: record.status,
      sizeBytes: record.sizeBytes ?? 0,
      ayahsCount: record.ayahsCount ?? 0,
      cachedAt: record.cachedAt ?? Date.now(),
      version: record.version ?? DOWNLOAD_MANIFEST_VERSION,
    });
  }
}

/**
 * Terapkan seluruh versi schema ke instance Dexie.
 * Dipanggil dari constructor `HanQuranDB`.
 */
export function applyMigrations(db: Dexie): void {
  db.version(1).stores(SCHEMA_V1);
  db.version(2).stores(SCHEMA_V2);

  // v3: cadangkan manifest lama (PK: surahId) sebelum tabel dihapus.
  db.version(3)
    .stores({
      ...SCHEMA_V2,
      [DOWNLOAD_MANIFEST_LEGACY_TABLE]: 'surahId, status, cachedAt',
    })
    .upgrade(async (tx) => {
      const rows = await tx.table('downloadManifest').toArray();
      if (rows.length === 0) return;
      await tx.table(DOWNLOAD_MANIFEST_LEGACY_TABLE).bulkPut(rows);
    });

  // v4: hapus tabel lama — Dexie tidak bisa mengubah primary key in-place.
  db.version(4).stores({
    ...SCHEMA_V2,
    downloadManifest: null,
    [DOWNLOAD_MANIFEST_LEGACY_TABLE]: 'surahId, status, cachedAt',
  });

  // v5: buat tabel baru dengan PK [surahId+reciterId], pulihkan data cadangan.
  db.version(5)
    .stores({
      ...SCHEMA_V3,
      [DOWNLOAD_MANIFEST_LEGACY_TABLE]: null,
    })
    .upgrade(migrateLegacyManifestRows);
}
