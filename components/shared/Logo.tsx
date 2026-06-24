import Image from 'next/image';

import { cn } from '@/lib/utils';

const LOGO_INTRINSIC_WIDTH = 1536;
const LOGO_INTRINSIC_HEIGHT = 1024;

interface LogoProps {
  /** Tinggi logo dalam piksel. Minimum 24 (sesuai logo-guidelines.md). */
  size?: number;
  /** Class tambahan untuk wrapper Image. */
  className?: string;
  /** Set true untuk preload (mis. saat dipakai pada header utama). */
  priority?: boolean;
  /** Override alt text. Default mengikuti varian. */
  alt?: string;
}

/**
 * Varian icon-only (Letter H + Mushaf + Light Star).
 * Digunakan pada favicon, header kompak, dan area kecil.
 */
export function Logo({
  size = 40,
  className,
  priority = false,
  alt = 'HanQuran',
}: LogoProps) {
  return (
    <Image
      src="/branding/logo.png"
      alt={alt}
      width={LOGO_INTRINSIC_WIDTH}
      height={LOGO_INTRINSIC_HEIGHT}
      priority={priority}
      style={{ height: size, width: 'auto' }}
      className={cn('select-none', className)}
    />
  );
}

/**
 * Varian Icon + Wordmark.
 * Digunakan pada landing, splash, dan layar dengan ruang lebih luas.
 */
export function LogoWithText({
  size = 56,
  className,
  priority = false,
  alt = 'HanQuran — Read, Listen, Memorize.',
}: LogoProps) {
  return (
    <Image
      src="/branding/logo-with-text.png"
      alt={alt}
      width={LOGO_INTRINSIC_WIDTH}
      height={LOGO_INTRINSIC_HEIGHT}
      priority={priority}
      style={{ height: size, width: 'auto' }}
      className={cn('select-none', className)}
    />
  );
}
