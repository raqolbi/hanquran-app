'use client';

import { useEffect, useState } from 'react';

import {
  dismissAppToast,
  getAppToast,
  subscribeAppToast,
  type AppToastPayload,
} from '@/lib/app-toast';

/**
 * Toast global ringan — dipakai untuk umpan balik offline audio (`docs/30` §4.2).
 */
export function AppToastHost() {
  const [toast, setToast] = useState<AppToastPayload | null>(() => getAppToast());

  useEffect(() => subscribeAppToast(() => setToast(getAppToast())), []);

  if (!toast) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] left-4 right-4 z-[60] mx-auto max-w-md"
    >
      <div className="pointer-events-auto rounded-xl border border-border bg-foreground px-4 py-3 text-sm leading-snug text-background shadow-lg">
        <p>{toast.message}</p>
        <button
          type="button"
          onClick={dismissAppToast}
          className="sr-only"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
