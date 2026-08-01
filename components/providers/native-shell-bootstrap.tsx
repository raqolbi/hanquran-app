'use client';

import { useEffect } from 'react';

import { initNativeShell } from '@/lib/native-shell';

/**
 * Mengaktifkan StatusBar / Splash / Back hanya di Capacitor native.
 * Di web: no-op.
 */
export function NativeShellBootstrap() {
  useEffect(() => {
    void initNativeShell();
  }, []);

  return null;
}
