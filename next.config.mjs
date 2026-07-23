/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
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

export default nextConfig
