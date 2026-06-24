import { describe, expect, it } from 'vitest';

import { SCHEMA_V1, SCHEMA_V2 } from '@/services/db/migrations';

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

  it('schema v1 historis masih menyertakan tabel konten Quran', () => {
    expect(SCHEMA_V1).toHaveProperty('surahs');
    expect(SCHEMA_V1).toHaveProperty('ayahs');
  });
});
