'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { initNativeShell } from '@/lib/native-shell';
import { syncStatusBarIcons } from '@/lib/status-bar-style';

/**
 * Mengaktifkan StatusBar / Splash / Back hanya di Capacitor native.
 * Warna ikon status bar disesuaikan tiap halaman (edge-to-edge Android 15+).
 * Di web: no-op.
 */
export function NativeShellBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    void initNativeShell();
  }, []);

  useEffect(() => {
    const sync = () => void syncStatusBarIcons(window.location.pathname);
    sync();
    // Inset dari Capacitor bisa terisi setelah muat / berubah saat rotasi.
    const timer = window.setTimeout(sync, 500);
    window.addEventListener('resize', sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', sync);
    };
  }, [pathname]);

  return null;
}
