/**
 * Precache seluruh konten baca (dataset teks + shell semua route) agar setiap
 * surat dapat dibuka & dibaca offline tanpa perlu diunduh lebih dulu.
 *
 * Audio TETAP opt-in (lihat `services/offline-surah-precache.ts`).
 * Spesifikasi: `docs/30-offline-behavior-spec.md` §3 & §6.
 */

import { routes } from '@/lib/routes';
import { manifestPath, surahPath, translationPath } from '@/services/quran/paths';

const TOTAL_SURAHS = 114;
const SUPPORTED_TRANSLATION_LANGS = ['id', 'en'] as const;
const PRECACHE_FLAG_PREFIX = 'hanquran:offline-precache:';
const BATCH_DONE_TIMEOUT_MS = 60_000;

/** Semua URL dataset statis yang dibutuhkan untuk membaca seluruh Qur'an. */
export function buildAllDatasetUrls(totalSurahs = TOTAL_SURAHS): string[] {
  const urls: string[] = [manifestPath()];

  for (let surahId = 1; surahId <= totalSurahs; surahId += 1) {
    urls.push(surahPath(surahId));
    for (const lang of SUPPORTED_TRANSLATION_LANGS) {
      urls.push(translationPath(surahId, lang));
    }
  }

  return urls;
}

/** Semua route shell (home, settings, about, surah, focus) untuk navigasi offline. */
export function buildAllRouteUrls(totalSurahs = TOTAL_SURAHS): string[] {
  const urls: string[] = [
    routes.home(),
    routes.settings(),
    routes.settingsAbout(),
  ];

  for (let surahId = 1; surahId <= totalSurahs; surahId += 1) {
    urls.push(routes.surah(surahId));
    urls.push(routes.focus(surahId));
  }

  return urls;
}

function precacheFlagKey(version: string): string {
  return `${PRECACHE_FLAG_PREFIX}${version}`;
}

function hasPrecacheCompleted(version: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(precacheFlagKey(version)) === 'done';
  } catch {
    return false;
  }
}

function markPrecacheCompleted(version: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(precacheFlagKey(version), 'done');
  } catch {
    // Abaikan — storage penuh / mode privat.
  }
}

async function readDatasetVersion(): Promise<string> {
  try {
    const response = await fetch(manifestPath(), { credentials: 'same-origin' });
    if (response.ok) {
      const manifest = (await response.json()) as { version?: string };
      if (manifest.version) return manifest.version;
    }
  } catch {
    // Fallback ke versi default di bawah.
  }
  return 'v0';
}

/**
 * Jalankan precache penuh sekali per versi dataset, hanya saat online & SW aktif.
 * Aman dipanggil berulang — keluar lebih awal jika sudah selesai / offline.
 */
export async function precacheAppForOffline(): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.onLine) return;
  if (!('serviceWorker' in navigator)) return;

  const version = await readDatasetVersion();
  if (hasPrecacheCompleted(version)) return;

  let registration: ServiceWorkerRegistration;
  try {
    registration = await navigator.serviceWorker.ready;
  } catch {
    return;
  }

  const worker = registration.active;
  if (!worker) return;

  const requestId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `precache-${Date.now()}`;

  const dataUrls = buildAllDatasetUrls();
  const routeUrls = buildAllRouteUrls();

  const done = new Promise<boolean>((resolve) => {
    const onMessage = (event: MessageEvent) => {
      const payload = event.data as { type?: string; requestId?: string } | null;
      if (
        payload?.type === 'cache-offline-batch-done' &&
        payload.requestId === requestId
      ) {
        navigator.serviceWorker.removeEventListener('message', onMessage);
        resolve(true);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
      resolve(false);
    }, BATCH_DONE_TIMEOUT_MS);
  });

  worker.postMessage({
    type: 'cache-offline-batch',
    requestId,
    dataUrls,
    routeUrls,
  });

  if (await done) {
    markPrecacheCompleted(version);
  }
}
