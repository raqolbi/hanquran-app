/** Estafet latar: langkah setelah ayat lintas surat saat layar mati (`docs/32` §10.1). */
import { describe, expect, it } from "vitest";

import {
  getRelay,
  relayStepAfterAyah,
  setRelay,
  shouldRelay,
} from "@/services/background-relay/relay";

describe("relayStepAfterAyah", () => {
  it("Mode Murotal: ayat berikutnya, lalu surat berikutnya, lalu khatam", () => {
    expect(
      relayStepAfterAyah({ murotalEnabled: true, position: { surahId: 112, ayah: 2 } })
    ).toEqual({ type: "play", surahId: 112, ayah: 3 });
    expect(
      relayStepAfterAyah({ murotalEnabled: true, position: { surahId: 112, ayah: 4 } })
    ).toEqual({ type: "play", surahId: 113, ayah: 1 });
    expect(
      relayStepAfterAyah({ murotalEnabled: true, position: { surahId: 114, ayah: 6 } })
    ).toEqual({ type: "stop", quranComplete: true });
  });

  it("Mode Murotal mati → berhenti", () => {
    expect(
      relayStepAfterAyah({ murotalEnabled: false, position: { surahId: 112, ayah: 2 } })
    ).toEqual({ type: "stop", quranComplete: false });
  });
});

describe("shouldRelay", () => {
  it("hanya di APK saat halaman tersembunyi", () => {
    expect(shouldRelay(true, "hidden")).toBe(true);
    expect(shouldRelay(true, "visible")).toBe(false);
    expect(shouldRelay(false, "hidden")).toBe(false);
  });
});

describe("posisi estafet", () => {
  it("disimpan dan dihapus", () => {
    setRelay({ surahId: 67, ayah: 1 });
    expect(getRelay()).toEqual({ surahId: 67, ayah: 1 });
    setRelay(null);
    expect(getRelay()).toBeNull();
  });
});
