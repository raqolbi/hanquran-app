const DISMISS_STORAGE_KEY = 'hanquran:install-banner-dismissed';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface DismissRecord {
  dismissedAt: number;
}

export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Safari di iOS belum mendukung `beforeinstallprompt`; tampilkan petunjuk manual. */
export function isIosSafariInstallable(): boolean {
  if (typeof navigator === 'undefined' || isAppInstalled()) {
    return false;
  }

  if (!isIosDevice()) {
    return false;
  }

  const ua = navigator.userAgent;
  const isSafari =
    /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);

  return isSafari;
}

export function isInstallBannerDismissed(now = Date.now()): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw) as DismissRecord;
    return now - parsed.dismissedAt < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export function dismissInstallBanner(now = Date.now()): void {
  if (typeof window === 'undefined') {
    return;
  }

  const record: DismissRecord = { dismissedAt: now };
  window.localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(record));
}

export function clearInstallBannerDismissal(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(DISMISS_STORAGE_KEY);
}

export type InstallPromptOutcome = 'accepted' | 'dismissed' | 'unavailable';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
