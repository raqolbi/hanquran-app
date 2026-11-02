import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Tentang HanQuran',
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
