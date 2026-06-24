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
