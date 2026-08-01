/**
 * Intent pemutaran otomatis setelah navigasi lintas surat (Mode Murotal).
 *
 * Di PWA (soft nav) cukup state modul. Di Capacitor, `replaceApp` memakai
 * hard navigation (`location.replace`) yang menghapus heap JS — jadi intent
 * juga ditulis ke sessionStorage (docs/32 / docs/29).
 */

const STORAGE_KEY = 'hanquran:murotal-pending-play';

let pending: { surahId: number; ayahNumber: number } | null = null;

function readStorage(): { surahId: number; ayahNumber: number } | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      surahId?: unknown;
      ayahNumber?: unknown;
    };
    if (
      typeof parsed.surahId !== 'number' ||
      typeof parsed.ayahNumber !== 'number'
    ) {
      return null;
    }
    return { surahId: parsed.surahId, ayahNumber: parsed.ayahNumber };
  } catch {
    return null;
  }
}

function writeStorage(value: { surahId: number; ayahNumber: number } | null): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    if (!value) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private mode / quota — state modul tetap dicoba.
  }
}

export function setPendingMurotalPlay(
  surahId: number,
  ayahNumber: number,
): void {
  pending = { surahId, ayahNumber };
  writeStorage(pending);
}

export function clearPendingMurotalPlay(): void {
  pending = null;
  writeStorage(null);
}

/**
 * Generasi navigasi lintas surat. Dinaikkan saat user keluar konteks putar
 * agar async `ensureAyahPlayable` + `replaceApp` yang masih jalan tidak
 * menarik pengguna kembali.
 */
let crossSurahGeneration = 0;

export function beginCrossSurahNavigation(): number {
  crossSurahGeneration += 1;
  return crossSurahGeneration;
}

export function isCrossSurahNavigationCurrent(token: number): boolean {
  return token === crossSurahGeneration;
}

export function cancelCrossSurahNavigation(): void {
  crossSurahGeneration += 1;
  clearPendingMurotalPlay();
}

export function consumePendingMurotalPlay(surahId: number): number | null {
  const fromMemory = pending;
  const fromStorage = readStorage();
  const resolved =
    fromMemory?.surahId === surahId
      ? fromMemory
      : fromStorage?.surahId === surahId
        ? fromStorage
        : null;

  if (!resolved) {
    return null;
  }

  pending = null;
  writeStorage(null);
  return resolved.ayahNumber;
}

/** Hanya untuk pengujian. */
export function clearPendingMurotalPlayForTests(): void {
  clearPendingMurotalPlay();
  crossSurahGeneration = 0;
}
