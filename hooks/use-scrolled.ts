'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

/**
 * `true` bila halaman sudah digulir lebih dari `threshold` px.
 * Dipakai header subhalaman: bayangan baru muncul saat konten lewat di bawahnya,
 * jadi header terasa menyatu dengan halaman saat di atas (`docs/09`).
 */
export function useScrolled(threshold = 4): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false,
  );
}
