import { describe, expect, it } from 'vitest';
import Dexie from 'dexie';
import 'fake-indexeddb/auto';

import { DOWNLOAD_MANIFEST_VERSION } from '@/services/audio-cache-constants';
import { getDefaultReciterId } from '@/services/quran';
import { SCHEMA_V2, applyMigrations } from '@/services/db/migrations';

describe('migrasi downloadManifest v2 ke v5', () => {
  it('memigrasi manifest lama ke pasangan surat + qari', async () => {
    const dbName = `hanquran-migrate-test-${Date.now()}`;
    const defaultReciterId = getDefaultReciterId();

    const legacyDb = new Dexie(dbName);
    legacyDb.version(2).stores(SCHEMA_V2);
    await legacyDb.open();
    await legacyDb.table('downloadManifest').put({
      surahId: 1,
      status: 'ready',
      sizeBytes: 1024,
      ayahsCount: 7,
      cachedAt: Date.now(),
      version: DOWNLOAD_MANIFEST_VERSION,
    });
    await legacyDb.close();

    const migratedDb = new Dexie(dbName);
    applyMigrations(migratedDb);
    await migratedDb.open();

    const manifest = await migratedDb
      .table('downloadManifest')
      .get([1, defaultReciterId]);

    expect(manifest?.status).toBe('ready');
    expect(manifest?.reciterId).toBe(defaultReciterId);
    expect(await migratedDb.table('downloadManifest').count()).toBe(1);

    await migratedDb.delete();
    await migratedDb.close();
  });
});
