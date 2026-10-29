import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { AppProviders } from '@/components/providers/app-providers'
import { JsonLd } from '@/components/json-ld'
import { buildWebSiteSchema } from '@/lib/schema-org'
import { isAndroidBuild } from '@/lib/platform'
import { SITE_URL } from '@/lib/site-url'

import './globals.css'

// Analytics Vercel hanya web production — bukan bundle Android (docs/32 A1).

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'HanQuran — Aplikasi Hafalan Al-Qur\'an',
    template: '%s | HanQuran',
  },
  description:
    "Aplikasi hafalan Al-Qur'an — audio per ayat, repeat, Mode Murotal, mode fokus, dan dukungan offline. Tanpa akun.",
  applicationName: 'HanQuran',
  manifest: '/manifest.json',
  // Favicon via file convention App Router: `app/icon.png` + `app/apple-icon.png`
  // (docs/35 §4 T8) — jangan ditimpa `icons` manual di sini.
  openGraph: {
    type: 'website',
    siteName: 'HanQuran',
    locale: 'id_ID',
    url: '/',
    title: "HanQuran — Aplikasi Hafalan Al-Qur'an",
    description:
      "Audio per ayat, repeat, Mode Murotal, mode fokus, dan dukungan offline. Tanpa akun.",
    images: [{ url: '/og/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "HanQuran — Aplikasi Hafalan Al-Qur'an",
    description:
      "Audio per ayat, repeat, Mode Murotal, mode fokus, dan dukungan offline. Tanpa akun.",
    images: ['/og/og-default.png'],
  },
  appleWebApp: {
    capable: true,
    title: 'HanQuran',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  colorScheme: 'only light',
  viewportFit: 'cover',
  themeColor: '#0F766E',
}

const PWA_LAUNCH_SCRIPT = `(function(){try{var m=window.matchMedia("(display-mode: standalone)");var s=m&&m.matches;var n=window.navigator;var i=n&&n.standalone;if(s||i)document.documentElement.classList.add("pwa-launching")}catch(e){}})();`;

const enableVercelAnalytics =
  process.env.NODE_ENV === 'production' && !isAndroidBuild()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PWA_LAUNCH_SCRIPT }} />
        <link rel="preload" href="/branding/logo-with-text.png" as="image" />
        <link rel="prefetch" href="/offline.html" as="document" />
      </head>
      <body className="font-sans antialiased">
        <JsonLd data={buildWebSiteSchema()} />
        <div id="pwa-splash" className="pwa-splash" aria-hidden="true">
          <img
            src="/branding/logo-with-text.png"
            alt="HanQuran"
            width={240}
            height={160}
            className="pwa-splash__logo"
            decoding="sync"
            fetchPriority="high"
          />
        </div>
        <AppProviders>{children}</AppProviders>
        {enableVercelAnalytics && <Analytics />}
      </body>
    </html>
  )
}
