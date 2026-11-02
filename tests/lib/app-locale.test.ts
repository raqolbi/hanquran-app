// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyAppLocaleToDocument,
  APP_LOCALE_ATTRIBUTE,
  APP_LOCALE_STORAGE_KEY,
  buildAppLocaleInitScript,
  isAppLocale,
  readCachedAppLocale,
  resolveInitialAppLocale,
  writeCachedAppLocale,
} from '@/lib/app-locale';

function setNavigatorLanguages(languages: string[]) {
  Object.defineProperty(window.navigator, 'languages', {
    configurable: true,
    get: () => languages,
  });
  Object.defineProperty(window.navigator, 'language', {
    configurable: true,
    get: () => languages[0] ?? 'en-US',
  });
}

function stubTimeZone(timeZone: string) {
  vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(
    () =>
      ({
        resolvedOptions: () => ({ timeZone }),
      }) as unknown as Intl.DateTimeFormat,
  );
}

describe('lib/app-locale', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(APP_LOCALE_ATTRIBUTE);
    document.documentElement.removeAttribute('lang');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('mengenali hanya id dan en', () => {
    expect(isAppLocale('id')).toBe(true);
    expect(isAppLocale('en')).toBe(true);
    expect(isAppLocale('fr')).toBe(false);
    expect(isAppLocale(null)).toBe(false);
  });

  it('cache locale valid dibaca, nilai lain diabaikan', () => {
    expect(readCachedAppLocale()).toBeNull();

    writeCachedAppLocale('en');
    expect(readCachedAppLocale()).toBe('en');

    window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, 'fr');
    expect(readCachedAppLocale()).toBeNull();
  });

  it('cache menjadi sumber pertama untuk paint awal', () => {
    writeCachedAppLocale('id');
    stubTimeZone('UTC');
    setNavigatorLanguages(['en-US']);

    expect(resolveInitialAppLocale()).toBe('id');
  });

  it('menerapkan locale ke <html> (atribut + lang) secara sinkron', () => {
    applyAppLocaleToDocument('en');

    expect(document.documentElement.getAttribute(APP_LOCALE_ATTRIBUTE)).toBe(
      'en',
    );
    expect(document.documentElement.lang).toBe('en');

    applyAppLocaleToDocument('id');

    expect(document.documentElement.getAttribute(APP_LOCALE_ATTRIBUTE)).toBe(
      'id',
    );
    expect(document.documentElement.lang).toBe('id');
  });
});

describe('buildAppLocaleInitScript', () => {
  const runScript = () => {
    new Function(buildAppLocaleInitScript())();
  };

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(APP_LOCALE_ATTRIBUTE);
    document.documentElement.removeAttribute('lang');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.documentElement.removeAttribute(APP_LOCALE_ATTRIBUTE);
    document.documentElement.removeAttribute('lang');
  });

  it('menetapkan atribut + lang dari cache valid sebelum paint', () => {
    window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, 'en');

    runScript();

    expect(document.documentElement.getAttribute(APP_LOCALE_ATTRIBUTE)).toBe(
      'en',
    );
    expect(document.documentElement.lang).toBe('en');
  });

  it('mengabaikan cache rusak dan mendeteksi bahasa Indonesia', () => {
    window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, 'fr');
    stubTimeZone('UTC');
    setNavigatorLanguages(['id-ID']);

    runScript();

    expect(document.documentElement.getAttribute(APP_LOCALE_ATTRIBUTE)).toBe(
      'id',
    );
  });

  it('fallback ke en untuk browser non-Indonesia', () => {
    stubTimeZone('UTC');
    setNavigatorLanguages(['en-US']);

    runScript();

    expect(document.documentElement.getAttribute(APP_LOCALE_ATTRIBUTE)).toBe(
      'en',
    );
  });

  it('mendeteksi timezone Indonesia bila bahasa browser bukan id', () => {
    stubTimeZone('Asia/Jakarta');
    setNavigatorLanguages(['en-US']);

    runScript();

    expect(document.documentElement.getAttribute(APP_LOCALE_ATTRIBUTE)).toBe(
      'id',
    );
  });

  it('hanya membaca localStorage, tidak menulis', () => {
    window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, 'en');

    runScript();

    expect(window.localStorage.getItem(APP_LOCALE_STORAGE_KEY)).toBe('en');
    expect(window.localStorage.length).toBe(1);
  });
});
