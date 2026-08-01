/**
 * Centralized route builders for the HanQuran app.
 *
 * Use these instead of inlining route strings, so route shape changes
 * (e.g. adding `?ayah` query, renaming `/focus` segment) require updating
 * only this file.
 */

import { isAndroidBuild } from '@/lib/platform';

type SurahId = string | number;

/**
 * Ubah path App Router menjadi file static export yang Capacitor Android
 * bisa resolve. WebView aset Capacitor tidak memetakan `/surah/1` →
 * `surah/1.html` maupun `/surah/1/` → `surah/1/index.html`.
 */
export function toStaticExportHref(href: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }

  const match = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  if (!match) {
    return href;
  }

  let [, path = '', query = '', hash = ''] = match;
  if (!path || path === '/') {
    return `${path}${query}${hash}`;
  }

  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  if (/\.[a-zA-Z0-9]+$/.test(path)) {
    return `${path}${query}${hash}`;
  }

  return `${path}.html${query}${hash}`;
}

function applyPlatformHref(href: string): string {
  return isAndroidBuild() ? toStaticExportHref(href) : href;
}

const buildSurahHref = (surahId: SurahId, ayah?: number): string =>
  applyPlatformHref(
    ayah ? `/surah/${surahId}?ayah=${ayah}` : `/surah/${surahId}`,
  );

const buildFocusHref = (surahId: SurahId, ayah?: number): string =>
  applyPlatformHref(
    ayah ? `/focus/${surahId}?ayah=${ayah}` : `/focus/${surahId}`,
  );

export const routes = {
  home: (): string => '/',
  settings: (): string => applyPlatformHref('/settings'),
  settingsAbout: (): string => applyPlatformHref('/settings/about'),
  surah: buildSurahHref,
  focus: buildFocusHref,
} as const;

/**
 * Ambil id surat dari pathname URL (`/surah/5` atau `/focus/5` → `"5"`).
 *
 * Dipakai halaman dinamis agar membaca id dari URL sisi-klien, bukan dari
 * params yang ditanam di HTML. Penting untuk strategi **app-shell** offline:
 * satu shell yang sama dapat melayani id apa pun (lihat `docs/30` §6.2).
 */
export function parseSurahIdFromPathname(pathname: string | null): string {
  if (!pathname) return '';
  const segments = pathname.split('/').filter(Boolean);
  // Bentuk yang valid: ['surah', '<id>'] atau ['focus', '<id>'].
  // Android static export: id bisa `5.html`.
  if (segments.length >= 2 && (segments[0] === 'surah' || segments[0] === 'focus')) {
    return decodeURIComponent(segments[1].replace(/\.html$/i, ''));
  }
  return '';
}
