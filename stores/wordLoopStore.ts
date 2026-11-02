/**
 * useWordLoopStore — state runtime Ulang Kata (docs/38 §4.5).
 *
 * Store terpisah dari `useRepeatStore` karena siklus hidupnya berbeda:
 * tidak dipersist, tidak disinkronkan lintas tab, dan berakhir begitu
 * pengguna pindah ayat/halaman (keputusan P15-2, `docs/15` Bagian 12).
 * Mesin pemutarnya ada di `services/word-loop-engine.ts`.
 */

import { create } from 'zustand';

import type { WordRange } from '@/services/quran/word-timings';

/**
 * - `playing` — potongan sedang diputar
 * - `gap` — jeda menirukan di antara pengulangan
 * - `paused` — dijeda pengguna (mode tetap aktif)
 */
export type WordLoopPhase = 'playing' | 'gap' | 'paused';

export interface WordLoopState {
  surahId: number;
  ayahNumber: number;
  reciterId: string;
  /** Rentang yang terdengar (sudah diperluas ke segmen gabungan). */
  range: WordRange;
  clip: { startMs: number; endMs: number };
  /** Jumlah pengulangan yang sudah selesai. */
  cycles: number;
  phase: WordLoopPhase;
}

interface WordLoopStore {
  loop: WordLoopState | null;
  set: (loop: WordLoopState | null) => void;
  patch: (patch: Partial<WordLoopState>) => void;
}

export const useWordLoopStore = create<WordLoopStore>()((set) => ({
  loop: null,
  set: (loop) => set({ loop }),
  patch: (patch) =>
    set((state) => (state.loop ? { loop: { ...state.loop, ...patch } } : state)),
}));

/** Ulang kata sedang aktif (dipakai untuk menangguhkan Repeat & Murotal). */
export function isWordLoopActive(): boolean {
  return useWordLoopStore.getState().loop !== null;
}
