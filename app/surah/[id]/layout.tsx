import type { ReactNode } from 'react';

import { generateSurahStaticParams } from '@/lib/surah-static-params';

export function generateStaticParams() {
  return generateSurahStaticParams();
}

// Id di luar 1..114 → 404 sungguhan (bukan soft-404 dari fallback statis).
export const dynamicParams = false;

export default function SurahIdLayout({ children }: { children: ReactNode }) {
  return children;
}
