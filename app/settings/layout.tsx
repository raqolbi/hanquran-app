import type { Metadata, ReactNode } from 'react';

// Halaman settings tidak bernilai cari — tidak untuk diindeks
// (docs/35 §3, §4 T7). Sitemap juga tidak mencantumkannya.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
