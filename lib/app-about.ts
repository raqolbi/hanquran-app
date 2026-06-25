import packageJson from '../package.json';

/** Nama tampilan aplikasi — satu sumber untuk UI About & metadata. */
export const APP_NAME = 'HanQuran';

/** URL repository GitHub resmi. */
export const APP_REPOSITORY_URL = 'https://github.com/raqolbi/hanquran-app';

const LICENSE_FILE = 'LICENSE';
const COMMERCIAL_LICENSE_FILE = 'COMMERCIAL-LICENSE.md';

/** Kunci prinsip filosofi — label di `about.mission.principles.*`. */
export const ABOUT_PHILOSOPHY_PRINCIPLE_KEYS = [
  'memorizationFirst',
  'mobileFirst',
  'offlineFirst',
  'simplicityFirst',
] as const;

/** Kunci item fokus aplikasi — label di `about.mission.focusItems.*`. */
export const ABOUT_FOCUS_ITEM_KEYS = [
  'repeat',
  'audio',
  'focusMode',
  'murotal',
  'mediaSession',
  'continueReading',
  'offline',
  'preferences',
] as const;

export type AboutPhilosophyPrincipleKey =
  (typeof ABOUT_PHILOSOPHY_PRINCIPLE_KEYS)[number];

export type AboutFocusItemKey = (typeof ABOUT_FOCUS_ITEM_KEYS)[number];

/** Versi aplikasi dari package.json — hindari duplikasi string versi. */
export function getAppVersion(): string {
  return packageJson.version;
}

export function getRepositoryLicenseUrl(): string {
  return `${APP_REPOSITORY_URL}/blob/main/${LICENSE_FILE}`;
}

export function getRepositoryCommercialLicenseUrl(): string {
  return `${APP_REPOSITORY_URL}/blob/main/${COMMERCIAL_LICENSE_FILE}`;
}
