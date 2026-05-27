import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { Geist, Geist_Mono } from 'next/font/google'
import { getPersonJsonLd, siteConfig } from '@/config/site'
import { ThemeProvider } from '@/components/ThemeProvider'
import 'highlight.js/styles/github-dark.css'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const { name, seo } = siteConfig

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: `${name} | Personal Website`,
  description: seo.description,
  openGraph: {
    title: `${name} | Personal Website`,
    description: seo.description,
    url: seo.siteUrl,
    siteName: name,
    images: [{ url: seo.ogImage, width: 512, height: 512, alt: name }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${name} | Personal Website`,
    description: seo.description,
    images: [seo.ogImage],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

const themeInitScript = `(function(){try{var t=localStorage.getItem('site-theme');if(t==='light')document.documentElement.classList.remove('dark');else document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}})()`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const personJsonLd = getPersonJsonLd()

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
