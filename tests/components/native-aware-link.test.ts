import { describe, expect, it } from 'vitest';

import { toStaticExportHref } from '@/lib/routes';

describe('toStaticExportHref', () => {
  it('menambah sufiks .html pada path App Router', () => {
    expect(toStaticExportHref('/surah/1')).toBe('/surah/1.html');
    expect(toStaticExportHref('/settings')).toBe('/settings.html');
    expect(toStaticExportHref('/settings/about')).toBe('/settings/about.html');
  });

  it('mempertahankan query string dan hash', () => {
    expect(toStaticExportHref('/surah/1?ayah=2')).toBe('/surah/1.html?ayah=2');
    expect(toStaticExportHref('/focus/5#ayat')).toBe('/focus/5.html#ayat');
  });

  it('tidak mengubah root, URL absolut, atau path ber-ekstensi', () => {
    expect(toStaticExportHref('/')).toBe('/');
    expect(toStaticExportHref('https://example.com/x')).toBe('https://example.com/x');
    expect(toStaticExportHref('/surah/1.html')).toBe('/surah/1.html');
  });

  it('menghapus trailing slash sebelum menambah .html', () => {
    expect(toStaticExportHref('/surah/1/')).toBe('/surah/1.html');
  });
});
