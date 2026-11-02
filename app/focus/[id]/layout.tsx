import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { generateSurahStaticParams } from '@/lib/surah-static-params';
import { readSurahForServer } from '@/services/quran/server-surah';

// Mode fokus menduplikasi konten Surah Detail — tidak untuk diindeks
// (docs/35 §3, §4 T7). Sitemap juga tidak mencantumkannya.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const number = Number.parseInt(id, 10);
  const surah =
    number >= 1 && number <= 114 ? await readSurahForServer(number) : null;
  return {
    // Template title root menambahkan ` | HanQuran`.
    title: surah ? `Mode Fokus — ${surah.englishName}` : 'Mode Fokus',
    robots: { index: false, follow: true },
  };
}

export function generateStaticParams() {
  return generateSurahStaticParams();
}

// Id di luar 1..114 → 404 sungguhan, bukan soft-404 dari fallback statis
// (docs/35 §9 H8). Halaman fokus tetap `noindex`.
export const dynamicParams = false;

export default function FocusIdLayout({ children }: { children: ReactNode }) {
  return children;
}
