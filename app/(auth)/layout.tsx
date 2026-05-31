import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { AuthFloatingCards } from '@/components/auth/auth-floating-cards'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AuthFloatingCards />

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xl font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-inter, sans-serif)', letterSpacing: '-0.035em' }}
        >
          smengo
          <span className="inline-block h-[5px] w-[5px] rounded-full" style={{ background: 'var(--accent)' }} />
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* Centered form */}
      <main className="relative z-10 flex min-h-[calc(100vh-68px)] items-center justify-center px-4 pb-16 pt-4">
        {children}
      </main>
    </div>
  )
}

