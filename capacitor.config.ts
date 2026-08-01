import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor 8.5 — platform Android tambahan.
 * webDir mengarah ke hasil `npm run build:android` (static export).
 * PWA/Vercel tidak memakai file ini. Spek: docs/32.
 */
const config: CapacitorConfig = {
  appId: 'app.hanquran.android',
  appName: 'HanQuran',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      // Teks/icon terang di atas latar emerald `#0F766E`.
      style: 'DARK',
      backgroundColor: '#0F766E',
      // false agar warna status bar terlihat di Android < 15.
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      launchFadeOutDuration: 250,
      backgroundColor: '#FAFAF8',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER',
      showSpinner: false,
    },
    // FGS hanya saat playback (default plugin); docs/32 §10.1
    MediaSession: {},
  },
};

export default config;
