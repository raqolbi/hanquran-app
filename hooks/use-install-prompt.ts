'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  dismissInstallBanner,
  isAppInstalled,
  isInstallBannerDismissed,
  isIosSafariInstallable,
  type BeforeInstallPromptEvent,
  type InstallPromptOutcome,
} from '@/lib/install-prompt';
import { useIsClient } from '@/hooks/use-is-client';

interface UseInstallPromptResult {
  showBanner: boolean;
  canNativePrompt: boolean;
  isIosHint: boolean;
  promptInstall: () => Promise<InstallPromptOutcome>;
  dismissBanner: () => void;
}

/**
 * Deteksi kelayakan instal PWA & kelola event `beforeinstallprompt`.
 * Banner disembunyikan jika sudah terinstall atau pengguna menutup (7 hari).
 */
export function useInstallPrompt(): UseInstallPromptResult {
  const isClient = useIsClient();
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canNativePrompt, setCanNativePrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    setInstalled(isAppInstalled());
    setDismissed(isInstallBannerDismissed());
    setReady(true);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      setCanNativePrompt(true);
    };

    const onAppInstalled = () => {
      deferredPromptRef.current = null;
      setCanNativePrompt(false);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [isClient]);

  const isIosHint = isClient && isIosSafariInstallable() && !canNativePrompt;
  const showBanner =
    ready &&
    !installed &&
    !dismissed &&
    (canNativePrompt || isIosHint);

  const promptInstall = useCallback(async (): Promise<InstallPromptOutcome> => {
    const deferredPrompt = deferredPromptRef.current;
    if (!deferredPrompt) {
      return 'unavailable';
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    deferredPromptRef.current = null;
    setCanNativePrompt(false);

    if (outcome === 'accepted') {
      setInstalled(true);
    }

    return outcome;
  }, []);

  const dismissBanner = useCallback(() => {
    dismissInstallBanner();
    setDismissed(true);
  }, []);

  return {
    showBanner,
    canNativePrompt,
    isIosHint,
    promptInstall,
    dismissBanner,
  };
}
