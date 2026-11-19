/**
 * Pindah otomatis audio lama ke folder data (`docs/30` §2.2a) & penyesuaian
 * `downloadManifest` dari berkas yang benar-benar ada. Hanya di APK.
 */

import { Directory, Filesystem } from "@capacitor/filesystem";

import { SURAH_AYAH_COUNTS } from "@/lib/surah-ayah-counts";
import {
  AUDIO_CACHE_NAME,
  DOWNLOAD_MANIFEST_VERSION,
} from "@/services/audio-cache-constants";
import { db } from "@/services/db/db";

import {
  parseAyahAudioUrl,
  storedAudioCounts,
  usesFileAudioStore,
  writeStoredAudio,
} from "./audio-store";

const MIGRATED_KEY = "hq-audio-files-v1";

/**
 * Sekali per perangkat: pindahkan semua audio di Cache Storage ke folder data,
 * lalu hapus salinan pemutar lama di `Directory.Cache/hanquran-audio`.
 * @returns jumlah berkas yang dipindah
 */
export async function migrateLegacyAudio(): Promise<number> {
  if (!usesFileAudioStore() || typeof caches === "undefined") return 0;
  try {
    if (localStorage.getItem(MIGRATED_KEY)) return 0;
  } catch {
    return 0;
  }
  let moved = 0;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    for (const request of await cache.keys()) {
      const ref = parseAyahAudioUrl(request.url);
      const response = ref ? await cache.match(request) : undefined;
      const blob = response?.ok ? await response.blob() : null;
      if (ref && blob && blob.size > 0) {
        await writeStoredAudio(ref, blob);
        moved += 1;
      }
      await cache.delete(request);
    }
    await caches.delete(AUDIO_CACHE_NAME);
  } catch {
    // Dicoba lagi saat aplikasi dibuka berikutnya; berkas yang sudah pindah aman.
    return moved;
  }
  try {
    await Filesystem.rmdir({
      path: "hanquran-audio",
      directory: Directory.Cache,
      recursive: true,
    });
  } catch {
    // tidak ada salinan lama
  }
  try {
    localStorage.setItem(MIGRATED_KEY, String(Date.now()));
  } catch {
    // tanpa localStorage: dicoba lagi, aman karena berkas yang ada ditimpa sama
  }
  return moved;
}

/**
 * Samakan `downloadManifest` dengan isi folder data untuk satu qari: surat
 * yang berkasnya lengkap → `ready`; `ready` yang berkasnya tidak lengkap → dihapus.
 */
export async function syncManifestFromFiles(reciterId: string): Promise<void> {
  if (!usesFileAudioStore()) return;
  const counts = await storedAudioCounts(reciterId);
  const existing = await db.downloadManifest
    .where("reciterId")
    .equals(reciterId)
    .toArray();
  const ready = new Set(
    existing.filter((r) => r.status === "ready").map((r) => r.surahId)
  );
  const now = Date.now();
  for (let surahId = 1; surahId <= 114; surahId += 1) {
    const total = SURAH_AYAH_COUNTS[surahId - 1]!;
    const complete = (counts[surahId] ?? 0) >= total;
    if (complete && !ready.has(surahId)) {
      await db.downloadManifest.put({
        surahId,
        reciterId,
        status: "ready",
        sizeBytes: 0,
        ayahsCount: total,
        cachedAt: now,
        version: DOWNLOAD_MANIFEST_VERSION,
      });
    } else if (!complete && ready.has(surahId)) {
      await db.downloadManifest.delete([surahId, reciterId]);
    }
  }
}
