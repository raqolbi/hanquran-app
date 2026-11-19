"use client";

/**
 * Estafet latar di halaman surat/Fokus (`services/background-relay`).
 * Selama halaman tersembunyi, ayat lintas surat diputar dari halaman ini;
 * saat terlihat lagi, pindah ke halaman surat yang sedang diputar.
 */

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { PlayAyahParams } from "@/hooks/use-audio";
import { showAppToast } from "@/lib/app-toast";
import { setPendingMurotalPlay } from "@/lib/murotal-pending-play";
import { replaceApp } from "@/lib/navigate";
import { isNativePlatform } from "@/lib/platform";
import { routes } from "@/lib/routes";
import { getSurahAyahCount } from "@/lib/surah-ayah-counts";
import {
  getRelay,
  relayStepAfterAyah,
  setRelay,
  shouldRelay,
  type RelayStep,
} from "@/services/background-relay/relay";
import { useAudioStore } from "@/stores/audioStore";
import { useUserStore } from "@/stores/userStore";

/** Jeda sebelum pindah halaman saat layar menyala (menyala sebentar → abaikan). */
const RELAY_WAKE_DELAY_MS = 1500;

export interface BackgroundRelayDeps {
  reciterId: string;
  routeMode: "surah" | "focus";
  playAyah: (params: PlayAyahParams) => Promise<void> | void;
  pause: () => void;
  ensureAyahPlayable: (surahId: number, ayah: number) => Promise<boolean>;
}

/** Halaman sedang tersembunyi di APK → lintas surat lewat estafet. */
export function isRelayNeeded(): boolean {
  return (
    typeof document !== "undefined" &&
    shouldRelay(isNativePlatform(), document.visibilityState)
  );
}

export function useBackgroundRelay(deps: BackgroundRelayDeps) {
  const router = useRouter();
  const tAudio = useTranslations("audio");
  const { reciterId, routeMode, playAyah, pause, ensureAyahPlayable } = deps;

  /** Putar ayat surat lain dari halaman ini (tanpa pindah halaman). */
  const startRelay = useCallback(
    (surahId: number, ayah: number) => {
      setRelay({ surahId, ayah });
      void useUserStore.getState().setLastViewed(surahId, ayah);
      void playAyah({
        surahId,
        ayahNumber: ayah,
        reciterId,
        totalAyahs: getSurahAyahCount(surahId),
      });
    },
    [playAyah, reciterId]
  );

  const applyRelayStep = useCallback(
    (step: RelayStep) => {
      if (step.type === "stop") {
        pause();
        return;
      }
      const position = getRelay();
      if (position && step.surahId === position.surahId) {
        startRelay(step.surahId, step.ayah);
        return;
      }
      void (async () => {
        // Sama dengan Mode Murotal: offline & audio surat berikutnya belum ada → berhenti.
        if (!(await ensureAyahPlayable(step.surahId, step.ayah))) {
          pause();
          showAppToast(tAudio("offlineUnavailableToast"));
          return;
        }
        startRelay(step.surahId, step.ayah);
      })();
    },
    [pause, startRelay, ensureAyahPlayable, tAudio]
  );

  /** Advance estafet setelah ayat selesai / ⏭. `false` = tidak ada estafet. */
  const advanceRelay = useCallback((): boolean => {
    const position = getRelay();
    if (!position) return false;
    applyRelayStep(
      relayStepAfterAyah({
        position,
        murotalEnabled: useUserStore.getState().settings.murotalEnabled,
      })
    );
    return true;
  }, [applyRelayStep]);

  /** ⏮ saat estafet: ayat sebelumnya di surat yang sama. */
  const relayPrevious = useCallback((): boolean => {
    const position = getRelay();
    if (!position) return false;
    if (position.ayah > 1) startRelay(position.surahId, position.ayah - 1);
    return true;
  }, [startRelay]);

  // Halaman terlihat lagi → pindah ke surat yang sedang diputar estafet.
  useEffect(() => {
    let timer: number | undefined;
    const navigateToRelay = () => {
      const position = getRelay();
      // Layar menyala sebentar (mis. notifikasi) lalu mati lagi: tetap estafet,
      // karena halaman baru tidak sempat hydrate saat tersembunyi.
      if (document.visibilityState !== "visible" || !position) return;
      setRelay(null);
      const audio = useAudioStore.getState();
      if (audio.isPlaying)
        setPendingMurotalPlay(position.surahId, position.ayah);
      const href =
        routeMode === "surah"
          ? routes.surah(position.surahId, position.ayah)
          : routes.focus(position.surahId, position.ayah);
      replaceApp(href, (next) => router.replace(next));
    };
    const onVisibilityChange = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === "visible" && getRelay()) {
        timer = window.setTimeout(navigateToRelay, RELAY_WAKE_DELAY_MS);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [routeMode, router]);

  return { startRelay, advanceRelay, relayPrevious };
}
