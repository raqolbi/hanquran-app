import { describe, expect, it } from 'vitest';

import { SCHEMA_V1, SCHEMA_V2, SCHEMA_V3 } from '@/services/db/migrations';

describe('services/db/migrations', () => {
  it('schema v2 tidak menyertakan tabel konten Quran', () => {
    expect(SCHEMA_V2).not.toHaveProperty('surahs');
    expect(SCHEMA_V2).not.toHaveProperty('ayahs');
    expect(SCHEMA_V2).not.toHaveProperty('translations');
    expect(SCHEMA_V2).not.toHaveProperty('wordTimings');
    expect(SCHEMA_V2).not.toHaveProperty('reciters');
  });

  it('schema v2 mempertahankan tabel data pengguna MVP', () => {
    expect(SCHEMA_V2).toHaveProperty('settings');
    expect(SCHEMA_V2).toHaveProperty('favorites');
    expect(SCHEMA_V2).toHaveProperty('lastRead');
    expect(SCHEMA_V2).toHaveProperty('downloadManifest');
  });

  it('schema v5 memakai manifest per surat + qari', () => {
    expect(SCHEMA_V3.downloadManifest).toContain('[surahId+reciterId]');
    expect(SCHEMA_V3.downloadManifest).toContain('reciterId');
  });
});
