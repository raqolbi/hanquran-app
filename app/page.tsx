import type { Metadata } from 'next';

import { HomeClient } from '@/components/home-client';
import { readSurahListForServer } from '@/services/quran/server-surah';

// Beranda di-SSG (docs/36 §3): daftar 114 surat ikut di HTML awal agar
// crawler & pengguna langsung melihat konten, bukan spinner.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function Home() {
  const surahs = await readSurahListForServer('id');

  return <HomeClient initialSurahs={surahs} />;
}
