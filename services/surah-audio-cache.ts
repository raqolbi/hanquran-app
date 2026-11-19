/**
 * Cek ketersediaan audio surat penuh di Cache Storage.
 * Dipakai untuk menyembunyikan tombol Simpan Offline bila seluruh ayat sudah tercache
 * (manifest `ready` atau auto download per ayat). Lihat `docs/31` §5.5.
 */

import { AUDIO_CACHE_NAME } from '@/services/audio-cache-constants';
import { storedAudioCounts, usesFileAudioStore } from '@/services/audio-store/audio-store';
import { buildSurahAudioUrls } from '@/services/download-manager';

/** Semua file MP3 ayat surat+qari ada di `hanquran-audio-v1`. */
export async function isSurahAudioFullyCached(
  surahId: number,
  reciterId: string,
  ayahCount: number,
): Promise<boolean> {
  if (ayahCount <= 0) return false;
  // APK: hitung berkas di folder data (`docs/30` §2.2a).
  if (usesFileAudioStore()) {
    return ((await storedAudioCounts(reciterId))[surahId] ?? 0) >= ayahCount;
  }
  if (typeof caches === 'undefined') {
    return false;
  }

  const urls = buildSurahAudioUrls(surahId, reciterId, ayahCount);
  const cache = await caches.open(AUDIO_CACHE_NAME);

  for (const url of urls) {
    const response = await cache.match(url);
    if (!response) {
      return false;
    }
  }

  return true;
}
