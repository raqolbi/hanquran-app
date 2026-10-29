import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/json-ld';
import SurahDetailClient from '@/components/surah-detail-client';
import { buildSurahBreadcrumbSchema, buildSurahPageSchema } from '@/lib/schema-org';
import { readSurahForServer } from '@/services/quran/server-surah';

// Server component (docs/35 §4 T1) — konten ayat + metadata per surat
// di-SSG saat build; interaksi audio/repeat di `SurahDetailClient`.

interface SurahDetailPageProps {
  params: Promise<{ id: string }>;
}

function parseValidSurahId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  return parsed >= 1 && parsed <= 114 ? parsed : null;
}

export async function generateMetadata(
  { params }: SurahDetailPageProps,
): Promise<Metadata> {
  const { id } = await params;
  const surahNumber = parseValidSurahId(id);
  if (!surahNumber) {
    return {};
  }

  const surah = await readSurahForServer(surahNumber);
  if (!surah) {
    return {};
  }

  const title = `Surat ${surah.englishName} (${surah.ayahCount} Ayat)`;
  const description =
    `Surat ke-${surah.number} dalam Al-Qur'an berjumlah ${surah.ayahCount} ayat. ` +
    'Baca teks Arab, transliterasi, dan terjemahan per ayat, dengarkan murotal, ' +
    'serta gunakan mode repeat untuk hafalan.';

  return {
    // Template title root menambahkan ` | HanQuran` (docs/35 §4 T4).
    title,
    description,
    alternates: { canonical: `/surah/${surah.number}` },
    openGraph: {
      type: 'article',
      url: `/surah/${surah.number}`,
      title,
      description,
      images: ['/og/og-default.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og/og-default.png'],
    },
  };
}

export default async function SurahDetailPage({ params }: SurahDetailPageProps) {
  const { id } = await params;
  const surahNumber = parseValidSurahId(id);
  if (!surahNumber) {
    notFound();
  }

  // Seed konten untuk SSR/SSG — klien tetap validasi ulang via `useSurah`.
  const initialSurah = await readSurahForServer(surahNumber!);
  if (!initialSurah) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildSurahPageSchema(initialSurah)} />
      <JsonLd data={buildSurahBreadcrumbSchema(initialSurah)} />
      <SurahDetailClient initialSurah={initialSurah} />
    </>
  );
}
