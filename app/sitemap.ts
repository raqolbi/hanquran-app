import type { MetadataRoute } from 'next';

import { generateSurahStaticParams } from '@/lib/surah-static-params';
import { SITE_URL } from '@/lib/site-url';

// Wajib untuk mode export Android (`output: 'export'`, docs/32) — route
// metadata diproses saat build tanpa runtime data fetch.
export const dynamic = 'force-static';

// Sitemap dievaluasi saat build (prerender) sehingga `lastModified` mencerminkan
// tanggal build terakhir. Dataset berubah → `npm run build` dijalankan lagi
// → lastmod ikut naik. `/focus` & `/settings` sengaja tidak didaftarkan
// (noindex, docs/35 §3). Tanpa `changeFrequency`/`priority` — Google
// mengabaikannya (docs/35 §4 T3).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
    },
    ...generateSurahStaticParams().map(({ id }) => ({
      url: `${SITE_URL}/surah/${id}`,
      lastModified,
    })),
  ];
}
