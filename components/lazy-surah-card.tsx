'use client';

import { useEffect, useRef, useState } from 'react';

import { SurahCard, type SurahCardProps } from '@/components/surah-card';

/** Perkiraan tinggi kartu — menjaga layout stabil sebelum konten dimuat. */
const CARD_MIN_HEIGHT = '7.5rem';

/** Jarak prefetch sebelum kartu masuk viewport. */
const VIEWPORT_ROOT_MARGIN = '240px 0px';

export function LazySurahCard(props: SurahCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || isVisible) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: VIEWPORT_ROOT_MARGIN, threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ minHeight: CARD_MIN_HEIGHT }}
    >
      {isVisible ? (
        <SurahCard {...props} />
      ) : (
        <div
          aria-hidden
          className="h-[7.5rem] rounded-xl border border-border bg-muted/40"
        />
      )}
    </div>
  );
}
