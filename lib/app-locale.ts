import { detectAppLocale } from '@/i18n/detection';
import type { AppLocale } from '@/types';

/**
 * Cache locale untuk **paint pertama** (docs/21 §6.1, F8).
 *
 * `settings.appLocale` tetap sumber kebenaran di Dexie, tetapi Dexie baru
 * selesai dibaca setelah hidrasi. Cache sinkron ini dipakai skrip inline
 * pra-paint agar CSS dapat menampilkan konten locale yang benar sebelum
 * React sempat membaca Dexie.
 */
export const APP_LOCALE_STORAGE_KEY = 'hanquran:app-locale';

/**
 * Penanda locale aktif di `<html>`. Dipakai CSS untuk memilih teks
 * bilingual yang dirender server (lihat `components/shared/locale-text.tsx`).
 */
export const APP_LOCALE_ATTRIBUTE = 'data-app-locale';

export function isAppLocale(value: unknown): value is AppLocale {
  return value === 'id' || value === 'en';
}

/** Baca cache locale; `null` bila belum ada / rusak / SSR. */
export function readCachedAppLocale(): AppLocale | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(APP_LOCALE_STORAGE_KEY);
    return isAppLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Simpan locale terakhir agar paint berikutnya tidak menunggu Dexie. */
export function writeCachedAppLocale(locale: AppLocale): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, locale);
  } catch {
    // Mode privat / storage penuh — abaikan, fallback ke id.
  }
}

/** Locale untuk paint pertama: cache → deteksi browser → `id`. */
export function resolveInitialAppLocale(): AppLocale {
  return readCachedAppLocale() ?? detectAppLocale();
}

/**
 * Skrip inline di `<head>`: set `<html lang>` + `data-app-locale` sebelum
 * paint. Aturan deteksi harus sama dengan `detectAppLocale()`.
 * Hanya membaca `localStorage`; tidak menulis.
 */
export function buildAppLocaleInitScript(): string {
  const key = JSON.stringify(APP_LOCALE_STORAGE_KEY);

  const attribute = JSON.stringify(APP_LOCALE_ATTRIBUTE);

  return `(function(){try{var k=${key},v=null;try{v=window.localStorage.getItem(k)}catch(e){}if(v!=="id"&&v!=="en"){v="en";try{var n=window.navigator,l=n&&(n.languages||[n.language]);if(l){for(var i=0;i<l.length;i++){if(l[i]&&String(l[i]).toLowerCase().indexOf("id")===0){v="id";break}}}if(v!=="id"){var z=Intl.DateTimeFormat().resolvedOptions().timeZone;if(z==="Asia/Jakarta"||z==="Asia/Makassar"||z==="Asia/Jayapura"){v="id"}}}catch(e){}}var d=document.documentElement;d.setAttribute(${attribute},v);d.lang=v}catch(e){}})();`;
}
