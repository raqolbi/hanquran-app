import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/services/db/db';
import { useUserStore } from '@/stores/userStore';
import { getDefaultReciterId } from '@/services/quran';
import { DEFAULT_ARABIC_FONT_SIZE_PX } from '@/lib/arabic-text-size';

describe('useUserStore — reciterId', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    useUserStore.setState({
      favorites: [],
      settings: {
        id: 'default',
        appLocale: 'id',
        fontSize: DEFAULT_ARABIC_FONT_SIZE_PX,
        translationVisible: false,
        transliterationVisible: false,
        contrastMode: 'default',
        smoothAnimation: true,
        autoFollowPlayback: true,
        murotalEnabled: false,
        reciterId: getDefaultReciterId(),
        translationResourceId: 33,
        updatedAt: 0,
      },
      lastViewed: null,
      initialized: false,
    });
  });

  it('menyimpan reciterId ke Dexie', async () => {
    await useUserStore.getState().init();
    await useUserStore.getState().updateSettings({
      reciterId: 'Husary_128kbps',
    });

    expect(useUserStore.getState().settings.reciterId).toBe('Husary_128kbps');

    const stored = await db.settings.get('default');
    expect(stored?.reciterId).toBe('Husary_128kbps');
  });

  it('memigrasi settings lama tanpa reciterId', async () => {
    await db.settings.put({
      id: 'default',
      appLocale: 'id',
      fontSize: 28,
      translationVisible: false,
      transliterationVisible: false,
      contrastMode: 'default',
      smoothAnimation: true,
      autoFollowPlayback: true,
      murotalEnabled: false,
      translationResourceId: 33,
      updatedAt: 1,
      // @ts-expect-error — bentuk legacy sebelum reciterId
      qariId: 7,
    });

    await useUserStore.getState().init();

    expect(useUserStore.getState().settings.reciterId).toBe(
      getDefaultReciterId(),
    );
  });

  it('menyimpan fontSize ke Dexie', async () => {
    await useUserStore.getState().init();
    await useUserStore.getState().updateSettings({ fontSize: 48 });

    expect(useUserStore.getState().settings.fontSize).toBe(48);

    const stored = await db.settings.get('default');
    expect(stored?.fontSize).toBe(48);
  });

  it('menormalisasi fontSize legacy saat init', async () => {
    // @ts-expect-error — bentuk legacy sebelum autoFollowPlayback / murotalEnabled
    await db.settings.put({
      id: 'default',
      appLocale: 'id',
      fontSize: 28,
      translationVisible: false,
      transliterationVisible: false,
      contrastMode: 'default',
      smoothAnimation: true,
      reciterId: getDefaultReciterId(),
      translationResourceId: 33,
      updatedAt: 1,
    });

    await useUserStore.getState().init();

    expect(useUserStore.getState().settings.fontSize).toBe(32);
  });
});

describe('useUserStore — aksesibilitas', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    useUserStore.setState({
      favorites: [],
      settings: {
        id: 'default',
        appLocale: 'id',
        fontSize: DEFAULT_ARABIC_FONT_SIZE_PX,
        translationVisible: false,
        transliterationVisible: false,
        contrastMode: 'default',
        smoothAnimation: true,
        autoFollowPlayback: true,
        murotalEnabled: false,
        reciterId: getDefaultReciterId(),
        translationResourceId: 33,
        updatedAt: 0,
      },
      lastViewed: null,
      initialized: false,
    });
  });

  it('menyimpan contrastMode ke Dexie', async () => {
    await useUserStore.getState().init();
    await useUserStore.getState().updateSettings({ contrastMode: 'high' });

    expect(useUserStore.getState().settings.contrastMode).toBe('high');

    const stored = await db.settings.get('default');
    expect(stored?.contrastMode).toBe('high');
  });

  it('menyimpan smoothAnimation ke Dexie', async () => {
    await useUserStore.getState().init();
    await useUserStore.getState().updateSettings({ smoothAnimation: false });

    expect(useUserStore.getState().settings.smoothAnimation).toBe(false);

    const stored = await db.settings.get('default');
    expect(stored?.smoothAnimation).toBe(false);
  });

  it('menyimpan autoFollowPlayback ke Dexie', async () => {
    await useUserStore.getState().init();
    await useUserStore.getState().updateSettings({ autoFollowPlayback: false });

    expect(useUserStore.getState().settings.autoFollowPlayback).toBe(false);

    const stored = await db.settings.get('default');
    expect(stored?.autoFollowPlayback).toBe(false);
  });

  it('memigrasi settings lama tanpa autoFollowPlayback', async () => {
    // @ts-expect-error — bentuk legacy sebelum autoFollowPlayback
    await db.settings.put({
      id: 'default',
      appLocale: 'id',
      fontSize: DEFAULT_ARABIC_FONT_SIZE_PX,
      translationVisible: false,
      transliterationVisible: false,
      contrastMode: 'default',
      smoothAnimation: true,
      reciterId: getDefaultReciterId(),
      translationResourceId: 33,
      updatedAt: 1,
    });

    await useUserStore.getState().init();

    expect(useUserStore.getState().settings.autoFollowPlayback).toBe(true);
  });

  it('menyimpan murotalEnabled ke Dexie', async () => {
    await useUserStore.getState().init();
    await useUserStore.getState().updateSettings({ murotalEnabled: true });

    expect(useUserStore.getState().settings.murotalEnabled).toBe(true);

    const stored = await db.settings.get('default');
    expect(stored?.murotalEnabled).toBe(true);
  });

  it('memigrasi settings lama tanpa murotalEnabled', async () => {
    // @ts-expect-error — bentuk legacy sebelum murotalEnabled
    await db.settings.put({
      id: 'default',
      appLocale: 'id',
      fontSize: DEFAULT_ARABIC_FONT_SIZE_PX,
      translationVisible: false,
      transliterationVisible: false,
      contrastMode: 'default',
      smoothAnimation: true,
      autoFollowPlayback: true,
      reciterId: getDefaultReciterId(),
      translationResourceId: 33,
      updatedAt: 1,
    });

    await useUserStore.getState().init();

    expect(useUserStore.getState().settings.murotalEnabled).toBe(false);
  });
});

