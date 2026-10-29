/**
 * URL dasar situs untuk metadata SEO (robots.txt, sitemap.xml, metadataBase).
 *
 * Urutan sumber:
 * 1. `NEXT_PUBLIC_SITE_URL` — diakui di build Jika dipasang di Vercel env.
 * 2. `VERCEL_URL` — otomatis diisi Vercel per deployment preview/production.
 * 3. Fallback lokal dev — `http://localhost:3000`.
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
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return normalizeUrl(vercel);
  }
  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();
