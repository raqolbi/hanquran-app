import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  // Sudah memuat nama aplikasi — tanpa akhiran template.
  title: { absolute: 'Tentang HanQuran' },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
