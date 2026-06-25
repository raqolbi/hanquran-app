/** Media query: HP landscape dengan tinggi viewport terbatas (bukan tablet). */
export const SHORT_LANDSCAPE_MEDIA =
  '(orientation: landscape) and (max-height: 31.25rem)';

/** Dialog desktop — lebar cukup DAN tinggi cukup (hindari landscape HP). */
export const DESKTOP_DIALOG_MEDIA =
  '(min-width: 768px) and (min-height: 31.25rem)';

export function isShortLandscapeViewport(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia(SHORT_LANDSCAPE_MEDIA).matches;
}
