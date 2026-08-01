import { describe, expect, it } from 'vitest';

import {
  isRootAppPath,
  normalizeAppPathname,
  resolveAndroidBackAction,
} from '@/lib/android-back';

describe('normalizeAppPathname', () => {
  it('menormalisasi static export .html dan trailing slash', () => {
    expect(normalizeAppPathname('/surah/1.html')).toBe('/surah/1');
    expect(normalizeAppPathname('/settings/about.html')).toBe('/settings/about');
    expect(normalizeAppPathname('/surah/1/')).toBe('/surah/1');
    expect(normalizeAppPathname('/index.html')).toBe('/');
    expect(normalizeAppPathname('/')).toBe('/');
  });
});

describe('isRootAppPath', () => {
  it('hanya true untuk beranda', () => {
    expect(isRootAppPath('/')).toBe(true);
    expect(isRootAppPath('/index.html')).toBe(true);
    expect(isRootAppPath('/surah/1.html')).toBe(false);
    expect(isRootAppPath('/settings')).toBe(false);
  });
});

describe('resolveAndroidBackAction', () => {
  it('mengutamakan history.back jika WebView bisa mundur', () => {
    expect(
      resolveAndroidBackAction({ pathname: '/surah/1.html', canGoBack: true }),
    ).toBe('history_back');
    expect(resolveAndroidBackAction({ pathname: '/', canGoBack: true })).toBe(
      'history_back',
    );
  });

  it('keluar aplikasi di beranda tanpa history', () => {
    expect(
      resolveAndroidBackAction({ pathname: '/', canGoBack: false }),
    ).toBe('exit_app');
  });

  it('ke beranda jika deep-link tanpa history', () => {
    expect(
      resolveAndroidBackAction({
        pathname: '/settings/about.html',
        canGoBack: false,
      }),
    ).toBe('go_home');
  });
});
