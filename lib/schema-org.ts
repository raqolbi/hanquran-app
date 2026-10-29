import { SITE_URL } from '@/lib/site-url';

import type { SurahData } from '@/services/quran';

/**
 * Pembangun structured data JSON-LD (docs/35 §4 T6).
 * Fungsi murni — mudah diuji tanpa React/Next.
 */

export interface JsonLdObject {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: unknown;
}

/**
 * Serialisasi aman untuk `<script type="application/ld+json">`.
 *
 * `<` di-escape menjadi `\u003c` supaya nilai data tidak bisa menutup tag
 * script lebih awal (docs/35 §9 H6). `JSON.parse` tetap menerima hasilnya.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildWebSiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'HanQuran',
    url: `${SITE_URL}/`,
    inLanguage: 'id',
    description:
      "Aplikasi hafalan Al-Qur'an — audio per ayat, repeat, Mode Murotal, mode fokus, dan dukungan offline. Tanpa akun.",
  };
}

export function buildSurahBreadcrumbSchema(surah: SurahData): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `Surat ${surah.englishName}`,
        item: `${SITE_URL}/surah/${surah.number}`,
      },
    ],
  };
}

export function buildSurahPageSchema(surah: SurahData): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContentPage',
    name: `Surat ${surah.englishName}`,
    alternateName: surah.arabicName,
    url: `${SITE_URL}/surah/${surah.number}`,
    inLanguage: 'id',
    description: `Surat ke-${surah.number} dalam Al-Qur'an berjumlah ${surah.ayahCount} ayat.`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'HanQuran',
      url: `${SITE_URL}/`,
    },
    breadcrumb: buildSurahBreadcrumbSchema(surah) as unknown,
  };
}
