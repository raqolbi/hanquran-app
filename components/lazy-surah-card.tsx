'use client';

import { SurahCard, type SurahCardProps } from '@/components/surah-card';

/**
 * Kartu surat dengan `content-visibility: auto`.
 *
 * Berbeda dari versi lama (placeholder sampai IntersectionObserver), kartu
 * kini selalu ada di HTML agar daftar surat ikut ter-SSR (docs/36 §3).
 * Browser melewati render/paint kartu di luar viewport; `contain-intrinsic-size`
 * menjaga tinggi perkiraan agar scrollbar tidak melompat.
 */
const CARD_INTRINSIC_SIZE = 'auto 7.5rem';

export function LazySurahCard(props: SurahCardProps) {
  return (
    <div
      className="relative"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: CARD_INTRINSIC_SIZE,
      }}
    >
      <SurahCard {...props} />
    </div>
  );
}
