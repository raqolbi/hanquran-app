/**
 * Centralized route builders for the HanQuran app.
 *
 * Use these instead of inlining route strings, so route shape changes
 * (e.g. adding `?ayah` query, renaming `/focus` segment) require updating
 * only this file.
 */

type SurahId = string | number;

const buildSurahHref = (surahId: SurahId, ayah?: number): string =>
  ayah ? `/surah/${surahId}?ayah=${ayah}` : `/surah/${surahId}`;

const buildFocusHref = (surahId: SurahId, ayah?: number): string =>
  ayah ? `/focus/${surahId}?ayah=${ayah}` : `/focus/${surahId}`;

export const routes = {
  home: (): string => '/',
  settings: (): string => '/settings',
  settingsAbout: (): string => '/settings/about',
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
  if (segments.length >= 2 && (segments[0] === 'surah' || segments[0] === 'focus')) {
    return decodeURIComponent(segments[1]);
  }
  return '';
}
