/**
 * Deteksi target platform HanQuran (web/PWA vs Capacitor native).
 *
 * Aturan (docs/32 §3.4):
 * - Build default tanpa HANQURAN_TARGET = perilaku PWA/Vercel sekarang
 * - Cabang Android hanya aktif via build-time env atau runtime Capacitor
 */

import { Capacitor } from '@capacitor/core';

export const HANQURAN_TARGET_ANDROID = 'android';

/**
 * True saat bundle dibangun untuk Android.
 * Harus memakai NEXT_PUBLIC_* agar ter-inline di Client Components.
 */
export function isAndroidBuild(): boolean {
  return (
    process.env.NEXT_PUBLIC_HANQURAN_TARGET === HANQURAN_TARGET_ANDROID ||
    process.env.HANQURAN_TARGET === HANQURAN_TARGET_ANDROID
  );
}

/**
 * True di dalam Capacitor WebView (APK/iOS). Aman dipanggil di SSR:
 * mengembalikan false jika tidak di browser native.
 */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** True untuk jalur web/PWA (bukan native Capacitor). */
export function isWebPlatform(): boolean {
  return !isNativePlatform();
}