describe('useUserStore — lastViewed', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    useUserStore.setState({
      favorites: [],
      settings: {
        id: 'default',
        appLocale: 'id',
        fontSize: DEFAULT_ARABIC_FONT_SIZE_PX,
        translationVisible: false,
        transliterationVisible: false,
        contrastMode: 'default',
        smoothAnimation: true,
        autoFollowPlayback: true,
        murotalEnabled: false,
        reciterId: getDefaultReciterId(),
        translationResourceId: 33,
        updatedAt: 0,
      },
      lastViewed: null,
      initialized: false,
    });
  });

  it('menyimpan lastViewed ke Dexie', async () => {
    await useUserStore.getState().init();
    await useUserStore.getState().setLastViewed(2, 142);

    expect(useUserStore.getState().lastViewed).toEqual({
      surahId: 2,
      ayahNumber: 142,
    });

    const stored = await db.lastRead.get('last-read');
    expect(stored?.surahId).toBe(2);
    expect(stored?.ayahNumber).toBe(142);
  });

  it('memuat lastViewed dari Dexie saat init', async () => {
    await db.lastRead.put({
      id: 'last-read',
      surahId: 18,
      ayahNumber: 5,
      updatedAt: 1,
    });

    await useUserStore.getState().init();

    expect(useUserStore.getState().lastViewed).toEqual({
      surahId: 18,
      ayahNumber: 5,
    });
  });

  it('tidak menulis ulang jika posisi sama', async () => {
    await useUserStore.getState().init();
    await useUserStore.getState().setLastViewed(2, 142);

    const before = await db.lastRead.get('last-read');
    await useUserStore.getState().setLastViewed(2, 142);
    const after = await db.lastRead.get('last-read');

    expect(after?.updatedAt).toBe(before?.updatedAt);
  });
});

describe('useUserStore — favorites', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    useUserStore.setState({
      favorites: [],
      settings: {
        id: 'default',
        appLocale: 'id',
        fontSize: DEFAULT_ARABIC_FONT_SIZE_PX,
        translationVisible: false,
        transliterationVisible: false,
        contrastMode: 'default',
        smoothAnimation: true,
        autoFollowPlayback: true,
        murotalEnabled: false,
        reciterId: getDefaultReciterId(),
        translationResourceId: 33,
        updatedAt: 0,
      },
      lastViewed: null,
      initialized: false,
    });
  });

  it('menyimpan favorit ke Dexie', async () => {
    await useUserStore.getState().init();
    await useUserStore.getState().toggleFavorite(1);

    expect(useUserStore.getState().favorites).toEqual([1]);
    expect(useUserStore.getState().isFavorite(1)).toBe(true);

    const stored = await db.favorites.get(1);
    expect(stored?.surahId).toBe(1);
  });

  it('menghapus favorit dari Dexie', async () => {
    await db.favorites.put({ surahId: 2, createdAt: 1 });
    await useUserStore.getState().init();

    await useUserStore.getState().toggleFavorite(2);

    expect(useUserStore.getState().favorites).toEqual([]);
    expect(await db.favorites.get(2)).toBeUndefined();
  });

  it('memuat favorit dari Dexie saat init', async () => {
    await db.favorites.bulkPut([
      { surahId: 1, createdAt: 1 },
      { surahId: 36, createdAt: 2 },
    ]);

    await useUserStore.getState().init();

    expect(useUserStore.getState().favorites).toEqual([1, 36]);
  });
});
