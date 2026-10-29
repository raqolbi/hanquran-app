import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site-url';

// Wajib untuk mode export Android (`output: 'export'`, docs/32) — route
// metadata diproses saat build tanpa runtime data fetch.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Mode fokus & settings tidak bernilai cari — fokus duplikat konten
        // surah (docs/35 §2). Tetap dilayani, hanya tidak diindeks.
        disallow: ['/focus', '/settings'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
