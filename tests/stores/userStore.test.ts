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
