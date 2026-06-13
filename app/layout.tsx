import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Inter, Source_Serif_4, Geist, Caveat, Press_Start_2P, VT323, JetBrains_Mono, Manrope } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/json-ld'

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

const pressStart = Press_Start_2P({
  variable: '--font-pixel',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
})

const vt323 = VT323({
  variable: '--font-pixel-body',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// Шрифт продукт-зоны (правка 4: минимализм в духе sona.ai). Sora из референса
// без кириллицы — Manrope ближайший геометрический гротеск с полной ru/uk.
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
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
    icon: [
      { url: '/icon-light.png', media: '(prefers-color-scheme: light)', sizes: '512x512', type: 'image/png' },
      { url: '/icon-dark.png',  media: '(prefers-color-scheme: dark)',  sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-light.png',
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
  const themeCookie = (await cookies()).get('theme')?.value
  const theme = themeCookie === 'dark' || themeCookie === 'light' ? themeCookie : undefined

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("h-full", "antialiased", inter.variable, sourceSerif.variable, caveat.variable, "font-sans", geist.variable, pressStart.variable, vt323.variable, jetbrainsMono.variable, manrope.variable, theme === 'dark' && 'dark')}
      style={theme ? { colorScheme: theme } : undefined}
    >
      <head>
        <JsonLd data={orgJsonLd} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
