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
  colorScheme: 'light dark',
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F766E' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="prefetch" href="/offline.html" as="document" />
      </head>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
