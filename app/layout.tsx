import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { GoogleAdSenseScript } from '@/components/ads/google-adsense-script'
import { LanguageProvider } from '@/contexts/language-context'
import { ThemeRuntime } from '@/components/theme/theme-runtime'
import { getInitialThemeScript } from '@/lib/theme-script'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://languageflow.io.vn'),
  applicationName: 'languageflow',
  title: {
    default: 'languageflow - Learn English Vocabulary',
    template: '%s | languageflow',
  },
  description:
    'Practice English vocabulary with focused study sessions, spaced review, examples, pronunciation, and AI-powered learning help.',
  keywords: [
    'English vocabulary',
    'learn English',
    'vocabulary practice',
    'English flashcards',
    'AI English learning',
    'languageflow',
  ],
  authors: [{ name: 'languageflow' }],
  creator: 'languageflow',
  publisher: 'languageflow',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://languageflow.io.vn',
    siteName: 'languageflow',
    title: 'languageflow - Learn English Vocabulary',
    description:
      'Practice English vocabulary with focused study sessions, spaced review, examples, pronunciation, and AI-powered learning help.',
    images: [
      {
        url: '/languageflow-logo.png',
        width: 512,
        height: 512,
        alt: 'languageflow',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'languageflow - Learn English Vocabulary',
    description:
      'Practice English vocabulary with focused study sessions, spaced review, examples, pronunciation, and AI-powered learning help.',
    images: ['/languageflow-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  other: {
    'google-adsense-account':
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || '',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-theme="vega"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: getInitialThemeScript() }} />
      </head>
      <body className="font-sans antialiased">
        <GoogleAdSenseScript />
        <LanguageProvider>
          <ThemeRuntime />
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </LanguageProvider>
      </body>
    </html>
  )
}
