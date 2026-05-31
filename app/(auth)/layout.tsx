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
        <Link href="/" className="flex items-center" aria-label="Smengo">
          {/* Light theme lockup */}
          <img src="/lockup-light.svg" alt="Smengo" height={28} className="block h-7 w-auto dark:hidden" />
          {/* Dark theme lockup */}
          <img src="/lockup-dark.svg"  alt="Smengo" height={28} className="hidden h-7 w-auto dark:block" />
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

