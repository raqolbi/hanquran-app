/**
 * Precache konten surat (JSON + shell halaman) saat unduhan offline selesai.
 * Audio di-cache terpisah oleh DownloadManager / Service Worker.
 */

import { routes } from '@/lib/routes';
import { db } from '@/services/db/db';
import { formatSurahId, surahPath, translationPath } from '@/services/quran/paths';

const SHELL_CACHE_NAME = 'hanquran-shell-v1';

const SUPPORTED_TRANSLATION_LANGS = ['id', 'en'] as const;

/** URL dataset statis yang dibutuhkan halaman Surah Detail offline. */
export function buildSurahOfflineDataUrls(surahId: number): string[] {
  return [
    surahPath(surahId),
    ...SUPPORTED_TRANSLATION_LANGS.map((lang) =>
      translationPath(surahId, lang),
    ),
  ];
}

/** URL navigasi yang perlu ada di shell cache agar buka surat offline berhasil. */
export function buildSurahOfflineRouteUrls(surahId: number): string[] {
  return [routes.surah(surahId), routes.focus(surahId)];
}

async function fetchSameOrigin(url: string, init?: RequestInit): Promise<void> {
  try {
    await fetch(url, { credentials: 'same-origin', ...init });
  } catch {
    // Precache best-effort — kegagalan tidak membatalkan unduhan audio.
  }
}

/**
 * Muat data surat + shell halaman ke Cache Storage (via Service Worker).
 * Panggil saat pengguna masih online, setelah audio surat selesai diunduh.
 */
export async function precacheSurahForOffline(surahId: number): Promise<void> {
  const dataUrls = buildSurahOfflineDataUrls(surahId);
  const routeUrls = buildSurahOfflineRouteUrls(surahId);

  await Promise.all([
    ...dataUrls.map((url) => fetchSameOrigin(url)),
    ...routeUrls.map((url) =>
      fetchSameOrigin(url, {
        headers: { Accept: 'text/html,application/xhtml+xml' },
      }),
    ),
  ]);

  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({
      type: 'cache-surah-offline',
      surahId,
      dataUrls,
      routeUrls,
    });
  } catch {
    // SW belum siap — fetch di atas sudah cukup jika SW aktif.
  }
}

/** Label manifest untuk logging / debug. */
export function formatSurahOfflineLabel(surahId: number): string {
  return formatSurahId(surahId);
}

async function isSurahShellCached(surahId: number): Promise<boolean> {
  if (typeof caches === 'undefined' || typeof location === 'undefined') {
    return true;
  }

  const cache = await caches.open(SHELL_CACHE_NAME);
  const request = new Request(
    new URL(routes.surah(surahId), location.origin).toString(),
    { headers: { Accept: 'text/html,application/xhtml+xml' } },
  );
  return Boolean(await cache.match(request));
}

/**
 * Perbaiki cache konten surat yang sudah pernah diunduh sebelum precache ada.
 * Hanya berjalan saat online dan shell surat belum ada di Cache Storage.
 */
export async function repairOfflineSurahCachesIfNeeded(): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.onLine) {
    return;
  }

  const ready = await db.downloadManifest.where('status').equals('ready').toArray();
  const surahIds = [...new Set(ready.map((record) => record.surahId))];

  for (const surahId of surahIds) {
    if (!(await isSurahShellCached(surahId))) {
      await precacheSurahForOffline(surahId);
    }
  }
}
