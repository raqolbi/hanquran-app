/**
 * Tempat audio offline: di APK berkas di folder data aplikasi
 * (`Directory.Data/audio/<qari>/<SSSAAA>.mp3`), di web Cache Storage.
 *
 * Mengapa: Cache Storage WebView bisa dibersihkan sistem saat ruang menipis,
 * dan pemutar native dulu menyalin berkas ke `Directory.Cache` setiap kali
 * diputar sehingga audio tersimpan dua kali. Semua pemanggil (pemutar, cek
 * offline, simpan per surat, unduh saat diputar, hapus cache) lewat modul ini
 * supaya hanya ada satu tempat (`docs/30` §2.2a).
 */

import { Directory, Filesystem } from "@capacitor/filesystem";

import { isNativePlatform } from "@/lib/platform";
import { AYAH_AUDIO_BASE_URL } from "@/services/quran/audio-config";

const AUDIO_ROOT = "audio";

export interface AyahAudioRef {
  reciterId: string;
  surah: number;
  ayah: number;
}

/** Audio disimpan sebagai berkas di folder data (APK), bukan Cache Storage. */
export function usesFileAudioStore(): boolean {
  return isNativePlatform();
}

/** Nama folder qari (`/` di id qari → `__`). */
export function audioDirName(reciterId: string): string {
  return reciterId.replace(/\//g, "__");
}

/** Path relatif berkas ayat di `Directory.Data`. */
export function audioFilePath(
  reciterId: string,
  surah: number,
  ayah: number
): string {
  const name = `${String(surah).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;
  return `${AUDIO_ROOT}/${audioDirName(reciterId)}/${name}`;
}

/** Kebalikan `buildAyahAudioUrl`; `null` bila bukan URL audio ayat. */
export function parseAyahAudioUrl(url: string): AyahAudioRef | null {
  const prefix = `${AYAH_AUDIO_BASE_URL}/`;
  if (!url.startsWith(prefix)) return null;
  const match = /^(.+)\/(\d{3})(\d{3})\.mp3$/.exec(url.slice(prefix.length));
  if (!match) return null;
  return {
    reciterId: match[1]!,
    surah: Number(match[2]),
    ayah: Number(match[3]),
  };
}

/** URI `file://` berkas ayat di folder data, atau `null` bila belum ada. */
export async function storedAudioUri(
  ref: AyahAudioRef
): Promise<string | null> {
  try {
    const stat = await Filesystem.stat({
      path: audioFilePath(ref.reciterId, ref.surah, ref.ayah),
      directory: Directory.Data,
    });
    return stat.size > 0 ? stat.uri : null;
  } catch {
    return null;
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/** Tulis audio ayat ke folder data; mengembalikan URI berkasnya. */
export async function writeStoredAudio(
  ref: AyahAudioRef,
  blob: Blob
): Promise<string> {
  const result = await Filesystem.writeFile({
    path: audioFilePath(ref.reciterId, ref.surah, ref.ayah),
    data: await blobToBase64(blob),
    directory: Directory.Data,
    recursive: true,
  });
  return result.uri;
}

interface StoredFile {
  name: string;
  size: number;
}

async function listDir(path: string): Promise<StoredFile[]> {
  try {
    const { files } = await Filesystem.readdir({ path, directory: Directory.Data });
    return files.map((f) => ({ name: f.name, size: f.size ?? 0 }));
  } catch {
    return [];
  }
}

/** Jumlah berkas ayat per surat untuk satu qari (`{}` di web). */
export async function storedAudioCounts(
  reciterId: string
): Promise<Record<number, number>> {
  if (!usesFileAudioStore()) return {};
  const counts: Record<number, number> = {};
  for (const file of await listDir(`${AUDIO_ROOT}/${audioDirName(reciterId)}`)) {
    const match = /^(\d{3})\d{3}\.mp3$/.exec(file.name);
    if (!match || file.size <= 0) continue;
    const surah = Number(match[1]);
    counts[surah] = (counts[surah] ?? 0) + 1;
  }
  return counts;
}

/** Total byte & berkas audio di folder data (`0` di web). */
export async function storedAudioUsage(): Promise<{ bytes: number; files: number }> {
  if (!usesFileAudioStore()) return { bytes: 0, files: 0 };
  let bytes = 0;
  let files = 0;
  for (const dir of await listDir(AUDIO_ROOT)) {
    for (const file of await listDir(`${AUDIO_ROOT}/${dir.name}`)) {
      if (!file.name.endsWith(".mp3")) continue;
      bytes += file.size;
      files += 1;
    }
  }
  return { bytes, files };
}

/** Hapus semua audio di folder data; mengembalikan byte yang dibebaskan. */
export async function deleteStoredAudio(): Promise<number> {
  if (!usesFileAudioStore()) return 0;
  const { bytes, files } = await storedAudioUsage();
  try {
    await Filesystem.rmdir({ path: AUDIO_ROOT, directory: Directory.Data, recursive: true });
  } catch {
    return 0;
  }
  // Folder kosong pun dianggap terhapus.
  return files > 0 ? Math.max(bytes, 1) : 0;
}
