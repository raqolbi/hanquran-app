/** @type {import('next').NextConfig} */
const isAndroidTarget =
  process.env.HANQURAN_TARGET === 'android' ||
  process.env.NEXT_PUBLIC_HANQURAN_TARGET === 'android';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Profil Android (Capacitor): static export ke `out/`.
  // Tanpa HANQURAN_TARGET → perilaku PWA/Vercel tidak berubah (docs/32 §3.4).
  // Catatan: jangan pakai trailingSlash — Capacitor Android sering gagal resolve
  // `/surah/1/` → `surah/1/index.html` (spike A0). Export tanpa slash → `surah/1.html`.
  ...(isAndroidTarget
    ? {
        output: 'export',
      }
    : {}),
  ...(!isAndroidTarget
    ? {
        async headers() {
          // SW + importScripts harus selalu di-revalidate agar `dataHash` baru
          // terdeteksi dan precache dataset bisa diperbarui.
          const swNoCache = [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
            },
          ];
          return [
            { source: '/sw.js', headers: swNoCache },
            { source: '/sw-helpers.js', headers: swNoCache },
            { source: '/sw-precache-manifest.js', headers: swNoCache },
          ];
        },
      }
    : {}),
};

export default nextConfig;
