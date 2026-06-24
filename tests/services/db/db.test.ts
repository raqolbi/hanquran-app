import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { db, defaultSettings } from '@/services/db/db';

describe('services/db/db', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('dapat menulis dan membaca settings', async () => {
    const settings = {
      ...defaultSettings,
      appLocale: 'id' as const,
      updatedAt: Date.now(),
    };

    await db.settings.put(settings);
    const stored = await db.settings.get('default');

    expect(stored?.appLocale).toBe('id');
    expect(stored?.translationVisible).toBe(false);
  });

  it('dapat menulis favorit dan lastRead', async () => {
    await db.favorites.put({ surahId: 1, createdAt: 1 });
    await db.lastRead.put({
      id: 'last-read',
      surahId: 2,
      ayahNumber: 5,
      updatedAt: 2,
    });

    const favorites = await db.favorites.toArray();
    const lastRead = await db.lastRead.get('last-read');

    expect(favorites).toHaveLength(1);
    expect(lastRead?.surahId).toBe(2);
    expect(lastRead?.ayahNumber).toBe(5);
  });
});
