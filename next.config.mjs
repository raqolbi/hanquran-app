/** @type {import('next').NextConfig} */
const isAndroidTarget =
  process.env.HANQURAN_TARGET === 'android' ||
  process.env.NEXT_PUBLIC_HANQURAN_TARGET === 'android';

const nextConfig = {
  // Error tipe kini menggagalkan build (docs/39 C1) — sebelumnya
  // `ignoreBuildErrors: true` menyembunyikan ±26 error.
  images: {
    // Tetap unoptimized GLOBAL (docs/35 §4 T8): SW precache + Capacitor
    // mengandalkan URL aset apa adanya (`/branding/*.png`), bukan `/_next/image`.
    // Logo satu-satunya `next/image` dan kecil — optimasi belum sepadan risikonya.
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
