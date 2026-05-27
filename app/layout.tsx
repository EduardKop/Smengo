import type { Metadata, Viewport } from 'next'
import { Inter, Source_Serif_4, Geist, Caveat } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { themeInitScript } from '@/components/theme-toggle'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  variable: '--font-lora',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

const caveat = Caveat({
  variable: '--font-handwriting',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  weight: ['500', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://smengo.com'),
  title: { default: 'Smengo', template: '%s' },
  description: 'Team schedule planning for modern companies',
  applicationName: 'Smengo',
  authors: [{ name: 'Smengo' }],
  creator: 'Smengo',
  publisher: 'Smengo',
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1e1c' },
  ],
  width: 'device-width',
  initialScale: 1,
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Smengo',
  url: 'https://smengo.com',
  logo: 'https://smengo.com/favicon.ico',
  description: 'Smart shift scheduling software for teams of 15–300',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning className={cn("h-full", "antialiased", inter.variable, sourceSerif.variable, caveat.variable, "font-sans", geist.variable)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
