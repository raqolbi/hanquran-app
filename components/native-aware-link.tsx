'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';

import { isNativePlatform } from '@/lib/platform';
import { toStaticExportHref } from '@/lib/routes';
import { stopPlaybackIfLeavingPlaybackContext } from '@/lib/stop-playback-on-leave';

type NativeAwareLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode;
};

/**
 * Di web/PWA: Next.js `<Link>` (client navigation).
 * Di Capacitor native: `<a>` hard navigation ke file `.html` static export
 * (Capacitor WebView tidak resolve path tanpa ekstensi).
 */
export function NativeAwareLink({
  href,
  children,
  onClick,
  ...rest
}: NativeAwareLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (typeof href === 'string') {
      stopPlaybackIfLeavingPlaybackContext(href);
    }
    onClick?.(event);
  };

  if (isNativePlatform() && typeof href === 'string') {
    const {
      replace: _replace,
      scroll: _scroll,
      prefetch: _prefetch,
      locale: _locale,
      ...anchorProps
    } = rest;

    return (
      <a
        href={toStaticExportHref(href)}
        {...anchorProps}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...rest} onClick={handleClick}>
      {children}
    </Link>
  );
}
