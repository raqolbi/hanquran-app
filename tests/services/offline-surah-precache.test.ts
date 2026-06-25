import { describe, expect, it } from 'vitest';

import { routes } from '@/lib/routes';
import {
  buildSurahOfflineDataUrls,
  buildSurahOfflineRouteUrls,
} from '@/services/offline-surah-precache';

describe('offline-surah-precache', () => {
  it('membangun URL data surat dan terjemahan id/en', () => {
    expect(buildSurahOfflineDataUrls(1)).toEqual([
      '/data/quran/001.json',
      '/data/translations/id/001.json',
      '/data/translations/en/001.json',
    ]);
  });

  it('membangun URL shell surah detail dan focus', () => {
    expect(buildSurahOfflineRouteUrls(2)).toEqual([
      routes.surah(2),
      routes.focus(2),
    ]);
  });
});
