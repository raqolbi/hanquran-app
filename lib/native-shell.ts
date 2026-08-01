/**
 * Bootstrap shell native Capacitor (StatusBar, Splash, Back).
 * No-op di web/PWA — docs/32 §3.4 / A2.
 */

import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

import { resolveAndroidBackAction } from '@/lib/android-back';
import { attachNativeBackgroundAudioKeepAlive } from '@/lib/native-background-audio';
import { cancelCrossSurahNavigation } from '@/lib/murotal-pending-play';
import { isNativePlatform } from '@/lib/platform';
import { routes } from '@/lib/routes';
import {
  dismissOrphanPlaybackIfNeeded,
  isPlaybackPathname,
  stopPlaybackSession,
} from '@/lib/stop-playback-on-leave';


const STATUS_BAR_COLOR = '#0F766E';

let backListenerAttached = false;

async function applyStatusBar(): Promise<void> {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    // Android 15+/16: sebagian opsi diabaikan OS — tetap aman.
  }

  try {
    await StatusBar.setBackgroundColor({ color: STATUS_BAR_COLOR });
  } catch {
    // ignore
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    // ignore
  }
}

async function hideSplash(): Promise<void> {
  try {
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {
    // ignore
  }
}

function attachBackButton(): void {
  if (backListenerAttached) return;
  backListenerAttached = true;

  void App.addListener('backButton', ({ canGoBack }) => {
    const action = resolveAndroidBackAction({
      pathname: window.location.pathname,
      canGoBack,
    });

    switch (action) {
      case 'history_back':
        // Hard/history back dari surat|fokus: hentikan sesi sebelum halaman hilang.
        if (isPlaybackPathname(window.location.pathname)) {
          cancelCrossSurahNavigation();
          stopPlaybackSession();
        }
        window.history.back();
        break;
      case 'go_home':
        cancelCrossSurahNavigation();
        stopPlaybackSession();
        window.location.assign(routes.home());
        break;
      case 'exit_app':
        void App.exitApp();
        break;
      default:
        break;
    }
  });
}

/** Panggil sekali setelah app siap (client). */
export async function initNativeShell(): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  // Hard nav ke Beranda/settings meninggalkan notifikasi FGS yatim — bersihkan.
  dismissOrphanPlaybackIfNeeded();

  await applyStatusBar();
  attachBackButton();
  attachNativeBackgroundAudioKeepAlive();
  await hideSplash();
}
