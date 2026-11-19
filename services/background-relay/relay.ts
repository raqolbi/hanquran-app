/**
 * Estafet latar (relay) untuk Mode Murotal lintas surat di APK.
 *
 * Mengapa: di APK, pindah surat = memuat halaman `.html` baru. Saat layar mati
 * atau aplikasi di latar, halaman baru itu tidak selesai hydrate sampai layar
 * menyala lagi, sehingga Mode Murotal berhenti di awal surat berikutnya.
 * Selama halaman tersembunyi, halaman lama tetap memutar ayat-ayat berikutnya
 * ("estafet"), lalu pindah ke halaman yang benar saat layar menyala
 * (`docs/32` §10.1, catatan lintas surat saat layar mati).
 */

import { getSurahAyahCount } from "@/lib/surah-ayah-counts";
import { resolveMurotalAfterAyahEnd } from "@/services/murotal-resolver";

export interface RelayPosition {
  surahId: number;
  ayah: number;
}

let relay: RelayPosition | null = null;

/** Posisi estafet yang sedang berjalan, atau `null`. */
export function getRelay(): RelayPosition | null {
  return relay;
}

export function setRelay(position: RelayPosition | null): void {
  relay = position;
}

/** Estafet hanya dipakai di APK saat halaman tidak terlihat. */
export function shouldRelay(
  isNative: boolean,
  visibility: DocumentVisibilityState
): boolean {
  return isNative && visibility === "hidden";
}

export type RelayStep =
  | { type: "play"; surahId: number; ayah: number }
  | { type: "stop"; quranComplete: boolean };

/**
 * Langkah setelah ayat estafet selesai: mengikuti Mode Murotal
 * (pengulangan tidak dipakai di estafet, sama dengan autoplay lintas surat).
 */
export function relayStepAfterAyah(input: {
  position: RelayPosition;
  murotalEnabled: boolean;
}): RelayStep {
  const { position, murotalEnabled } = input;
  if (!murotalEnabled) return { type: "stop", quranComplete: false };
  const next = resolveMurotalAfterAyahEnd({
    surahId: position.surahId,
    currentAyah: position.ayah,
    totalAyahs: getSurahAyahCount(position.surahId),
  });
  if (next.type === "advance_ayah") {
    return { type: "play", surahId: position.surahId, ayah: next.ayahNumber };
  }
  if (next.type === "advance_surah") {
    return { type: "play", surahId: next.surahId, ayah: next.ayahNumber };
  }
  return { type: "stop", quranComplete: true };
}
