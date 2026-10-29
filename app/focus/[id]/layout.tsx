import type { Metadata, ReactNode } from 'next';

import { generateSurahStaticParams } from '@/lib/surah-static-params';

// Mode fokus menduplikasi konten Surah Detail — tidak untuk diindeks
// (docs/35 §3, §4 T7). Sitemap juga tidak mencantumkannya.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export function generateStaticParams() {
  return generateSurahStaticParams();
}

export default function FocusIdLayout({ children }: { children: ReactNode }) {
  return children;
}
