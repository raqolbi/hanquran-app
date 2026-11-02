'use client';

import { useSyncExternalStore } from 'react';

/**
 * Petunjuk sekali tampil (onboarding ringan). Disimpan di localStorage per
 * perangkat — kemudahan tampilan saja; bila storage diblokir, petunjuk
 * dianggap sudah dilihat agar tidak muncul terus-menerus.
 */
export type HintKey = 'word-loop' | 'word-loop-stop';

const STORAGE_PREFIX = 'hanquran:hint-seen:';
const listeners = new Set<() => void>();
/** Cadangan di memori bila localStorage tidak bisa ditulis. */
const memorySeen = new Set<HintKey>();

export function isHintSeen(key: HintKey): boolean {
  if (memorySeen.has(key)) return true;
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + key) === '1';
  } catch {
    return true;
  }
}

export function markHintSeen(key: HintKey): void {
  if (isHintSeen(key)) return;
  memorySeen.add(key);
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, '1');
  } catch {
    // cukup di memori untuk sesi ini
  }
  listeners.forEach((listener) => listener());
}

/** Hanya untuk test. */
export function resetHintsForTest(): void {
  memorySeen.clear();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** `true` di server & sebelum hidrasi → petunjuk tidak pernah ikut SSR. */
export function useHintSeen(key: HintKey): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isHintSeen(key),
    () => true,
  );
}
