'use client';

import { useEffect } from 'react';

import {
  computeSplashDismissDelay,
  dismissPwaSplash,
  isPwaLaunching,
  PWA_SPLASH_MAX_MS,
} from '@/lib/pwa-splash';

/**
 * Menutup splash statis setelah halaman siap — hanya aktif saat `html.pwa-launching`.
 */
export function PwaSplashDismisser() {
  useEffect(() => {
    if (!isPwaLaunching()) {
      return;
    }

    const startedAt = Date.now();
    let dismissed = false;

    const finish = () => {
      if (dismissed) {
        return;
      }
      dismissed = true;

      const delay = computeSplashDismissDelay(Date.now() - startedAt);
      window.setTimeout(dismissPwaSplash, delay);
    };

    if (document.readyState === 'complete') {
      finish();
      return;
    }

    window.addEventListener('load', finish, { once: true });
    const maxTimer = window.setTimeout(finish, PWA_SPLASH_MAX_MS);

    return () => {
      window.removeEventListener('load', finish);
      window.clearTimeout(maxTimer);
    };
  }, []);

  return null;
}
