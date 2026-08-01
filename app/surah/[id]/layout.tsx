import type { ReactNode } from 'react';

import { generateSurahStaticParams } from '@/lib/surah-static-params';

export function generateStaticParams() {
  return generateSurahStaticParams();
}

export default function SurahIdLayout({ children }: { children: ReactNode }) {
  return children;
}
