/**
 * URL dasar situs untuk metadata SEO (robots.txt, sitemap.xml, metadataBase).
 *
 * Urutan sumber:
 * 1. `NEXT_PUBLIC_SITE_URL` — sumber utama; **wajib** dipasang di Vercel
 *    Production agar canonical/sitemap menunjuk domain final.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — domain produksi proyek (tanpa hash
 *    deployment), otomatis tersedia di Vercel.
 * 3. `VERCEL_URL` — URL deployment/preview (ber-hash); hanya cadangan.
 * 4. Fallback lokal dev — `http://localhost:3000`.
 */

function normalizeUrl(raw: string): string {
  const trimmed = raw.replace(/\/+$/, '');
  if (/^https?:\/\//.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return normalizeUrl(explicit);
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) {
    return normalizeUrl(productionHost);
  }

  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return normalizeUrl(vercel);
  }

  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();
