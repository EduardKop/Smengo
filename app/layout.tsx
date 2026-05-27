import type { Metadata } from 'next'
import { Inter, Source_Serif_4, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'

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

export const metadata: Metadata = {
  title: 'Smengo',
  description: 'Team schedule planning for modern companies',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={cn("h-full", "antialiased", inter.variable, sourceSerif.variable, "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
