import { describe, expect, it } from 'vitest';

import { routes } from '@/lib/routes';
import {
  buildAllDatasetUrls,
  buildAllRouteUrls,
} from '@/services/offline-app-precache';

describe('offline-app-precache', () => {
  it('membangun URL dataset penuh: manifest + quran + terjemahan id/en', () => {
    const urls = buildAllDatasetUrls(2);

    expect(urls).toEqual([
      '/data/manifest.json',
      '/data/quran/001.json',
      '/data/translations/id/001.json',
      '/data/translations/en/001.json',
      '/data/quran/002.json',
      '/data/translations/id/002.json',
      '/data/translations/en/002.json',
    ]);
  });

  it('mencakup seluruh 114 surat secara default', () => {
    const urls = buildAllDatasetUrls();
    // 1 manifest + 114 * (1 quran + 2 terjemahan)
    expect(urls).toHaveLength(1 + 114 * 3);
  });

  it('membangun URL semua route shell', () => {
    const urls = buildAllRouteUrls(2);

    expect(urls).toEqual([
      routes.home(),
      routes.settings(),
      routes.settingsAbout(),
      routes.surah(1),
      routes.focus(1),
      routes.surah(2),
      routes.focus(2),
    ]);
  });

  it('mencakup 3 route statis + 2 route per surat', () => {
    const urls = buildAllRouteUrls();
    expect(urls).toHaveLength(3 + 114 * 2);
  });
});
