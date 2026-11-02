import packageJson from '../package.json';

/** Nama tampilan aplikasi — satu sumber untuk UI About & metadata. */
export const APP_NAME = 'HanQuran';

/** URL repository GitHub resmi. */
export const APP_REPOSITORY_URL = 'https://github.com/raqolbi/hanquran-app';

/**
 * Penanda "sembunyikan" untuk env tautan pembuat. Nilai kosong (`NAMA=`)
 * atau `-` (bila dashboard hosting tidak menerima nilai kosong).
 */
function isHiddenValue(value: string): boolean {
  return value === '' || value === '-';
}

/**
 * Ambil URL publik dari env build.
 *
 * - env **tidak dipasang** (`undefined`) → `fallback` (nilai bawaan).
 * - env **dikosongkan** (`""` atau `-`) → `''` = elemen disembunyikan.
 * - Hanya `https://` yang diterima agar `javascript:`/salah ketik tidak
 *   pernah masuk ke `href`; nilai tidak valid → `''` (disembunyikan) +
 *   peringatan saat build.
 *
 * Catatan: `process.env.NEXT_PUBLIC_*` harus ditulis literal di pemanggil
 * agar Next.js meng-inline nilainya ke bundle klien (termasuk build Android).
 */
export function resolvePublicUrl(
  raw: string | undefined,
  fallback: string,
): string {
  if (raw === undefined) {
    return fallback;
  }

  const value = raw.trim();
  if (isHiddenValue(value)) {
    return '';
  }

  try {
    if (new URL(value).protocol === 'https:') {
      return value;
    }
  } catch {
    // jatuh ke peringatan di bawah
  }

  console.warn(
    `[HanQuran] URL env tidak valid (harus https://), tautan disembunyikan: ${value}`,
  );
  return '';
}

/** Sama seperti `resolvePublicUrl` untuk teks: tidak dipasang → bawaan, dikosongkan → `''`. */
export function resolvePublicText(
  raw: string | undefined,
  fallback: string,
): string {
  if (raw === undefined) {
    return fallback;
  }

  const value = raw.trim();
  return isHiddenValue(value) ? '' : value;
}

/**
 * Kredit pembuat & organisasi. Bisa diganti lewat env saat build
 * (lihat `.env.example`) — dipakai Gerbang Threads dan footer Beranda.
 * Nilai `''` berarti elemen terkait TIDAK dirender:
 * - `APP_AUTHOR_THREADS_URL` kosong → tautan Threads footer & Gerbang Threads hilang.
 * - `APP_AUTHOR_X_URL` kosong → tautan X footer hilang.
 * - `APP_AUTHOR_NAME` kosong → baris "Dibuat oleh" hilang.
 * - `QOLCORE_URL` kosong → baris organisasi hilang.
 */
export const APP_AUTHOR_NAME = resolvePublicText(
  process.env.NEXT_PUBLIC_AUTHOR_NAME,
  'CenyBug',
);
export const APP_AUTHOR_THREADS_URL = resolvePublicUrl(
  process.env.NEXT_PUBLIC_AUTHOR_THREADS_URL,
  'https://www.threads.com/@qolcore',
);
export const APP_AUTHOR_X_URL = resolvePublicUrl(
  process.env.NEXT_PUBLIC_AUTHOR_X_URL,
  'https://x.com/cenybug',
);

/**
 * Handle Threads untuk teks gerbang (`@nama`), diambil dari path URL
 * Threads. Bila URL tidak berbentuk `/@nama`, pakai nama pembuat; bila
 * nama juga kosong, pakai "HanQuran".
 */
export function deriveThreadsHandle(url: string, fallback: string): string {
  try {
    const segment = new URL(url).pathname.split('/').find(Boolean) ?? '';
    if (/^@[\w.]+$/.test(segment)) {
      return segment;
    }
  } catch {
    // URL kosong/tidak valid
  }
  return fallback || 'HanQuran';
}

export const APP_AUTHOR_THREADS_HANDLE = deriveThreadsHandle(
  APP_AUTHOR_THREADS_URL,
  APP_AUTHOR_NAME,
);
export const QOLCORE_URL = resolvePublicUrl(
  process.env.NEXT_PUBLIC_ORGANIZATION_URL,
  'https://qolcore.com',
);

const LICENSE_FILE = 'LICENSE';
const COMMERCIAL_LICENSE_FILE = 'COMMERCIAL-LICENSE.md';

/** Kunci prinsip filosofi — label di `about.mission.principles.*`. */
export const ABOUT_PHILOSOPHY_PRINCIPLE_KEYS = [
  'memorizationFirst',
  'mobileFirst',
  'offlineFirst',
  'simplicityFirst',
] as const;

/** Kunci item fokus aplikasi — label di `about.mission.focusItems.*`. */
export const ABOUT_FOCUS_ITEM_KEYS = [
  'repeat',
  'audio',
  'focusMode',
  'murotal',
  'mediaSession',
  'continueReading',
  'offline',
  'preferences',
] as const;

export type AboutPhilosophyPrincipleKey =
  (typeof ABOUT_PHILOSOPHY_PRINCIPLE_KEYS)[number];

export type AboutFocusItemKey = (typeof ABOUT_FOCUS_ITEM_KEYS)[number];

/** Versi aplikasi dari package.json — hindari duplikasi string versi. */
export function getAppVersion(): string {
  return packageJson.version;
}

export function getRepositoryLicenseUrl(): string {
  return `${APP_REPOSITORY_URL}/blob/main/${LICENSE_FILE}`;
}

export function getRepositoryCommercialLicenseUrl(): string {
  return `${APP_REPOSITORY_URL}/blob/main/${COMMERCIAL_LICENSE_FILE}`;
}
