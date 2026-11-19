/** Audio offline APK di folder data (`docs/30` §2.2a). */
import { beforeEach, describe, expect, it, vi } from "vitest";

const fs = vi.hoisted(() => ({
  stat: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
  rmdir: vi.fn(),
}));
const native = vi.hoisted(() => ({ value: true }));

vi.mock("@capacitor/filesystem", () => ({
  Directory: { Data: "DATA", Cache: "CACHE" },
  Filesystem: fs,
}));
vi.mock("@/lib/platform", () => ({ isNativePlatform: () => native.value }));

import {
  audioFilePath,
  deleteStoredAudio,
  parseAyahAudioUrl,
  storedAudioCounts,
  storedAudioUri,
  storedAudioUsage,
  writeStoredAudio,
} from "@/services/audio-store/audio-store";
import { AYAH_AUDIO_BASE_URL } from "@/services/quran/audio-config";

beforeEach(() => {
  native.value = true;
  Object.values(fs).forEach((f) => f.mockReset());
});

describe("audio-store", () => {
  it("path berkas & parse URL ayat", () => {
    expect(audioFilePath("Alafasy_128kbps", 2, 255)).toBe("audio/Alafasy_128kbps/002255.mp3");
    expect(audioFilePath("warsh/x_128kbps", 1, 1)).toBe("audio/warsh__x_128kbps/001001.mp3");
    expect(parseAyahAudioUrl(`${AYAH_AUDIO_BASE_URL}/warsh/x_128kbps/112004.mp3`)).toEqual({
      reciterId: "warsh/x_128kbps",
      surah: 112,
      ayah: 4,
    });
    expect(parseAyahAudioUrl("https://contoh.com/a.mp3")).toBeNull();
  });

  it("berkas kosong atau tidak ada dianggap belum tersimpan", async () => {
    fs.stat.mockResolvedValueOnce({ size: 0, uri: "file:///x" });
    expect(await storedAudioUri({ reciterId: "q", surah: 1, ayah: 1 })).toBeNull();
    fs.stat.mockRejectedValueOnce(new Error("tidak ada"));
    expect(await storedAudioUri({ reciterId: "q", surah: 1, ayah: 1 })).toBeNull();
    fs.stat.mockResolvedValueOnce({ size: 10, uri: "file:///ok" });
    expect(await storedAudioUri({ reciterId: "q", surah: 1, ayah: 1 })).toBe("file:///ok");
  });

  it("menulis berkas ke folder data", async () => {
    fs.writeFile.mockResolvedValue({ uri: "file:///data/audio/q/001001.mp3" });
    const uri = await writeStoredAudio({ reciterId: "q", surah: 1, ayah: 1 }, new Blob(["abc"]));
    expect(uri).toBe("file:///data/audio/q/001001.mp3");
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({ path: "audio/q/001001.mp3", directory: "DATA", recursive: true, data: btoa("abc") }),
    );
  });

  it("menghitung berkas per surat & total ukuran", async () => {
    fs.readdir.mockImplementation(async ({ path }: { path: string }) => {
      if (path === "audio") return { files: [{ name: "q", size: 0 }] };
      return {
        files: [
          { name: "112001.mp3", size: 100 },
          { name: "112002.mp3", size: 200 },
          { name: "113001.mp3", size: 0 },
          { name: "catatan.txt", size: 5 },
        ],
      };
    });
    expect(await storedAudioCounts("q")).toEqual({ 112: 2 });
    expect(await storedAudioUsage()).toEqual({ bytes: 300, files: 3 });
  });

  it("hapus semua audio menghapus folder audio/", async () => {
    fs.readdir.mockImplementation(async ({ path }: { path: string }) =>
      path === "audio" ? { files: [{ name: "q" }] } : { files: [{ name: "001001.mp3", size: 50 }] },
    );
    fs.rmdir.mockResolvedValue(undefined);
    expect(await deleteStoredAudio()).toBe(50);
    expect(fs.rmdir).toHaveBeenCalledWith({ path: "audio", directory: "DATA", recursive: true });
  });

  it("di web tidak menyentuh berkas", async () => {
    native.value = false;
    expect(await storedAudioCounts("q")).toEqual({});
    expect(await storedAudioUsage()).toEqual({ bytes: 0, files: 0 });
    expect(await deleteStoredAudio()).toBe(0);
    expect(fs.readdir).not.toHaveBeenCalled();
  });
});
