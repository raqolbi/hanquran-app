/**
 * Intent pemutaran otomatis setelah navigasi lintas surat (Mode Murotal).
 * Modul-level — tidak dipersist; hanya hidup antar replace route.
 */

let pending: { surahId: number; ayahNumber: number } | null = null;

export function setPendingMurotalPlay(
  surahId: number,
  ayahNumber: number,
): void {
  pending = { surahId, ayahNumber };
}

export function consumePendingMurotalPlay(surahId: number): number | null {
  if (pending?.surahId !== surahId) {
    return null;
  }

  const ayahNumber = pending.ayahNumber;
  pending = null;
  return ayahNumber;
}

/** Hanya untuk pengujian. */
export function clearPendingMurotalPlayForTests(): void {
  pending = null;
}
