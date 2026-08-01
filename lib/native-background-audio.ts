/**
 * Keep-alive tilawah di Capacitor Android saat app background / layar mati.
 *
 * WebView Chromium sering mem-pause HTMLAudioElement saat halaman hidden,
 * meskipun Foreground Service Media Session aktif. Modul ini (hanya native)
 * mencoba `play()` ulang setelah pause sistem — PWA tidak terpengaruh.
 * docs/32 §10.1
 */

import { App } from '@capacitor/app';

import { isNativePlatform } from '@/lib/platform';
import { useAudioStore } from '@/stores/audioStore';

let attached = false;
let wantPlaying = false;
/** Jendela singkat setelah visibility/appState → ignore pause event + resume. */
let resumeGuardUntil = 0;
/** Pause dari kontrol pengguna (UI / Media Session) — jangan di-resume paksa. */
let userInitiatedPause = false;
let audioGetter: (() => HTMLAudioElement | null) | null = null;
let unsubscribeStore: (() => void) | null = null;

export function registerNativeBackgroundAudioElement(
  getter: () => HTMLAudioElement | null,
): void {
  audioGetter = getter;
}

export function markNativeUserInitiatedPause(): void {
  if (!isNativePlatform()) return;
  userInitiatedPause = true;
  wantPlaying = false;
  resumeGuardUntil = 0;
}

async function tryResumePlayback(): Promise<void> {
  if (userInitiatedPause || !wantPlaying) return;

  const audio = audioGetter?.();
  if (!audio?.src) return;

  resumeGuardUntil = Date.now() + 1000;
  try {
    if (audio.paused) {
      await audio.play();
    }
    if (!useAudioStore.getState().isPlaying) {
      useAudioStore.getState().resume();
    }
  } catch {
    // OS/WebView menolak resume.
  }
}

/**
 * Dipakai AudioController.handlePause: abaikan pause otomatis WebView
 * saat app hidden / jendela keep-alive, lalu coba play ulang.
 * Pause dari kontrol pengguna ditandai lewat `markNativeUserInitiatedPause`.
 */
export function shouldIgnoreNativeMediaPause(): boolean {
  if (!isNativePlatform() || userInitiatedPause) return false;
  if (!wantPlaying) return false;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    return true;
  }
  return Date.now() < resumeGuardUntil;
}

function armResumeGuard(): void {
  if (!wantPlaying || userInitiatedPause) return;
  resumeGuardUntil = Date.now() + 1500;
  void tryResumePlayback();
  window.setTimeout(() => {
    void tryResumePlayback();
  }, 350);
}

export function attachNativeBackgroundAudioKeepAlive(): void {
  if (!isNativePlatform() || attached || typeof window === 'undefined') {
    return;
  }
  attached = true;

  unsubscribeStore = useAudioStore.subscribe((state) => {
    wantPlaying = state.isPlaying;
    if (state.isPlaying) {
      userInitiatedPause = false;
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      armResumeGuard();
    }
  });

  void App.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      armResumeGuard();
    }
  });
}

/** Untuk pengujian. */
export function resetNativeBackgroundAudioKeepAliveForTests(): void {
  attached = false;
  wantPlaying = false;
  resumeGuardUntil = 0;
  userInitiatedPause = false;
  audioGetter = null;
  unsubscribeStore?.();
  unsubscribeStore = null;
}
