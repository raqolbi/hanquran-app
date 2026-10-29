'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { parseAyahParam } from '@/lib/ayah-param';

interface StartAyahSyncProps {
  /** Dipanggil setiap query berubah (termasuk saat mount/hidrasi). */
  onChange: (ayah: number) => void;
}

/**
 * Sinkronisasi `?ayah` → ayat aktif (docs/35 §9 H1).
 *
 * `useSearchParams` men-suspend prerender, jadi komponen ini adalah leaf
 * kecil yang dirender di dalam `<Suspense fallback={null}>`. Konten surat di
 * luar boundary tetap di-SSR penuh; reaktivitas back/forward kembali normal.
 */
export function StartAyahSync({ onChange }: StartAyahSyncProps) {
  const searchParams = useSearchParams();

  // Bergantung pada identitas `searchParams` (bukan string-nya) agar
  // navigasi ke URL yang sama tetap memicu sinkronisasi.
  useEffect(() => {
    onChange(parseAyahParam(searchParams.get('ayah')));
  }, [onChange, searchParams]);

  return null;
}
