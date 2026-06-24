'use client';

import { useSyncExternalStore } from 'react';

/** `true` hanya setelah mount klien — aman untuk menghindari hydration mismatch. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
