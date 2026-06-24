import { describe, expect, it } from 'vitest';

import packageJson from '@/package.json';
import {
  APP_NAME,
  APP_REPOSITORY_URL,
  getAppVersion,
  getRepositoryCommercialLicenseUrl,
  getRepositoryLicenseUrl,
} from '@/lib/app-about';
import { routes } from '@/lib/routes';

describe('app-about', () => {
  it('mengembalikan versi dari package.json', () => {
    expect(getAppVersion()).toBe(packageJson.version);
  });

  it('menyediakan metadata aplikasi tetap', () => {
    expect(APP_NAME).toBe('HanQuran');
    expect(APP_REPOSITORY_URL).toBe('https://github.com/raqolbi/hanquran-app');
  });

  it('membangun URL lisensi repository', () => {
    expect(getRepositoryLicenseUrl()).toBe(
      `${APP_REPOSITORY_URL}/blob/main/LICENSE`,
    );
    expect(getRepositoryCommercialLicenseUrl()).toBe(
      `${APP_REPOSITORY_URL}/blob/main/COMMERCIAL-LICENSE.md`,
    );
  });
});

describe('routes.settingsAbout', () => {
  it('mengarah ke /settings/about', () => {
    expect(routes.settingsAbout()).toBe('/settings/about');
  });
});
