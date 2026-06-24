import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { AppProviders } from '@/components/providers/app-providers'

import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'HanQuran',
  description: 'Aplikasi hafalan Al-Qur’an dengan repeat & word highlight.',
  applicationName: 'HanQuran',
  manifest: '/manifest.json',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/branding/logo.png', type: 'image/png' }],
    apple: '/icons/icon-192.png',
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
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
