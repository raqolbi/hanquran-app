"use client";

import { useEffect, useRef } from "react";

import { usePreferredReciterId } from "@/hooks/use-preferred-reciter";
import { usesFileAudioStore } from "@/services/audio-store/audio-store";
import {
  migrateLegacyAudio,
  syncManifestFromFiles,
} from "@/services/audio-store/migrate";
import { useOfflineStore } from "@/stores/offlineStore";

/**
 * Sekali per sesi di APK (`docs/30` §2.2a): pindahkan audio lama dari Cache
 * Storage ke folder data, lalu samakan status offline per surat dengan berkas
 * yang ada.
 */
export function AudioStoreSync() {
  const reciterId = usePreferredReciterId();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !usesFileAudioStore()) return;
    done.current = true;
    void (async () => {
      await migrateLegacyAudio();
      await syncManifestFromFiles(reciterId);
      await useOfflineStore.getState().refreshManifest();
    })();
  }, [reciterId]);

  return null;
}
