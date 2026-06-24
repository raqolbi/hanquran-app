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
